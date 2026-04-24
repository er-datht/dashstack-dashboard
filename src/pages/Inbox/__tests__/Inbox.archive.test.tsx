import { render, screen, fireEvent } from '@testing-library/react'
import Inbox from '../index'

/**
 * Integration tests for the inbox-archive-message change.
 *
 * These tests render the full Inbox page (index.tsx) and verify the
 * end-to-end behavior of archiving, unarchiving, archive folder display,
 * sidebar count updates, and exclusion of archived messages from source folders.
 *
 * The Inbox page uses useLocalStorage for archivedMessages. In the test
 * environment localStorage starts empty, so the archive folder begins
 * with count 0 and no messages.
 *
 * Note: The mock data module is NOT mocked here -- we use the real
 * mockEmailRecords and inboxFolders.
 */

// Clear localStorage before each test so archive state doesn't leak
beforeEach(() => {
  localStorage.clear()
})

describe('Inbox -- archive folder sidebar', () => {
  it('renders the Archive folder tab in the sidebar', () => {
    render(<Inbox />)

    // The Archive folder should appear in the sidebar
    expect(screen.getByText('folders.archive')).toBeInTheDocument()
  })

  it('displays archive count of 0 when no messages are archived', () => {
    render(<Inbox />)

    const archiveFolderButton = screen.getByText('folders.archive').closest('button')!
    expect(archiveFolderButton).toBeInTheDocument()
    expect(archiveFolderButton).toHaveTextContent('0')
  })
})

describe('Inbox -- archive a message from inbox', () => {
  it('removes the archived message from the inbox list', () => {
    render(<Inbox />)

    // Note the first sender name visible in the inbox list
    const archiveButtons = screen.getAllByRole('button', { name: 'list.archive' })
    expect(archiveButtons.length).toBeGreaterThan(0)

    // Get the name of the sender in the first row before archiving
    // The first record in mockEmailRecords is "Ethan Rodriguez"
    expect(screen.getByText('Ethan Rodriguez')).toBeInTheDocument()

    // Archive the first message
    fireEvent.click(archiveButtons[0])

    // The message should no longer appear in the inbox list
    expect(screen.queryByText('Ethan Rodriguez')).not.toBeInTheDocument()
  })

  it('increments the archive folder count by 1 after archiving a message', () => {
    render(<Inbox />)

    const archiveFolderButton = screen.getByText('folders.archive').closest('button')!
    expect(archiveFolderButton).toHaveTextContent('0')

    // Archive the first message
    const archiveButtons = screen.getAllByRole('button', { name: 'list.archive' })
    fireEvent.click(archiveButtons[0])

    // Archive count should now be 1
    expect(archiveFolderButton).toHaveTextContent('1')
  })

  it('shows a "Message archived" toast after archiving', () => {
    render(<Inbox />)

    const archiveButtons = screen.getAllByRole('button', { name: 'list.archive' })
    fireEvent.click(archiveButtons[0])

    // Toast with the archived message translation key
    expect(screen.getByText('list.archived')).toBeInTheDocument()
  })
})

describe('Inbox -- archive folder displays archived messages', () => {
  it('shows archived messages when switching to the Archive folder', () => {
    render(<Inbox />)

    // Archive a message from inbox
    const archiveButtons = screen.getAllByRole('button', { name: 'list.archive' })
    fireEvent.click(archiveButtons[0])

    // Switch to Archive folder
    const archiveFolderButton = screen.getByText('folders.archive').closest('button')!
    fireEvent.click(archiveFolderButton)

    // The archived message should be visible in the archive folder
    expect(screen.getByText('Ethan Rodriguez')).toBeInTheDocument()
  })

  it('shows empty list when archive folder has no messages', () => {
    render(<Inbox />)

    // Switch to Archive folder without archiving anything
    const archiveFolderButton = screen.getByText('folders.archive').closest('button')!
    fireEvent.click(archiveFolderButton)

    // No email records should be visible (no sender names from mockEmailRecords)
    expect(screen.queryByText('Ethan Rodriguez')).not.toBeInTheDocument()
    expect(screen.queryByText('Jullu Jalal')).not.toBeInTheDocument()
  })
})

describe('Inbox -- unarchive (restore) from archive folder', () => {
  it('restores an archived message back to its source folder', () => {
    render(<Inbox />)

    // Archive the first inbox message
    const archiveButtons = screen.getAllByRole('button', { name: 'list.archive' })
    fireEvent.click(archiveButtons[0])

    // Confirm it's gone from inbox
    expect(screen.queryByText('Ethan Rodriguez')).not.toBeInTheDocument()

    // Switch to Archive folder
    const archiveFolderButton = screen.getByText('folders.archive').closest('button')!
    fireEvent.click(archiveFolderButton)

    // The archived message should be visible
    expect(screen.getByText('Ethan Rodriguez')).toBeInTheDocument()

    // Click the restore (unarchive) button
    const restoreButtons = screen.getAllByRole('button', { name: 'list.unarchive' })
    expect(restoreButtons.length).toBeGreaterThan(0)
    fireEvent.click(restoreButtons[0])

    // The message should disappear from archive folder
    expect(screen.queryByText('Ethan Rodriguez')).not.toBeInTheDocument()

    // Switch back to inbox
    const inboxFolderButton = screen.getByText('folders.inbox').closest('button')!
    fireEvent.click(inboxFolderButton)

    // The message should be back in the inbox
    expect(screen.getByText('Ethan Rodriguez')).toBeInTheDocument()
  })

  it('decrements the archive count after unarchiving', () => {
    render(<Inbox />)

    // Archive a message
    const archiveButtons = screen.getAllByRole('button', { name: 'list.archive' })
    fireEvent.click(archiveButtons[0])

    const archiveFolderButton = screen.getByText('folders.archive').closest('button')!
    expect(archiveFolderButton).toHaveTextContent('1')

    // Switch to archive folder and restore
    fireEvent.click(archiveFolderButton)
    const restoreButtons = screen.getAllByRole('button', { name: 'list.unarchive' })
    fireEvent.click(restoreButtons[0])

    // Archive count should be back to 0
    expect(archiveFolderButton).toHaveTextContent('0')
  })

  it('shows a "Message unarchived" toast after restoring', () => {
    render(<Inbox />)

    // Archive and then restore
    const archiveButtons = screen.getAllByRole('button', { name: 'list.archive' })
    fireEvent.click(archiveButtons[0])

    const archiveFolderButton = screen.getByText('folders.archive').closest('button')!
    fireEvent.click(archiveFolderButton)

    const restoreButtons = screen.getAllByRole('button', { name: 'list.unarchive' })
    fireEvent.click(restoreButtons[0])

    expect(screen.getByText('list.unarchived')).toBeInTheDocument()
  })
})

describe('Inbox -- archived messages excluded from starred folder', () => {
  it('excludes archived starred messages from the Starred folder view', () => {
    render(<Inbox />)

    // Find a starred message by looking for filled star buttons
    const starButtons = screen.getAllByRole('button', { name: 'list.star' })
    const starredBtn = starButtons.find(
      (btn) => btn.className.includes('text-warning')
    )
    expect(starredBtn).toBeDefined()

    // Switch to starred folder to verify the message appears there
    const starredFolderButton = screen.getByText('folders.starred').closest('button')!
    fireEvent.click(starredFolderButton)
    const starredCountBefore = screen.getAllByRole('button', { name: 'list.star' }).length
    expect(starredCountBefore).toBeGreaterThan(0)

    // Switch back to inbox
    const inboxFolderButton = screen.getByText('folders.inbox').closest('button')!
    fireEvent.click(inboxFolderButton)

    // Archive the first starred message
    // SPEC: archive buttons appear on each row in eligible folders
    // Find the archive button in the same row as a starred message
    const archiveButtons = screen.getAllByRole('button', { name: 'list.archive' })
    // Archive the first message (Ethan Rodriguez, who is starred in mock data)
    fireEvent.click(archiveButtons[0])

    // Switch to starred folder
    fireEvent.click(starredFolderButton)

    // The starred folder should have one fewer record
    const starredCountAfter = screen.getAllByRole('button', { name: 'list.star' }).length
    expect(starredCountAfter).toBe(starredCountBefore - 1)
  })
})

describe('Inbox -- bulk archive from toolbar', () => {
  it('archives multiple selected messages via toolbar archive button', () => {
    render(<Inbox />)

    const archiveFolderButton = screen.getByText('folders.archive').closest('button')!
    expect(archiveFolderButton).toHaveTextContent('0')

    // Select the first two message checkboxes
    const checkboxes = screen.getAllByRole('checkbox', { name: 'list.selectMessage' })
    fireEvent.click(checkboxes[0])
    fireEvent.click(checkboxes[1])

    // Click the toolbar archive button (identified by aria-label)
    const archiveToolbarButton = screen.getByRole('button', { name: 'chat.archive' })
    fireEvent.click(archiveToolbarButton)

    // Archive count should be 2
    expect(archiveFolderButton).toHaveTextContent('2')
  })
})

describe('Inbox -- archive from chat header', () => {
  it('archives the message and returns to list when archive is clicked in ChatHeader', () => {
    render(<Inbox />)

    // Verify we start on MessageList (search input visible)
    expect(screen.getByPlaceholderText('list.search')).toBeInTheDocument()

    // Click the first message row to open ChatView
    // The first sender is "Ethan Rodriguez" -- click the row
    const senderName = screen.getByText('Ethan Rodriguez')
    const row = senderName.closest('button')!
    fireEvent.click(row)

    // Now in ChatView -- search input should be gone
    expect(screen.queryByPlaceholderText('list.search')).not.toBeInTheDocument()

    // Click the archive button in ChatHeader (identified by aria-label)
    const archiveButton = screen.getByRole('button', { name: 'list.archive' })
    fireEvent.click(archiveButton)

    // Should return to MessageList (search input visible again)
    expect(screen.getByPlaceholderText('list.search')).toBeInTheDocument()

    // The archived message should no longer be in the inbox list
    expect(screen.queryByText('Ethan Rodriguez')).not.toBeInTheDocument()

    // Archive count should be 1
    const archiveFolderButton = screen.getByText('folders.archive').closest('button')!
    expect(archiveFolderButton).toHaveTextContent('1')
  })
})

describe('Inbox -- restore sent message from archive', () => {
  it('restores a sent message back to the sent folder', () => {
    render(<Inbox />)

    // Open compose, send a message to create a sent record
    const composeButton = screen.getByText('composeBtn')
    fireEvent.click(composeButton)

    const toInput = screen.getByPlaceholderText('compose.toPlaceholder')
    const subjectInput = screen.getByPlaceholderText('compose.subjectPlaceholder')
    const bodyInput = screen.getByPlaceholderText('compose.bodyPlaceholder')

    fireEvent.change(toInput, { target: { value: 'test@example.com' } })
    fireEvent.change(subjectInput, { target: { value: 'Test sent message' } })
    fireEvent.change(bodyInput, { target: { value: 'Body text' } })

    const sendButton = screen.getByRole('button', { name: 'compose.send' })
    fireEvent.click(sendButton)

    // Should auto-navigate to Sent folder — verify the sent message is there
    expect(screen.getByText('Test sent message')).toBeInTheDocument()

    // Archive the sent message
    const archiveButtons = screen.getAllByRole('button', { name: 'list.archive' })
    fireEvent.click(archiveButtons[0])

    // Sent message should be gone from sent folder
    expect(screen.queryByText('Test sent message')).not.toBeInTheDocument()

    // Go to archive folder, restore it
    const archiveFolderButton = screen.getByText('folders.archive').closest('button')!
    fireEvent.click(archiveFolderButton)
    expect(screen.getByText('Test sent message')).toBeInTheDocument()

    const restoreButtons = screen.getAllByRole('button', { name: 'list.unarchive' })
    fireEvent.click(restoreButtons[0])

    // Switch back to Sent folder — message should be back
    const sentFolderButton = screen.getByText('folders.sent').closest('button')!
    fireEvent.click(sentFolderButton)
    expect(screen.getByText('Test sent message')).toBeInTheDocument()
  })
})

describe('Inbox -- starred state preserved through archive/unarchive', () => {
  it('retains star status after archive and unarchive round-trip', () => {
    render(<Inbox />)

    // Ethan Rodriguez (rec-1) is starred in mock data
    // Verify star is filled (text-warning class)
    const starButtons = screen.getAllByRole('button', { name: 'list.star' })
    const firstStar = starButtons[0]
    expect(firstStar.className).toContain('text-warning')

    // Archive the first message
    const archiveButtons = screen.getAllByRole('button', { name: 'list.archive' })
    fireEvent.click(archiveButtons[0])

    // Go to archive folder
    const archiveFolderButton = screen.getByText('folders.archive').closest('button')!
    fireEvent.click(archiveFolderButton)

    // Restore the message
    const restoreButtons = screen.getAllByRole('button', { name: 'list.unarchive' })
    fireEvent.click(restoreButtons[0])

    // Go back to inbox
    const inboxFolderButton = screen.getByText('folders.inbox').closest('button')!
    fireEvent.click(inboxFolderButton)

    // Ethan Rodriguez should be back and still starred
    expect(screen.getByText('Ethan Rodriguez')).toBeInTheDocument()
    const starButtonsAfter = screen.getAllByRole('button', { name: 'list.star' })
    const firstStarAfter = starButtonsAfter[0]
    expect(firstStarAfter.className).toContain('text-warning')
  })
})

describe('Inbox -- bulk unarchive from toolbar', () => {
  it('unarchives multiple selected messages via toolbar unarchive button', () => {
    render(<Inbox />)

    // Archive first two messages from inbox
    const archiveButtons = screen.getAllByRole('button', { name: 'list.archive' })
    fireEvent.click(archiveButtons[0])

    // Re-query after first archive (DOM has changed)
    const archiveButtons2 = screen.getAllByRole('button', { name: 'list.archive' })
    fireEvent.click(archiveButtons2[0])

    const archiveFolderButton = screen.getByText('folders.archive').closest('button')!
    expect(archiveFolderButton).toHaveTextContent('2')

    // Switch to Archive folder
    fireEvent.click(archiveFolderButton)

    // Select both archived messages
    const checkboxes = screen.getAllByRole('checkbox', { name: 'list.selectMessage' })
    fireEvent.click(checkboxes[0])
    fireEvent.click(checkboxes[1])

    // Click toolbar unarchive button
    const unarchiveToolbarButton = screen.getByRole('button', { name: 'chat.unarchive' })
    fireEvent.click(unarchiveToolbarButton)

    // Archive count should be 0
    expect(archiveFolderButton).toHaveTextContent('0')
  })

  it('shows "No messages selected" toast when toolbar unarchive is clicked with no selection', () => {
    render(<Inbox />)

    // Archive a message first
    const archiveButtons = screen.getAllByRole('button', { name: 'list.archive' })
    fireEvent.click(archiveButtons[0])

    // Switch to Archive folder
    const archiveFolderButton = screen.getByText('folders.archive').closest('button')!
    fireEvent.click(archiveFolderButton)

    // Click toolbar unarchive without selecting any checkboxes
    const unarchiveToolbarButton = screen.getByRole('button', { name: 'chat.unarchive' })
    fireEvent.click(unarchiveToolbarButton)

    expect(screen.getByText('list.noSelection')).toBeInTheDocument()
  })
})

describe('Inbox -- clicking archived message opens ChatView', () => {
  it('opens ChatView when clicking a message row in the Archive folder', () => {
    render(<Inbox />)

    // Archive a message from inbox
    const archiveButtons = screen.getAllByRole('button', { name: 'list.archive' })
    fireEvent.click(archiveButtons[0])

    // Switch to Archive folder
    const archiveFolderButton = screen.getByText('folders.archive').closest('button')!
    fireEvent.click(archiveFolderButton)

    // Verify we're on the message list (search input visible)
    expect(screen.getByPlaceholderText('list.search')).toBeInTheDocument()

    // Click the archived message row
    const senderName = screen.getByText('Ethan Rodriguez')
    const row = senderName.closest('button')!
    fireEvent.click(row)

    // ChatView should open — search input gone, back button visible
    expect(screen.queryByPlaceholderText('list.search')).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'chat.back' })).toBeInTheDocument()
  })
})
