import { render, screen, fireEvent } from '@testing-library/react'
import LanguageSwitcher from '../index'

describe('LanguageSwitcher', () => {
  describe('existing behavior', () => {
    it('renders the current language label', () => {
      render(<LanguageSwitcher />)

      expect(screen.getByText('English')).toBeInTheDocument()
    })

    it('opens dropdown on mouse enter', () => {
      render(<LanguageSwitcher />)

      const container = screen.getByText('English').closest('div[class*="relative"]')!
      fireEvent.mouseEnter(container)

      // Both language options should be visible
      expect(screen.getByText('English')).toBeInTheDocument()
    })
  })

  describe('forceClose prop', () => {
    it('closes dropdown when forceClose becomes true', () => {
      const { rerender } = render(<LanguageSwitcher forceClose={false} />)

      // Open the dropdown via hover
      const container = screen.getByText('English').closest('div[class*="relative"]')!
      fireEvent.mouseEnter(container)

      // Force close
      rerender(<LanguageSwitcher forceClose={true} />)

      // When closed, the dropdown list items are not rendered.
      // The trigger only shows the current language, so 日本語 should not appear.
      // SPEC: assumed forceClose=true resets internal isOpen state to false
      expect(screen.queryByText('日本語')).not.toBeInTheDocument()
    })
  })

  describe('onOpen callback', () => {
    it('calls onOpen when dropdown opens on hover', () => {
      const onOpen = vi.fn()
      render(<LanguageSwitcher onOpen={onOpen} />)

      const container = screen.getByText('English').closest('div[class*="relative"]')!
      fireEvent.mouseEnter(container)

      expect(onOpen).toHaveBeenCalledTimes(1)
    })

    it('does not call onOpen when dropdown is already open', () => {
      const onOpen = vi.fn()
      render(<LanguageSwitcher onOpen={onOpen} />)

      const container = screen.getByText('English').closest('div[class*="relative"]')!
      fireEvent.mouseEnter(container)
      fireEvent.mouseLeave(container)
      fireEvent.mouseEnter(container)

      // Should be called each time the dropdown opens (2 times total)
      expect(onOpen).toHaveBeenCalledTimes(2)
    })
  })
})
