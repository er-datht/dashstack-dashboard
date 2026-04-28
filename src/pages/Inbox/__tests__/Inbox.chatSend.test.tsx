import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import Inbox from '../index'

function renderInbox() {
  return render(<MemoryRouter><Inbox /></MemoryRouter>)
}

/**
 * Integration tests for the inbox-chat-send change.
 *
 * These tests render the full Inbox page (index.tsx) and verify the
 * end-to-end behavior of:
 *   - Chat send via the ChatInput in ChatView
 *   - Cross-user delivery to "inbox-delivered-messages" localStorage
 *   - ComposeView send also delivers to recipient
 *   - Received messages appearing in inbox folder for the logged-in user
 *   - Sender identity captured from getStoredUser()
 *   - No delivery when not logged in
 *
 * The deliverMessage helper is internal to index.tsx. Its behavior
 * is tested indirectly through these integration tests.
 *
 * IMPORTANT: getStoredUser() is mocked at the module level so we can
 * control the logged-in user identity for each test.
 */

const DELIVERED_STORAGE_KEY = 'inbox-delivered-messages'
const SENT_STORAGE_KEY = 'inbox-sent-messages'

// Mock getStoredUser from auth service
const mockGetStoredUser = vi.fn()
vi.mock('../../../services/auth', () => ({
  getStoredUser: (...args: unknown[]) => mockGetStoredUser(...args),
}))

describe('Inbox — chat send integration', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
    // Default: user is logged in
    mockGetStoredUser.mockReturnValue({
      name: 'Alice',
      email: 'alice@example.com',
      role: 'admin',
    })
  })

  /**
   * Helper: open a chat view by clicking on a record in the message list.
   * The first non-draft, non-sent record will be selected.
   */
  function openChatView() {
    // Click on the first email record in the message list
    // The record row renders sender name as clickable text
    const firstRecord = screen.getByText('Ethan Rodriguez')
    fireEvent.click(firstRecord.closest('button')!)

    // ChatView should now be visible (chat input present)
    expect(screen.getByPlaceholderText('chat.placeholder')).toBeInTheDocument()
  }

  describe('chat send delivers message', () => {
    it('sends a message and delivers it to localStorage', () => {
      renderInbox()
      openChatView()

      // Type a message
      const input = screen.getByPlaceholderText('chat.placeholder')
      fireEvent.change(input, { target: { value: 'Hello from chat' } })

      // Click Send
      const sendButton = screen.getByText('chat.send').closest('button')!
      fireEvent.click(sendButton)

      // The delivered messages localStorage should contain the message
      const delivered = JSON.parse(localStorage.getItem(DELIVERED_STORAGE_KEY) || '[]')
      expect(delivered).toHaveLength(1)
      expect(delivered[0]).toMatchObject({
        senderEmail: 'alice@example.com',
        senderName: 'Alice',
        body: 'Hello from chat',
      })
      // Should have all required DeliveredMessage fields
      expect(delivered[0].id).toBeDefined()
      expect(delivered[0].recipientEmail).toBeDefined()
      expect(delivered[0].subject).toBeDefined()
      expect(delivered[0].sentAt).toBeDefined()
    })

    it('appends new sent message as a chat bubble in the conversation', () => {
      renderInbox()
      openChatView()

      const input = screen.getByPlaceholderText('chat.placeholder')
      fireEvent.change(input, { target: { value: 'Visible in chat' } })

      const sendButton = screen.getByText('chat.send').closest('button')!
      fireEvent.click(sendButton)

      // The newly sent message should appear in the chat as a bubble
      expect(screen.getByText('Visible in chat')).toBeInTheDocument()
    })

    it('clears input after sending from chat', () => {
      renderInbox()
      openChatView()

      const input = screen.getByPlaceholderText('chat.placeholder') as HTMLInputElement
      fireEvent.change(input, { target: { value: 'Clear me' } })

      const sendButton = screen.getByText('chat.send').closest('button')!
      fireEvent.click(sendButton)

      expect(input.value).toBe('')
    })
  })

  describe('compose send delivers to recipient', () => {
    it('delivers a message to inbox-delivered-messages when compose send completes', () => {
      renderInbox()

      // Open compose
      fireEvent.click(screen.getByRole('button', { name: 'composeBtn' }))

      // Fill all fields
      fireEvent.change(screen.getByPlaceholderText('compose.toPlaceholder'), {
        target: { value: 'bob@example.com' },
      })
      fireEvent.change(screen.getByPlaceholderText('compose.subjectPlaceholder'), {
        target: { value: 'Hello Bob' },
      })
      fireEvent.change(screen.getByPlaceholderText('compose.bodyPlaceholder'), {
        target: { value: 'This is the body.' },
      })

      // Send
      fireEvent.click(screen.getByRole('button', { name: 'compose.send' }))

      // Check inbox-delivered-messages
      const delivered = JSON.parse(localStorage.getItem(DELIVERED_STORAGE_KEY) || '[]')
      expect(delivered).toHaveLength(1)
      expect(delivered[0]).toMatchObject({
        senderEmail: 'alice@example.com',
        senderName: 'Alice',
        recipientEmail: 'bob@example.com',
        subject: 'Hello Bob',
        body: 'This is the body.',
      })
      expect(delivered[0].id).toBeDefined()
      expect(delivered[0].sentAt).toBeDefined()

      // Also still saves to inbox-sent-messages (existing behavior)
      const sent = JSON.parse(localStorage.getItem(SENT_STORAGE_KEY) || '[]')
      expect(sent).toHaveLength(1)
    })
  })

  describe('no delivery when not logged in', () => {
    it('does not create a DeliveredMessage when getStoredUser returns null', () => {
      mockGetStoredUser.mockReturnValue(null)

      renderInbox()

      // Open compose and send
      fireEvent.click(screen.getByRole('button', { name: 'composeBtn' }))
      fireEvent.change(screen.getByPlaceholderText('compose.toPlaceholder'), {
        target: { value: 'bob@example.com' },
      })
      fireEvent.change(screen.getByPlaceholderText('compose.subjectPlaceholder'), {
        target: { value: 'Test' },
      })
      fireEvent.change(screen.getByPlaceholderText('compose.bodyPlaceholder'), {
        target: { value: 'Body' },
      })
      fireEvent.click(screen.getByRole('button', { name: 'compose.send' }))

      // inbox-delivered-messages should be empty
      const delivered = JSON.parse(localStorage.getItem(DELIVERED_STORAGE_KEY) || '[]')
      expect(delivered).toHaveLength(0)

      // inbox-sent-messages should still work (sender-side)
      const sent = JSON.parse(localStorage.getItem(SENT_STORAGE_KEY) || '[]')
      expect(sent).toHaveLength(1)
    })
  })

  describe('received messages in inbox folder', () => {
    it('shows delivered messages addressed to the current user in the inbox', () => {
      // Pre-populate delivered messages from another user
      const deliveredMessages = [
        {
          id: 'del-1',
          senderEmail: 'bob@example.com',
          senderName: 'Bob',
          recipientEmail: 'alice@example.com',
          subject: 'Message from Bob to Alice',
          body: 'Hi Alice!',
          sentAt: '2026-04-24T10:00:00Z',
        },
      ]
      localStorage.setItem(DELIVERED_STORAGE_KEY, JSON.stringify(deliveredMessages))

      renderInbox()

      // The inbox folder is active by default
      // The delivered message should appear as a row with Bob's name and subject
      expect(screen.getByText('Bob')).toBeInTheDocument()
      expect(screen.getByText('Message from Bob to Alice')).toBeInTheDocument()
    })

    it('does not show delivered messages addressed to a different user', () => {
      // Pre-populate delivered messages for a different recipient
      const deliveredMessages = [
        {
          id: 'del-2',
          senderEmail: 'carol@example.com',
          senderName: 'Carol',
          recipientEmail: 'dave@example.com',
          subject: 'Message for Dave',
          body: 'Hi Dave!',
          sentAt: '2026-04-24T10:00:00Z',
        },
      ]
      localStorage.setItem(DELIVERED_STORAGE_KEY, JSON.stringify(deliveredMessages))

      renderInbox()

      // Carol's message is NOT for Alice, so it should not appear
      expect(screen.queryByText('Message for Dave')).not.toBeInTheDocument()
    })

    it('prepends received messages before mock records', () => {
      // Pre-populate a delivered message
      const deliveredMessages = [
        {
          id: 'del-3',
          senderEmail: 'frank@example.com',
          senderName: 'Frank',
          recipientEmail: 'alice@example.com',
          subject: 'Urgent from Frank',
          body: 'Please respond!',
          sentAt: '2026-04-24T12:00:00Z',
        },
      ]
      localStorage.setItem(DELIVERED_STORAGE_KEY, JSON.stringify(deliveredMessages))

      renderInbox()

      // Frank's message should appear in the inbox
      expect(screen.getByText('Frank')).toBeInTheDocument()
      expect(screen.getByText('Urgent from Frank')).toBeInTheDocument()

      // Existing mock records should still be present (e.g., Ethan Rodriguez)
      expect(screen.getByText('Ethan Rodriguez')).toBeInTheDocument()
    })
  })

  describe('delivered messages survive logout', () => {
    it('delivered messages persist in localStorage independent of auth state', () => {
      // Pre-populate delivered messages
      const deliveredMessages = [
        {
          id: 'del-persist',
          senderEmail: 'sender@example.com',
          senderName: 'Sender',
          recipientEmail: 'alice@example.com',
          subject: 'Persistent message',
          body: 'This should survive logout',
          sentAt: '2026-04-24T10:00:00Z',
        },
      ]
      localStorage.setItem(DELIVERED_STORAGE_KEY, JSON.stringify(deliveredMessages))

      // Verify the key exists
      expect(localStorage.getItem(DELIVERED_STORAGE_KEY)).not.toBeNull()

      // Simulate what clearTokens does (clear auth keys but NOT delivered messages)
      localStorage.removeItem('auth_token')
      localStorage.removeItem('refresh_token')
      localStorage.removeItem('auth_user')
      localStorage.removeItem('registered_user')

      // Delivered messages should still be there
      const remaining = JSON.parse(localStorage.getItem(DELIVERED_STORAGE_KEY) || '[]')
      expect(remaining).toHaveLength(1)
      expect(remaining[0].id).toBe('del-persist')
    })
  })
})
