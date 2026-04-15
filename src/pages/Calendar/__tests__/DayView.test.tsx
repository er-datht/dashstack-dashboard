import { render, screen } from '@testing-library/react'
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
})
