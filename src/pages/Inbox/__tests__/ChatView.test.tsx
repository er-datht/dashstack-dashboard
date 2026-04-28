import { render, screen, fireEvent } from '@testing-library/react'
import ChatView from '../ChatView'
import type { Message } from '../../../types/inbox'
import type { InboxLabel } from '../mockData'

/**
 * Unit tests for ChatView component (inbox-chat-send change).
 *
 * ChatView displays a conversation's message bubbles, a header, and a ChatInput.
 *
 * New prop added by the change:
 *   - onSendMessage: (text: string) => void — passed through to ChatInput as onSend
 *
 * New behavior:
 *   - Auto-scroll to bottom of messages area when messages.length changes
 *
 * Existing props (unchanged):
 *   - messages, contactName, activeLabel, labels, onLabelChange, onShowToast, onBack
 *   - onArchive?, onShowInfo?
 */

const mockLabels: InboxLabel[] = [
  { id: 'primary', nameKey: 'labels.primary', color: '#00b69b' },
]

const mockMessages: Message[] = [
  {
    id: 'msg-1',
    senderId: 'user-2',
    senderName: 'Ethan Rodriguez',
    recipientId: 'user-1',
    subject: 'Project Update',
    body: 'Hi there! How are things going?',
    isRead: true,
    isStarred: false,
    hasAttachments: false,
    createdAt: '2025-01-15T18:30:00Z',
    folder: 'inbox',
  },
  {
    id: 'msg-2',
    senderId: 'user-1',
    senderName: 'You',
    recipientId: 'user-2',
    subject: 'Re: Project Update',
    body: 'Everything is going well!',
    isRead: true,
    isStarred: false,
    hasAttachments: false,
    createdAt: '2025-01-15T18:35:00Z',
    folder: 'sent',
  },
]

const defaultProps = {
  messages: mockMessages,
  contactName: 'Ethan Rodriguez',
  activeLabel: 'primary',
  labels: mockLabels,
  onLabelChange: vi.fn(),
  onShowToast: vi.fn(),
  onBack: vi.fn(),
  onSendMessage: vi.fn(),
}

describe('ChatView', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('rendering', () => {
    it('renders all message bubbles', () => {
      render(<ChatView {...defaultProps} />)

      expect(screen.getByText('Hi there! How are things going?')).toBeInTheDocument()
      expect(screen.getByText('Everything is going well!')).toBeInTheDocument()
    })

    it('renders the chat input area', () => {
      render(<ChatView {...defaultProps} />)

      expect(screen.getByPlaceholderText('chat.placeholder')).toBeInTheDocument()
      expect(screen.getByText('chat.send')).toBeInTheDocument()
    })
  })

  describe('onSendMessage prop', () => {
    it('calls onSendMessage when a message is sent from the chat input', () => {
      const onSendMessage = vi.fn()
      render(<ChatView {...defaultProps} onSendMessage={onSendMessage} />)

      const input = screen.getByPlaceholderText('chat.placeholder')
      fireEvent.change(input, { target: { value: 'New message from test' } })

      const sendButton = screen.getByText('chat.send').closest('button')!
      fireEvent.click(sendButton)

      expect(onSendMessage).toHaveBeenCalledTimes(1)
      expect(onSendMessage).toHaveBeenCalledWith('New message from test')
    })

    it('calls onSendMessage when Enter is pressed in the chat input', () => {
      const onSendMessage = vi.fn()
      render(<ChatView {...defaultProps} onSendMessage={onSendMessage} />)

      const input = screen.getByPlaceholderText('chat.placeholder')
      fireEvent.change(input, { target: { value: 'Enter key message' } })
      fireEvent.keyDown(input, { key: 'Enter' })

      expect(onSendMessage).toHaveBeenCalledTimes(1)
      expect(onSendMessage).toHaveBeenCalledWith('Enter key message')
    })
  })

  describe('auto-scroll', () => {
    it('scrolls the sentinel element into view when messages change', () => {
      // Mock scrollIntoView since jsdom does not implement it
      const scrollIntoViewMock = vi.fn()
      Element.prototype.scrollIntoView = scrollIntoViewMock

      const { rerender } = render(<ChatView {...defaultProps} messages={mockMessages} />)

      // Reset mock after initial render scroll
      scrollIntoViewMock.mockClear()

      // Add a new message to trigger the effect
      const updatedMessages: Message[] = [
        ...mockMessages,
        {
          id: 'msg-3',
          senderId: 'user-1',
          senderName: 'You',
          recipientId: 'user-2',
          subject: 'Re: Project Update',
          body: 'Just sent a new message',
          isRead: true,
          isStarred: false,
          hasAttachments: false,
          createdAt: '2025-01-15T18:45:00Z',
          folder: 'sent',
        },
      ]

      rerender(<ChatView {...defaultProps} messages={updatedMessages} />)

      // scrollIntoView should have been called on the sentinel div
      expect(scrollIntoViewMock).toHaveBeenCalled()
    })
  })
})
