import { render, screen, fireEvent } from '@testing-library/react'
import ProductCard from '../index'
import type { Product } from '../../../types/product'

/**
 * Tests for the ProductCard component (src/components/ProductCard/index.tsx).
 *
 * SPEC: Behavior derived from
 *   openspec/changes/add-product-detail-page/specs/product-listing/spec.md
 *
 *   Modified scenarios under test:
 *   - Existing baseline: image, name, price, rating, review count, Edit button.
 *   - Card-body click navigates to /products/:id (the read-only Detail page).
 *   - Edit button does NOT propagate to the card-body Link and navigates to
 *     /products/:id/edit instead.
 *   - Wishlist heart does NOT propagate to the card-body Link and only calls
 *     onWishlistToggle.
 *   - The card body is a real <a> (from <Link>) so right-click and middle-click
 *     "open in new tab" work natively.
 *
 * react-i18next is globally mocked in src/test/setup.ts to return keys
 * verbatim, so we assert against translation keys.
 */

// --- Mocks ----------------------------------------------------------------

const mockNavigate = vi.fn()

// Mock react-router-dom: provide a passthrough <Link> that renders an <a>
// (so DOM assertions work without setting up a real Router) and a useNavigate
// spy. This mirrors the project's existing module-mock style for Card-style
// components (see src/pages/Contact/__tests__/ContactCard.test.tsx).
//
// The card body Link tags itself with data-testid="card-link" so we can spy
// on its click handler and verify non-propagation from the Edit/heart buttons.
// The Edit Link (sibling) is identified by its translation-key accessible name.
vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
  Link: ({
    to,
    children,
    onClick,
    ...rest
  }: {
    to: string
    children?: React.ReactNode
    onClick?: (e: React.MouseEvent<HTMLAnchorElement>) => void
  } & React.AnchorHTMLAttributes<HTMLAnchorElement>) => {
    // Tag only the card-body Link (the one wrapping image + info, which has
    // className containing "cardLink") so existing tests can still spy on it.
    // All other <Link>s (e.g., the Edit link) render as plain anchors.
    const isCardBody =
      typeof rest.className === 'string' && rest.className.includes('cardLink')
    return (
      <a
        href={typeof to === 'string' ? to : '#'}
        onClick={onClick}
        data-testid={isCardBody ? 'card-link' : undefined}
        {...rest}
      >
        {children}
      </a>
    )
  },
}))

// Stub react-slick so the carousel renders all images as plain children.
vi.mock('react-slick', () => ({
  default: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}))

// --- Fixtures -------------------------------------------------------------

const baseProduct: Product = {
  id: '42',
  name: 'Apple Watch Series 4',
  price: 120,
  image: 'https://example.com/img-1.jpg',
  rating: 4,
  reviewCount: 131,
  images: [
    'https://example.com/img-1.jpg',
    'https://example.com/img-2.jpg',
  ],
}

const singleImageProduct: Product = {
  id: '7',
  name: 'Smart Watch Pro',
  price: 199,
  image: 'https://example.com/single.jpg',
  rating: 5,
  reviewCount: 89,
  images: ['https://example.com/single.jpg'],
}

function renderCard(overrides: Partial<{
  product: Product
  isWishlisted: boolean
  onWishlistToggle: (id: string) => void
}> = {}) {
  const onWishlistToggle = overrides.onWishlistToggle ?? vi.fn()
  const utils = render(
    <ProductCard
      product={overrides.product ?? baseProduct}
      isWishlisted={overrides.isWishlisted ?? false}
      onWishlistToggle={onWishlistToggle}
    />
  )
  return { ...utils, onWishlistToggle }
}

// --- Tests ----------------------------------------------------------------

describe('ProductCard', () => {
  beforeEach(() => {
    mockNavigate.mockClear()
  })

  describe('rendering baseline content', () => {
    it('renders the product name, price, and review count', () => {
      renderCard()

      expect(screen.getByText('Apple Watch Series 4')).toBeInTheDocument()
      expect(screen.getByText('$120.00')).toBeInTheDocument()
      expect(screen.getByText('(131)')).toBeInTheDocument()
    })

    it('renders image elements via the gallery imageAlt translation key', () => {
      renderCard()
      // The carousel labels each image via the shared
      // `products.detail.gallery.imageAlt` key, which interpolates the product
      // name and a 1-based index. The i18n mock returns keys verbatim (it
      // doesn't run i18next interpolation), so we assert against the key.
      const images = screen.getAllByRole('img')
      expect(images.length).toBeGreaterThan(0)
      expect(
        images.some(
          (img) =>
            (img as HTMLImageElement).alt ===
            'products.detail.gallery.imageAlt'
        )
      ).toBe(true)
    })

    it('renders 5 Lucide star icons for the rating', () => {
      const { container } = renderCard()
      const stars = container.querySelectorAll('svg.lucide-star')
      expect(stars.length).toBe(5)
    })

    it('renders the Edit Product link with translation key', () => {
      renderCard()
      expect(
        screen.getByRole('link', { name: 'products.editProduct' })
      ).toBeInTheDocument()
    })
  })

  describe('card-body navigation Link', () => {
    it('renders the card body as an anchor with href="/products/:id" so open-in-new-tab works', () => {
      renderCard()

      const cardLink = screen.getByTestId('card-link')
      expect(cardLink.tagName).toBe('A')
      expect(cardLink).toHaveAttribute('href', '/products/42')
    })

    it('renders the anchor with the correct id for a different product', () => {
      renderCard({ product: singleImageProduct })

      const cardLink = screen.getByTestId('card-link')
      expect(cardLink).toHaveAttribute('href', '/products/7')
    })

    it('clicking the card body Link does NOT call useNavigate (native anchor handles it)', () => {
      renderCard()

      const cardLink = screen.getByTestId('card-link')
      fireEvent.click(cardLink)

      // The Link is a native anchor; jsdom does not navigate, but we ensure
      // useNavigate (used for Edit) is not invoked when only the card is clicked.
      expect(mockNavigate).not.toHaveBeenCalled()
    })
  })

  describe('Edit link behavior', () => {
    it('renders the Edit link with href=/products/:id/edit (open-in-new-tab works)', () => {
      renderCard()

      const editLink = screen.getByRole('link', {
        name: 'products.editProduct',
      })
      expect(editLink).toHaveAttribute('href', '/products/42/edit')
    })

    it('does NOT trigger the card-body Link when the Edit link is clicked', () => {
      renderCard()

      const editLink = screen.getByRole('link', {
        name: 'products.editProduct',
      })

      // The Edit link is now a sibling of the card-body Link (not a child),
      // but we keep this regression test to guarantee a click on Edit never
      // surfaces a click on the card-body Link.
      const cardLink = screen.getByTestId('card-link')
      const linkClickSpy = vi.fn()
      cardLink.addEventListener('click', linkClickSpy)

      fireEvent.click(editLink)

      // The card-body Link must NOT have been clicked
      expect(linkClickSpy).not.toHaveBeenCalled()
      // And no programmatic navigation occurs (Edit relies on native anchor href)
      expect(mockNavigate).not.toHaveBeenCalled()
    })
  })

  describe('Wishlist heart behavior', () => {
    it('calls onWishlistToggle with the product id when the heart is clicked', () => {
      const { onWishlistToggle } = renderCard()

      const heartButton = screen.getByRole('button', {
        name: 'products.addToWishlist',
      })
      fireEvent.click(heartButton)

      expect(onWishlistToggle).toHaveBeenCalledTimes(1)
      expect(onWishlistToggle).toHaveBeenCalledWith('42')
    })

    it('does NOT trigger the card-body Link when the heart is clicked', () => {
      renderCard()

      const heartButton = screen.getByRole('button', {
        name: 'products.addToWishlist',
      })

      const cardLink = screen.getByTestId('card-link')
      const linkClickSpy = vi.fn()
      cardLink.addEventListener('click', linkClickSpy)

      fireEvent.click(heartButton)

      // The wishlist toggle stops propagation; the parent Link click handler
      // must NOT have been invoked, and useNavigate must NOT have been called.
      expect(linkClickSpy).not.toHaveBeenCalled()
      expect(mockNavigate).not.toHaveBeenCalled()
    })

    it('uses the "Remove from Wishlist" aria-label when isWishlisted is true', () => {
      renderCard({ isWishlisted: true })

      expect(
        screen.getByRole('button', { name: 'products.removeFromWishlist' })
      ).toBeInTheDocument()
    })
  })
})
