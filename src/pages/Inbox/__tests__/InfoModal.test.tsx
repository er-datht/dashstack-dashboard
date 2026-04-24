import { render, screen, fireEvent } from '@testing-library/react'
import InfoModal from '../InfoModal'
import type { InfoModalData } from '../InfoModal'

const sampleData: InfoModalData = {
  senderName: 'Alice Johnson',
  subject: 'Quarterly Report Q1',
  labelName: 'labels.work',
  labelColor: '#fd9a56',
  time: '10:30 AM',
  isStarred: false,
  folder: 'inbox',
}

const secondData: InfoModalData = {
  senderName: 'Bob Smith',
  subject: 'Project Update',
  labelName: 'labels.social',
  labelColor: '#5b93ff',
  time: '11:00 AM',
  isStarred: true,
  folder: 'inbox',
}

const thirdData: InfoModalData = {
  senderName: 'Carol White',
  subject: 'Meeting Notes',
  labelName: 'labels.friends',
  labelColor: '#c979e0',
  time: '2:00 PM',
  isStarred: false,
  folder: 'inbox',
}

const defaultProps = {
  isOpen: true,
  onClose: vi.fn(),
  items: [sampleData],
}

describe('InfoModal', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('visibility', () => {
    it('renders nothing when isOpen is false', () => {
      const { container } = render(
        <InfoModal {...defaultProps} isOpen={false} />
      )

      expect(container.innerHTML).toBe('')
    })

    it('renders nothing when items is empty', () => {
      const { container } = render(
        <InfoModal isOpen={true} onClose={vi.fn()} items={[]} />
      )

      expect(container.innerHTML).toBe('')
    })

    it('renders the modal dialog when isOpen is true', () => {
      render(<InfoModal {...defaultProps} />)

      expect(screen.getByRole('dialog')).toBeInTheDocument()
    })
  })

  describe('accessibility', () => {
    it('has role="dialog" and aria-modal="true"', () => {
      render(<InfoModal {...defaultProps} />)

      const dialog = screen.getByRole('dialog')
      expect(dialog).toHaveAttribute('aria-modal', 'true')
    })

    it('has aria-labelledby pointing to the title element', () => {
      render(<InfoModal {...defaultProps} />)

      const dialog = screen.getByRole('dialog')
      const labelledById = dialog.getAttribute('aria-labelledby')
      expect(labelledById).toBeTruthy()

      const titleElement = document.getElementById(labelledById!)
      expect(titleElement).toBeInTheDocument()
    })
  })

  describe('message metadata display', () => {
    it('displays sender name, subject, time, and folder', () => {
      render(<InfoModal {...defaultProps} />)

      expect(screen.getByText('Alice Johnson')).toBeInTheDocument()
      expect(screen.getByText('Quarterly Report Q1')).toBeInTheDocument()
      expect(screen.getByText('10:30 AM')).toBeInTheDocument()
      expect(screen.getByText('inbox')).toBeInTheDocument()
    })

    it('displays the label badge with the label name', () => {
      render(<InfoModal {...defaultProps} />)

      expect(screen.getByText('labels.work')).toBeInTheDocument()
    })

    it('shows starred indicator when isStarred is true', () => {
      const starredData: InfoModalData = { ...sampleData, isStarred: true }
      render(<InfoModal {...defaultProps} items={[starredData]} />)

      const dialog = screen.getByRole('dialog')
      const starIcon = dialog.querySelector('.lucide-star')
      expect(starIcon).toBeTruthy()
    })
  })

  describe('selected count and navigation', () => {
    it('shows counter and nav buttons when multiple items', () => {
      render(<InfoModal {...defaultProps} items={[sampleData, secondData, thirdData]} />)

      // i18n mock returns key as-is: "info.selectedCount"
      expect(screen.getByText(/selectedCount/)).toBeInTheDocument()
      // Previous and Next buttons present
      expect(screen.getByRole('button', { name: /previous/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /next/i })).toBeInTheDocument()
    })

    it('does NOT show counter or nav buttons for single item', () => {
      render(<InfoModal {...defaultProps} items={[sampleData]} />)

      expect(screen.queryByText(/selectedCount/)).not.toBeInTheDocument()
      expect(screen.queryByRole('button', { name: /previous/i })).not.toBeInTheDocument()
      expect(screen.queryByRole('button', { name: /next/i })).not.toBeInTheDocument()
    })

    it('navigates to next message on Next click', () => {
      render(<InfoModal {...defaultProps} items={[sampleData, secondData]} />)

      expect(screen.getByText('Alice Johnson')).toBeInTheDocument()

      fireEvent.click(screen.getByRole('button', { name: /next/i }))

      expect(screen.getByText('Bob Smith')).toBeInTheDocument()
      expect(screen.queryByText('Alice Johnson')).not.toBeInTheDocument()
    })

    it('navigates back on Previous click', () => {
      render(<InfoModal {...defaultProps} items={[sampleData, secondData]} />)

      // Go to second
      fireEvent.click(screen.getByRole('button', { name: /next/i }))
      expect(screen.getByText('Bob Smith')).toBeInTheDocument()

      // Go back to first
      fireEvent.click(screen.getByRole('button', { name: /previous/i }))
      expect(screen.getByText('Alice Johnson')).toBeInTheDocument()
    })

    it('Previous button is disabled on first message', () => {
      render(<InfoModal {...defaultProps} items={[sampleData, secondData]} />)

      const prevBtn = screen.getByRole('button', { name: /previous/i })
      expect(prevBtn).toBeDisabled()
    })

    it('Next button is disabled on last message', () => {
      render(<InfoModal {...defaultProps} items={[sampleData, secondData]} />)

      // Navigate to last
      fireEvent.click(screen.getByRole('button', { name: /next/i }))

      const nextBtn = screen.getByRole('button', { name: /next/i })
      expect(nextBtn).toBeDisabled()
    })
  })

  describe('close behavior', () => {
    it('calls onClose when close button is clicked', () => {
      const onClose = vi.fn()
      render(<InfoModal {...defaultProps} onClose={onClose} />)

      const closeButton = screen.getByRole('button', { name: /close/i })
      fireEvent.click(closeButton)

      expect(onClose).toHaveBeenCalledTimes(1)
    })

    it('calls onClose when Escape key is pressed', () => {
      const onClose = vi.fn()
      render(<InfoModal {...defaultProps} onClose={onClose} />)

      fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape' })

      expect(onClose).toHaveBeenCalledTimes(1)
    })

    it('calls onClose when overlay is clicked', () => {
      const onClose = vi.fn()
      render(<InfoModal {...defaultProps} onClose={onClose} />)

      const dialog = screen.getByRole('dialog')
      fireEvent.click(dialog)

      expect(onClose).toHaveBeenCalledTimes(1)
    })

    it('does NOT call onClose when clicking inside modal content', () => {
      const onClose = vi.fn()
      render(<InfoModal {...defaultProps} onClose={onClose} />)

      fireEvent.click(screen.getByText('Alice Johnson'))

      expect(onClose).not.toHaveBeenCalled()
    })
  })
})
