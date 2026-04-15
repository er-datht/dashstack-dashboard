import {
  getHourLabels,
  getEventsInTimeRange,
  calculateEventPosition,
  groupOverlappingEvents,
  getWeekRange,
} from '../calendarUtils'
import type { CalendarEvent } from '../../../types/calendar'

// Helper to create a minimal CalendarEvent for testing
function makeEvent(
  overrides: Partial<CalendarEvent> & { startDate: Date }
): CalendarEvent {
  return {
    id: 'evt-1',
    title: 'Test Event',
    location: '',
    organizer: '',
    color: { border: '#000', bg: '#fff', text: '#000' },
    participants: [],
    ...overrides,
  }
}

describe('getHourLabels', () => {
  it('returns an array of 24 labels', () => {
    const labels = getHourLabels()
    expect(labels).toHaveLength(24)
  })

  it('starts with timezone label and ends with 11 PM', () => {
    const labels = getHourLabels()
    // First label is timezone (e.g., "GMT+07", "EST", "PST")
    expect(labels[0]).toMatch(/^(GMT|UTC|[A-Z]{2,5})/i)
    expect(labels[23]).toMatch(/11.*PM/i)
  })

  it('includes noon as 12 PM', () => {
    const labels = getHourLabels()
    expect(labels[12]).toMatch(/12.*PM/i)
  })

  it('transitions from AM to PM correctly', () => {
    const labels = getHourLabels()
    // 11 AM at index 11, 12 PM at index 12
    expect(labels[11]).toMatch(/11.*AM/i)
    expect(labels[12]).toMatch(/12.*PM/i)
  })
})

describe('getEventsInTimeRange', () => {
  it('returns events that fall entirely within the range', () => {
    const rangeStart = new Date(2026, 3, 15, 0, 0)
    const rangeEnd = new Date(2026, 3, 15, 23, 59)
    const event = makeEvent({
      id: 'evt-within',
      startDate: new Date(2026, 3, 15, 9, 0),
      endDate: new Date(2026, 3, 15, 10, 0),
    })

    const result = getEventsInTimeRange([event], rangeStart, rangeEnd)
    expect(result).toHaveLength(1)
    expect(result[0].id).toBe('evt-within')
  })

  it('returns events that overlap the start of the range', () => {
    const rangeStart = new Date(2026, 3, 15, 9, 0)
    const rangeEnd = new Date(2026, 3, 15, 17, 0)
    const event = makeEvent({
      id: 'evt-overlap-start',
      startDate: new Date(2026, 3, 15, 8, 0),
      endDate: new Date(2026, 3, 15, 10, 0),
    })

    const result = getEventsInTimeRange([event], rangeStart, rangeEnd)
    expect(result).toHaveLength(1)
  })

  it('returns events that overlap the end of the range', () => {
    const rangeStart = new Date(2026, 3, 15, 9, 0)
    const rangeEnd = new Date(2026, 3, 15, 17, 0)
    const event = makeEvent({
      id: 'evt-overlap-end',
      startDate: new Date(2026, 3, 15, 16, 0),
      endDate: new Date(2026, 3, 15, 18, 0),
    })

    const result = getEventsInTimeRange([event], rangeStart, rangeEnd)
    expect(result).toHaveLength(1)
  })

  it('excludes events entirely outside the range', () => {
    const rangeStart = new Date(2026, 3, 15, 9, 0)
    const rangeEnd = new Date(2026, 3, 15, 17, 0)
    const event = makeEvent({
      id: 'evt-outside',
      startDate: new Date(2026, 3, 16, 9, 0),
      endDate: new Date(2026, 3, 16, 10, 0),
    })

    const result = getEventsInTimeRange([event], rangeStart, rangeEnd)
    expect(result).toHaveLength(0)
  })

  it('returns empty array when no events provided', () => {
    const rangeStart = new Date(2026, 3, 15, 0, 0)
    const rangeEnd = new Date(2026, 3, 15, 23, 59)

    const result = getEventsInTimeRange([], rangeStart, rangeEnd)
    expect(result).toHaveLength(0)
  })

  it('includes events that span the entire range', () => {
    const rangeStart = new Date(2026, 3, 15, 9, 0)
    const rangeEnd = new Date(2026, 3, 15, 17, 0)
    const event = makeEvent({
      id: 'evt-spans-all',
      startDate: new Date(2026, 3, 15, 0, 0),
      endDate: new Date(2026, 3, 15, 23, 59),
    })

    const result = getEventsInTimeRange([event], rangeStart, rangeEnd)
    expect(result).toHaveLength(1)
  })
})

describe('calculateEventPosition', () => {
  it('returns top 0% for an event starting at midnight', () => {
    const dayStart = new Date(2026, 3, 15, 0, 0)
    const event = makeEvent({
      startDate: new Date(2026, 3, 15, 0, 0),
      endDate: new Date(2026, 3, 15, 1, 0),
    })

    const position = calculateEventPosition(event, dayStart)
    expect(position.top).toBeCloseTo(0)
  })

  it('returns top ~50% for an event starting at noon', () => {
    const dayStart = new Date(2026, 3, 15, 0, 0)
    const event = makeEvent({
      startDate: new Date(2026, 3, 15, 12, 0),
      endDate: new Date(2026, 3, 15, 13, 0),
    })

    const position = calculateEventPosition(event, dayStart)
    // 12 hours / 24 hours = 50%
    expect(position.top).toBeCloseTo(50)
  })

  it('returns correct height for a 1-hour event', () => {
    const dayStart = new Date(2026, 3, 15, 0, 0)
    const event = makeEvent({
      startDate: new Date(2026, 3, 15, 9, 0),
      endDate: new Date(2026, 3, 15, 10, 0),
    })

    const position = calculateEventPosition(event, dayStart)
    // 1 hour / 24 hours = ~4.167%
    expect(position.height).toBeCloseTo(100 / 24)
  })

  it('returns correct height for a 1.5-hour event', () => {
    const dayStart = new Date(2026, 3, 15, 0, 0)
    const event = makeEvent({
      startDate: new Date(2026, 3, 15, 9, 0),
      endDate: new Date(2026, 3, 15, 10, 30),
    })

    const position = calculateEventPosition(event, dayStart)
    // 1.5 hours / 24 hours = 6.25%
    expect(position.height).toBeCloseTo(6.25)
  })

  it('enforces minimum height for very short events (30 min equivalent)', () => {
    const dayStart = new Date(2026, 3, 15, 0, 0)
    const event = makeEvent({
      startDate: new Date(2026, 3, 15, 9, 0),
      endDate: new Date(2026, 3, 15, 9, 15), // 15 min event
    })

    const position = calculateEventPosition(event, dayStart)
    // Min height should be at least 30 min worth = 30/1440 * 100 = ~2.083%
    const minHeight = (30 / 1440) * 100
    expect(position.height).toBeGreaterThanOrEqual(minHeight)
  })

  it('clips event at midnight when it spans past end of day', () => {
    const dayStart = new Date(2026, 3, 15, 0, 0)
    const event = makeEvent({
      startDate: new Date(2026, 3, 15, 23, 0),
      endDate: new Date(2026, 3, 16, 1, 0), // extends past midnight
    })

    const position = calculateEventPosition(event, dayStart)
    // Should be clipped: top at 23/24 * 100, height = 1/24 * 100 (only to midnight)
    expect(position.top).toBeCloseTo((23 / 24) * 100)
    expect(position.top + position.height).toBeLessThanOrEqual(100)
  })
})

describe('groupOverlappingEvents', () => {
  it('assigns column 0 to a single event', () => {
    const event = makeEvent({
      id: 'evt-1',
      startDate: new Date(2026, 3, 15, 9, 0),
      endDate: new Date(2026, 3, 15, 10, 0),
    })

    const grouped = groupOverlappingEvents([event])
    expect(grouped).toHaveLength(1)
    expect(grouped[0].column).toBe(0)
    expect(grouped[0].totalColumns).toBe(1)
  })

  it('assigns adjacent columns to two overlapping events', () => {
    const event1 = makeEvent({
      id: 'evt-1',
      startDate: new Date(2026, 3, 15, 9, 0),
      endDate: new Date(2026, 3, 15, 10, 0),
    })
    const event2 = makeEvent({
      id: 'evt-2',
      startDate: new Date(2026, 3, 15, 9, 30),
      endDate: new Date(2026, 3, 15, 11, 0),
    })

    const grouped = groupOverlappingEvents([event1, event2])
    expect(grouped).toHaveLength(2)

    const columns = grouped.map((g) => g.column).sort()
    expect(columns).toEqual([0, 1])

    // Both should report totalColumns = 2
    expect(grouped[0].totalColumns).toBe(2)
    expect(grouped[1].totalColumns).toBe(2)
  })

  it('assigns three columns to three mutually overlapping events', () => {
    const event1 = makeEvent({
      id: 'evt-1',
      startDate: new Date(2026, 3, 15, 9, 0),
      endDate: new Date(2026, 3, 15, 11, 0),
    })
    const event2 = makeEvent({
      id: 'evt-2',
      startDate: new Date(2026, 3, 15, 9, 30),
      endDate: new Date(2026, 3, 15, 10, 30),
    })
    const event3 = makeEvent({
      id: 'evt-3',
      startDate: new Date(2026, 3, 15, 10, 0),
      endDate: new Date(2026, 3, 15, 12, 0),
    })

    const grouped = groupOverlappingEvents([event1, event2, event3])
    expect(grouped).toHaveLength(3)

    const columns = grouped.map((g) => g.column).sort()
    expect(columns).toEqual([0, 1, 2])

    // All should report totalColumns = 3
    grouped.forEach((g) => {
      expect(g.totalColumns).toBe(3)
    })
  })

  it('does not group non-overlapping events together', () => {
    const event1 = makeEvent({
      id: 'evt-1',
      startDate: new Date(2026, 3, 15, 9, 0),
      endDate: new Date(2026, 3, 15, 10, 0),
    })
    const event2 = makeEvent({
      id: 'evt-2',
      startDate: new Date(2026, 3, 15, 14, 0),
      endDate: new Date(2026, 3, 15, 15, 0),
    })

    const grouped = groupOverlappingEvents([event1, event2])
    expect(grouped).toHaveLength(2)

    // Both should be in column 0 with totalColumns = 1 (no overlap)
    grouped.forEach((g) => {
      expect(g.column).toBe(0)
      expect(g.totalColumns).toBe(1)
    })
  })

  it('returns empty array for empty input', () => {
    const grouped = groupOverlappingEvents([])
    expect(grouped).toHaveLength(0)
  })

  it('preserves event data in the result', () => {
    const event = makeEvent({
      id: 'evt-preserve',
      title: 'Important Meeting',
      startDate: new Date(2026, 3, 15, 9, 0),
      endDate: new Date(2026, 3, 15, 10, 0),
    })

    const grouped = groupOverlappingEvents([event])
    expect(grouped[0].event.id).toBe('evt-preserve')
    expect(grouped[0].event.title).toBe('Important Meeting')
  })
})

describe('getWeekRange', () => {
  it('returns Sunday as start and Saturday as end for a mid-week date', () => {
    // April 15, 2026 is a Wednesday
    const date = new Date(2026, 3, 15)
    const range = getWeekRange(date)

    // Sunday April 12
    expect(range.start.getDay()).toBe(0) // Sunday
    expect(range.start.getDate()).toBe(12)
    expect(range.start.getMonth()).toBe(3) // April

    // Saturday April 18
    expect(range.end.getDay()).toBe(6) // Saturday
    expect(range.end.getDate()).toBe(18)
    expect(range.end.getMonth()).toBe(3) // April
  })

  it('returns the same day as start when the date is a Sunday', () => {
    // April 12, 2026 is a Sunday
    const date = new Date(2026, 3, 12)
    const range = getWeekRange(date)

    expect(range.start.getDate()).toBe(12)
    expect(range.end.getDate()).toBe(18)
  })

  it('returns the same day as end when the date is a Saturday', () => {
    // April 18, 2026 is a Saturday
    const date = new Date(2026, 3, 18)
    const range = getWeekRange(date)

    expect(range.start.getDate()).toBe(12)
    expect(range.end.getDate()).toBe(18)
  })

  it('handles week crossing month boundary', () => {
    // March 30, 2026 is a Monday; week is Mar 29 (Sun) - Apr 4 (Sat)
    const date = new Date(2026, 2, 30)
    const range = getWeekRange(date)

    expect(range.start.getMonth()).toBe(2) // March
    expect(range.start.getDate()).toBe(29)
    expect(range.end.getMonth()).toBe(3) // April
    expect(range.end.getDate()).toBe(4)
  })

  it('handles week crossing year boundary', () => {
    // Dec 31, 2025 is a Wednesday; week is Dec 28 (Sun) - Jan 3 (Sat)
    const date = new Date(2025, 11, 31)
    const range = getWeekRange(date)

    expect(range.start.getFullYear()).toBe(2025)
    expect(range.start.getMonth()).toBe(11) // December
    expect(range.start.getDate()).toBe(28)

    expect(range.end.getFullYear()).toBe(2026)
    expect(range.end.getMonth()).toBe(0) // January
    expect(range.end.getDate()).toBe(3)
  })
})
