import { render, screen, fireEvent } from '@testing-library/react'
import Inbox from '../index'

/**
 * Integration tests for the inbox-compose change.
 *
 * These tests render the full Inbox page (index.tsx) and verify the
 * end-to-end behavior of the compose flow:
 *   - Compose button opens ComposeView
 *   - ComposeView replaces MessageList in the right panel
 *   - Sending a message persists to localStorage "inbox-sent-messages"
 *   - After sending, compose closes and message list returns
 *   - Sent folder shows messages from localStorage
 *
 * The localStorage key "inbox-sent-messages" stores a JSON array of
 * SentMessage objects: { id, recipientEmail, subject, body, sentAt }.
 */

const STORAGE_KEY = 'inbox-sent-messages'

describe('Inbox — compose integration', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
  })

  describe('opening compose view', () => {
    it('shows ComposeView when Compose button in sidebar is clicked', () => {
      render(<Inbox />)

      // The sidebar has a Compose button with translation key "compose"
      const composeButton = screen.getByRole('button', { name: 'composeBtn' })
      fireEvent.click(composeButton)

      // ComposeView should now be visible with its heading
      expect(screen.getByText('compose.newMessage')).toBeInTheDocument()
    })

    it('hides MessageList search when ComposeView is open', () => {
      render(<Inbox />)

      // MessageList has a search input — verify it exists initially
      expect(screen.getByPlaceholderText('list.search')).toBeInTheDocument()

      // Open compose
      const composeButton = screen.getByRole('button', { name: 'composeBtn' })
      fireEvent.click(composeButton)

      // MessageList search should no longer be visible
      expect(screen.queryByPlaceholderText('list.search')).not.toBeInTheDocument()
    })
  })

  describe('closing compose view', () => {
    it('returns to message list when close (X) is clicked in ComposeView', () => {
      render(<Inbox />)

      // Open compose
      fireEvent.click(screen.getByRole('button', { name: 'composeBtn' }))
      expect(screen.getByText('compose.newMessage')).toBeInTheDocument()

      // Click close (X)
      fireEvent.click(screen.getByRole('button', { name: 'compose.close' }))

      // Message list should be visible again (search input present)
      expect(screen.getByPlaceholderText('list.search')).toBeInTheDocument()
      // Compose heading should be gone
      expect(screen.queryByText('compose.newMessage')).not.toBeInTheDocument()
    })
  })

  describe('sending a message', () => {
    it('persists sent message to localStorage and closes compose', () => {
      render(<Inbox />)

      // Open compose
      fireEvent.click(screen.getByRole('button', { name: 'composeBtn' }))

      // Fill in all fields
      fireEvent.change(screen.getByPlaceholderText('compose.toPlaceholder'), {
        target: { value: 'test@example.com' },
      })
      fireEvent.change(screen.getByPlaceholderText('compose.subjectPlaceholder'), {
        target: { value: 'Integration Test Subject' },
      })
      fireEvent.change(screen.getByPlaceholderText('compose.bodyPlaceholder'), {
        target: { value: 'This is the body of the message.' },
      })

      // Click Send
      fireEvent.click(screen.getByRole('button', { name: 'compose.send' }))

      // Compose should close — message list should be visible again
      expect(screen.getByPlaceholderText('list.search')).toBeInTheDocument()
      expect(screen.queryByText('compose.newMessage')).not.toBeInTheDocument()

      // localStorage should contain the sent message
      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
      expect(stored).toHaveLength(1)
      expect(stored[0]).toMatchObject({
        recipientEmail: 'test@example.com',
        subject: 'Integration Test Subject',
        body: 'This is the body of the message.',
      })
      // SentMessage should have id and sentAt fields
      expect(stored[0].id).toBeDefined()
      expect(stored[0].sentAt).toBeDefined()
    })

    it('shows a toast notification after sending', () => {
      render(<Inbox />)

      // Open compose and fill fields
      fireEvent.click(screen.getByRole('button', { name: 'composeBtn' }))
      fireEvent.change(screen.getByPlaceholderText('compose.toPlaceholder'), {
        target: { value: 'user@example.com' },
      })
      fireEvent.change(screen.getByPlaceholderText('compose.subjectPlaceholder'), {
        target: { value: 'Toast Test' },
      })
      fireEvent.change(screen.getByPlaceholderText('compose.bodyPlaceholder'), {
        target: { value: 'Body content' },
      })

      // Send
      fireEvent.click(screen.getByRole('button', { name: 'compose.send' }))

      // SPEC: assumed toast shows a translation key like "compose.sent" or similar
      // The toast container is rendered in the Inbox page component
      // We check that some toast element appears in the DOM
      const toastContainer = document.querySelector('.fixed.top-4')
      expect(toastContainer).toBeInTheDocument()
    })
  })

  describe('sent folder', () => {
    it('shows sent messages from localStorage when Sent folder is active', () => {
      // Pre-populate localStorage with a sent message
      const sentMessages = [
        {
          id: 'sent-1',
          recipientEmail: 'alice@example.com',
          subject: 'Hello Alice',
          body: 'Hi Alice, how are you?',
          sentAt: '2026-04-22T10:00:00Z',
        },
      ]
      localStorage.setItem(STORAGE_KEY, JSON.stringify(sentMessages))

      render(<Inbox />)

      // Click on the Sent folder in the sidebar
      const sentFolderButton = screen.getByText('folders.sent').closest('button')!
      fireEvent.click(sentFolderButton)

      // The sent message subject should be visible
      expect(screen.getByText('Hello Alice')).toBeInTheDocument()
    })

    it('updates sent folder count dynamically based on localStorage', () => {
      // Pre-populate localStorage with 2 sent messages
      const sentMessages = [
        {
          id: 'sent-1',
          recipientEmail: 'a@b.com',
          subject: 'First',
          body: 'Body 1',
          sentAt: '2026-04-22T10:00:00Z',
        },
        {
          id: 'sent-2',
          recipientEmail: 'c@d.com',
          subject: 'Second',
          body: 'Body 2',
          sentAt: '2026-04-22T11:00:00Z',
        },
      ]
      localStorage.setItem(STORAGE_KEY, JSON.stringify(sentMessages))

      render(<Inbox />)

      // The Sent folder count should reflect the number of sent messages in localStorage
      const sentFolderButton = screen.getByText('folders.sent').closest('button')!
      expect(sentFolderButton).toHaveTextContent('2')
      // Should NOT show the static 24,532
      expect(sentFolderButton).not.toHaveTextContent('24,532')
    })
  })
})
