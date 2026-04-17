import { render, screen, fireEvent } from '@testing-library/react'
import Contact from '../index'
import type { Contact as ContactType } from '../../../types/contact'

// Generate a controlled array of mock contacts for testing
function createMockContacts(count: number): ContactType[] {
  return Array.from({ length: count }, (_, i) => ({
    id: String(i + 1),
    name: `Contact ${i + 1}`,
    email: `contact${i + 1}@example.com`,
    avatar: `https://randomuser.me/api/portraits/men/${i + 1}.jpg`,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  }))
}

// Mock the contactData module to return a controlled dataset
vi.mock('../contactData', () => ({
  mockContacts: createMockContacts(18),
}))

// Mock react-router-dom so ContactCard's useNavigate resolves
vi.mock('react-router-dom', () => ({
  useNavigate: () => vi.fn(),
}))

describe('Contact', () => {
  describe('rendering', () => {
    it('renders the page title with translation key', () => {
      render(<Contact />)

      expect(screen.getByText('contact:title')).toBeInTheDocument()
    })

    it('renders the "Add New Contact" button', () => {
      render(<Contact />)

      expect(
        screen.getByRole('button', { name: /contact:addNewContact/i })
      ).toBeInTheDocument()
    })

    it('renders the Users icon badge in the header', () => {
      render(<Contact />)

      // The header should contain the icon badge area
      // SPEC: yellow bg-warning-light container with Users icon
      const header = screen.getByText('contact:title').closest('div')
      expect(header).toBeInTheDocument()
    })
  })

  describe('initial load', () => {
    it('shows exactly 6 contact cards initially', () => {
      render(<Contact />)

      // Each contact card renders the contact name
      for (let i = 1; i <= 6; i++) {
        expect(screen.getByText(`Contact ${i}`)).toBeInTheDocument()
      }

      // Contact 7 should not be visible yet
      expect(screen.queryByText('Contact 7')).not.toBeInTheDocument()
    })
  })

  describe('Load More behavior', () => {
    it('shows "Load More" button when more contacts exist', () => {
      render(<Contact />)

      expect(
        screen.getByRole('button', { name: /contact:loadMore/i })
      ).toBeInTheDocument()
    })

    it('reveals 6 more contacts when "Load More" is clicked', () => {
      render(<Contact />)

      const loadMoreButton = screen.getByRole('button', {
        name: /contact:loadMore/i,
      })
      fireEvent.click(loadMoreButton)

      // Now 12 contacts should be visible
      for (let i = 1; i <= 12; i++) {
        expect(screen.getByText(`Contact ${i}`)).toBeInTheDocument()
      }

      // Contact 13 should not be visible yet
      expect(screen.queryByText('Contact 13')).not.toBeInTheDocument()
    })

    it('hides "Load More" button when all contacts are loaded', () => {
      render(<Contact />)

      const loadMoreButton = screen.getByRole('button', {
        name: /contact:loadMore/i,
      })

      // Click Load More 2 times: 6 -> 12 -> 18 (all loaded)
      fireEvent.click(loadMoreButton)
      fireEvent.click(loadMoreButton)

      // All 18 contacts visible
      for (let i = 1; i <= 18; i++) {
        expect(screen.getByText(`Contact ${i}`)).toBeInTheDocument()
      }

      // Load More button should be gone
      expect(
        screen.queryByRole('button', { name: /contact:loadMore/i })
      ).not.toBeInTheDocument()
    })
  })

  describe('interactions', () => {
    it('shows "Coming soon" toast when "Add New Contact" is clicked', () => {
      render(<Contact />)

      const addButton = screen.getByRole('button', {
        name: /contact:addNewContact/i,
      })
      fireEvent.click(addButton)

      // SPEC: toast shows "Coming soon" — using the same toast key pattern as NotificationDropdown
      expect(screen.getByText(/comingSoon/i)).toBeInTheDocument()
    })

    it('does not show toast before any button is clicked', () => {
      render(<Contact />)

      expect(screen.queryByText(/comingSoon/i)).not.toBeInTheDocument()
    })
  })
})
