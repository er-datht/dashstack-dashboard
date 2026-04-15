import { render, screen, fireEvent } from '@testing-library/react'
import CalendarHeader from '../CalendarHeader'

// SPEC: CalendarHeader props from design.md decision #3:
// viewMode: 'day' | 'week' | 'month'
// onViewChange: (mode: 'day' | 'week' | 'month') => void
// onPrev: () => void
// onNext: () => void
// onToday: () => void
// label: string

describe('CalendarHeader', () => {
  const defaultProps = {
    viewMode: 'month' as const,
    onViewChange: vi.fn(),
    onPrev: vi.fn(),
    onNext: vi.fn(),
    onToday: vi.fn(),
    label: 'April 2026',
  }

  describe('rendering', () => {
    it('renders the Today button', () => {
      render(<CalendarHeader {...defaultProps} />)
      expect(screen.getByText('today')).toBeInTheDocument()
    })

    it('renders the label text', () => {
      render(<CalendarHeader {...defaultProps} label="April 2026" />)
      expect(screen.getByText('April 2026')).toBeInTheDocument()
    })

    it('renders previous and next navigation buttons', () => {
      render(<CalendarHeader {...defaultProps} />)
      // Buttons use aria-labels with translation keys
      expect(screen.getByRole('button', { name: /previous/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /next/i })).toBeInTheDocument()
    })

    it('renders all three view toggle buttons', () => {
      render(<CalendarHeader {...defaultProps} />)
      expect(screen.getByText('viewDay')).toBeInTheDocument()
      expect(screen.getByText('viewWeek')).toBeInTheDocument()
      expect(screen.getByText('viewMonth')).toBeInTheDocument()
    })
  })

  describe('active view toggle', () => {
    it('applies active class to the Month button when viewMode is month', () => {
      render(<CalendarHeader {...defaultProps} viewMode="month" />)
      const monthButton = screen.getByText('viewMonth')
      expect(monthButton).toHaveClass('viewToggleButtonActive')
    })

    it('applies active class to the Day button when viewMode is day', () => {
      render(<CalendarHeader {...defaultProps} viewMode="day" />)
      const dayButton = screen.getByText('viewDay')
      expect(dayButton).toHaveClass('viewToggleButtonActive')
    })

    it('applies active class to the Week button when viewMode is week', () => {
      render(<CalendarHeader {...defaultProps} viewMode="week" />)
      const weekButton = screen.getByText('viewWeek')
      expect(weekButton).toHaveClass('viewToggleButtonActive')
    })

    it('does not apply active class to inactive buttons', () => {
      render(<CalendarHeader {...defaultProps} viewMode="day" />)
      const weekButton = screen.getByText('viewWeek')
      const monthButton = screen.getByText('viewMonth')
      expect(weekButton).not.toHaveClass('viewToggleButtonActive')
      expect(monthButton).not.toHaveClass('viewToggleButtonActive')
    })
  })

  describe('click interactions', () => {
    it('calls onToday when Today button is clicked', () => {
      const onToday = vi.fn()
      render(<CalendarHeader {...defaultProps} onToday={onToday} />)
      fireEvent.click(screen.getByText('today'))
      expect(onToday).toHaveBeenCalledTimes(1)
    })

    it('calls onPrev when previous button is clicked', () => {
      const onPrev = vi.fn()
      render(<CalendarHeader {...defaultProps} onPrev={onPrev} />)
      fireEvent.click(screen.getByRole('button', { name: /previous/i }))
      expect(onPrev).toHaveBeenCalledTimes(1)
    })

    it('calls onNext when next button is clicked', () => {
      const onNext = vi.fn()
      render(<CalendarHeader {...defaultProps} onNext={onNext} />)
      fireEvent.click(screen.getByRole('button', { name: /next/i }))
      expect(onNext).toHaveBeenCalledTimes(1)
    })

    it('calls onViewChange with "day" when Day toggle is clicked', () => {
      const onViewChange = vi.fn()
      render(<CalendarHeader {...defaultProps} onViewChange={onViewChange} />)
      fireEvent.click(screen.getByText('viewDay'))
      expect(onViewChange).toHaveBeenCalledWith('day')
    })

    it('calls onViewChange with "week" when Week toggle is clicked', () => {
      const onViewChange = vi.fn()
      render(<CalendarHeader {...defaultProps} onViewChange={onViewChange} />)
      fireEvent.click(screen.getByText('viewWeek'))
      expect(onViewChange).toHaveBeenCalledWith('week')
    })

    it('calls onViewChange with "month" when Month toggle is clicked', () => {
      const onViewChange = vi.fn()
      render(<CalendarHeader {...defaultProps} onViewChange={onViewChange} />)
      fireEvent.click(screen.getByText('viewMonth'))
      expect(onViewChange).toHaveBeenCalledWith('month')
    })
  })
})
