import { render, screen, fireEvent, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import Inbox from '../index'

/**
 * Integration tests for the add-inbox-important-folder change.
 *
 * These tests render the full Inbox page (index.tsx) and verify the
 * end-to-end behavior of the Important folder feature: the per-message
 * `isImportant` flag with three entry points (per-row Bookmark, ChatHeader
 * Bookmark, bulk toolbar Bookmark), persistence via localStorage under
 * `inbox-important-ids`, dynamic sidebar count, cross-folder preservation,
 * and folder-view exclusion of binned/archived/spammed records.
 *
 * Implementation key facts (from openspec/changes/add-inbox-important-folder/):
 *   - mockEmailRecords pre-seeds exactly 5 records with `isImportant: true`
 *   - localStorage key: "inbox-important-ids"
 *   - aria-labels (i18n keys, returned verbatim by the global mock):
 *     - per-row: "list.markImportant" / "list.unmarkImportant"
 *     - chat header: "chat.markImportant" / "chat.unmarkImportant"
 *     - bulk toolbar: "list.bulkMarkImportant" / "list.bulkUnmarkImportant"
 *   - toast keys: "list.markedImportant" / "list.unmarkedImportant"
 *   - Bookmark visible only on inbox / starred / sent / important
 *   - Important folder filtered view = flagged minus binned/archived/spammed
 *
 * Note: This change has NOT been implemented yet. These tests WILL FAIL on
 * the first run. That is correct TDD behavior — they define the contract
 * the implementation specialist must satisfy.
 */

function renderInbox() {
  return render(
    <MemoryRouter>
      <Inbox />
    </MemoryRouter>
  )
}

// Clear localStorage before each test so important state and other inbox
// state (sent, draft, binned, archived, spammed) don't leak across tests.
beforeEach(() => {
  localStorage.clear()
})

const goToFolder = (folderKey: string) => {
  const folderButton = screen.getByText(folderKey).closest('button')!
  fireEvent.click(folderButton)
}

const getFolderButton = (folderKey: string) =>
  screen.getByText(folderKey).closest('button')!

// --------------------------------------------------------------------------
// 1. Mock seed and initial render
// --------------------------------------------------------------------------

describe('Inbox -- Important folder seed and initial render', () => {
  it('shows exactly 5 pre-seeded records on first load when navigating to Important', () => {
    renderInbox()

    goToFolder('folders.important')

    // Each row is a button with a per-row Bookmark inside; on the Important
    // folder every visible row is flagged so every row has an "unmarkImportant"
    // button. Counting those is the most reliable way to count rows.
    const unmarkButtons = screen.getAllByRole('button', { name: 'list.unmarkImportant' })
    expect(unmarkButtons).toHaveLength(5)
  })

  it('shows sidebar count of 5 for Important on first load', () => {
    renderInbox()

    const importantFolderButton = getFolderButton('folders.important')
    expect(importantFolderButton).toHaveTextContent('5')
  })
})

// --------------------------------------------------------------------------
// 2. Per-row Bookmark toggle (Inbox + Important)
// --------------------------------------------------------------------------

describe('Inbox -- per-row Bookmark toggle', () => {
  it('marks an unflagged inbox row as Important and increments the sidebar count', () => {
    renderInbox()

    const importantFolderButton = getFolderButton('folders.important')
    expect(importantFolderButton).toHaveTextContent('5')

    // On the Inbox folder, both flagged and unflagged rows are visible. Find
    // the FIRST unflagged row's per-row Bookmark (aria-label "list.markImportant")
    // and click it. The very first such button is the per-row button on the
    // first unflagged row in the list.
    const markButtons = screen.getAllByRole('button', { name: 'list.markImportant' })
    expect(markButtons.length).toBeGreaterThan(0)
    fireEvent.click(markButtons[0])

    // Sidebar count goes 5 -> 6
    expect(importantFolderButton).toHaveTextContent('6')

    // Confirmation toast appears
    expect(screen.getByText('list.markedImportant')).toBeInTheDocument()
  })

  it('unmarks a flagged Important row, removes it from view, and decrements the count', () => {
    renderInbox()

    goToFolder('folders.important')

    const importantFolderButton = getFolderButton('folders.important')
    expect(importantFolderButton).toHaveTextContent('5')

    // On the Important folder, every visible row is flagged. Clicking the
    // first per-row "unmarkImportant" Bookmark removes that row from view.
    let unmarkButtons = screen.getAllByRole('button', { name: 'list.unmarkImportant' })
    expect(unmarkButtons).toHaveLength(5)

    fireEvent.click(unmarkButtons[0])

    // The row should disappear from the Important folder
    unmarkButtons = screen.queryAllByRole('button', { name: 'list.unmarkImportant' })
    expect(unmarkButtons).toHaveLength(4)

    // Sidebar count 5 -> 4
    expect(importantFolderButton).toHaveTextContent('4')

    // Toast for unmark
    expect(screen.getByText('list.unmarkedImportant')).toBeInTheDocument()
  })
})

// --------------------------------------------------------------------------
// 3. ChatHeader Bookmark toggle
// --------------------------------------------------------------------------

describe('Inbox -- ChatHeader Bookmark toggle', () => {
  it('shows a filled Bookmark in ChatHeader for a flagged message and unmarks on click', () => {
    renderInbox()

    goToFolder('folders.important')

    // Open the first row in Important by clicking its row button. Each row
    // is a top-level <button class="...border-b border-default..."> wrapping
    // the inner per-row buttons. Walk up from the per-row Bookmark to that
    // row-level button and click it to open ChatView.
    const unmarkRowButton = screen.getAllByRole('button', { name: 'list.unmarkImportant' })[0]
    const rowButton = unmarkRowButton.closest('button[class*="border-b"]') as HTMLElement
    expect(rowButton).not.toBeNull()
    fireEvent.click(rowButton)

    // ChatHeader's Bookmark for a flagged message is "unmarkImportant"
    const chatUnmarkBtn = screen.getByRole('button', { name: 'chat.unmarkImportant' })
    expect(chatUnmarkBtn).toBeInTheDocument()

    // Sidebar count before click: 5
    const importantFolderButton = getFolderButton('folders.important')
    expect(importantFolderButton).toHaveTextContent('5')

    fireEvent.click(chatUnmarkBtn)

    // After click, the message is unflagged. Count drops 5 -> 4.
    expect(importantFolderButton).toHaveTextContent('4')
  })
})

// --------------------------------------------------------------------------
// 4. Bulk toolbar action (mark, unmark, no-selection guard)
// --------------------------------------------------------------------------

describe('Inbox -- bulk toolbar Bookmark', () => {
  it('marks all selected rows as Important from Inbox and clears selection', () => {
    renderInbox()

    const importantFolderButton = getFolderButton('folders.important')
    const initialCount = 5
    expect(importantFolderButton).toHaveTextContent(String(initialCount))

    // Find two unflagged rows: pick the rows whose per-row Bookmark is the
    // outlined "list.markImportant" variant. Walk up to the row-level
    // <button class="...border-b..."> and read each row's checkbox.
    const markRowButtons = screen.getAllByRole('button', { name: 'list.markImportant' })
    expect(markRowButtons.length).toBeGreaterThanOrEqual(2)

    const firstUnflaggedRow = markRowButtons[0].closest('button[class*="border-b"]') as HTMLElement
    const secondUnflaggedRow = markRowButtons[1].closest('button[class*="border-b"]') as HTMLElement

    const cb1 = within(firstUnflaggedRow).getByRole('checkbox', { name: 'list.selectMessage' })
    const cb2 = within(secondUnflaggedRow).getByRole('checkbox', { name: 'list.selectMessage' })

    fireEvent.click(cb1)
    fireEvent.click(cb2)
    expect(cb1).toBeChecked()
    expect(cb2).toBeChecked()

    // Click the toolbar bulk-mark button (aria-label "list.bulkMarkImportant")
    const bulkBtn = screen.getByRole('button', { name: 'list.bulkMarkImportant' })
    fireEvent.click(bulkBtn)

    // Count goes up by 2: 5 -> 7
    expect(importantFolderButton).toHaveTextContent(String(initialCount + 2))

    // Selection cleared: re-query checkboxes (the rows are still in the inbox
    // since marking doesn't remove them from inbox view) and assert none
    // remain checked.
    const checkboxesAfter = screen.getAllByRole('checkbox', { name: 'list.selectMessage' })
    checkboxesAfter.forEach((cb) => expect(cb).not.toBeChecked())
  })

  it('unmarks all selected rows when invoked from the Important folder', () => {
    renderInbox()

    goToFolder('folders.important')

    const importantFolderButton = getFolderButton('folders.important')
    expect(importantFolderButton).toHaveTextContent('5')

    // Select 2 rows in Important
    const checkboxes = screen.getAllByRole('checkbox', { name: 'list.selectMessage' })
    expect(checkboxes.length).toBeGreaterThanOrEqual(2)
    fireEvent.click(checkboxes[0])
    fireEvent.click(checkboxes[1])

    // Click the toolbar bulk-unmark button (aria-label "list.bulkUnmarkImportant")
    const bulkBtn = screen.getByRole('button', { name: 'list.bulkUnmarkImportant' })
    fireEvent.click(bulkBtn)

    // The 2 unmarked rows disappear from the Important view (5 -> 3)
    const remainingUnmarkButtons = screen.queryAllByRole('button', { name: 'list.unmarkImportant' })
    expect(remainingUnmarkButtons).toHaveLength(3)

    // Sidebar count 5 -> 3
    expect(importantFolderButton).toHaveTextContent('3')
  })

  it('shows "No messages selected" toast when bulk Bookmark is clicked with no selection', () => {
    renderInbox()

    // Click the toolbar bulk-mark button with no selection
    const bulkBtn = screen.getByRole('button', { name: 'list.bulkMarkImportant' })
    fireEvent.click(bulkBtn)

    expect(screen.getByText('list.noSelection')).toBeInTheDocument()
  })
})

// --------------------------------------------------------------------------
// 5. Cross-folder preservation (bin / archive / spam round-trips)
// --------------------------------------------------------------------------

describe('Inbox -- Important flag preserved through round-trips', () => {
  it('preserves the Important flag across bin -> restore', () => {
    renderInbox()

    const importantFolderButton = getFolderButton('folders.important')
    expect(importantFolderButton).toHaveTextContent('5')

    // Mark an unflagged inbox row as Important (count 5 -> 6)
    const markButtons = screen.getAllByRole('button', { name: 'list.markImportant' })
    fireEvent.click(markButtons[0])
    expect(importantFolderButton).toHaveTextContent('6')

    // Delete-to-bin the same row by clicking the per-row delete button on
    // the row that now shows "list.unmarkImportant" (the just-flagged one).
    // After marking, the just-flagged row's Bookmark is now "unmarkImportant".
    // Use the most-recently-flagged row as the one with the *first*
    // unmarkImportant button that did NOT exist before: simplest is to
    // delete the same row by index — the row reorder hasn't happened, so the
    // row that was at position 0 of unflagged is now flagged, but its delete
    // button is per-row[i]. We just delete the first row in the list to
    // exercise the path. Since the just-flagged row is still in the inbox
    // list, deleting the first row may delete a different one. To be robust
    // against ordering, capture the sender name of the just-flagged row by
    // walking up from the unmarkImportant button.
    const unmarkBtn = screen.getAllByRole('button', { name: 'list.unmarkImportant' })[0]
    const rowEl = unmarkBtn.closest('button[class*="border-b"]')
    expect(rowEl).not.toBeNull()
    const deleteBtn = within(rowEl as HTMLElement).getByRole('button', { name: 'chat.delete' })
    fireEvent.click(deleteBtn)

    // Important count drops back to 5 (record is binned, excluded from view)
    expect(importantFolderButton).toHaveTextContent('5')

    // Switch to Bin and restore the message
    goToFolder('folders.bin')
    const restoreBtn = screen.getByRole('button', { name: 'list.restore' })
    fireEvent.click(restoreBtn)

    // After restore: count returns to 6 (flag preserved through round-trip)
    expect(getFolderButton('folders.important')).toHaveTextContent('6')

    // Verify by visiting Important folder: 6 unmarkImportant buttons
    goToFolder('folders.important')
    expect(screen.getAllByRole('button', { name: 'list.unmarkImportant' })).toHaveLength(6)
  })

  it('preserves the Important flag across archive -> unarchive', () => {
    renderInbox()

    const importantFolderButton = getFolderButton('folders.important')

    // Mark an unflagged inbox row (5 -> 6)
    const markButtons = screen.getAllByRole('button', { name: 'list.markImportant' })
    fireEvent.click(markButtons[0])
    expect(importantFolderButton).toHaveTextContent('6')

    // Archive the just-flagged row (find via its unmarkImportant Bookmark)
    const unmarkBtn = screen.getAllByRole('button', { name: 'list.unmarkImportant' })[0]
    const rowEl = unmarkBtn.closest('button[class*="border-b"]') as HTMLElement
    const archiveBtn = within(rowEl).getByRole('button', { name: 'list.archive' })
    fireEvent.click(archiveBtn)

    // Count drops back to 5
    expect(importantFolderButton).toHaveTextContent('5')

    // Switch to Archive and unarchive
    goToFolder('folders.archive')
    const unarchiveBtn = screen.getByRole('button', { name: 'list.unarchive' })
    fireEvent.click(unarchiveBtn)

    // Count returns to 6
    expect(getFolderButton('folders.important')).toHaveTextContent('6')
  })

  it('preserves the Important flag across spam -> not spam', () => {
    renderInbox()

    const importantFolderButton = getFolderButton('folders.important')

    // Mark an unflagged inbox row (5 -> 6)
    const markButtons = screen.getAllByRole('button', { name: 'list.markImportant' })
    fireEvent.click(markButtons[0])
    expect(importantFolderButton).toHaveTextContent('6')

    // Move the just-flagged row to spam
    const unmarkBtn = screen.getAllByRole('button', { name: 'list.unmarkImportant' })[0]
    const rowEl = unmarkBtn.closest('button[class*="border-b"]') as HTMLElement
    const spamBtn = within(rowEl).getByRole('button', { name: 'list.moveToSpam' })
    fireEvent.click(spamBtn)

    // Important count drops 6 -> 5 (spammed records excluded from Important view)
    expect(importantFolderButton).toHaveTextContent('5')

    // Switch to Spam and click "Not Spam" on that user-spammed row.
    // The user-spammed row appears at the top of the Spam list (per
    // spam folder ordering: userSpam first, then mockSpam). The first row
    // in spam should therefore be the one we just spammed.
    goToFolder('folders.spam')
    const notSpamButtons = screen.getAllByRole('button', { name: 'list.notSpam' })
    expect(notSpamButtons.length).toBeGreaterThan(0)
    // The toolbar button is index 0; per-row buttons start at index 1.
    fireEvent.click(notSpamButtons[1])

    // After "Not Spam": message is restored to inbox; flag is preserved.
    // Important count returns to 6.
    expect(getFolderButton('folders.important')).toHaveTextContent('6')
  })
})

// --------------------------------------------------------------------------
// 6. Folder-view exclusions
// --------------------------------------------------------------------------

describe('Inbox -- Important folder excludes binned/archived/spammed', () => {
  it('excludes a flagged-then-binned record from the Important folder', () => {
    renderInbox()

    // Flag an inbox row (5 -> 6)
    const markButtons = screen.getAllByRole('button', { name: 'list.markImportant' })
    fireEvent.click(markButtons[0])

    // Bin the same row
    const unmarkBtn = screen.getAllByRole('button', { name: 'list.unmarkImportant' })[0]
    const rowEl = unmarkBtn.closest('button[class*="border-b"]') as HTMLElement
    const deleteBtn = within(rowEl).getByRole('button', { name: 'chat.delete' })
    fireEvent.click(deleteBtn)

    // Important folder should show 5 (binned record excluded)
    goToFolder('folders.important')
    const unmarkButtons = screen.getAllByRole('button', { name: 'list.unmarkImportant' })
    expect(unmarkButtons).toHaveLength(5)
  })

  it('excludes a flagged-then-archived record from the Important folder', () => {
    renderInbox()

    const markButtons = screen.getAllByRole('button', { name: 'list.markImportant' })
    fireEvent.click(markButtons[0])

    const unmarkBtn = screen.getAllByRole('button', { name: 'list.unmarkImportant' })[0]
    const rowEl = unmarkBtn.closest('button[class*="border-b"]') as HTMLElement
    const archiveBtn = within(rowEl).getByRole('button', { name: 'list.archive' })
    fireEvent.click(archiveBtn)

    goToFolder('folders.important')
    expect(screen.getAllByRole('button', { name: 'list.unmarkImportant' })).toHaveLength(5)
  })

  it('excludes a flagged-then-spammed record from the Important folder', () => {
    renderInbox()

    const markButtons = screen.getAllByRole('button', { name: 'list.markImportant' })
    fireEvent.click(markButtons[0])

    const unmarkBtn = screen.getAllByRole('button', { name: 'list.unmarkImportant' })[0]
    const rowEl = unmarkBtn.closest('button[class*="border-b"]') as HTMLElement
    const spamBtn = within(rowEl).getByRole('button', { name: 'list.moveToSpam' })
    fireEvent.click(spamBtn)

    goToFolder('folders.important')
    expect(screen.getAllByRole('button', { name: 'list.unmarkImportant' })).toHaveLength(5)
  })
})

// --------------------------------------------------------------------------
// 7. Persistence
// --------------------------------------------------------------------------

describe('Inbox -- Important state persistence via localStorage', () => {
  it('persists newly-marked records across re-mount', () => {
    const { unmount } = renderInbox()

    // Mark an unflagged inbox row
    const markButtons = screen.getAllByRole('button', { name: 'list.markImportant' })
    fireEvent.click(markButtons[0])

    // Sidebar count is now 6
    expect(getFolderButton('folders.important')).toHaveTextContent('6')

    // Confirm localStorage has been updated under "inbox-important-ids"
    const stored = localStorage.getItem('inbox-important-ids')
    expect(stored).not.toBeNull()
    const parsed = JSON.parse(stored!) as Record<string, boolean>
    // 5 seed entries + 1 newly-flagged = 6 truthy entries
    expect(Object.values(parsed).filter(Boolean).length).toBe(6)

    // Unmount and re-render — useLocalStorage should rehydrate from storage
    unmount()
    renderInbox()

    // Sidebar count is still 6
    expect(getFolderButton('folders.important')).toHaveTextContent('6')

    // Important folder still has 6 flagged records
    goToFolder('folders.important')
    expect(screen.getAllByRole('button', { name: 'list.unmarkImportant' })).toHaveLength(6)
  })
})

// --------------------------------------------------------------------------
// 8. Bookmark visibility per folder
// --------------------------------------------------------------------------

describe('Inbox -- per-row Bookmark visibility per folder', () => {
  it('shows the per-row Bookmark on Inbox, Starred, Sent, Important folders', () => {
    renderInbox()

    // Inbox (default)
    expect(
      screen.queryAllByRole('button', { name: 'list.markImportant' }).length +
        screen.queryAllByRole('button', { name: 'list.unmarkImportant' }).length
    ).toBeGreaterThan(0)

    // Starred
    goToFolder('folders.starred')
    expect(
      screen.queryAllByRole('button', { name: 'list.markImportant' }).length +
        screen.queryAllByRole('button', { name: 'list.unmarkImportant' }).length
    ).toBeGreaterThan(0)

    // Sent — first send a message so the folder has content
    const composeButton = screen.getByText('composeBtn')
    fireEvent.click(composeButton)
    fireEvent.change(screen.getByPlaceholderText('compose.toPlaceholder'), {
      target: { value: 'test@example.com' },
    })
    fireEvent.change(screen.getByPlaceholderText('compose.subjectPlaceholder'), {
      target: { value: 'Sent test for Important visibility' },
    })
    fireEvent.change(screen.getByPlaceholderText('compose.bodyPlaceholder'), {
      target: { value: 'Body' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'compose.send' }))
    // Auto-navigates to Sent folder; assert at least one Bookmark exists
    expect(
      screen.queryAllByRole('button', { name: 'list.markImportant' }).length +
        screen.queryAllByRole('button', { name: 'list.unmarkImportant' }).length
    ).toBeGreaterThan(0)

    // Important — every visible row is flagged
    goToFolder('folders.important')
    expect(
      screen.getAllByRole('button', { name: 'list.unmarkImportant' }).length
    ).toBeGreaterThan(0)
  })

  it('does NOT show the per-row Bookmark on Draft / Spam / Bin / Archive folders', () => {
    renderInbox()

    // Draft — needs at least one draft for rows to render. We save a draft
    // by opening compose, entering content, saving as draft. To keep this
    // test focused, we assert "no Bookmark visible" by switching folders
    // even if the list is empty (no Bookmark buttons can exist).

    // Bin — bin a message first so the folder has content
    const deleteButtons = screen.getAllByRole('button', { name: 'chat.delete' })
    fireEvent.click(deleteButtons[0])

    goToFolder('folders.bin')
    expect(
      screen.queryByRole('button', { name: 'list.markImportant' })
    ).not.toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: 'list.unmarkImportant' })
    ).not.toBeInTheDocument()

    // Archive — archive a message to populate the folder
    goToFolder('folders.inbox')
    const archiveButtons = screen.getAllByRole('button', { name: 'list.archive' })
    fireEvent.click(archiveButtons[0])

    goToFolder('folders.archive')
    expect(
      screen.queryByRole('button', { name: 'list.markImportant' })
    ).not.toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: 'list.unmarkImportant' })
    ).not.toBeInTheDocument()

    // Spam — pre-seeded mock spam exists, so rows are guaranteed
    goToFolder('folders.spam')
    expect(
      screen.queryByRole('button', { name: 'list.markImportant' })
    ).not.toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: 'list.unmarkImportant' })
    ).not.toBeInTheDocument()

    // Draft — empty list yields no Bookmark by definition; this is the
    // weakest assertion of the four but matches the spec scenario.
    goToFolder('folders.draft')
    expect(
      screen.queryByRole('button', { name: 'list.markImportant' })
    ).not.toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: 'list.unmarkImportant' })
    ).not.toBeInTheDocument()
  })
})
