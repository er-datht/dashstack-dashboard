import { render, screen, fireEvent } from '@testing-library/react'
import ChatHeader from '../ChatHeader'
import type { InboxLabel } from '../mockData'

/**
 * Tests for ChatHeader after the inbox-archive-message change.
 *
 * Changes made by the feature:
 *   - Download icon in the action button group is replaced with Archive icon
 *   - New optional prop: onArchive?: () => void
 *     When provided, clicking the archive button calls onArchive (which archives
 *     the current message and navigates back to the list)
 *   - When onArchive is NOT provided, clicking the archive button shows "Coming soon" toast
 *
 * Behaviors under test:
 *   - Archive icon renders in place of Download icon in the action group
 *   - Clicking archive button calls onArchive when provided
 *   - Clicking archive button shows "Coming soon" toast when onArchive is not provided
 */

const mockLabels: InboxLabel[] = [
  { id: 'primary', nameKey: 'labels.primary', color: '#00b69b' },
  { id: 'social', nameKey: 'labels.social', color: '#5a8cff' },
  { id: 'work', nameKey: 'labels.work', color: '#fd9a56' },
  { id: 'friends', nameKey: 'labels.friends', color: '#d456fd' },
]

const defaultProps = {
  contactName: 'Alice',
  activeLabel: 'primary',
  labels: mockLabels,
  onLabelChange: vi.fn(),
  onShowToast: vi.fn(),
  onBack: vi.fn(),
}

describe('ChatHeader -- archive button', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders Archive icon instead of Download icon in action buttons', () => {
    render(<ChatHeader {...defaultProps} />)

    // The action button group should contain an Archive icon, not a Download icon
    const allButtons = screen.getAllByRole('button')

    const downloadButton = allButtons.find(
      (btn) => btn.querySelector('.lucide-download')
    )
    expect(downloadButton).toBeUndefined()

    const archiveButton = allButtons.find(
      (btn) => btn.querySelector('.lucide-archive')
    )
    expect(archiveButton).toBeDefined()
  })

  it('calls onArchive when archive button is clicked and onArchive is provided', () => {
    const onArchive = vi.fn()

    render(<ChatHeader {...defaultProps} onArchive={onArchive} />)

    const allButtons = screen.getAllByRole('button')
    const archiveButton = allButtons.find(
      (btn) => btn.querySelector('.lucide-archive')
    )
    expect(archiveButton).toBeDefined()
    fireEvent.click(archiveButton!)

    expect(onArchive).toHaveBeenCalledTimes(1)
  })

  it('shows "Coming soon" toast when archive button is clicked and onArchive is not provided', () => {
    const onShowToast = vi.fn()

    render(<ChatHeader {...defaultProps} onShowToast={onShowToast} />)

    const allButtons = screen.getAllByRole('button')
    const archiveButton = allButtons.find(
      (btn) => btn.querySelector('.lucide-archive')
    )
    expect(archiveButton).toBeDefined()
    fireEvent.click(archiveButton!)

    expect(onShowToast).toHaveBeenCalledWith('chat.comingSoon')
  })

  it('does NOT call onShowToast when onArchive is provided and archive is clicked', () => {
    const onShowToast = vi.fn()
    const onArchive = vi.fn()

    render(
      <ChatHeader
        {...defaultProps}
        onShowToast={onShowToast}
        onArchive={onArchive}
      />
    )

    const allButtons = screen.getAllByRole('button')
    const archiveButton = allButtons.find(
      (btn) => btn.querySelector('.lucide-archive')
    )
    fireEvent.click(archiveButton!)

    // onArchive should be called, not the toast
    expect(onArchive).toHaveBeenCalledTimes(1)
    expect(onShowToast).not.toHaveBeenCalled()
  })
})
