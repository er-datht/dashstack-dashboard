import { render, screen } from '@testing-library/react'
import InboxSidebar from '../InboxSidebar'

/**
 * Tests for InboxSidebar after the inbox-starred-messages change.
 *
 * New prop added by the change:
 *   - folderCountOverrides?: Partial<Record<string, number>>
 *     When provided, the count for a matching folder id uses the override
 *     value instead of the static folder.count from mockData.
 *
 * Behaviors under test:
 *   - Starred folder count displays the overridden value
 *   - Non-overridden folders keep their static counts
 *   - When no overrides are provided, all folders use their static counts
 */

const defaultProps = {
  activeFolder: 'inbox',
  onFolderChange: vi.fn(),
  onShowToast: vi.fn(),
  onCompose: vi.fn(),
}

describe('InboxSidebar — folderCountOverrides', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders overridden starred count when folderCountOverrides is provided', () => {
    render(
      <InboxSidebar
        {...defaultProps}
        folderCountOverrides={{ starred: 7 }}
      />
    )

    // The Starred folder should show 7 (the overridden value),
    // not 245 (the static mock data value).
    // Folder items render the translated nameKey and a count.
    // Since i18n mock returns keys as-is, the starred folder text is "folders.starred".
    expect(screen.getByText('folders.starred')).toBeInTheDocument()

    // Find the folder button containing the starred text and verify its count
    const starredButton = screen.getByText('folders.starred').closest('button')!
    expect(starredButton).toHaveTextContent('7')
    // Ensure the static 245 is NOT shown
    expect(starredButton).not.toHaveTextContent('245')
  })

  it('keeps static counts for non-overridden folders', () => {
    render(
      <InboxSidebar
        {...defaultProps}
        folderCountOverrides={{ starred: 3 }}
      />
    )

    // Inbox folder should still show its static count (1,253)
    const inboxButton = screen.getByText('folders.inbox').closest('button')!
    // toLocaleString would format 1253 as "1,253" in en locale
    expect(inboxButton).toHaveTextContent('1,253')
  })

  it('uses static counts for all folders when no overrides are provided', () => {
    render(<InboxSidebar {...defaultProps} />)

    // Starred folder should show its static count (245)
    const starredButton = screen.getByText('folders.starred').closest('button')!
    expect(starredButton).toHaveTextContent('245')
  })
})
