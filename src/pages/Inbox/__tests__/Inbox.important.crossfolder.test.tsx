import { render, screen, fireEvent, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import Inbox from '../index'

/**
 * Cross-folder integration tests for the Important folder feature.
 *
 * These cover the spec scenarios added after the initial implementation,
 * once verification surfaced that the Important folder display source and
 * the shared `buildBinnedMessage` / `buildArchivedMessage` helpers were
 * missing `restoredFromSpam` and `receivedEmailRecords`:
 *
 *   - Important folder includes flagged received messages
 *   - Important folder includes flagged restored-from-spam messages
 *   - Archive from Important succeeds for a restored-from-spam record
 *   - Delete from Important succeeds for a received message
 *   - Archive/Delete from Important succeeds for a mock or sent record
 *
 * Auth is mocked here so we can pre-seed `inbox-delivered-messages` with a
 * message addressed to the logged-in user (the only path by which
 * `receivedEmailRecords` becomes non-empty).
 */

const mockGetStoredUser = vi.fn()
vi.mock('../../../services/auth', () => ({
  getStoredUser: (...args: unknown[]) => mockGetStoredUser(...args),
}))

function renderInbox() {
  return render(
    <MemoryRouter>
      <Inbox />
    </MemoryRouter>
  )
}

const goToFolder = (folderKey: string) => {
  const folderButton = screen.getByText(folderKey).closest('button')!
  fireEvent.click(folderButton)
}

const getFolderButton = (folderKey: string) =>
  screen.getByText(folderKey).closest('button')!

beforeEach(() => {
  vi.clearAllMocks()
  localStorage.clear()
  mockGetStoredUser.mockReturnValue({
    name: 'Alice',
    email: 'alice@example.com',
    role: 'admin',
  })
})

// Pre-seed a single delivered message addressed to the logged-in user. This
// is the only path that produces a `receivedEmailRecords` row; the inbox
// reads this list on every render.
const RECEIVED_ID = 'received-1'
function seedReceivedMessage() {
  localStorage.setItem(
    'inbox-delivered-messages',
    JSON.stringify([
      {
        id: RECEIVED_ID,
        senderEmail: 'bob@example.com',
        senderName: 'Bob',
        recipientEmail: 'alice@example.com',
        subject: 'Hello from Bob',
        body: 'Body content',
        sentAt: new Date().toISOString(),
      },
    ])
  )
}

// Restore a mock spam record into the inbox via the per-row "Not Spam"
// button. Returns the id used (spam-1, the first user-visible spam row).
function restoreSpamToInbox() {
  goToFolder('folders.spam')
  const notSpamButtons = screen.getAllByRole('button', { name: 'list.notSpam' })
  // index 0 is the toolbar button; index 1 is the first per-row button.
  fireEvent.click(notSpamButtons[1])
}

// --------------------------------------------------------------------------
// Display: Important folder includes received & restored-from-spam records
// --------------------------------------------------------------------------

describe('Inbox -- Important folder display source includes all visible record types', () => {
  it('shows a flagged received message in the Important folder and counts it', () => {
    seedReceivedMessage()
    renderInbox()

    // The received message appears in the inbox; flag it via per-row Bookmark.
    const bobRow = screen.getByText('Hello from Bob').closest('button') as HTMLElement
    const flagBtn = within(bobRow).getByRole('button', { name: 'list.markImportant' })
    fireEvent.click(flagBtn)

    // Sidebar count is 5 (seeded mocks) + 1 (Bob's message) = 6
    expect(getFolderButton('folders.important')).toHaveTextContent('6')

    // Important folder view contains Bob's message
    goToFolder('folders.important')
    expect(screen.getByText('Hello from Bob')).toBeInTheDocument()
    expect(
      screen.getAllByRole('button', { name: 'list.unmarkImportant' })
    ).toHaveLength(6)
  })

  it('shows a flagged restored-from-spam record in the Important folder and counts it', () => {
    renderInbox()

    restoreSpamToInbox()

    // Back to inbox, flag the restored record (Prize Center / spam-1)
    goToFolder('folders.inbox')
    const restoredRow = screen.getByText('Prize Center').closest('button') as HTMLElement
    const flagBtn = within(restoredRow).getByRole('button', { name: 'list.markImportant' })
    fireEvent.click(flagBtn)

    // Sidebar count: 5 + 1 = 6
    expect(getFolderButton('folders.important')).toHaveTextContent('6')

    // Important folder shows the restored record
    goToFolder('folders.important')
    expect(screen.getByText('Prize Center')).toBeInTheDocument()
    expect(
      screen.getAllByRole('button', { name: 'list.unmarkImportant' })
    ).toHaveLength(6)
  })
})

// --------------------------------------------------------------------------
// Per-row Archive/Delete from Important folder for non-mock record types
// --------------------------------------------------------------------------

describe('Inbox -- per-row Archive/Delete from Important folder', () => {
  it('archives a flagged restored-from-spam record from Important', () => {
    renderInbox()
    restoreSpamToInbox()
    goToFolder('folders.inbox')

    const row = screen.getByText('Prize Center').closest('button') as HTMLElement
    fireEvent.click(within(row).getByRole('button', { name: 'list.markImportant' }))

    // Archive from the Important folder
    goToFolder('folders.important')
    const importantRow = screen.getByText('Prize Center').closest('button') as HTMLElement
    fireEvent.click(within(importantRow).getByRole('button', { name: 'list.archive' }))

    // The record is now in archivedMessages with sourceFolder "inbox"
    const archived = JSON.parse(
      localStorage.getItem('inbox-archived-messages') || '[]'
    )
    expect(archived).toHaveLength(1)
    expect(archived[0]).toMatchObject({
      id: 'spam-1',
      sourceFolder: 'inbox',
    })

    // The row is gone from Important
    expect(screen.queryByText('Prize Center')).not.toBeInTheDocument()
  })

  it('deletes a flagged received message to Bin from Important', () => {
    seedReceivedMessage()
    renderInbox()

    const inboxRow = screen.getByText('Hello from Bob').closest('button') as HTMLElement
    fireEvent.click(within(inboxRow).getByRole('button', { name: 'list.markImportant' }))

    goToFolder('folders.important')
    const importantRow = screen.getByText('Hello from Bob').closest('button') as HTMLElement
    fireEvent.click(within(importantRow).getByRole('button', { name: 'chat.delete' }))

    // The record is now in binnedMessages with sourceFolder "inbox"
    const binned = JSON.parse(
      localStorage.getItem('inbox-binned-messages') || '[]'
    )
    expect(binned).toHaveLength(1)
    expect(binned[0]).toMatchObject({
      id: RECEIVED_ID,
      sourceFolder: 'inbox',
    })

    expect(screen.queryByText('Hello from Bob')).not.toBeInTheDocument()
  })

  it('archives a flagged mock record from Important with sourceFolder "inbox"', () => {
    renderInbox()

    // First seeded important record is rec-2 ("Jullu Jalal")
    goToFolder('folders.important')
    const row = screen.getByText('Jullu Jalal').closest('button') as HTMLElement
    fireEvent.click(within(row).getByRole('button', { name: 'list.archive' }))

    const archived = JSON.parse(
      localStorage.getItem('inbox-archived-messages') || '[]'
    )
    expect(archived).toHaveLength(1)
    expect(archived[0]).toMatchObject({
      id: 'rec-2',
      sourceFolder: 'inbox',
    })

    // Important count drops 5 -> 4
    expect(getFolderButton('folders.important')).toHaveTextContent('4')
  })
})
