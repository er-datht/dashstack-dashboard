import { render, screen, fireEvent } from '@testing-library/react'
import ComposeView from '../ComposeView'

/**
 * Unit tests for the ComposeView component (inbox-compose change).
 *
 * ComposeView is a form panel with three required fields (To, Subject, Body),
 * a Send button, a Cancel button, and a close (X) button.
 *
 * Props:
 *   - onClose: () => void — called when Cancel or close (X) is clicked
 *   - onSend: (message: { recipientEmail: string, subject: string, body: string }) => void
 *
 * i18n namespace: "inbox" (globally mocked — keys returned as-is)
 */

const defaultProps = {
  onClose: vi.fn(),
  onSend: vi.fn(),
}

describe('ComposeView', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('rendering', () => {
    it('renders all three form fields with labels', () => {
      render(<ComposeView {...defaultProps} />)

      // To field
      expect(screen.getByText('compose.to')).toBeInTheDocument()
      // Subject field
      expect(screen.getByText('compose.subject')).toBeInTheDocument()
      // Body field
      expect(screen.getByText('compose.body')).toBeInTheDocument()
    })

    it('renders Send and Cancel buttons', () => {
      render(<ComposeView {...defaultProps} />)

      expect(screen.getByRole('button', { name: 'compose.send' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'compose.cancel' })).toBeInTheDocument()
    })

    it('renders the new message heading', () => {
      render(<ComposeView {...defaultProps} />)

      expect(screen.getByText('compose.newMessage')).toBeInTheDocument()
    })
  })

  describe('cancel and close behavior', () => {
    it('calls onClose when Cancel button is clicked', () => {
      const onClose = vi.fn()
      render(<ComposeView {...defaultProps} onClose={onClose} />)

      fireEvent.click(screen.getByRole('button', { name: 'compose.cancel' }))

      expect(onClose).toHaveBeenCalledTimes(1)
    })

    it('calls onClose when close (X) button is clicked', () => {
      const onClose = vi.fn()
      render(<ComposeView {...defaultProps} onClose={onClose} />)

      // SPEC: assumed close button uses aria-label "compose.close"
      fireEvent.click(screen.getByRole('button', { name: 'compose.close' }))

      expect(onClose).toHaveBeenCalledTimes(1)
    })
  })

  describe('validation', () => {
    it('shows validation errors when Send is clicked with all fields empty', () => {
      render(<ComposeView {...defaultProps} />)

      fireEvent.click(screen.getByRole('button', { name: 'compose.send' }))

      // All three fields should show invalid state
      const toInput = screen.getByPlaceholderText('compose.toPlaceholder')
      const subjectInput = screen.getByPlaceholderText('compose.subjectPlaceholder')
      const bodyInput = screen.getByPlaceholderText('compose.bodyPlaceholder')

      expect(toInput).toHaveAttribute('aria-invalid', 'true')
      expect(subjectInput).toHaveAttribute('aria-invalid', 'true')
      expect(bodyInput).toHaveAttribute('aria-invalid', 'true')

      // onSend should NOT have been called
      expect(defaultProps.onSend).not.toHaveBeenCalled()
    })

    it('does not call onSend when only some fields are filled', () => {
      const onSend = vi.fn()
      render(<ComposeView {...defaultProps} onSend={onSend} />)

      // Fill only the To field
      const toInput = screen.getByPlaceholderText('compose.toPlaceholder')
      fireEvent.change(toInput, { target: { value: 'test@example.com' } })

      fireEvent.click(screen.getByRole('button', { name: 'compose.send' }))

      expect(onSend).not.toHaveBeenCalled()

      // Subject and Body should be marked invalid, but To should not
      expect(toInput).not.toHaveAttribute('aria-invalid', 'true')
      const subjectInput = screen.getByPlaceholderText('compose.subjectPlaceholder')
      const bodyInput = screen.getByPlaceholderText('compose.bodyPlaceholder')
      expect(subjectInput).toHaveAttribute('aria-invalid', 'true')
      expect(bodyInput).toHaveAttribute('aria-invalid', 'true')
    })
  })

  describe('error clearing', () => {
    it('clears error styling on a field when user types into it', () => {
      render(<ComposeView {...defaultProps} />)

      // Trigger validation errors
      fireEvent.click(screen.getByRole('button', { name: 'compose.send' }))

      const toInput = screen.getByPlaceholderText('compose.toPlaceholder')
      expect(toInput).toHaveAttribute('aria-invalid', 'true')

      // Type into the To field — error should clear
      fireEvent.change(toInput, { target: { value: 'a' } })
      expect(toInput).not.toHaveAttribute('aria-invalid', 'true')
    })
  })

  describe('successful send', () => {
    it('calls onSend with correct data when all fields are filled', () => {
      const onSend = vi.fn()
      render(<ComposeView {...defaultProps} onSend={onSend} />)

      fireEvent.change(screen.getByPlaceholderText('compose.toPlaceholder'), {
        target: { value: 'recipient@example.com' },
      })
      fireEvent.change(screen.getByPlaceholderText('compose.subjectPlaceholder'), {
        target: { value: 'Test Subject' },
      })
      fireEvent.change(screen.getByPlaceholderText('compose.bodyPlaceholder'), {
        target: { value: 'Hello, this is the body.' },
      })

      fireEvent.click(screen.getByRole('button', { name: 'compose.send' }))

      expect(onSend).toHaveBeenCalledTimes(1)
      expect(onSend).toHaveBeenCalledWith({
        recipientEmail: 'recipient@example.com',
        subject: 'Test Subject',
        body: 'Hello, this is the body.',
      })
    })
  })
})
