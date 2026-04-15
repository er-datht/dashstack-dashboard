import { render, screen } from '@testing-library/react'
import StatusBadge from '../index'

describe('StatusBadge', () => {
  describe('rendering status text', () => {
    it('renders the delivered translation key', () => {
      render(<StatusBadge status="Delivered" />)
      expect(screen.getByText('status.delivered')).toBeInTheDocument()
    })

    it('renders the pending translation key', () => {
      render(<StatusBadge status="Pending" />)
      expect(screen.getByText('status.pending')).toBeInTheDocument()
    })

    it('renders the rejected translation key', () => {
      render(<StatusBadge status="Rejected" />)
      expect(screen.getByText('status.rejected')).toBeInTheDocument()
    })
  })

  describe('status-specific CSS classes', () => {
    it('applies teal classes for Delivered status', () => {
      render(<StatusBadge status="Delivered" />)
      const badge = screen.getByText('status.delivered')
      expect(badge).toHaveClass('bg-teal-500', 'text-white')
    })

    it('applies yellow classes for Pending status', () => {
      render(<StatusBadge status="Pending" />)
      const badge = screen.getByText('status.pending')
      expect(badge).toHaveClass('bg-yellow-500', 'text-white')
    })

    it('applies red classes for Rejected status', () => {
      render(<StatusBadge status="Rejected" />)
      const badge = screen.getByText('status.rejected')
      expect(badge).toHaveClass('bg-red-500', 'text-white')
    })
  })

  describe('base CSS classes', () => {
    it('always includes base layout classes', () => {
      render(<StatusBadge status="Delivered" />)
      const badge = screen.getByText('status.delivered')
      expect(badge).toHaveClass(
        'inline-flex',
        'items-center',
        'justify-center',
        'rounded-full',
        'text-sm',
        'font-medium'
      )
    })
  })

  describe('className prop', () => {
    it('merges custom className with status classes', () => {
      render(
        <StatusBadge status="Delivered" className="mt-4 custom-class" />
      )
      const badge = screen.getByText('status.delivered')
      expect(badge).toHaveClass('mt-4', 'custom-class', 'bg-teal-500')
    })

    it('renders without extra classes when className is not provided', () => {
      render(<StatusBadge status="Pending" />)
      const badge = screen.getByText('status.pending')
      expect(badge).toHaveClass('bg-yellow-500')
      expect(badge.className).not.toContain('undefined')
    })
  })
})
