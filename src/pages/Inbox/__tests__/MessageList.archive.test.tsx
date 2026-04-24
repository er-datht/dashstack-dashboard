import { render, screen, fireEvent } from '@testing-library/react'
import MessageList from '../MessageList'
import type { EmailRecord, InboxLabel } from '../mockData'

/**
 * Tests for MessageList after the inbox-archive-message change.
 *
 * New props added by the change:
 *   - onArchive: (id: string) => void     -- called on per-row archive button click
 *   - onBulkArchive: (ids: string[]) => void -- called on toolbar archive button click
 *   - onUnarchive: (id: string) => void   -- called on restore button click in archive folder
 *
 * Behaviors under test:
 *   - Per-row Archive icon button visible on eligible folders (inbox, starred, sent, important)
 *   - Per-row Archive icon button NOT visible on non-eligible folders (draft, spam, bin, archive)
 *   - Archive button placed to the left of the Trash2 delete button
 *   - Clicking archive button calls onArchive with record id
 *   - Clicking archive button does NOT call onSelect (stopPropagation)
 *   - Toolbar Download icon replaced with Archive icon
 *   - Toolbar Archive button performs bulk archive on eligible folders
 *   - Toolbar Archive button shows "No messages selected" toast when no selection
 *   - Toolbar Archive button shows "Coming soon" toast on non-eligible folders
 *   - Restore (RotateCcw) button visible on archive folder rows
 *   - Clicking restore button in archive folder calls onUnarchive
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

const defaultProps = {
  records: mockRecords,
  labels: mockLabels,
  onSelect: vi.fn(),
  onShowToast: vi.fn(),
  starredIds: {} as Record<string, boolean>,
  onToggleStar: vi.fn(),
  activeFolder: 'inbox',
}

describe('MessageList -- archive button visibility', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('per-row archive button on eligible folders', () => {
    it.each(['inbox', 'starred', 'sent', 'important'])(
      'renders per-row archive button when activeFolder is "%s"',
      (folder) => {
        render(
          <MessageList
            {...defaultProps}
            activeFolder={folder}
            onArchive={vi.fn()}
            onDelete={vi.fn()}
            starredIds={
              folder === 'starred'
                ? { 'rec-1': true, 'rec-2': true, 'rec-3': true }
                : {}
            }
          />
        )

        const archiveButtons = screen.getAllByRole('button', { name: 'list.archive' })
        // One archive button per visible row
        expect(archiveButtons.length).toBeGreaterThan(0)
      }
    )
  })

  describe('per-row archive button on non-eligible folders', () => {
    it.each(['draft', 'spam', 'bin', 'archive'])(
      'does NOT render per-row archive button when activeFolder is "%s"',
      (folder) => {
        render(
          <MessageList
            {...defaultProps}
            activeFolder={folder}
          />
        )

        expect(screen.queryByRole('button', { name: 'list.archive' })).not.toBeInTheDocument()
      }
    )
  })

  it('places archive button to the left of the Trash2 delete button', () => {
    render(
      <MessageList
        {...defaultProps}
        activeFolder="inbox"
        onArchive={vi.fn()}
        onDelete={vi.fn()}
      />
    )

    // Get the first row's archive and delete buttons
    const archiveButtons = screen.getAllByRole('button', { name: 'list.archive' })
    const deleteButtons = screen.getAllByRole('button', { name: 'chat.delete' })

    expect(archiveButtons.length).toBeGreaterThan(0)
    expect(deleteButtons.length).toBeGreaterThan(0)

    // Archive button should appear before (to the left of) the delete button in DOM order
    // compareDocumentPosition returns a bitmask; bit 4 (DOCUMENT_POSITION_FOLLOWING) means
    // the compared node follows the reference node in the document.
    const archiveFirst = archiveButtons[0]
    const deleteFirst = deleteButtons[0]
    // eslint-disable-next-line no-bitwise
    expect(archiveFirst.compareDocumentPosition(deleteFirst) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
  })
})

describe('MessageList -- per-row archive click behavior', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('calls onArchive with the record id when archive button is clicked', () => {
    const onArchive = vi.fn()

    render(
      <MessageList
        {...defaultProps}
        activeFolder="inbox"
        onArchive={onArchive}
        onDelete={vi.fn()}
      />
    )

    const archiveButtons = screen.getAllByRole('button', { name: 'list.archive' })
    fireEvent.click(archiveButtons[0])

    expect(onArchive).toHaveBeenCalledWith('rec-1')
  })

  it('does NOT call onSelect when archive button is clicked (stopPropagation)', () => {
    const onSelect = vi.fn()
    const onArchive = vi.fn()

    render(
      <MessageList
        {...defaultProps}
        onSelect={onSelect}
        activeFolder="inbox"
        onArchive={onArchive}
        onDelete={vi.fn()}
      />
    )

    const archiveButtons = screen.getAllByRole('button', { name: 'list.archive' })
    fireEvent.click(archiveButtons[0])

    expect(onArchive).toHaveBeenCalledTimes(1)
    expect(onSelect).not.toHaveBeenCalled()
  })
})

describe('MessageList -- toolbar archive button', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders Archive icon in the toolbar (replacing Download)', () => {
    render(
      <MessageList
        {...defaultProps}
        activeFolder="inbox"
        onArchive={vi.fn()}
        onBulkArchive={vi.fn()}
        onDelete={vi.fn()}
      />
    )

    // The toolbar should have an archive button (not download)
    // SPEC: toolbar download icon replaced with archive icon
    // The toolbar archive button uses the same aria-label pattern as other toolbar buttons.
    // Based on the spec, the toolbar archive button may use "list.archive" or a chat-level label.
    // We look for the Archive icon in the toolbar action button group.
    const toolbarButtons = screen.getAllByRole('button')
    const downloadButton = toolbarButtons.find(
      (btn) => btn.querySelector('.lucide-download')
    )
    // Download icon should no longer exist in the toolbar
    expect(downloadButton).toBeUndefined()
  })

  it('bulk archives selected messages when toolbar archive is clicked on eligible folder', () => {
    const onBulkArchive = vi.fn()

    render(
      <MessageList
        {...defaultProps}
        activeFolder="inbox"
        onArchive={vi.fn()}
        onBulkArchive={onBulkArchive}
        onDelete={vi.fn()}
      />
    )

    // Select checkboxes for the first two records
    const checkboxes = screen.getAllByRole('checkbox', { name: 'list.selectMessage' })
    fireEvent.click(checkboxes[0])
    fireEvent.click(checkboxes[1])

    // Find and click the toolbar archive button
    // SPEC: The toolbar archive icon is the first button in the action button group
    const toolbarButtons = screen.getAllByRole('button')
    const archiveToolbarButton = toolbarButtons.find(
      (btn) => btn.querySelector('.lucide-archive')
    )
    expect(archiveToolbarButton).toBeDefined()
    fireEvent.click(archiveToolbarButton!)

    expect(onBulkArchive).toHaveBeenCalledWith(
      expect.arrayContaining(['rec-1', 'rec-2'])
    )
  })

  it('shows "No messages selected" toast when toolbar archive is clicked with no selection on eligible folder', () => {
    const onShowToast = vi.fn()

    render(
      <MessageList
        {...defaultProps}
        onShowToast={onShowToast}
        activeFolder="inbox"
        onArchive={vi.fn()}
        onBulkArchive={vi.fn()}
        onDelete={vi.fn()}
      />
    )

    // Click toolbar archive without selecting any checkboxes
    const toolbarButtons = screen.getAllByRole('button')
    const archiveToolbarButton = toolbarButtons.find(
      (btn) => btn.querySelector('.lucide-archive')
    )
    expect(archiveToolbarButton).toBeDefined()
    fireEvent.click(archiveToolbarButton!)

    expect(onShowToast).toHaveBeenCalledWith('list.noSelection')
  })

  it('shows Download icon and "Coming soon" toast on non-eligible folder', () => {
    const onShowToast = vi.fn()

    render(
      <MessageList
        {...defaultProps}
        onShowToast={onShowToast}
        activeFolder="draft"
      />
    )

    // On non-eligible folders, toolbar shows Download icon instead of Archive
    const toolbarButtons = screen.getAllByRole('button')
    const archiveToolbarButton = toolbarButtons.find(
      (btn) => btn.querySelector('.lucide-archive')
    )
    expect(archiveToolbarButton).toBeUndefined()

    const downloadButton = toolbarButtons.find(
      (btn) => btn.querySelector('.lucide-download')
    )
    expect(downloadButton).toBeDefined()
    fireEvent.click(downloadButton!)

    expect(onShowToast).toHaveBeenCalledWith('chat.comingSoon')
  })

  it('clears selection after bulk archive', () => {
    const onBulkArchive = vi.fn()

    render(
      <MessageList
        {...defaultProps}
        activeFolder="inbox"
        onArchive={vi.fn()}
        onBulkArchive={onBulkArchive}
        onDelete={vi.fn()}
      />
    )

    // Select a checkbox
    const checkboxes = screen.getAllByRole('checkbox', { name: 'list.selectMessage' })
    fireEvent.click(checkboxes[0])
    expect(checkboxes[0]).toBeChecked()

    // Click toolbar archive
    const toolbarButtons = screen.getAllByRole('button')
    const archiveToolbarButton = toolbarButtons.find(
      (btn) => btn.querySelector('.lucide-archive')
    )
    fireEvent.click(archiveToolbarButton!)

    // Checkbox should be unchecked after bulk archive (selection cleared)
    expect(checkboxes[0]).not.toBeChecked()
  })
})

describe('MessageList -- archive folder restore button', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders RotateCcw restore button on archive folder rows', () => {
    render(
      <MessageList
        {...defaultProps}
        activeFolder="archive"
        onUnarchive={vi.fn()}
      />
    )

    // SPEC: Archive folder rows show RotateCcw restore button
    const restoreButtons = screen.getAllByRole('button', { name: 'list.unarchive' })
    expect(restoreButtons).toHaveLength(mockRecords.length)
  })

  it('calls onUnarchive with record id when restore button is clicked', () => {
    const onUnarchive = vi.fn()

    render(
      <MessageList
        {...defaultProps}
        activeFolder="archive"
        onUnarchive={onUnarchive}
      />
    )

    const restoreButtons = screen.getAllByRole('button', { name: 'list.unarchive' })
    fireEvent.click(restoreButtons[0])

    expect(onUnarchive).toHaveBeenCalledWith('rec-1')
  })

  it('does NOT call onSelect when restore button is clicked (stopPropagation)', () => {
    const onSelect = vi.fn()
    const onUnarchive = vi.fn()

    render(
      <MessageList
        {...defaultProps}
        onSelect={onSelect}
        activeFolder="archive"
        onUnarchive={onUnarchive}
      />
    )

    const restoreButtons = screen.getAllByRole('button', { name: 'list.unarchive' })
    fireEvent.click(restoreButtons[0])

    expect(onUnarchive).toHaveBeenCalledTimes(1)
    expect(onSelect).not.toHaveBeenCalled()
  })

  it('does NOT render Trash2 delete button on archive folder rows', () => {
    render(
      <MessageList
        {...defaultProps}
        activeFolder="archive"
        onUnarchive={vi.fn()}
      />
    )

    // No delete buttons should be present in archive folder
    expect(screen.queryByRole('button', { name: 'chat.delete' })).not.toBeInTheDocument()
  })

  it('does NOT render per-row archive button on archive folder rows', () => {
    render(
      <MessageList
        {...defaultProps}
        activeFolder="archive"
        onUnarchive={vi.fn()}
      />
    )

    expect(screen.queryByRole('button', { name: 'list.archive' })).not.toBeInTheDocument()
  })
})
