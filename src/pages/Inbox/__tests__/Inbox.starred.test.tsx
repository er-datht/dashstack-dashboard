import { render, screen, fireEvent } from '@testing-library/react'
import Inbox from '../index'

/**
 * Integration tests for the inbox-starred-messages change.
 *
 * These tests render the full Inbox page (index.tsx) and verify the
 * end-to-end behavior of star toggling, starred folder filtering,
 * and live sidebar count updates.
 *
 * The Inbox page initializes starredIds from mockEmailRecords' isStarred
 * field. Per task 1.2, 3-4 records are seeded as starred.
 *
 * Note: The mock data module is NOT mocked here — we use the real
 * mockEmailRecords. Tests rely on the seeded starred count being >= 1.
 */

describe('Inbox — starred messages integration', () => {
  describe('initial state', () => {
    it('renders the Starred folder with a count matching seeded starred records', () => {
      render(<Inbox />)

      // The Starred folder button should exist with some count > 0
      // (task 1.2 seeds 3-4 records as starred)
      const starredFolderButton = screen.getByText('folders.starred').closest('button')!
      expect(starredFolderButton).toBeInTheDocument()

      // The count should be a small number (3 or 4 from seeded data),
      // NOT the static 245 from the original mock data
      expect(starredFolderButton).not.toHaveTextContent('245')
    })
  })

  describe('star toggle updates sidebar count', () => {
    it('increments starred count when an unstarred record is starred', () => {
      render(<Inbox />)

      // Get initial starred count from sidebar
      const starredFolderButton = screen.getByText('folders.starred').closest('button')!
      const initialCountText = starredFolderButton.textContent!
      // Extract the numeric count — the button text includes folder name + count
      // e.g., "folders.starred3" or "folders.starred 3"
      const initialCount = parseInt(initialCountText.replace(/\D/g, ''), 10)

      // Find all star buttons in the message list
      const starButtons = screen.getAllByRole('button', { name: 'list.star' })
      expect(starButtons.length).toBeGreaterThan(0)

      // Find an unstarred star button (one without text-warning class)
      const unstarredBtn = starButtons.find(
        (btn) => !btn.className.includes('text-warning')
      )
      // SPEC: assumed at least one record is unstarred in the initial seed
      expect(unstarredBtn).toBeDefined()

      fireEvent.click(unstarredBtn!)

      // Starred count should have increased by 1
      const updatedCountText = starredFolderButton.textContent!
      const updatedCount = parseInt(updatedCountText.replace(/\D/g, ''), 10)
      expect(updatedCount).toBe(initialCount + 1)
    })

    it('decrements starred count when a starred record is unstarred', () => {
      render(<Inbox />)

      const starredFolderButton = screen.getByText('folders.starred').closest('button')!
      const initialCountText = starredFolderButton.textContent!
      const initialCount = parseInt(initialCountText.replace(/\D/g, ''), 10)
      expect(initialCount).toBeGreaterThan(0)

      // Find a starred star button (one with text-warning class)
      const starButtons = screen.getAllByRole('button', { name: 'list.star' })
      const starredBtn = starButtons.find(
        (btn) => btn.className.includes('text-warning')
      )
      expect(starredBtn).toBeDefined()

      fireEvent.click(starredBtn!)

      const updatedCountText = starredFolderButton.textContent!
      const updatedCount = parseInt(updatedCountText.replace(/\D/g, ''), 10)
      expect(updatedCount).toBe(initialCount - 1)
    })
  })

  describe('starred folder filtering', () => {
    it('shows only starred records when Starred folder is clicked', () => {
      render(<Inbox />)

      // Count initial visible records (all records shown on page 1)
      const initialStarButtons = screen.getAllByRole('button', { name: 'list.star' })
      const totalVisibleRecords = initialStarButtons.length

      // Click the Starred folder
      const starredFolderButton = screen.getByText('folders.starred').closest('button')!
      fireEvent.click(starredFolderButton)

      // After filtering, fewer records should be visible
      const filteredStarButtons = screen.getAllByRole('button', { name: 'list.star' })
      expect(filteredStarButtons.length).toBeLessThan(totalVisibleRecords)
      expect(filteredStarButtons.length).toBeGreaterThan(0)
    })

    it('removes a row from Starred view when unstarring it', () => {
      render(<Inbox />)

      // Switch to Starred folder
      const starredFolderButton = screen.getByText('folders.starred').closest('button')!
      fireEvent.click(starredFolderButton)

      // Count starred records currently visible
      const starButtonsBefore = screen.getAllByRole('button', { name: 'list.star' })
      const countBefore = starButtonsBefore.length

      // Click the first star button to unstar it
      fireEvent.click(starButtonsBefore[0])

      // One fewer record should be visible
      if (countBefore > 1) {
        const starButtonsAfter = screen.getAllByRole('button', { name: 'list.star' })
        expect(starButtonsAfter.length).toBe(countBefore - 1)
      } else {
        // If only one starred record, the list should now be empty
        expect(screen.queryAllByRole('button', { name: 'list.star' })).toHaveLength(0)
      }
    })

    it('restores full list when switching away from Starred folder', () => {
      render(<Inbox />)

      // Note the initial record count on page 1
      const initialStarButtons = screen.getAllByRole('button', { name: 'list.star' })
      const totalCount = initialStarButtons.length

      // Switch to Starred folder
      const starredFolderButton = screen.getByText('folders.starred').closest('button')!
      fireEvent.click(starredFolderButton)

      // Verify filtered view has fewer records
      const filteredStarButtons = screen.getAllByRole('button', { name: 'list.star' })
      expect(filteredStarButtons.length).toBeLessThan(totalCount)

      // Switch back to Inbox folder
      const inboxFolderButton = screen.getByText('folders.inbox').closest('button')!
      fireEvent.click(inboxFolderButton)

      // Full list should be restored (same count as initial)
      const restoredStarButtons = screen.getAllByRole('button', { name: 'list.star' })
      expect(restoredStarButtons.length).toBe(totalCount)
    })
  })

  describe('star click does not open conversation', () => {
    it('does not navigate to ChatView when star is clicked', () => {
      render(<Inbox />)

      // Verify we are on the MessageList (not ChatView)
      // MessageList has a search input; ChatView does not
      expect(screen.getByPlaceholderText('list.search')).toBeInTheDocument()

      // Click a star button
      const starButtons = screen.getAllByRole('button', { name: 'list.star' })
      fireEvent.click(starButtons[0])

      // Should still be on MessageList, not ChatView
      expect(screen.getByPlaceholderText('list.search')).toBeInTheDocument()
    })
  })
})
