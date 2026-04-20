import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import Settings from '../index'

describe('Settings', () => {
  describe('rendering', () => {
    it('renders the generalSettings heading', () => {
      render(<Settings />)
      expect(
        screen.getByRole('heading', { name: 'generalSettings' })
      ).toBeInTheDocument()
    })

    it('renders all 5 form field labels', () => {
      render(<Settings />)
      expect(screen.getByText(/siteName/)).toBeInTheDocument()
      expect(screen.getByText(/copyright/)).toBeInTheDocument()
      expect(screen.getByText(/seoTitle/)).toBeInTheDocument()
      expect(screen.getByText(/seoKeywords/)).toBeInTheDocument()
      expect(screen.getByText(/seoDescription/)).toBeInTheDocument()
    })

    it('renders uploadLogo text', () => {
      render(<Settings />)
      expect(screen.getByText('uploadLogo')).toBeInTheDocument()
    })

    it('renders saveChanges button', () => {
      render(<Settings />)
      expect(
        screen.getByRole('button', { name: 'saveChanges' })
      ).toBeInTheDocument()
    })
  })

  describe('form interaction', () => {
    it('allows typing in text inputs', () => {
      render(<Settings />)
      const siteNameInput = screen.getByLabelText(/siteName/)
      fireEvent.change(siteNameInput, { target: { value: 'My Site' } })
      expect(siteNameInput).toHaveValue('My Site')
    })

    it('allows typing in the seoDescription textarea', () => {
      render(<Settings />)
      const textarea = screen.getByLabelText(/seoDescription/)
      fireEvent.change(textarea, {
        target: { value: 'A description of the site' },
      })
      expect(textarea).toHaveValue('A description of the site')
    })
  })

  describe('logo upload', () => {
    it('has a hidden file input that accepts images', () => {
      render(<Settings />)
      const fileInput = document.querySelector(
        'input[type="file"]'
      ) as HTMLInputElement
      expect(fileInput).toBeInTheDocument()
      expect(fileInput).toHaveAttribute('accept', 'image/*')
    })

    it('shows logo preview after file selection', async () => {
      render(<Settings />)
      const fileInput = document.querySelector(
        'input[type="file"]'
      ) as HTMLInputElement

      const file = new File(['logo'], 'logo.png', { type: 'image/png' })
      fireEvent.change(fileInput, { target: { files: [file] } })

      await waitFor(() => {
        expect(screen.getByAltText(/logo/i)).toBeInTheDocument()
      })
    })

    it('shows remove button when logo is selected', async () => {
      render(<Settings />)
      const fileInput = document.querySelector(
        'input[type="file"]'
      ) as HTMLInputElement

      const file = new File(['logo'], 'logo.png', { type: 'image/png' })
      fireEvent.change(fileInput, { target: { files: [file] } })

      await waitFor(() => {
        // SPEC: assumed remove button is identifiable by role or text
        const removeButton = screen.getByRole('button', {
          name: /remove/i,
        })
        expect(removeButton).toBeInTheDocument()
      })
    })

    it('clears logo preview when remove button is clicked', async () => {
      render(<Settings />)
      const fileInput = document.querySelector(
        'input[type="file"]'
      ) as HTMLInputElement

      const file = new File(['logo'], 'logo.png', { type: 'image/png' })
      fireEvent.change(fileInput, { target: { files: [file] } })

      await waitFor(() => {
        expect(screen.getByAltText(/logo/i)).toBeInTheDocument()
      })

      const removeButton = screen.getByRole('button', { name: /remove/i })
      fireEvent.click(removeButton)

      expect(screen.queryByAltText(/logo/i)).not.toBeInTheDocument()
    })
  })

  describe('validation', () => {
    it('shows error state on required fields when saving with empty values', async () => {
      render(<Settings />)

      const saveButton = screen.getByRole('button', { name: 'saveChanges' })
      fireEvent.click(saveButton)

      await waitFor(() => {
        const siteNameInput = screen.getByLabelText(/siteName/)
        const copyrightInput = screen.getByLabelText(/copyright/)
        const seoTitleInput = screen.getByLabelText(/seoTitle/)
        const seoKeywordsInput = screen.getByLabelText(/seoKeywords/)

        // SPEC: assumed required fields show aria-invalid="true" on validation failure
        expect(siteNameInput).toHaveAttribute('aria-invalid', 'true')
        expect(copyrightInput).toHaveAttribute('aria-invalid', 'true')
        expect(seoTitleInput).toHaveAttribute('aria-invalid', 'true')
        expect(seoKeywordsInput).toHaveAttribute('aria-invalid', 'true')
      })
    })

    it('does not mark optional seoDescription as invalid when empty', async () => {
      render(<Settings />)

      const saveButton = screen.getByRole('button', { name: 'saveChanges' })
      fireEvent.click(saveButton)

      await waitFor(() => {
        const seoDescInput = screen.getByLabelText(/seoDescription/)
        expect(seoDescInput).not.toHaveAttribute('aria-invalid', 'true')
      })
    })
  })

  describe('save behavior', () => {
    it('shows loading state on save button after clicking with valid data', async () => {
      render(<Settings />)

      // Fill required fields
      fireEvent.change(screen.getByLabelText(/siteName/), {
        target: { value: 'My Site' },
      })
      fireEvent.change(screen.getByLabelText(/copyright/), {
        target: { value: '2026 My Company' },
      })
      fireEvent.change(screen.getByLabelText(/seoTitle/), {
        target: { value: 'My SEO Title' },
      })
      fireEvent.change(screen.getByLabelText(/seoKeywords/), {
        target: { value: 'dashboard, admin' },
      })

      const saveButton = screen.getByRole('button', { name: 'saveChanges' })
      fireEvent.click(saveButton)

      // Button should be disabled during loading
      await waitFor(() => {
        expect(saveButton).toBeDisabled()
      })
    })

    it('shows success toast after save completes', async () => {
      render(<Settings />)

      // Fill required fields
      fireEvent.change(screen.getByLabelText(/siteName/), {
        target: { value: 'My Site' },
      })
      fireEvent.change(screen.getByLabelText(/copyright/), {
        target: { value: '2026 My Company' },
      })
      fireEvent.change(screen.getByLabelText(/seoTitle/), {
        target: { value: 'My SEO Title' },
      })
      fireEvent.change(screen.getByLabelText(/seoKeywords/), {
        target: { value: 'dashboard, admin' },
      })

      const saveButton = screen.getByRole('button', { name: 'saveChanges' })
      fireEvent.click(saveButton)

      // After loading completes, success toast should appear
      await waitFor(() => {
        expect(screen.getByText('settingsSaved')).toBeInTheDocument()
      })
    })
  })
})
