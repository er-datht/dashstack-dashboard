import { render, screen, fireEvent } from '@testing-library/react'
import ChatInput from '../ChatInput'

/**
 * Unit tests for ChatInput component (inbox-chat-send change).
 *
 * ChatInput is a controlled text input with a Send button and action icons.
 *
 * Props (after change):
 *   - onSend: (text: string) => void  — called with trimmed text on Send click or Enter
 *   - onShowToast: (message: string) => void — called by mic/attachment/image icons
 *
 * Behaviors:
 *   - Send button click calls onSend with trimmed input text
 *   - Enter key press calls onSend with trimmed input text
 *   - Empty or whitespace-only input is silently ignored (no onSend call)
 *   - Input field is cleared after a successful send
 *   - Mic, paperclip, and image icons still call onShowToast with "Coming soon"
 */

const defaultProps = {
  onSend: vi.fn(),
  onShowToast: vi.fn(),
}

describe('ChatInput', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('rendering', () => {
    it('renders the text input with placeholder', () => {
      render(<ChatInput {...defaultProps} />)

      expect(screen.getByPlaceholderText('chat.placeholder')).toBeInTheDocument()
    })

    it('renders the Send button', () => {
      render(<ChatInput {...defaultProps} />)

      expect(screen.getByText('chat.send')).toBeInTheDocument()
    })
  })

  describe('send via button click', () => {
    it('calls onSend with trimmed text when Send button is clicked', () => {
      const onSend = vi.fn()
      render(<ChatInput {...defaultProps} onSend={onSend} />)

      const input = screen.getByPlaceholderText('chat.placeholder')
      fireEvent.change(input, { target: { value: 'Hello there' } })

      const sendButton = screen.getByText('chat.send').closest('button')!
      fireEvent.click(sendButton)

      expect(onSend).toHaveBeenCalledTimes(1)
      expect(onSend).toHaveBeenCalledWith('Hello there')
    })

    it('clears input field after successful send via button click', () => {
      render(<ChatInput {...defaultProps} />)

      const input = screen.getByPlaceholderText('chat.placeholder') as HTMLInputElement
      fireEvent.change(input, { target: { value: 'Hello there' } })
      expect(input.value).toBe('Hello there')

      const sendButton = screen.getByText('chat.send').closest('button')!
      fireEvent.click(sendButton)

      expect(input.value).toBe('')
    })
  })

  describe('send via Enter key', () => {
    it('calls onSend with trimmed text when Enter is pressed', () => {
      const onSend = vi.fn()
      render(<ChatInput {...defaultProps} onSend={onSend} />)

      const input = screen.getByPlaceholderText('chat.placeholder')
      fireEvent.change(input, { target: { value: 'Quick update' } })
      fireEvent.keyDown(input, { key: 'Enter' })

      expect(onSend).toHaveBeenCalledTimes(1)
      expect(onSend).toHaveBeenCalledWith('Quick update')
    })

    it('clears input field after successful send via Enter key', () => {
      render(<ChatInput {...defaultProps} />)

      const input = screen.getByPlaceholderText('chat.placeholder') as HTMLInputElement
      fireEvent.change(input, { target: { value: 'Quick update' } })
      fireEvent.keyDown(input, { key: 'Enter' })

      expect(input.value).toBe('')
    })
  })

  describe('empty and whitespace input ignored', () => {
    it('does not call onSend when input is empty and Send is clicked', () => {
      const onSend = vi.fn()
      render(<ChatInput {...defaultProps} onSend={onSend} />)

      const sendButton = screen.getByText('chat.send').closest('button')!
      fireEvent.click(sendButton)

      expect(onSend).not.toHaveBeenCalled()
    })

    it('does not call onSend when input is whitespace-only and Send is clicked', () => {
      const onSend = vi.fn()
      render(<ChatInput {...defaultProps} onSend={onSend} />)

      const input = screen.getByPlaceholderText('chat.placeholder') as HTMLInputElement
      fireEvent.change(input, { target: { value: '   ' } })

      const sendButton = screen.getByText('chat.send').closest('button')!
      fireEvent.click(sendButton)

      expect(onSend).not.toHaveBeenCalled()
      // SPEC: whitespace-only input is not cleared
      expect(input.value).toBe('   ')
    })

    it('does not call onSend when input is empty and Enter is pressed', () => {
      const onSend = vi.fn()
      render(<ChatInput {...defaultProps} onSend={onSend} />)

      const input = screen.getByPlaceholderText('chat.placeholder')
      fireEvent.keyDown(input, { key: 'Enter' })

      expect(onSend).not.toHaveBeenCalled()
    })
  })

  describe('attachment icons show Coming soon toast', () => {
    it('calls onShowToast when mic icon is clicked', () => {
      const onShowToast = vi.fn()
      render(<ChatInput {...defaultProps} onShowToast={onShowToast} />)

      const micButton = screen.getByRole('button', { name: 'chat.voiceChat' })
      fireEvent.click(micButton)

      expect(onShowToast).toHaveBeenCalledTimes(1)
      expect(onShowToast).toHaveBeenCalledWith('chat.comingSoon')
    })

    it('calls onShowToast when attachment icon is clicked', () => {
      const onShowToast = vi.fn()
      render(<ChatInput {...defaultProps} onShowToast={onShowToast} />)

      const attachButton = screen.getByRole('button', { name: 'chat.attachment' })
      fireEvent.click(attachButton)

      expect(onShowToast).toHaveBeenCalledTimes(1)
      expect(onShowToast).toHaveBeenCalledWith('chat.comingSoon')
    })

    it('calls onShowToast when image icon is clicked', () => {
      const onShowToast = vi.fn()
      render(<ChatInput {...defaultProps} onShowToast={onShowToast} />)

      const imageButton = screen.getByRole('button', { name: 'chat.image' })
      fireEvent.click(imageButton)

      expect(onShowToast).toHaveBeenCalledTimes(1)
      expect(onShowToast).toHaveBeenCalledWith('chat.comingSoon')
    })
  })

  describe('trimming behavior', () => {
    it('trims leading and trailing whitespace from input before sending', () => {
      const onSend = vi.fn()
      render(<ChatInput {...defaultProps} onSend={onSend} />)

      const input = screen.getByPlaceholderText('chat.placeholder')
      fireEvent.change(input, { target: { value: '  Hello world  ' } })

      const sendButton = screen.getByText('chat.send').closest('button')!
      fireEvent.click(sendButton)

      expect(onSend).toHaveBeenCalledWith('Hello world')
    })
  })
})
