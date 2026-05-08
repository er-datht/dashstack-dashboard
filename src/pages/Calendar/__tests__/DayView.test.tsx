import { fireEvent, render, screen } from '@testing-library/react'
import DayView from '../DayView'
import type { CalendarEvent } from '../../../types/calendar'

// SPEC: DayView props (derived from design.md and spec):
// currentDate: Date
// events: CalendarEvent[]
// onTimeSlotClick?: (date: Date) => void
// onEventClick?: (event: CalendarEvent, position: { top: number; left: number }) => void

function makeEvent(
  overrides: Partial<CalendarEvent> & { startDate: Date }
): CalendarEvent {
  return {
    id: 'evt-1',
    title: 'Test Event',
    location: '',
    organizer: '',
    color: { border: '#7551e9', bg: 'rgba(117, 81, 233, 0.15)', text: '#7551e9' },
    participants: [],
    ...overrides,
  }
}

describe('DayView', () => {
  const defaultProps = {
    currentDate: new Date(2026, 3, 15), // April 15, 2026 (Wednesday)
    events: [] as CalendarEvent[],
    onTimeSlotClick: vi.fn(),
    onEventClick: vi.fn(),
  }

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('time grid rendering', () => {
    it('renders 24 hour rows', () => {
      render(<DayView {...defaultProps} />)
      // 23 hour labels (1 AM - 11 PM) + 1 timezone label = 24 total
      const hourLabels = screen.getAllByText(/^(12|[1-9]|1[01])\s*(AM|PM)$/i)
      // 23 standard hour labels (no 12 AM — replaced by timezone)
      expect(hourLabels).toHaveLength(23)
    })

    it('renders timezone label as the first hour label', () => {
      render(<DayView {...defaultProps} />)
      // First label shows timezone (e.g., "GMT+07", "EST") instead of "12 AM"
      const tzLabels = screen.getAllByText(/^(GMT|UTC)/i)
      expect(tzLabels.length).toBeGreaterThanOrEqual(1)
    })

    it('renders 11 PM as the last hour label', () => {
      render(<DayView {...defaultProps} />)
      expect(screen.getByText(/^11\s*PM$/i)).toBeInTheDocument()
    })
  })

  describe('all-day events', () => {
    it('renders all-day events in the all-day section', () => {
      const allDayEvent = makeEvent({
        id: 'evt-allday',
        title: 'All Day Meeting',
        startDate: new Date(2026, 3, 15),
        endDate: new Date(2026, 3, 15),
        allDay: true,
      } as Partial<CalendarEvent> & { startDate: Date })

      render(<DayView {...defaultProps} events={[allDayEvent]} />)
      expect(screen.getByText('All Day Meeting')).toBeInTheDocument()
    })

    it('renders the all-day row even when there are no all-day events', () => {
      const { container } = render(<DayView {...defaultProps} events={[]} />)
      // SPEC: "the all-day row is still rendered but appears empty (minimal height)"
      // Check that the all-day section container exists
      // SPEC: assumed the all-day section has a recognizable role or test id
      const allDaySection = container.querySelector('[class*="allDay"]')
      expect(allDaySection).toBeInTheDocument()
    })

    // SPEC: fix-day-view-all-day-event-stacking — calendar-day-view "Day view
    // renders all-day events in a pinned row". When two or more all-day events
    // are present on the displayed day, they SHALL stack into distinct vertical
    // rows. Implementation reuses `packAllDayRows` with `startCol: 0, span: 1`
    // per event and renders each bar with `top: ${rowIdx * 24}px` (stride =
    // 22px bar height + 2px gap), mirroring WeekView.
    it('renders multiple overlapping all-day events at distinct vertical positions', () => {
      const evtA = makeEvent({
        id: 'evt-allday-a',
        title: 'All Day A',
        startDate: new Date(2026, 3, 15),
        endDate: new Date(2026, 3, 15),
        allDay: true,
      } as Partial<CalendarEvent> & { startDate: Date })
      const evtB = makeEvent({
        id: 'evt-allday-b',
        title: 'All Day B',
        startDate: new Date(2026, 3, 15),
        endDate: new Date(2026, 3, 15),
        allDay: true,
      } as Partial<CalendarEvent> & { startDate: Date })

      render(<DayView {...defaultProps} events={[evtA, evtB]} />)

      const barA = screen.getByText('All Day A')
      const barB = screen.getByText('All Day B')
      expect(barA).toBeInTheDocument()
      expect(barB).toBeInTheDocument()

      // Their inline `top` values must be distinct, with one at '0px' and the other at '24px'.
      const tops = [barA.style.top, barB.style.top].sort()
      expect(tops).toEqual(['0px', '24px'])
    })

    it('all-day content minHeight reflects row count for two events', () => {
      const evtA = makeEvent({
        id: 'evt-allday-a',
        title: 'All Day A',
        startDate: new Date(2026, 3, 15),
        endDate: new Date(2026, 3, 15),
        allDay: true,
      } as Partial<CalendarEvent> & { startDate: Date })
      const evtB = makeEvent({
        id: 'evt-allday-b',
        title: 'All Day B',
        startDate: new Date(2026, 3, 15),
        endDate: new Date(2026, 3, 15),
        allDay: true,
      } as Partial<CalendarEvent> & { startDate: Date })

      const { container } = render(
        <DayView {...defaultProps} events={[evtA, evtB]} />
      )

      // Vitest CSS module classNameStrategy is 'non-scoped' (see vitest.config.ts),
      // so the rendered class name matches the SCSS source name verbatim.
      const content = container.querySelector('.allDayContent') as HTMLElement | null
      expect(content).not.toBeNull()

      // SPEC: minHeight = rowCount * 24 + 4. With 2 rows → 2 * 24 + 4 = 52px.
      expect(content?.style.minHeight).toBe('52px')
    })

    it('renders three stacked all-day events at top values 0/24/48', () => {
      const evtA = makeEvent({
        id: 'evt-allday-a',
        title: 'All Day A',
        startDate: new Date(2026, 3, 15),
        endDate: new Date(2026, 3, 15),
        allDay: true,
      } as Partial<CalendarEvent> & { startDate: Date })
      const evtB = makeEvent({
        id: 'evt-allday-b',
        title: 'All Day B',
        startDate: new Date(2026, 3, 15),
        endDate: new Date(2026, 3, 15),
        allDay: true,
      } as Partial<CalendarEvent> & { startDate: Date })
      const evtC = makeEvent({
        id: 'evt-allday-c',
        title: 'All Day C',
        startDate: new Date(2026, 3, 15),
        endDate: new Date(2026, 3, 15),
        allDay: true,
      } as Partial<CalendarEvent> & { startDate: Date })

      const { container } = render(
        <DayView {...defaultProps} events={[evtA, evtB, evtC]} />
      )

      const barA = screen.getByText('All Day A')
      const barB = screen.getByText('All Day B')
      const barC = screen.getByText('All Day C')

      const tops = [barA.style.top, barB.style.top, barC.style.top].sort()
      // String sort: '0px' < '24px' < '48px' (lexicographic order matches numeric here).
      expect(tops).toEqual(['0px', '24px', '48px'])

      const content = container.querySelector('.allDayContent') as HTMLElement | null
      expect(content).not.toBeNull()
      // SPEC: minHeight = 3 * 24 + 4 = 76px.
      expect(content?.style.minHeight).toBe('76px')
    })

    it('single all-day event renders at top 0px and minHeight 28px', () => {
      const evtA = makeEvent({
        id: 'evt-allday-solo',
        title: 'Solo All Day',
        startDate: new Date(2026, 3, 15),
        endDate: new Date(2026, 3, 15),
        allDay: true,
      } as Partial<CalendarEvent> & { startDate: Date })

      const { container } = render(
        <DayView {...defaultProps} events={[evtA]} />
      )

      const bar = screen.getByText('Solo All Day')
      expect(bar.style.top).toBe('0px')

      const content = container.querySelector('.allDayContent') as HTMLElement | null
      expect(content).not.toBeNull()
      // SPEC: minHeight = 1 * 24 + 4 = 28px.
      expect(content?.style.minHeight).toBe('28px')
    })
  })

  describe('timed events', () => {
    it('renders timed event blocks with the event title', () => {
      const timedEvent = makeEvent({
        id: 'evt-timed',
        title: 'Team Standup',
        startDate: new Date(2026, 3, 15, 9, 0),
        endDate: new Date(2026, 3, 15, 10, 0),
        allDay: false,
      } as Partial<CalendarEvent> & { startDate: Date })

      render(<DayView {...defaultProps} events={[timedEvent]} />)
      expect(screen.getByText('Team Standup')).toBeInTheDocument()
    })

    it('does not render timed events in the all-day section', () => {
      const timedEvent = makeEvent({
        id: 'evt-timed',
        title: 'Team Standup',
        startDate: new Date(2026, 3, 15, 9, 0),
        endDate: new Date(2026, 3, 15, 10, 0),
        allDay: false,
      } as Partial<CalendarEvent> & { startDate: Date })

      const allDayEvent = makeEvent({
        id: 'evt-allday',
        title: 'Conference',
        startDate: new Date(2026, 3, 15),
        endDate: new Date(2026, 3, 15),
        allDay: true,
      } as Partial<CalendarEvent> & { startDate: Date })

      render(<DayView {...defaultProps} events={[timedEvent, allDayEvent]} />)
      // Both events should be rendered but in different sections
      expect(screen.getByText('Team Standup')).toBeInTheDocument()
      expect(screen.getByText('Conference')).toBeInTheDocument()
    })

    it('does not render events from other days', () => {
      const otherDayEvent = makeEvent({
        id: 'evt-other',
        title: 'Tomorrow Event',
        startDate: new Date(2026, 3, 16, 9, 0),
        endDate: new Date(2026, 3, 16, 10, 0),
        allDay: false,
      } as Partial<CalendarEvent> & { startDate: Date })

      render(<DayView {...defaultProps} events={[otherDayEvent]} />)
      expect(screen.queryByText('Tomorrow Event')).not.toBeInTheDocument()
    })
  })

  describe('current time indicator', () => {
    it('shows the current time indicator when viewing today', () => {
      vi.useFakeTimers()
      vi.setSystemTime(new Date(2026, 3, 15, 14, 30)) // 2:30 PM on April 15

      const { container } = render(
        <DayView {...defaultProps} currentDate={new Date(2026, 3, 15)} />
      )

      // SPEC: "A horizontal line with a dot marker" for current time
      const indicator = container.querySelector('[class*="timeIndicator"], [class*="currentTime"]')
      expect(indicator).toBeInTheDocument()
    })

    it('does not show the current time indicator when viewing another day', () => {
      vi.useFakeTimers()
      vi.setSystemTime(new Date(2026, 3, 15, 14, 30))

      const { container } = render(
        <DayView {...defaultProps} currentDate={new Date(2026, 3, 20)} />
      )

      const indicator = container.querySelector('[class*="timeIndicator"], [class*="currentTime"]')
      expect(indicator).not.toBeInTheDocument()
    })
  })

  // SPEC: fix-calendar-time-slot-clicks — calendar-day-view "Time-grid event overlay
  // does not block slot clicks". JSDOM does not enforce CSS pointer-events (see
  // design.md Decision 3), so these tests lock the spec-level handler-wiring
  // contract: slots fire onTimeSlotClick with the right Date, event blocks fire
  // onEventClick (with position) and stop propagation so onTimeSlotClick does NOT
  // also fire. Browser verification covers the CSS-layer regression class.
  describe('slot click interactions', () => {
    it('clicking a non-event hour slot fires onTimeSlotClick once with a Date matching the row hour and currentDate', () => {
      const onTimeSlotClick = vi.fn()
      const onEventClick = vi.fn()
      const currentDate = new Date(2026, 3, 15) // April 15, 2026 (Wednesday)

      render(
        <DayView
          currentDate={currentDate}
          events={[]}
          onTimeSlotClick={onTimeSlotClick}
          onEventClick={onEventClick}
        />
      )

      // DayView slot aria-label = `${label} ${t("timeSlot")}`. With the i18n mock
      // returning keys as-is, t("timeSlot") === "timeSlot". Hour 14 label = "2 PM".
      const slot = screen.getByRole('button', { name: '2 PM timeSlot' })
      fireEvent.click(slot)

      expect(onTimeSlotClick).toHaveBeenCalledTimes(1)
      const clicked = onTimeSlotClick.mock.calls[0][0] as Date
      expect(clicked).toBeInstanceOf(Date)
      expect(clicked.getFullYear()).toBe(currentDate.getFullYear())
      expect(clicked.getMonth()).toBe(currentDate.getMonth())
      expect(clicked.getDate()).toBe(currentDate.getDate())
      expect(clicked.getHours()).toBe(14)
    })

    it('clicking a rendered timed event block fires onEventClick (with position) and does not fire onTimeSlotClick', () => {
      const onTimeSlotClick = vi.fn()
      const onEventClick = vi.fn()
      const currentDate = new Date(2026, 3, 15)

      const timedEvent = makeEvent({
        id: 'evt-timed-click',
        title: 'Clickable Standup',
        startDate: new Date(2026, 3, 15, 9, 0),
        endDate: new Date(2026, 3, 15, 10, 0),
        allDay: false,
      } as Partial<CalendarEvent> & { startDate: Date })

      render(
        <DayView
          currentDate={currentDate}
          events={[timedEvent]}
          onTimeSlotClick={onTimeSlotClick}
          onEventClick={onEventClick}
        />
      )

      const eventBlock = screen.getByText('Clickable Standup')
      fireEvent.click(eventBlock)

      expect(onEventClick).toHaveBeenCalledTimes(1)
      const [calledEvent, position] = onEventClick.mock.calls[0]
      expect(calledEvent).toBe(timedEvent)
      expect(position).toEqual(
        expect.objectContaining({
          top: expect.any(Number),
          left: expect.any(Number),
        })
      )
      expect(onTimeSlotClick).not.toHaveBeenCalled()
    })
  })
})
