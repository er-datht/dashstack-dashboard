import { render, screen, fireEvent } from '@testing-library/react'
import ContactCard from '../ContactCard'
import { ROUTES } from '../../../routes/routes'
import type { Contact } from '../../../types/contact'

const mockNavigate = vi.fn()
vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
}))

const mockContact: Contact = {
  id: '1',
  name: 'Jane Doe',
  email: 'jane.doe@example.com',
  avatar: 'https://randomuser.me/api/portraits/women/1.jpg',
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-01-01T00:00:00Z',
}

describe('ContactCard', () => {
  const defaultProps = {
    contact: mockContact,
  }

  beforeEach(() => {
    mockNavigate.mockClear()
  })

  describe('rendering', () => {
    it('renders the contact name and email', () => {
      render(<ContactCard {...defaultProps} />)

      expect(screen.getByText('Jane Doe')).toBeInTheDocument()
      expect(screen.getByText('jane.doe@example.com')).toBeInTheDocument()
    })

    it('renders the avatar image with correct src and alt', () => {
      render(<ContactCard {...defaultProps} />)

      const img = screen.getByAltText('Jane Doe')
      expect(img).toBeInTheDocument()
      expect(img).toHaveAttribute(
        'src',
        'https://randomuser.me/api/portraits/women/1.jpg'
      )
    })

    it('renders a "Message" button with translation key', () => {
      render(<ContactCard {...defaultProps} />)

      expect(
        screen.getByRole('button', { name: /contact:message/i })
      ).toBeInTheDocument()
    })
  })

  describe('avatar fallback', () => {
    it('shows fallback User icon when avatar image fails to load', () => {
      render(<ContactCard {...defaultProps} />)

      const img = screen.getByAltText('Jane Doe')
      fireEvent.error(img)

      // After error, the img should be replaced by the User icon fallback
      expect(screen.queryByAltText('Jane Doe')).not.toBeInTheDocument()
      // SPEC: assumed the fallback renders a container that is identifiable;
      // the User icon from lucide-react will render an svg
      expect(document.querySelector('svg')).toBeInTheDocument()
    })

    it('shows fallback User icon when avatar is undefined', () => {
      const contactNoAvatar: Contact = {
        ...mockContact,
        avatar: undefined,
      }

      render(<ContactCard {...defaultProps} contact={contactNoAvatar} />)

      // No img element should be rendered
      expect(screen.queryByRole('img')).not.toBeInTheDocument()
      // Fallback svg icon should be present
      expect(document.querySelector('svg')).toBeInTheDocument()
    })
  })

  describe('text truncation', () => {
    it('applies truncation class to the name', () => {
      render(<ContactCard {...defaultProps} />)

      const nameElement = screen.getByText('Jane Doe')
      expect(nameElement.className).toMatch(/truncate/)
    })

    it('applies truncation class to the email', () => {
      render(<ContactCard {...defaultProps} />)

      const emailElement = screen.getByText('jane.doe@example.com')
      expect(emailElement.className).toMatch(/truncate/)
    })
  })

  describe('interactions', () => {
    it('navigates to inbox when "Message" button is clicked', () => {
      render(<ContactCard {...defaultProps} />)

      const messageButton = screen.getByRole('button', {
        name: /contact:message/i,
      })
      fireEvent.click(messageButton)

      expect(mockNavigate).toHaveBeenCalledTimes(1)
      expect(mockNavigate).toHaveBeenCalledWith(ROUTES.INBOX)
    })
  })
})
