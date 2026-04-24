import { render, screen, fireEvent } from '@testing-library/react'
import UserMenu from '../index'

const mockNavigate = vi.fn()

vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
  useLocation: () => ({ pathname: '/dashboard', state: null, search: '', hash: '', key: 'default' }),
}))

// SVG imports in Vite resolve to file path strings; no special mock needed

describe('UserMenu', () => {
  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
  }

  beforeEach(() => {
    localStorage.clear()
    mockNavigate.mockClear()
  })

  describe('rendering', () => {
    it('renders 4 menu items in correct order when isOpen is true', () => {
      render(<UserMenu {...defaultProps} />)

      const items = screen.getAllByRole('menuitem')
      expect(items).toHaveLength(4)

      expect(items[0]).toHaveTextContent('navigation:userMenu.manageAccount')
      expect(items[1]).toHaveTextContent('navigation:userMenu.changePassword')
      expect(items[2]).toHaveTextContent('navigation:userMenu.activityLog')
      expect(items[3]).toHaveTextContent('navigation:userMenu.logOut')
    })

    it('renders an icon (img element) for each menu item', () => {
      render(<UserMenu {...defaultProps} />)

      const icons = screen.getAllByRole('img')
      expect(icons).toHaveLength(4)
    })

    it('does not render menu items when isOpen is false', () => {
      render(<UserMenu {...defaultProps} isOpen={false} />)

      expect(
        screen.queryByText('navigation:userMenu.manageAccount')
      ).not.toBeInTheDocument()
      expect(
        screen.queryByText('navigation:userMenu.logOut')
      ).not.toBeInTheDocument()
    })
  })

  describe('escape key behavior', () => {
    it('calls onClose when Escape key is pressed', () => {
      const onClose = vi.fn()
      render(<UserMenu {...defaultProps} onClose={onClose} />)

      fireEvent.keyDown(document, { key: 'Escape' })
      expect(onClose).toHaveBeenCalledTimes(1)
    })
  })

  describe('log out action', () => {
    it('clears auth tokens from localStorage and navigates to login', () => {
      localStorage.setItem('auth_token', 'test-token')
      localStorage.setItem('refresh_token', 'test-refresh')

      render(<UserMenu {...defaultProps} />)

      const logOutButton = screen.getByText('navigation:userMenu.logOut')
      fireEvent.click(logOutButton)

      expect(localStorage.getItem('auth_token')).toBeNull()
      expect(localStorage.getItem('refresh_token')).toBeNull()
      expect(mockNavigate).toHaveBeenCalledWith('/login', { state: { from: '/dashboard' } })
    })
  })

  describe('placeholder item actions', () => {
    it('calls onClose when a placeholder item is clicked', () => {
      const onClose = vi.fn()
      render(<UserMenu {...defaultProps} onClose={onClose} />)

      fireEvent.click(
        screen.getByText('navigation:userMenu.manageAccount')
      )
      expect(onClose).toHaveBeenCalled()
    })
  })

  describe('keyboard accessibility', () => {
    it('renders menu items as buttons that can receive focus', () => {
      render(<UserMenu {...defaultProps} />)

      const items = screen.getAllByRole('menuitem')
      items.forEach((item) => {
        expect(item.tagName).toBe('BUTTON')
      })
    })

    it('renders the dropdown container with role="menu"', () => {
      render(<UserMenu {...defaultProps} />)

      expect(screen.getByRole('menu')).toBeInTheDocument()
    })
  })
})
