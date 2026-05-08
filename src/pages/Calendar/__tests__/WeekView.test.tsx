import { fireEvent, render, screen } from '@testing-library/react'
import WeekView from '../WeekView'
import type { CalendarEvent } from '../../../types/calendar'

// SPEC: WeekView props (derived from design.md and spec):
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

describe('WeekView', () => {
  const defaultProps = {
    currentDate: new Date(2026, 3, 15), // April 15, 2026 (Wednesday)
    events: [] as CalendarEvent[],
    onTimeSlotClick: vi.fn(),
    onEventClick: vi.fn(),
  }

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('column layout', () => {
    it('renders 7 day column headers', () => {
      render(<WeekView {...defaultProps} />)
      // Week of April 12-18, 2026 (Sun-Sat)
      // Column headers display abbreviated day name + date: "SUN 12", "MON 13", etc.
      // Since i18n is mocked, day names come back as translation keys
      // SPEC: "column headers show SUN 12, MON 13, TUE 14, WED 15, THU 16, FRI 17, SAT 18"
      // Note: /12/ matches hour labels "12 AM"/"12 PM" too, so use exact text match for "12"
      expect(screen.getByText('12')).toBeInTheDocument() // Sunday
      expect(screen.getByText('13')).toBeInTheDocument() // Monday
      expect(screen.getByText('14')).toBeInTheDocument() // Tuesday
      expect(screen.getByText('15')).toBeInTheDocument() // Wednesday
      expect(screen.getByText('16')).toBeInTheDocument() // Thursday
      expect(screen.getByText('17')).toBeInTheDocument() // Friday
      expect(screen.getByText('18')).toBeInTheDocument() // Saturday
    })

    it('renders hour labels in the gutter', () => {
      render(<WeekView {...defaultProps} />)
      // First label is timezone, 12 PM should be present
      const tzLabels = screen.getAllByText(/^(GMT|UTC)/i)
      expect(tzLabels.length).toBeGreaterThanOrEqual(1)
      expect(screen.getByText(/^12\s*PM$/i)).toBeInTheDocument()
    })
  })

  describe('today highlight', () => {
    it('highlights today column header with a badge when current week contains today', () => {
      vi.useFakeTimers()
      vi.setSystemTime(new Date(2026, 3, 15, 10, 0)) // April 15, Wednesday

      const { container } = render(
        <WeekView {...defaultProps} currentDate={new Date(2026, 3, 15)} />
      )

      // SPEC: "Today's column header SHALL display the date number with the same
      // blue circle badge used in the month view" (todayNumber class from CalendarGrid)
      const todayBadge = container.querySelector('[class*="today"], [class*="Today"]')
      expect(todayBadge).toBeInTheDocument()
    })

    it('does not highlight any column when viewing a week that does not contain today', () => {
      vi.useFakeTimers()
      vi.setSystemTime(new Date(2026, 3, 15, 10, 0)) // April 15

      const { container } = render(
        <WeekView {...defaultProps} currentDate={new Date(2026, 3, 5)} />
      )

      // Week of Apr 5 = Mar 29 - Apr 4 (does not contain Apr 15)
      const todayBadge = container.querySelector('[class*="today"], [class*="Today"]')
      expect(todayBadge).not.toBeInTheDocument()
    })
  })

  describe('timed events', () => {
    it('renders a timed event in the correct day column', () => {
      const timedEvent = makeEvent({
        id: 'evt-wed',
        title: 'Wednesday Meeting',
        startDate: new Date(2026, 3, 15, 14, 0), // Wed 2 PM
        endDate: new Date(2026, 3, 15, 15, 0),
        allDay: false,
      } as Partial<CalendarEvent> & { startDate: Date })

      render(<WeekView {...defaultProps} events={[timedEvent]} />)
      expect(screen.getByText('Wednesday Meeting')).toBeInTheDocument()
    })

    it('does not render events from outside the current week', () => {
      const outsideEvent = makeEvent({
        id: 'evt-outside',
        title: 'Next Week Event',
        startDate: new Date(2026, 3, 22, 9, 0), // April 22 - next week
        endDate: new Date(2026, 3, 22, 10, 0),
        allDay: false,
      } as Partial<CalendarEvent> & { startDate: Date })

      render(<WeekView {...defaultProps} events={[outsideEvent]} />)
      expect(screen.queryByText('Next Week Event')).not.toBeInTheDocument()
    })
  })

  describe('all-day events', () => {
    it('renders a single-day all-day event', () => {
      const allDayEvent = makeEvent({
        id: 'evt-allday',
        title: 'All Day Conference',
        startDate: new Date(2026, 3, 15),
        endDate: new Date(2026, 3, 15),
        allDay: true,
      } as Partial<CalendarEvent> & { startDate: Date })

      render(<WeekView {...defaultProps} events={[allDayEvent]} />)
      expect(screen.getByText('All Day Conference')).toBeInTheDocument()
    })

    it('renders a multi-day all-day event', () => {
      const multiDayEvent = makeEvent({
        id: 'evt-multi',
        title: 'Multi Day Retreat',
        startDate: new Date(2026, 3, 14), // Tuesday
        endDate: new Date(2026, 3, 16), // Thursday
        allDay: true,
      } as Partial<CalendarEvent> & { startDate: Date })

      render(<WeekView {...defaultProps} events={[multiDayEvent]} />)
      expect(screen.getByText('Multi Day Retreat')).toBeInTheDocument()
    })

    // SPEC: fix-week-view-all-day-event-stacking — when two or more all-day events
    // share at least one visible day-column, they SHALL stack into distinct vertical
    // rows. Implementation renders each bar with `top: ${rowIdx * 24}px` (stride =
    // 22px bar height + 2px gap) so rowIdx 0/1 → top 0/24px.
    it('renders multiple overlapping all-day events at distinct vertical positions', () => {
      // Both events fall on Friday April 17, 2026 in the visible week.
      const fri1 = makeEvent({
        id: 'evt-fri-1',
        title: 'Friday Event A',
        startDate: new Date(2026, 3, 17),
        endDate: new Date(2026, 3, 17),
        allDay: true,
      } as Partial<CalendarEvent> & { startDate: Date })
      const fri2 = makeEvent({
        id: 'evt-fri-2',
        title: 'Friday Event B',
        startDate: new Date(2026, 3, 17),
        endDate: new Date(2026, 3, 17),
        allDay: true,
      } as Partial<CalendarEvent> & { startDate: Date })

      render(<WeekView {...defaultProps} events={[fri1, fri2]} />)

      // Both bars present in the DOM.
      const barA = screen.getByText('Friday Event A')
      const barB = screen.getByText('Friday Event B')
      expect(barA).toBeInTheDocument()
      expect(barB).toBeInTheDocument()

      // Their inline `top` values must be distinct, with one at '0px' and the other at '24px'.
      const tops = [barA.style.top, barB.style.top].sort()
      expect(tops).toEqual(['0px', '24px'])
    })

    it('grows the all-day grid minHeight to reflect stacked row count', () => {
      const fri1 = makeEvent({
        id: 'evt-fri-1',
        title: 'Friday Event A',
        startDate: new Date(2026, 3, 17),
        endDate: new Date(2026, 3, 17),
        allDay: true,
      } as Partial<CalendarEvent> & { startDate: Date })
      const fri2 = makeEvent({
        id: 'evt-fri-2',
        title: 'Friday Event B',
        startDate: new Date(2026, 3, 17),
        endDate: new Date(2026, 3, 17),
        allDay: true,
      } as Partial<CalendarEvent> & { startDate: Date })

      const { container } = render(
        <WeekView {...defaultProps} events={[fri1, fri2]} />
      )

      // Vitest CSS module classNameStrategy is 'non-scoped' (see vitest.config.ts),
      // so the rendered class name matches the SCSS source name verbatim.
      const grid = container.querySelector('.weekAllDayGrid') as HTMLElement | null
      expect(grid).not.toBeNull()

      // SPEC: minHeight = rowCount * 24 + 4. With 2 rows → 2 * 24 + 4 = 52px.
      expect(grid?.style.minHeight).toBe('52px')
    })
  })

  describe('current time indicator', () => {
    it('shows the current time indicator when current week contains today', () => {
      vi.useFakeTimers()
      vi.setSystemTime(new Date(2026, 3, 15, 14, 30))

      const { container } = render(
        <WeekView {...defaultProps} currentDate={new Date(2026, 3, 15)} />
      )

      const indicator = container.querySelector('[class*="timeIndicator"], [class*="currentTime"]')
      expect(indicator).toBeInTheDocument()
    })

    it('does not show the current time indicator when viewing another week', () => {
      vi.useFakeTimers()
      vi.setSystemTime(new Date(2026, 3, 15, 14, 30))

      const { container } = render(
        <WeekView {...defaultProps} currentDate={new Date(2026, 3, 5)} />
      )

      const indicator = container.querySelector('[class*="timeIndicator"], [class*="currentTime"]')
      expect(indicator).not.toBeInTheDocument()
    })
  })

  // SPEC: fix-calendar-time-slot-clicks — calendar-week-view "Per-day event overlay
  // does not block slot clicks". JSDOM does not enforce CSS pointer-events (see
  // design.md Decision 3), so these tests lock the spec-level handler-wiring
  // contract: slots fire onTimeSlotClick with the right day/hour Date, and event
  // blocks fire onEventClick while stopping propagation so onTimeSlotClick does
  // NOT also fire. Browser verification covers the CSS-layer regression class.
  describe('slot click interactions', () => {
    it('clicking the Wednesday 2 PM slot fires onTimeSlotClick with a Date for Wed 14:00', () => {
      const onTimeSlotClick = vi.fn()
      const onEventClick = vi.fn()
      // April 15, 2026 is a Wednesday (getDay() === 3)
      const currentDate = new Date(2026, 3, 15)

      render(
        <WeekView
          currentDate={currentDate}
          events={[]}
          onTimeSlotClick={onTimeSlotClick}
          onEventClick={onEventClick}
        />
      )

      // WeekView slot aria-label = `${t("dayNames.<key>")} ${label} ${t("timeSlot")}`.
      // With the i18n mock returning keys as-is, day key "wed" produces
      // "dayNames.wed", and hour 14 label = "2 PM".
      const slot = screen.getByRole('button', {
        name: 'dayNames.wed 2 PM timeSlot',
      })
      fireEvent.click(slot)

      expect(onTimeSlotClick).toHaveBeenCalledTimes(1)
      const clicked = onTimeSlotClick.mock.calls[0][0] as Date
      expect(clicked).toBeInstanceOf(Date)
      expect(clicked.getDay()).toBe(3) // Wednesday
      expect(clicked.getHours()).toBe(14)
      // Sanity-check the date matches the Wednesday of the rendered week.
      expect(clicked.getFullYear()).toBe(2026)
      expect(clicked.getMonth()).toBe(3) // April
      expect(clicked.getDate()).toBe(15)
    })

    it('clicking a rendered Wednesday timed event block fires onEventClick and does not fire onTimeSlotClick', () => {
      const onTimeSlotClick = vi.fn()
      const onEventClick = vi.fn()
      const currentDate = new Date(2026, 3, 15)

      const wedEvent = makeEvent({
        id: 'evt-wed-click',
        title: 'Clickable Wed Meeting',
        startDate: new Date(2026, 3, 15, 14, 0),
        endDate: new Date(2026, 3, 15, 15, 0),
        allDay: false,
      } as Partial<CalendarEvent> & { startDate: Date })

      render(
        <WeekView
          currentDate={currentDate}
          events={[wedEvent]}
          onTimeSlotClick={onTimeSlotClick}
          onEventClick={onEventClick}
        />
      )

      const eventBlock = screen.getByText('Clickable Wed Meeting')
      fireEvent.click(eventBlock)

      expect(onEventClick).toHaveBeenCalledTimes(1)
      const [calledEvent, position] = onEventClick.mock.calls[0]
      expect(calledEvent).toBe(wedEvent)
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
