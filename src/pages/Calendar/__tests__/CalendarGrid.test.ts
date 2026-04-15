import { generateCalendarDays } from '../CalendarGrid'

describe('generateCalendarDays', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  describe('today in current month', () => {
    it('marks exactly one day as isToday when today is in the viewed month', () => {
      vi.useFakeTimers()
      vi.setSystemTime(new Date(2026, 3, 15)) // April 15, 2026

      const days = generateCalendarDays(3, 2026) // April 2026

      const todayDays = days.filter((d) => d.isToday)
      expect(todayDays).toHaveLength(1)
      expect(todayDays[0].dayOfMonth).toBe(15)
      expect(todayDays[0].isCurrentMonth).toBe(true)
    })

    it('sets isToday to false for all other days', () => {
      vi.useFakeTimers()
      vi.setSystemTime(new Date(2026, 3, 15)) // April 15, 2026

      const days = generateCalendarDays(3, 2026) // April 2026

      const nonTodayDays = days.filter((d) => !d.isToday)
      expect(nonTodayDays).toHaveLength(41) // 42 total - 1 today
      expect(nonTodayDays.every((d) => d.isToday === false)).toBe(true)
    })
  })

  describe('today in adjacent month row', () => {
    it('marks today as isToday even when it falls in leading/trailing days', () => {
      // May 1, 2026 is a Friday. April 2026 grid will have trailing days
      // from May (May 1, May 2). Set today to May 1 and view April.
      vi.useFakeTimers()
      vi.setSystemTime(new Date(2026, 4, 1)) // May 1, 2026

      const days = generateCalendarDays(3, 2026) // Viewing April 2026

      const todayDays = days.filter((d) => d.isToday)
      expect(todayDays).toHaveLength(1)
      expect(todayDays[0].dayOfMonth).toBe(1)
      expect(todayDays[0].isCurrentMonth).toBe(false)
    })
  })

  describe('viewed month does not contain today', () => {
    it('sets isToday to false for all 42 days when today is not visible', () => {
      vi.useFakeTimers()
      vi.setSystemTime(new Date(2026, 3, 15)) // April 15, 2026

      // View January 2026 - today (April 15) is nowhere in the 42 cells
      const days = generateCalendarDays(0, 2026) // January 2026

      expect(days).toHaveLength(42)
      expect(days.every((d) => d.isToday === false)).toBe(true)
    })
  })
})
