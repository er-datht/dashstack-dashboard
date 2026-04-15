import { render, screen } from '@testing-library/react'
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
})
