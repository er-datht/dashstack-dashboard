import { render, screen, fireEvent } from '@testing-library/react'
import MessageList from '../MessageList'
import type { EmailRecord, InboxLabel } from '../mockData'

/**
 * Tests for MessageList after the inbox-starred-messages change.
 *
 * New props added by the change:
 *   - starredIds: Record<string, boolean>  -- which records are starred
 *   - onToggleStar: (id: string) => void   -- called on star button click
 *   - activeFolder: string                 -- current folder tab
 *
 * Behaviors under test:
 *   - Star icon renders filled (text-warning + fill attribute) when starred
 *   - Star icon renders outlined (no fill) when not starred
 *   - Clicking star calls onToggleStar with record id
 *   - Clicking star does NOT call onSelect (stopPropagation)
 *   - When activeFolder === "starred", only starred records are shown
 *   - When activeFolder !== "starred", all records are shown
 *   - Page resets to 0 when activeFolder changes
 */

const mockLabels: InboxLabel[] = [
  { id: 'primary', nameKey: 'labels.primary', color: '#00b69b' },
  { id: 'work', nameKey: 'labels.work', color: '#fd9a56' },
]

// Small set of records for testing — only 3 to keep things simple
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

describe('MessageList — star toggle', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('star icon rendering', () => {
    it('renders outlined star icon for unstarred records', () => {
      render(<MessageList {...defaultProps} starredIds={{}} />)

      // All star buttons should exist
      const starButtons = screen.getAllByRole('button', { name: 'list.star' })
      expect(starButtons).toHaveLength(3)

      // Unstarred star icons should NOT have fill="currentColor"
      for (const btn of starButtons) {
        const svg = btn.querySelector('.lucide-star')
        expect(svg).not.toBeNull()
        // SPEC: unstarred uses default outlined style — no fill attribute set to "currentColor"
        expect(svg).not.toHaveAttribute('fill', 'currentColor')
      }
    })

    it('renders filled yellow star icon for starred records', () => {
      render(
        <MessageList
          {...defaultProps}
          starredIds={{ 'rec-1': true, 'rec-3': true }}
        />
      )

      const starButtons = screen.getAllByRole('button', { name: 'list.star' })
      expect(starButtons).toHaveLength(3)

      // rec-1 (Alice) star should be filled
      const aliceRow = screen.getByText('Alice').closest('button[class]')!
      const aliceStarBtn = aliceRow.querySelector('button[aria-label="list.star"]')!
      const aliceStarIcon = aliceStarBtn.querySelector('.lucide-star')!
      expect(aliceStarIcon).toHaveAttribute('fill', 'currentColor')
      // SPEC: filled star uses text-warning class
      expect(aliceStarBtn.className).toContain('text-warning')

      // rec-2 (Bob) star should be outlined
      const bobRow = screen.getByText('Bob').closest('button[class]')!
      const bobStarBtn = bobRow.querySelector('button[aria-label="list.star"]')!
      const bobStarIcon = bobStarBtn.querySelector('.lucide-star')!
      expect(bobStarIcon).not.toHaveAttribute('fill', 'currentColor')
    })
  })

  describe('star click behavior', () => {
    it('calls onToggleStar with the record id when star is clicked', () => {
      const onToggleStar = vi.fn()

      render(
        <MessageList {...defaultProps} onToggleStar={onToggleStar} />
      )

      const starButtons = screen.getAllByRole('button', { name: 'list.star' })
      fireEvent.click(starButtons[0])

      expect(onToggleStar).toHaveBeenCalledWith('rec-1')
    })

    it('does NOT call onSelect when star is clicked (stopPropagation)', () => {
      const onSelect = vi.fn()
      const onToggleStar = vi.fn()

      render(
        <MessageList
          {...defaultProps}
          onSelect={onSelect}
          onToggleStar={onToggleStar}
        />
      )

      const starButtons = screen.getAllByRole('button', { name: 'list.star' })
      fireEvent.click(starButtons[0])

      // Star was toggled
      expect(onToggleStar).toHaveBeenCalledTimes(1)
      // But conversation was NOT opened
      expect(onSelect).not.toHaveBeenCalled()
    })
  })

  describe('starred folder filtering', () => {
    it('shows only starred records when activeFolder is "starred"', () => {
      render(
        <MessageList
          {...defaultProps}
          activeFolder="starred"
          starredIds={{ 'rec-1': true, 'rec-3': true }}
        />
      )

      // Alice and Carol are starred — they should be visible
      expect(screen.getByText('Alice')).toBeInTheDocument()
      expect(screen.getByText('Carol')).toBeInTheDocument()

      // Bob is not starred — should not be visible
      expect(screen.queryByText('Bob')).not.toBeInTheDocument()
    })

    it('shows all records when activeFolder is "inbox"', () => {
      render(
        <MessageList
          {...defaultProps}
          activeFolder="inbox"
          starredIds={{ 'rec-1': true }}
        />
      )

      // All records visible regardless of starred state
      expect(screen.getByText('Alice')).toBeInTheDocument()
      expect(screen.getByText('Bob')).toBeInTheDocument()
      expect(screen.getByText('Carol')).toBeInTheDocument()
    })

    it('shows empty list when activeFolder is "starred" and no records are starred', () => {
      render(
        <MessageList
          {...defaultProps}
          activeFolder="starred"
          starredIds={{}}
        />
      )

      // No sender names visible
      expect(screen.queryByText('Alice')).not.toBeInTheDocument()
      expect(screen.queryByText('Bob')).not.toBeInTheDocument()
      expect(screen.queryByText('Carol')).not.toBeInTheDocument()
    })
  })

  describe('pagination reset on folder change', () => {
    it('resets to page 0 when activeFolder changes', () => {
      // We need more records than RECORDS_PER_PAGE (12) to test pagination.
      // Create 14 records so there are 2 pages.
      const manyRecords: EmailRecord[] = Array.from({ length: 14 }, (_, i) => ({
        id: `rec-${i + 1}`,
        senderName: `Sender ${i + 1}`,
        labelId: 'primary',
        subject: `Subject ${i + 1}`,
        time: '9:00 AM',
      }))

      // Star all records so they all show in the starred folder
      const allStarred: Record<string, boolean> = {}
      for (const r of manyRecords) {
        allStarred[r.id] = true
      }

      const { rerender } = render(
        <MessageList
          {...defaultProps}
          records={manyRecords}
          starredIds={allStarred}
          activeFolder="inbox"
        />
      )

      // Verify we see page 1 content (Sender 1 should be visible)
      expect(screen.getByText('Sender 1')).toBeInTheDocument()
      // Sender 13 should be on page 2, not visible
      expect(screen.queryByText('Sender 13')).not.toBeInTheDocument()

      // Simulate user navigating to page 2 by clicking next
      const nextButton = screen.getAllByRole('button').find(
        (btn) => btn.querySelector('.lucide-chevron-right')
      )
      expect(nextButton).toBeDefined()
      fireEvent.click(nextButton!)

      // After clicking next, Sender 13 should now be visible (page 2)
      expect(screen.getByText('Sender 13')).toBeInTheDocument()
      // Sender 1 should no longer be visible
      expect(screen.queryByText('Sender 1')).not.toBeInTheDocument()

      // Now switch folder — should reset to page 0
      rerender(
        <MessageList
          {...defaultProps}
          records={manyRecords}
          starredIds={allStarred}
          activeFolder="starred"
        />
      )

      // After folder switch, page resets to 0 — Sender 1 should be visible again
      expect(screen.getByText('Sender 1')).toBeInTheDocument()
    })
  })
})
