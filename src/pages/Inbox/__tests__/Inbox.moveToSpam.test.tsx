import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import Inbox from '../index'
import MessageList from '../MessageList'
import type { EmailRecord, InboxLabel } from '../mockData'

// --- Integration tests (full Inbox page) ---

function renderInbox() {
  return render(<MemoryRouter><Inbox /></MemoryRouter>)
}

/**
 * Integration tests for the inbox-move-to-spam change.
 *
 * These tests render the full Inbox page (index.tsx) and verify the
 * end-to-end behavior of moving messages to the Spam folder from eligible
 * folders (inbox, starred, sent), bulk spam via toolbar, updated spam count,
 * exclusion from source folders, and "Not Spam" restore to original source.
 *
 * Key implementation details from the spec:
 *   - SPAM_ELIGIBLE_FOLDERS = ["inbox", "starred", "sent"]
 *   - SpammedMessage type with sourceFolder for restore
 *   - Per-row AlertTriangle button with aria-label t("list.moveToSpam")
 *   - Toolbar AlertTriangle button for bulk move-to-spam
 *   - Spam count = (14 - restoredSpamIds.length) + spammedMessages.length
 *   - "Not Spam" on user-spammed messages restores to sourceFolder
 *   - Starred state preserved through spam/restore cycle
 *   - localStorage key: "inbox-spammed-messages"
 *
 * Note: SpammedMessage type and handlers will be created during implementation.
 * These tests use the real mock data module -- no mocking of mockData.
 */

// Clear localStorage before each test so spam state doesn't leak
beforeEach(() => {
  localStorage.clear()
})

// --------------------------------------------------------------------------
// Per-row spam button visibility
// --------------------------------------------------------------------------

describe('Inbox -- per-row spam button visibility', () => {
  it('renders AlertTriangle spam button on Inbox folder rows', () => {
    renderInbox()

    // Default folder is inbox
    const spamButtons = screen.getAllByRole('button', { name: 'list.moveToSpam' })
    expect(spamButtons.length).toBeGreaterThan(0)
  })

  it('renders AlertTriangle spam button on Starred folder rows', () => {
    renderInbox()

    const starredFolderButton = screen.getByText('folders.starred').closest('button')!
    fireEvent.click(starredFolderButton)

    const spamButtons = screen.getAllByRole('button', { name: 'list.moveToSpam' })
    expect(spamButtons.length).toBeGreaterThan(0)
  })

  it('renders AlertTriangle spam button on Sent folder rows', () => {
    renderInbox()

    // Send a message first so the Sent folder has content
    const composeButton = screen.getByText('composeBtn')
    fireEvent.click(composeButton)

    const toInput = screen.getByPlaceholderText('compose.toPlaceholder')
    const subjectInput = screen.getByPlaceholderText('compose.subjectPlaceholder')
    const bodyInput = screen.getByPlaceholderText('compose.bodyPlaceholder')

    fireEvent.change(toInput, { target: { value: 'test@example.com' } })
    fireEvent.change(subjectInput, { target: { value: 'Sent test message' } })
    fireEvent.change(bodyInput, { target: { value: 'Body text for sent' } })

    const sendButton = screen.getByRole('button', { name: 'compose.send' })
    fireEvent.click(sendButton)

    // Should auto-navigate to Sent folder
    const spamButtons = screen.getAllByRole('button', { name: 'list.moveToSpam' })
    expect(spamButtons.length).toBeGreaterThan(0)
  })

  it('does NOT render spam button on Important folder rows', () => {
    renderInbox()

    const importantFolderButton = screen.getByText('folders.important').closest('button')!
    fireEvent.click(importantFolderButton)

    expect(screen.queryByRole('button', { name: 'list.moveToSpam' })).not.toBeInTheDocument()
  })

  it('does NOT render spam button on Draft folder rows', () => {
    renderInbox()

    const draftFolderButton = screen.getByText('folders.draft').closest('button')!
    fireEvent.click(draftFolderButton)

    expect(screen.queryByRole('button', { name: 'list.moveToSpam' })).not.toBeInTheDocument()
  })

  it('does NOT render spam button on Bin folder rows', () => {
    renderInbox()

    // Move a message to bin first so Bin folder has content
    const deleteButtons = screen.getAllByRole('button', { name: 'chat.delete' })
    fireEvent.click(deleteButtons[0])

    const binFolderButton = screen.getByText('folders.bin').closest('button')!
    fireEvent.click(binFolderButton)

    expect(screen.queryByRole('button', { name: 'list.moveToSpam' })).not.toBeInTheDocument()
  })

  it('does NOT render spam button on Archive folder rows', () => {
    renderInbox()

    // Archive a message first so Archive folder has content
    const archiveButtons = screen.getAllByRole('button', { name: 'list.archive' })
    fireEvent.click(archiveButtons[0])

    const archiveFolderButton = screen.getByText('folders.archive').closest('button')!
    fireEvent.click(archiveFolderButton)

    expect(screen.queryByRole('button', { name: 'list.moveToSpam' })).not.toBeInTheDocument()
  })

  it('does NOT render spam button on Spam folder rows', () => {
    renderInbox()

    const spamFolderButton = screen.getByText('folders.spam').closest('button')!
    fireEvent.click(spamFolderButton)

    expect(screen.queryByRole('button', { name: 'list.moveToSpam' })).not.toBeInTheDocument()
  })
})

// --------------------------------------------------------------------------
// Per-row spam button -- move message to spam
// --------------------------------------------------------------------------

describe('Inbox -- per-row move to spam', () => {
  it('removes the spammed message from the inbox list', () => {
    renderInbox()

    // "Ethan Rodriguez" is the first record in mockEmailRecords
    expect(screen.getByText('Ethan Rodriguez')).toBeInTheDocument()

    // spamButtons[0] is the toolbar button; per-row buttons start at [1]
    const spamButtons = screen.getAllByRole('button', { name: 'list.moveToSpam' })
    fireEvent.click(spamButtons[1])

    // The message should no longer appear in the inbox list
    expect(screen.queryByText('Ethan Rodriguez')).not.toBeInTheDocument()
  })

  it('increments the spam folder count by 1 after moving a message to spam', () => {
    renderInbox()

    const spamFolderButton = screen.getByText('folders.spam').closest('button')!
    expect(spamFolderButton).toHaveTextContent('14')

    const spamButtons = screen.getAllByRole('button', { name: 'list.moveToSpam' })
    fireEvent.click(spamButtons[1])

    // Spam count should now be 15
    expect(spamFolderButton).toHaveTextContent('15')
  })

  it('shows a toast notification after moving a message to spam', () => {
    renderInbox()

    const spamButtons = screen.getAllByRole('button', { name: 'list.moveToSpam' })
    fireEvent.click(spamButtons[1])

    expect(screen.getByText('list.movedToSpam')).toBeInTheDocument()
  })

  it('shows the spammed message in the Spam folder', () => {
    renderInbox()

    // Move Ethan Rodriguez to spam
    const spamButtons = screen.getAllByRole('button', { name: 'list.moveToSpam' })
    fireEvent.click(spamButtons[1])

    // Switch to Spam folder
    const spamFolderButton = screen.getByText('folders.spam').closest('button')!
    fireEvent.click(spamFolderButton)

    // The moved message should appear in the Spam folder alongside pre-seeded spam
    expect(screen.getByText('Ethan Rodriguez')).toBeInTheDocument()
  })
})

// --------------------------------------------------------------------------
// Bulk spam via toolbar
// --------------------------------------------------------------------------

describe('Inbox -- bulk move to spam via toolbar', () => {
  it('renders toolbar spam button on Inbox folder', () => {
    renderInbox()

    // The toolbar spam button has aria-label "list.moveToSpam"
    // spamButtons[0] is the toolbar button; per-row buttons start at [1]
    const spamButtons = screen.getAllByRole('button', { name: 'list.moveToSpam' })
    expect(spamButtons.length).toBeGreaterThan(0)
  })

  it('does NOT render toolbar spam button on Important folder', () => {
    renderInbox()

    const importantFolderButton = screen.getByText('folders.important').closest('button')!
    fireEvent.click(importantFolderButton)

    // No spam buttons at all (neither toolbar nor per-row) on Important folder
    expect(screen.queryByRole('button', { name: 'list.moveToSpam' })).not.toBeInTheDocument()
  })

  it('does NOT render toolbar spam button on Draft folder', () => {
    renderInbox()

    const draftFolderButton = screen.getByText('folders.draft').closest('button')!
    fireEvent.click(draftFolderButton)

    expect(screen.queryByRole('button', { name: 'list.moveToSpam' })).not.toBeInTheDocument()
  })

  it('does NOT render toolbar spam button on Spam folder', () => {
    renderInbox()

    const spamFolderButton = screen.getByText('folders.spam').closest('button')!
    fireEvent.click(spamFolderButton)

    expect(screen.queryByRole('button', { name: 'list.moveToSpam' })).not.toBeInTheDocument()
  })

  it('moves multiple selected messages to spam via toolbar', () => {
    renderInbox()

    const spamFolderButton = screen.getByText('folders.spam').closest('button')!
    expect(spamFolderButton).toHaveTextContent('14')

    // Select the first two message checkboxes
    const checkboxes = screen.getAllByRole('checkbox', { name: 'list.selectMessage' })
    fireEvent.click(checkboxes[0])
    fireEvent.click(checkboxes[1])

    // Click the toolbar spam button (first in the list, per-row buttons follow)
    const spamButtons = screen.getAllByRole('button', { name: 'list.moveToSpam' })
    fireEvent.click(spamButtons[0])

    // Spam count should now be 16
    expect(spamFolderButton).toHaveTextContent('16')
  })

  it('clears selection after bulk spam', () => {
    renderInbox()

    const checkboxes = screen.getAllByRole('checkbox', { name: 'list.selectMessage' })
    fireEvent.click(checkboxes[0])
    expect(checkboxes[0]).toBeChecked()

    // Click the toolbar spam button
    const spamButtons = screen.getAllByRole('button', { name: 'list.moveToSpam' })
    fireEvent.click(spamButtons[0])

    // Re-query checkboxes after bulk spam (the spammed message is removed from the list)
    const checkboxesAfter = screen.getAllByRole('checkbox', { name: 'list.selectMessage' })
    checkboxesAfter.forEach((cb) => expect(cb).not.toBeChecked())
  })
})

// --------------------------------------------------------------------------
// Spammed messages excluded from source folder
// --------------------------------------------------------------------------

describe('Inbox -- spammed messages excluded from source folder', () => {
  it('excludes spammed inbox message from Inbox folder', () => {
    renderInbox()

    expect(screen.getByText('Ethan Rodriguez')).toBeInTheDocument()

    const spamButtons = screen.getAllByRole('button', { name: 'list.moveToSpam' })
    fireEvent.click(spamButtons[1])

    expect(screen.queryByText('Ethan Rodriguez')).not.toBeInTheDocument()
  })

  it('excludes spammed starred message from Starred folder', () => {
    renderInbox()

    // Switch to Starred folder -- count records
    const starredFolderButton = screen.getByText('folders.starred').closest('button')!
    fireEvent.click(starredFolderButton)
    const starredCountBefore = screen.getAllByRole('button', { name: 'list.star' }).length
    expect(starredCountBefore).toBeGreaterThan(0)

    // Switch back to Inbox -- spam a starred message (Ethan Rodriguez is starred in mock data)
    const inboxFolderButton = screen.getByText('folders.inbox').closest('button')!
    fireEvent.click(inboxFolderButton)

    // spamButtons[0] is the toolbar button; per-row buttons start at [1]
    const spamButtons = screen.getAllByRole('button', { name: 'list.moveToSpam' })
    fireEvent.click(spamButtons[1])

    // Switch to Starred folder -- count should be reduced
    fireEvent.click(starredFolderButton)
    const starredCountAfter = screen.getAllByRole('button', { name: 'list.star' }).length
    expect(starredCountAfter).toBe(starredCountBefore - 1)
  })

  it('excludes spammed sent message from Sent folder', () => {
    renderInbox()

    // Send a message first
    const composeButton = screen.getByText('composeBtn')
    fireEvent.click(composeButton)

    const toInput = screen.getByPlaceholderText('compose.toPlaceholder')
    const subjectInput = screen.getByPlaceholderText('compose.subjectPlaceholder')
    const bodyInput = screen.getByPlaceholderText('compose.bodyPlaceholder')

    fireEvent.change(toInput, { target: { value: 'test@example.com' } })
    fireEvent.change(subjectInput, { target: { value: 'Sent for spam test' } })
    fireEvent.change(bodyInput, { target: { value: 'Body' } })

    const sendButton = screen.getByRole('button', { name: 'compose.send' })
    fireEvent.click(sendButton)

    // Should auto-navigate to Sent folder -- message visible
    expect(screen.getByText('Sent for spam test')).toBeInTheDocument()

    // Spam the sent message (spamButtons[0] is toolbar; [1] is per-row)
    const spamButtons = screen.getAllByRole('button', { name: 'list.moveToSpam' })
    fireEvent.click(spamButtons[1])

    // Message should be gone from Sent folder
    expect(screen.queryByText('Sent for spam test')).not.toBeInTheDocument()
  })
})

// --------------------------------------------------------------------------
// "Not Spam" on user-spammed messages restores to source folder
// --------------------------------------------------------------------------

describe('Inbox -- "Not Spam" restores user-spammed messages', () => {
  it('restores a user-spammed inbox message back to the Inbox folder', () => {
    renderInbox()

    // Spam Ethan Rodriguez from inbox (spamButtons[0] is toolbar; [1] is per-row)
    const spamButtons = screen.getAllByRole('button', { name: 'list.moveToSpam' })
    fireEvent.click(spamButtons[1])
    expect(screen.queryByText('Ethan Rodriguez')).not.toBeInTheDocument()

    // Go to Spam folder
    const spamFolderButton = screen.getByText('folders.spam').closest('button')!
    fireEvent.click(spamFolderButton)

    // Find Ethan Rodriguez in spam and click "Not Spam"
    expect(screen.getByText('Ethan Rodriguez')).toBeInTheDocument()
    // Ethan Rodriguez should be in the list -- click the "Not Spam" button on his row
    // User-spammed messages appear alongside mock spam. We click "Not Spam" on the
    // row containing Ethan Rodriguez. Since we don't know exact position, find his row.
    const ethanRow = screen.getByText('Ethan Rodriguez').closest('button')!
    const notSpamBtn = ethanRow.querySelector('button[aria-label="list.notSpam"]')
    expect(notSpamBtn).not.toBeNull()
    fireEvent.click(notSpamBtn!)

    // Go back to Inbox
    const inboxFolderButton = screen.getByText('folders.inbox').closest('button')!
    fireEvent.click(inboxFolderButton)

    // Ethan Rodriguez should be back in the Inbox
    expect(screen.getByText('Ethan Rodriguez')).toBeInTheDocument()
  })

  it('restores a user-spammed sent message back to the Sent folder', () => {
    renderInbox()

    // Send a message
    const composeButton = screen.getByText('composeBtn')
    fireEvent.click(composeButton)

    const toInput = screen.getByPlaceholderText('compose.toPlaceholder')
    const subjectInput = screen.getByPlaceholderText('compose.subjectPlaceholder')
    const bodyInput = screen.getByPlaceholderText('compose.bodyPlaceholder')

    fireEvent.change(toInput, { target: { value: 'restore@example.com' } })
    fireEvent.change(subjectInput, { target: { value: 'Restore from spam test' } })
    fireEvent.change(bodyInput, { target: { value: 'Body' } })

    const sendButton = screen.getByRole('button', { name: 'compose.send' })
    fireEvent.click(sendButton)

    // Auto-navigated to Sent folder -- spam the sent message (spamButtons[0] is toolbar; [1] is per-row)
    expect(screen.getByText('Restore from spam test')).toBeInTheDocument()
    const spamButtons = screen.getAllByRole('button', { name: 'list.moveToSpam' })
    fireEvent.click(spamButtons[1])

    // Go to Spam folder
    const spamFolderButton = screen.getByText('folders.spam').closest('button')!
    fireEvent.click(spamFolderButton)

    // Find the sent message in spam and click "Not Spam"
    expect(screen.getByText('Restore from spam test')).toBeInTheDocument()
    const sentRow = screen.getByText('Restore from spam test').closest('button')!
    const notSpamBtn = sentRow.querySelector('button[aria-label="list.notSpam"]')
    expect(notSpamBtn).not.toBeNull()
    fireEvent.click(notSpamBtn!)

    // Go to Sent folder
    const sentFolderButton = screen.getByText('folders.sent').closest('button')!
    fireEvent.click(sentFolderButton)

    // Message should be back in Sent
    expect(screen.getByText('Restore from spam test')).toBeInTheDocument()
  })
})

// --------------------------------------------------------------------------
// Starred state preserved through spam/restore cycle
// --------------------------------------------------------------------------

describe('Inbox -- starred state preserved through spam/restore', () => {
  it('retains star status after spam and restore round-trip', () => {
    renderInbox()

    // Ethan Rodriguez (rec-1) is starred in mock data
    const starButtons = screen.getAllByRole('button', { name: 'list.star' })
    const firstStar = starButtons[0]
    expect(firstStar.className).toContain('text-warning')

    // Spam the first message (spamButtons[0] is toolbar; [1] is per-row)
    const spamButtons = screen.getAllByRole('button', { name: 'list.moveToSpam' })
    fireEvent.click(spamButtons[1])

    // Go to Spam folder
    const spamFolderButton = screen.getByText('folders.spam').closest('button')!
    fireEvent.click(spamFolderButton)

    // Restore via "Not Spam"
    const ethanRow = screen.getByText('Ethan Rodriguez').closest('button')!
    const notSpamBtn = ethanRow.querySelector('button[aria-label="list.notSpam"]')
    fireEvent.click(notSpamBtn!)

    // Go back to Inbox
    const inboxFolderButton = screen.getByText('folders.inbox').closest('button')!
    fireEvent.click(inboxFolderButton)

    // Ethan Rodriguez should be back and still starred
    expect(screen.getByText('Ethan Rodriguez')).toBeInTheDocument()
    const starButtonsAfter = screen.getAllByRole('button', { name: 'list.star' })
    const firstStarAfter = starButtonsAfter[0]
    expect(firstStarAfter.className).toContain('text-warning')
  })
})

// --------------------------------------------------------------------------
// Spam count formula
// --------------------------------------------------------------------------

describe('Inbox -- spam count formula', () => {
  it('starts at 14 (pre-seeded mock spam)', () => {
    renderInbox()

    const spamFolderButton = screen.getByText('folders.spam').closest('button')!
    expect(spamFolderButton).toHaveTextContent('14')
  })

  it('increments on move-to-spam and decrements on not-spam', () => {
    renderInbox()

    const spamFolderButton = screen.getByText('folders.spam').closest('button')!

    // Move one message to spam: 14 -> 15 (spamButtons[0] is toolbar; [1] is per-row)
    const spamButtons = screen.getAllByRole('button', { name: 'list.moveToSpam' })
    fireEvent.click(spamButtons[1])
    expect(spamFolderButton).toHaveTextContent('15')

    // Go to Spam folder and restore one: 15 -> 14
    fireEvent.click(spamFolderButton)
    // Click "Not Spam" on Ethan Rodriguez (user-spammed message)
    const ethanRow = screen.getByText('Ethan Rodriguez').closest('button')!
    const notSpamBtn = ethanRow.querySelector('button[aria-label="list.notSpam"]')
    fireEvent.click(notSpamBtn!)

    expect(spamFolderButton).toHaveTextContent('14')
  })
})

// --------------------------------------------------------------------------
// Persistence across re-renders
// --------------------------------------------------------------------------

describe('Inbox -- spammed messages persist via localStorage', () => {
  it('persists spammed messages across re-renders', () => {
    const { unmount } = renderInbox()

    // Spam a message (spamButtons[0] is toolbar; [1] is per-row)
    const spamButtons = screen.getAllByRole('button', { name: 'list.moveToSpam' })
    fireEvent.click(spamButtons[1])

    const spamFolderButton = screen.getByText('folders.spam').closest('button')!
    expect(spamFolderButton).toHaveTextContent('15')

    // Unmount and re-render (simulating page refresh -- localStorage persists)
    unmount()
    renderInbox()

    // Spam count should still be 15 after re-render
    const spamFolderButtonAfter = screen.getByText('folders.spam').closest('button')!
    expect(spamFolderButtonAfter).toHaveTextContent('15')

    // Ethan Rodriguez should still be absent from inbox
    expect(screen.queryByText('Ethan Rodriguez')).not.toBeInTheDocument()
  })
})

// --- Unit tests (MessageList component) ---

/**
 * Unit tests for the "Move to Spam" per-row button and toolbar button on MessageList.
 *
 * New props added by the change:
 *   - onMoveToSpam?: (id: string) => void -- per-row spam button click
 *   - onBulkMoveToSpam?: (ids: string[]) => void -- toolbar spam button click
 *
 * Behaviors under test:
 *   - AlertTriangle per-row button renders when onMoveToSpam is provided
 *   - Per-row button does NOT render when onMoveToSpam is undefined
 *   - Clicking per-row button calls onMoveToSpam with the record id
 *   - Clicking per-row button does NOT call onSelect (stopPropagation)
 *   - Per-row button positioned between Archive and Trash2 in DOM order
 *   - Toolbar AlertTriangle button renders when onBulkMoveToSpam is provided
 *   - Toolbar button does NOT render when onBulkMoveToSpam is undefined
 */

const mockLabels: InboxLabel[] = [
  { id: 'primary', nameKey: 'labels.primary', color: '#00b69b' },
  { id: 'social', nameKey: 'labels.social', color: '#5a8cff' },
  { id: 'work', nameKey: 'labels.work', color: '#fd9a56' },
  { id: 'friends', nameKey: 'labels.friends', color: '#d456fd' },
]

const mockRecords: EmailRecord[] = [
  { id: 'rec-1', senderName: 'Alice', labelId: 'primary', subject: 'Hello from Alice', time: '9:00 AM' },
  { id: 'rec-2', senderName: 'Bob', labelId: 'work', subject: 'Project update', time: '10:00 AM' },
  { id: 'rec-3', senderName: 'Carol', labelId: 'primary', subject: 'Meeting notes', time: '11:00 AM' },
]

const defaultMessageListProps = {
  records: mockRecords,
  labels: mockLabels,
  onSelect: vi.fn(),
  onShowToast: vi.fn(),
  starredIds: {} as Record<string, boolean>,
  onToggleStar: vi.fn(),
  activeFolder: 'inbox',
}

describe('MessageList -- per-row "Move to Spam" button', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('button visibility', () => {
    it('renders spam button on each row when onMoveToSpam is provided', () => {
      render(
        <MessageList
          {...defaultMessageListProps}
          activeFolder="inbox"
          onMoveToSpam={vi.fn()}
          onArchive={vi.fn()}
          onDelete={vi.fn()}
        />
      )

      const spamButtons = screen.getAllByRole('button', { name: 'list.moveToSpam' })
      expect(spamButtons).toHaveLength(3)
    })

    it('does NOT render spam button when onMoveToSpam is not provided', () => {
      render(
        <MessageList
          {...defaultMessageListProps}
          activeFolder="inbox"
          onArchive={vi.fn()}
          onDelete={vi.fn()}
        />
      )

      expect(screen.queryByRole('button', { name: 'list.moveToSpam' })).not.toBeInTheDocument()
    })

    it.each(['inbox', 'starred', 'sent'])(
      'renders spam button when activeFolder is "%s" and onMoveToSpam is provided',
      (folder) => {
        render(
          <MessageList
            {...defaultMessageListProps}
            activeFolder={folder}
            onMoveToSpam={vi.fn()}
            onArchive={vi.fn()}
            onDelete={vi.fn()}
            starredIds={
              folder === 'starred'
                ? { 'rec-1': true, 'rec-2': true, 'rec-3': true }
                : {}
            }
          />
        )

        const spamButtons = screen.getAllByRole('button', { name: 'list.moveToSpam' })
        expect(spamButtons.length).toBeGreaterThan(0)
      }
    )
  })

  describe('click behavior', () => {
    it('calls onMoveToSpam with the record id when spam button is clicked', () => {
      const onMoveToSpam = vi.fn()

      render(
        <MessageList
          {...defaultMessageListProps}
          activeFolder="inbox"
          onMoveToSpam={onMoveToSpam}
          onArchive={vi.fn()}
          onDelete={vi.fn()}
        />
      )

      const spamButtons = screen.getAllByRole('button', { name: 'list.moveToSpam' })
      fireEvent.click(spamButtons[0])

      expect(onMoveToSpam).toHaveBeenCalledWith('rec-1')
    })

    it('does NOT call onSelect when spam button is clicked (stopPropagation)', () => {
      const onSelect = vi.fn()
      const onMoveToSpam = vi.fn()

      render(
        <MessageList
          {...defaultMessageListProps}
          onSelect={onSelect}
          activeFolder="inbox"
          onMoveToSpam={onMoveToSpam}
          onArchive={vi.fn()}
          onDelete={vi.fn()}
        />
      )

      const spamButtons = screen.getAllByRole('button', { name: 'list.moveToSpam' })
      fireEvent.click(spamButtons[0])

      // Spam was called
      expect(onMoveToSpam).toHaveBeenCalledTimes(1)
      // But conversation was NOT opened
      expect(onSelect).not.toHaveBeenCalled()
    })
  })

  describe('button position', () => {
    it('places spam button between archive and delete buttons in DOM order', () => {
      render(
        <MessageList
          {...defaultMessageListProps}
          activeFolder="inbox"
          onMoveToSpam={vi.fn()}
          onArchive={vi.fn()}
          onDelete={vi.fn()}
        />
      )

      const archiveButtons = screen.getAllByRole('button', { name: 'list.archive' })
      const spamButtons = screen.getAllByRole('button', { name: 'list.moveToSpam' })
      const deleteButtons = screen.getAllByRole('button', { name: 'chat.delete' })

      expect(archiveButtons.length).toBeGreaterThan(0)
      expect(spamButtons.length).toBeGreaterThan(0)
      expect(deleteButtons.length).toBeGreaterThan(0)

      // Archive should come before Spam in DOM order
      expect(archiveButtons[0].compareDocumentPosition(spamButtons[0]) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()

      // Spam should come before Delete in DOM order
      expect(spamButtons[0].compareDocumentPosition(deleteButtons[0]) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    })
  })
})

describe('MessageList -- toolbar "Move to Spam" button', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders AlertTriangle toolbar button when onBulkMoveToSpam is provided', () => {
    render(
      <MessageList
        {...defaultMessageListProps}
        activeFolder="inbox"
        onMoveToSpam={vi.fn()}
        onBulkMoveToSpam={vi.fn()}
        onArchive={vi.fn()}
        onBulkArchive={vi.fn()}
        onDelete={vi.fn()}
      />
    )

    const toolbarButtons = screen.getAllByRole('button')
    const spamToolbarButton = toolbarButtons.find(
      (btn) => btn.querySelector('.lucide-triangle-alert')
    )
    expect(spamToolbarButton).toBeDefined()
  })

  it('does NOT render AlertTriangle toolbar button when onBulkMoveToSpam is not provided', () => {
    render(
      <MessageList
        {...defaultMessageListProps}
        activeFolder="inbox"
        onArchive={vi.fn()}
        onBulkArchive={vi.fn()}
        onDelete={vi.fn()}
      />
    )

    const toolbarButtons = screen.getAllByRole('button')
    const spamToolbarButton = toolbarButtons.find(
      (btn) => btn.querySelector('.lucide-triangle-alert')
    )
    expect(spamToolbarButton).toBeUndefined()
  })

  it('calls onBulkMoveToSpam with selected IDs when toolbar spam button is clicked', () => {
    const onBulkMoveToSpam = vi.fn()

    render(
      <MessageList
        {...defaultMessageListProps}
        activeFolder="inbox"
        onMoveToSpam={vi.fn()}
        onBulkMoveToSpam={onBulkMoveToSpam}
        onArchive={vi.fn()}
        onBulkArchive={vi.fn()}
        onDelete={vi.fn()}
      />
    )

    // Select the first two checkboxes
    const checkboxes = screen.getAllByRole('checkbox', { name: 'list.selectMessage' })
    fireEvent.click(checkboxes[0])
    fireEvent.click(checkboxes[1])

    // Click the toolbar spam button
    const toolbarButtons = screen.getAllByRole('button')
    const spamToolbarButton = toolbarButtons.find(
      (btn) => btn.querySelector('.lucide-triangle-alert')
    )!
    fireEvent.click(spamToolbarButton)

    expect(onBulkMoveToSpam).toHaveBeenCalledWith(
      expect.arrayContaining(['rec-1', 'rec-2'])
    )
  })

  it('shows "No messages selected" toast when toolbar spam is clicked with no selection', () => {
    const onShowToast = vi.fn()

    render(
      <MessageList
        {...defaultMessageListProps}
        onShowToast={onShowToast}
        activeFolder="inbox"
        onMoveToSpam={vi.fn()}
        onBulkMoveToSpam={vi.fn()}
        onArchive={vi.fn()}
        onBulkArchive={vi.fn()}
        onDelete={vi.fn()}
      />
    )

    // Click toolbar spam without selecting any checkboxes
    const toolbarButtons = screen.getAllByRole('button')
    const spamToolbarButton = toolbarButtons.find(
      (btn) => btn.querySelector('.lucide-triangle-alert')
    )!
    fireEvent.click(spamToolbarButton)

    expect(onShowToast).toHaveBeenCalledWith('list.noSelection')
  })
})
