import { render, screen, fireEvent } from '@testing-library/react'
import TopNav from '../index'

const mockNavigate = vi.fn()

vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
}))

describe('TopNav', () => {
  describe('user menu trigger', () => {
    it('renders a profile trigger button with aria-haspopup="menu"', () => {
      render(<TopNav />)

      const trigger = screen.getByRole('button', { name: /moni roy/i })
      expect(trigger).toHaveAttribute('aria-haspopup', 'menu')
    })

    it('has aria-expanded="false" by default', () => {
      render(<TopNav />)

      const trigger = screen.getByRole('button', { name: /moni roy/i })
      expect(trigger).toHaveAttribute('aria-expanded', 'false')
    })

    it('toggles aria-expanded on click', () => {
      render(<TopNav />)

      const trigger = screen.getByRole('button', { name: /moni roy/i })

      fireEvent.click(trigger)
      expect(trigger).toHaveAttribute('aria-expanded', 'true')

      fireEvent.click(trigger)
      expect(trigger).toHaveAttribute('aria-expanded', 'false')
    })
  })

  describe('dropdown visibility', () => {
    it('shows user menu items when trigger is clicked', () => {
      render(<TopNav />)

      // Menu items not visible initially
      expect(
        screen.queryByText('navigation:userMenu.logOut')
      ).not.toBeInTheDocument()

      const trigger = screen.getByRole('button', { name: /moni roy/i })
      fireEvent.click(trigger)

      // Menu items visible after click
      expect(
        screen.getByText('navigation:userMenu.logOut')
      ).toBeInTheDocument()
    })

    it('closes dropdown when clicking outside', () => {
      render(<TopNav />)

      const trigger = screen.getByRole('button', { name: /moni roy/i })
      fireEvent.click(trigger)

      expect(
        screen.getByText('navigation:userMenu.logOut')
      ).toBeInTheDocument()

      // Simulate click outside the container
      fireEvent.mouseDown(document.body)

      expect(
        screen.queryByText('navigation:userMenu.logOut')
      ).not.toBeInTheDocument()
    })
  })

  describe('chevron indicator', () => {
    it('renders a ChevronDown icon in the trigger area', () => {
      render(<TopNav />)

      // lucide-react icons render as SVG elements; ChevronDown has a specific test id or class
      // SPEC: assumed the ChevronDown icon is inside or adjacent to the trigger button
      const trigger = screen.getByRole('button', { name: /moni roy/i })
      const svg = trigger.querySelector('svg')
      expect(svg).toBeInTheDocument()
    })
  })
})
