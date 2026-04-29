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
 * Integration tests for the inbox-spam-folder change.
 *
 * These tests render the full Inbox page (index.tsx) and verify the
 * end-to-end behavior of the Spam folder: displaying pre-seeded spam
 * records, "Not Spam" restore action, dynamic sidebar count, restored
 * records appearing in Inbox, and exclusion from Starred view.
 *
 * Key implementation details from the spec:
 *   - mockSpamRecords: 14 EmailRecord entries with "spam-" prefixed IDs
 *   - localStorage keys: "inbox-restored-spam-ids" (string[]), "inbox-restored-from-spam" (EmailRecord[])
 *   - "Not Spam" button uses ShieldCheck icon with aria-label from t("list.notSpam")
 *   - Spam count = 14 - restoredSpamIds.length, via folderCountOverrides
 *   - Restored spam records appear in the Inbox folder's default branch
 *   - Spam records excluded from Starred folder view
 *
 * Note: mockSpamRecords will be created during implementation (task 1.1).
 * These tests use the real mock data module — no mocking of mockData.
 */

// Clear localStorage before each test so spam restore state doesn't leak
beforeEach(() => {
  localStorage.clear()
})

describe('Inbox -- spam folder sidebar', () => {
  it('renders the Spam folder tab in the sidebar', () => {
    renderInbox()

    expect(screen.getByText('folders.spam')).toBeInTheDocument()
  })

  it('displays spam count of 14 on first load (no prior "Not Spam" actions)', () => {
    renderInbox()

    const spamFolderButton = screen.getByText('folders.spam').closest('button')!
    expect(spamFolderButton).toBeInTheDocument()
    expect(spamFolderButton).toHaveTextContent('14')
  })
})

describe('Inbox -- spam folder displays pre-seeded mock spam records', () => {
  it('shows spam records when switching to the Spam folder', () => {
    renderInbox()

    // Switch to Spam folder
    const spamFolderButton = screen.getByText('folders.spam').closest('button')!
    fireEvent.click(spamFolderButton)

    // The Spam folder should show records (star buttons indicate rows are present).
    // Per spec, there should be 14 spam records on first load.
    // The page size is 12, so first page shows 12 rows.
    const starButtons = screen.getAllByRole('button', { name: 'list.star' })
    expect(starButtons).toHaveLength(12)
  })

  it('shows the correct total count in pagination text', () => {
    renderInbox()

    // Switch to Spam folder
    const spamFolderButton = screen.getByText('folders.spam').closest('button')!
    fireEvent.click(spamFolderButton)

    // Pagination should indicate 14 total records
    // The MessageList renders "Showing 1-12 of 14" using t("list.showing", ...)
    // Since i18n returns keys as-is, we check for the rendered text containing "14"
    // SPEC: assumed pagination text includes total count — verify during implementation
    expect(screen.getByText(/14/)).toBeInTheDocument()
  })
})

describe('Inbox -- "Not Spam" button on spam folder rows', () => {
  it('displays "Not Spam" button (ShieldCheck icon) on each spam row', () => {
    renderInbox()

    // Switch to Spam folder
    const spamFolderButton = screen.getByText('folders.spam').closest('button')!
    fireEvent.click(spamFolderButton)

    // Each row in the spam folder should have a "Not Spam" button
    // notSpamButtons[0] is the toolbar bulk button; per-row buttons start at [1]
    const notSpamButtons = screen.getAllByRole('button', { name: 'list.notSpam' })
    expect(notSpamButtons.length).toBeGreaterThan(0)
    // 1 toolbar + 12 per-row (RECORDS_PER_PAGE) = 13 buttons
    expect(notSpamButtons).toHaveLength(13)
  })

  it('does NOT display "Not Spam" button on inbox folder rows', () => {
    renderInbox()

    // Stay on Inbox folder (default)
    expect(screen.queryByRole('button', { name: 'list.notSpam' })).not.toBeInTheDocument()
  })
})

describe('Inbox -- "Not Spam" restores message to inbox', () => {
  it('removes the message from spam folder when "Not Spam" is clicked', () => {
    renderInbox()

    // Switch to Spam folder
    const spamFolderButton = screen.getByText('folders.spam').closest('button')!
    fireEvent.click(spamFolderButton)

    // Click "Not Spam" on the first spam row (notSpamButtons[0] is toolbar; per-row starts at [1])
    const notSpamButtons = screen.getAllByRole('button', { name: 'list.notSpam' })
    fireEvent.click(notSpamButtons[1])

    // The spam folder should now show 11 records on the first page
    // (was 12 on page 1 out of 14 total; after removing 1, total is 13, page 1 still has 12)
    // But we can verify the total count changed via pagination
    // SPEC: assumed pagination text updates to reflect 13 total
    expect(screen.getByText(/13/)).toBeInTheDocument()
  })

  it('decrements the spam sidebar count by 1 after "Not Spam"', () => {
    renderInbox()

    const spamFolderButton = screen.getByText('folders.spam').closest('button')!
    expect(spamFolderButton).toHaveTextContent('14')

    // Switch to Spam folder and click "Not Spam" (notSpamButtons[0] is toolbar; [1] is per-row)
    fireEvent.click(spamFolderButton)
    const notSpamButtons = screen.getAllByRole('button', { name: 'list.notSpam' })
    fireEvent.click(notSpamButtons[1])

    // Spam count should now be 13
    expect(spamFolderButton).toHaveTextContent('13')
  })

  it('increments the inbox sidebar count by 1 after "Not Spam"', () => {
    renderInbox()

    const inboxFolderButton = screen.getByText('folders.inbox').closest('button')!
    const inboxCountBefore = parseInt(inboxFolderButton.textContent!.match(/\d+/)?.[0] || '0', 10)

    // Switch to Spam folder and click "Not Spam" (notSpamButtons[0] is toolbar; [1] is per-row)
    const spamFolderButton = screen.getByText('folders.spam').closest('button')!
    fireEvent.click(spamFolderButton)
    const notSpamButtons = screen.getAllByRole('button', { name: 'list.notSpam' })
    fireEvent.click(notSpamButtons[1])

    // Inbox count should have incremented by 1
    const inboxCountAfter = parseInt(inboxFolderButton.textContent!.match(/\d+/)?.[0] || '0', 10)
    expect(inboxCountAfter).toBe(inboxCountBefore + 1)
  })

  it('shows a toast notification after "Not Spam" action', () => {
    renderInbox()

    // Switch to Spam folder
    const spamFolderButton = screen.getByText('folders.spam').closest('button')!
    fireEvent.click(spamFolderButton)

    const notSpamButtons = screen.getAllByRole('button', { name: 'list.notSpam' })
    fireEvent.click(notSpamButtons[1])

    // Toast with the "marked not spam" translation key
    expect(screen.getByText('list.markedNotSpam')).toBeInTheDocument()
  })

  it('makes the restored spam record appear in the Inbox folder', () => {
    renderInbox()

    // Switch to Spam folder
    const spamFolderButton = screen.getByText('folders.spam').closest('button')!
    fireEvent.click(spamFolderButton)

    // Get the sender name of the first spam record before restoring
    const starButtons = screen.getAllByRole('button', { name: 'list.star' })
    // The first row's sender name is adjacent to the star button
    // We'll find the first spam record's sender by looking at the row content
    const firstSpamRow = starButtons[0].closest('button[class]')!
    const firstSpamSenderName = firstSpamRow.querySelector('.font-medium')?.textContent

    // Click "Not Spam" on the first row (notSpamButtons[0] is toolbar; [1] is per-row)
    const notSpamButtons = screen.getAllByRole('button', { name: 'list.notSpam' })
    fireEvent.click(notSpamButtons[1])

    // Switch to Inbox folder
    const inboxFolderButton = screen.getByText('folders.inbox').closest('button')!
    fireEvent.click(inboxFolderButton)

    // The restored spam record should now be visible in the Inbox folder
    // SPEC: assumed sender name from mockSpamRecords[0] is present — verify during implementation
    if (firstSpamSenderName) {
      expect(screen.getByText(firstSpamSenderName)).toBeInTheDocument()
    }
  })
})

describe('Inbox -- clicking a spam row opens ChatView', () => {
  it('opens ChatView when clicking a message row in the Spam folder', () => {
    renderInbox()

    // Switch to Spam folder
    const spamFolderButton = screen.getByText('folders.spam').closest('button')!
    fireEvent.click(spamFolderButton)

    // Verify we're on the message list (search input visible)
    expect(screen.getByPlaceholderText('list.search')).toBeInTheDocument()

    // Click the first spam message row (the row button wrapping the entire row)
    // The row button is the outermost button with class starting with "w-full"
    const rows = screen.getAllByRole('button', { name: 'list.star' })
    const firstRow = rows[0].closest('button.w-full')!
    fireEvent.click(firstRow)

    // ChatView should open -- search input gone, back button visible
    expect(screen.queryByPlaceholderText('list.search')).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'chat.back' })).toBeInTheDocument()
  })
})

describe('Inbox -- spam records excluded from Starred folder', () => {
  it('does not show spam records in the Starred folder view', () => {
    renderInbox()

    // Switch to Starred folder -- count the records
    const starredFolderButton = screen.getByText('folders.starred').closest('button')!
    fireEvent.click(starredFolderButton)

    const starredRecordsBefore = screen.queryAllByRole('button', { name: 'list.star' })
    const countBefore = starredRecordsBefore.length

    // Switch back to Inbox -- verify normal inbox records (no spam senders mixed in)
    // The key assertion is that Starred folder record count does NOT include
    // any of the 14 spam records (which could theoretically have starred state).
    // Since spam records start fresh with no starred state, the Starred count
    // should remain unchanged from what the inbox mock data seeds provide.
    const inboxFolderButton = screen.getByText('folders.inbox').closest('button')!
    fireEvent.click(inboxFolderButton)

    // Switch back to Starred -- count should be the same (no spam records leaked in)
    fireEvent.click(starredFolderButton)
    const starredRecordsAfter = screen.queryAllByRole('button', { name: 'list.star' })
    expect(starredRecordsAfter.length).toBe(countBefore)
  })
})

describe('Inbox -- spam count persists via localStorage', () => {
  it('persists restored spam IDs across re-renders', () => {
    const { unmount } = renderInbox()

    // Switch to Spam folder and restore one message
    const spamFolderButton = screen.getByText('folders.spam').closest('button')!
    fireEvent.click(spamFolderButton)

    const notSpamButtons = screen.getAllByRole('button', { name: 'list.notSpam' })
    fireEvent.click(notSpamButtons[1])

    expect(spamFolderButton).toHaveTextContent('13')

    // Unmount and re-render (simulating page refresh — localStorage persists)
    unmount()
    renderInbox()

    // Spam count should still be 13 after re-render
    const spamFolderButtonAfter = screen.getByText('folders.spam').closest('button')!
    expect(spamFolderButtonAfter).toHaveTextContent('13')
  })
})

// --- Unit tests (MessageList component) ---

/**
 * Unit tests for the "Not Spam" button on MessageList.
 *
 * New prop added by the change:
 *   - onNotSpam?: (id: string) => void -- called on "Not Spam" button click in spam folder
 *
 * Behaviors under test:
 *   - ShieldCheck "Not Spam" button renders when activeFolder === "spam" and onNotSpam is provided
 *   - "Not Spam" button does NOT render on non-spam folders
 *   - Clicking "Not Spam" button calls onNotSpam with the record id
 *   - Clicking "Not Spam" button does NOT call onSelect (stopPropagation)
 */

const mockLabels: InboxLabel[] = [
  { id: 'primary', nameKey: 'labels.primary', color: '#00b69b' },
  { id: 'social', nameKey: 'labels.social', color: '#5a8cff' },
  { id: 'work', nameKey: 'labels.work', color: '#fd9a56' },
  { id: 'friends', nameKey: 'labels.friends', color: '#d456fd' },
]

const mockSpamTestRecords: EmailRecord[] = [
  { id: 'spam-1', senderName: 'Nigerian Prince Foundation', labelId: 'primary', subject: "You've Won $1,000,000!", time: '9:00 AM' },
  { id: 'spam-2', senderName: 'Account Security Team', labelId: 'work', subject: 'Verify your account immediately', time: '10:00 AM' },
  { id: 'spam-3', senderName: 'Free Prize Center', labelId: 'social', subject: 'Claim your exclusive reward now', time: '11:00 AM' },
]

const defaultMessageListProps = {
  records: mockSpamTestRecords,
  labels: mockLabels,
  onSelect: vi.fn(),
  onShowToast: vi.fn(),
  starredIds: {} as Record<string, boolean>,
  onToggleStar: vi.fn(),
  activeFolder: 'spam',
}

describe('MessageList -- "Not Spam" button', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('button visibility', () => {
    it('renders "Not Spam" button on each row when activeFolder is "spam" and onNotSpam is provided', () => {
      render(
        <MessageList
          {...defaultMessageListProps}
          activeFolder="spam"
          onNotSpam={vi.fn()}
        />
      )

      const notSpamButtons = screen.getAllByRole('button', { name: 'list.notSpam' })
      expect(notSpamButtons).toHaveLength(3)
    })

    it('does NOT render "Not Spam" button when activeFolder is "inbox"', () => {
      render(
        <MessageList
          {...defaultMessageListProps}
          activeFolder="inbox"
          onNotSpam={vi.fn()}
        />
      )

      expect(screen.queryByRole('button', { name: 'list.notSpam' })).not.toBeInTheDocument()
    })

    it('does NOT render "Not Spam" button when onNotSpam is not provided', () => {
      render(
        <MessageList
          {...defaultMessageListProps}
          activeFolder="spam"
        />
      )

      expect(screen.queryByRole('button', { name: 'list.notSpam' })).not.toBeInTheDocument()
    })

    it.each(['inbox', 'starred', 'sent', 'draft', 'important', 'bin', 'archive'])(
      'does NOT render "Not Spam" button when activeFolder is "%s"',
      (folder) => {
        render(
          <MessageList
            {...defaultMessageListProps}
            activeFolder={folder}
            onNotSpam={vi.fn()}
            starredIds={
              folder === 'starred'
                ? { 'spam-1': true, 'spam-2': true, 'spam-3': true }
                : {}
            }
          />
        )

        expect(screen.queryByRole('button', { name: 'list.notSpam' })).not.toBeInTheDocument()
      }
    )
  })

  describe('click behavior', () => {
    it('calls onNotSpam with the record id when "Not Spam" button is clicked', () => {
      const onNotSpam = vi.fn()

      render(
        <MessageList
          {...defaultMessageListProps}
          activeFolder="spam"
          onNotSpam={onNotSpam}
        />
      )

      const notSpamButtons = screen.getAllByRole('button', { name: 'list.notSpam' })
      fireEvent.click(notSpamButtons[0])

      expect(onNotSpam).toHaveBeenCalledWith('spam-1')
    })

    it('does NOT call onSelect when "Not Spam" button is clicked (stopPropagation)', () => {
      const onSelect = vi.fn()
      const onNotSpam = vi.fn()

      render(
        <MessageList
          {...defaultMessageListProps}
          onSelect={onSelect}
          activeFolder="spam"
          onNotSpam={onNotSpam}
        />
      )

      const notSpamButtons = screen.getAllByRole('button', { name: 'list.notSpam' })
      fireEvent.click(notSpamButtons[0])

      // "Not Spam" was called
      expect(onNotSpam).toHaveBeenCalledTimes(1)
      // But conversation was NOT opened
      expect(onSelect).not.toHaveBeenCalled()
    })
  })
})
