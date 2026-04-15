import {
  formatCurrency,
  formatDate,
  formatNumber,
  truncate,
  capitalize,
  toTitleCase,
  formatFileSize,
} from '../formatters'

describe('formatters', () => {
  describe('formatCurrency', () => {
    it('formats USD by default', () => {
      expect(formatCurrency(1234.56, 'USD', 'en-US')).toBe('$1,234.56')
    })

    it('formats zero', () => {
      expect(formatCurrency(0, 'USD', 'en-US')).toBe('$0.00')
    })

    it('formats negative amounts', () => {
      expect(formatCurrency(-99.99, 'USD', 'en-US')).toBe('-$99.99')
    })

    it('formats EUR currency', () => {
      expect(formatCurrency(1000, 'EUR', 'en-US')).toBe('\u20AC1,000.00')
    })

    it('formats large numbers', () => {
      expect(formatCurrency(1000000, 'USD', 'en-US')).toBe('$1,000,000.00')
    })
  })

  describe('formatDate', () => {
    it('formats a date string with default options', () => {
      const result = formatDate(
        '2024-01-15',
        { year: 'numeric', month: 'long', day: 'numeric' },
        'en-US'
      )
      expect(result).toBe('January 15, 2024')
    })

    it('formats a Date object', () => {
      const date = new Date(2024, 0, 15)
      const result = formatDate(
        date,
        { year: 'numeric', month: 'long', day: 'numeric' },
        'en-US'
      )
      expect(result).toBe('January 15, 2024')
    })

    it('formats with custom options', () => {
      const result = formatDate(
        '2024-06-01',
        { year: 'numeric', month: 'short' },
        'en-US'
      )
      expect(result).toBe('Jun 2024')
    })

    it('formats with numeric month and day', () => {
      const result = formatDate(
        '2024-03-05',
        { year: 'numeric', month: '2-digit', day: '2-digit' },
        'en-US'
      )
      expect(result).toBe('03/05/2024')
    })
  })

  describe('formatNumber', () => {
    it('formats integers with thousand separators', () => {
      expect(formatNumber(1234567, 'en-US')).toBe('1,234,567')
    })

    it('formats zero', () => {
      expect(formatNumber(0, 'en-US')).toBe('0')
    })

    it('formats negative numbers', () => {
      expect(formatNumber(-5000, 'en-US')).toBe('-5,000')
    })

    it('formats decimal numbers', () => {
      expect(formatNumber(1234.567, 'en-US')).toBe('1,234.567')
    })

    it('formats small numbers without separators', () => {
      expect(formatNumber(999, 'en-US')).toBe('999')
    })
  })

  describe('truncate', () => {
    it('returns the original string if shorter than maxLength', () => {
      expect(truncate('hello', 10)).toBe('hello')
    })

    it('returns the original string if equal to maxLength', () => {
      expect(truncate('hello', 5)).toBe('hello')
    })

    it('truncates and adds ellipsis if longer than maxLength', () => {
      expect(truncate('hello world', 5)).toBe('hello...')
    })

    it('handles empty string', () => {
      expect(truncate('', 5)).toBe('')
    })

    it('handles maxLength of 0', () => {
      expect(truncate('hello', 0)).toBe('...')
    })

    it('handles single character truncation', () => {
      expect(truncate('ab', 1)).toBe('a...')
    })
  })

  describe('capitalize', () => {
    it('capitalizes the first letter', () => {
      expect(capitalize('hello')).toBe('Hello')
    })

    it('lowercases the rest of the string', () => {
      expect(capitalize('hELLO')).toBe('Hello')
    })

    it('handles a single character', () => {
      expect(capitalize('a')).toBe('A')
    })

    it('handles empty string', () => {
      expect(capitalize('')).toBe('')
    })

    it('handles already capitalized string', () => {
      expect(capitalize('Hello')).toBe('Hello')
    })

    it('handles all uppercase string', () => {
      expect(capitalize('WORLD')).toBe('World')
    })
  })

  describe('toTitleCase', () => {
    it('converts a simple phrase to title case', () => {
      expect(toTitleCase('hello world')).toBe('Hello World')
    })

    it('handles all uppercase input', () => {
      expect(toTitleCase('HELLO WORLD')).toBe('Hello World')
    })

    it('handles a single word', () => {
      expect(toTitleCase('hello')).toBe('Hello')
    })

    it('handles empty string', () => {
      expect(toTitleCase('')).toBe('')
    })

    it('handles mixed case input', () => {
      expect(toTitleCase('hElLo WoRlD')).toBe('Hello World')
    })

    it('handles multiple words', () => {
      expect(toTitleCase('the quick brown fox')).toBe('The Quick Brown Fox')
    })
  })

  describe('formatFileSize', () => {
    it('returns "0 Bytes" for zero', () => {
      expect(formatFileSize(0)).toBe('0 Bytes')
    })

    it('formats bytes', () => {
      expect(formatFileSize(500)).toBe('500 Bytes')
    })

    it('formats kilobytes', () => {
      expect(formatFileSize(1024)).toBe('1 KB')
    })

    it('formats megabytes', () => {
      expect(formatFileSize(1048576)).toBe('1 MB')
    })

    it('formats gigabytes', () => {
      expect(formatFileSize(1073741824)).toBe('1 GB')
    })

    it('formats terabytes', () => {
      expect(formatFileSize(1099511627776)).toBe('1 TB')
    })

    it('formats fractional sizes', () => {
      expect(formatFileSize(1536)).toBe('1.5 KB')
    })

    it('rounds to 2 decimal places', () => {
      expect(formatFileSize(1234567)).toBe('1.18 MB')
    })

    it('formats 1 byte', () => {
      expect(formatFileSize(1)).toBe('1 Bytes')
    })
  })
})
