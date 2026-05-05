import { render, screen, fireEvent } from '@testing-library/react'
import ProductDetail from '../index'
import type { Product } from '../../../types/product'
import { ROUTES } from '../../../routes/routes'

/**
 * Tests for the ProductDetail page (src/pages/ProductDetail/index.tsx).
 *
 * SPEC: Behavior derived from
 *   openspec/specs/product-detail/spec.md
 *
 *   Key requirements covered:
 *   - Loading state renders the spinner pattern.
 *   - Error state renders an error card with the error message.
 *   - Not-found state renders the empty-state card with a "Back to Products"
 *     button that navigates to ROUTES.PRODUCTS.
 *   - Loaded happy path renders hero (name, price, rating stars, review count,
 *     short description), Specifications rows, and About paragraphs.
 *   - Optional spec fields are omitted when undefined.
 *   - longDescription absent omits the About section.
 *   - Breadcrumb at the top of the loaded page (Products link + current name).
 *   - Breadcrumb omitted on loading, error, and not-found states.
 *   - Action bar Wishlist toggle wiring + Edit link href.
 *
 * react-i18next is globally mocked in src/test/setup.ts to return keys
 * verbatim, so we assert against translation keys.
 */

// --- Mocks ----------------------------------------------------------------

const mockNavigate = vi.fn()
const mockUseParams = vi.fn(() => ({ id: '1' }))

vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
  useParams: () => mockUseParams(),
  // The page uses <Link> for the breadcrumb's "Products" segment and for the
  // Edit action; mock it as a plain anchor so href assertions work without a
  // Router context.
  Link: ({
    to,
    children,
    ...rest
  }: {
    to: string
    children?: React.ReactNode
  } & React.AnchorHTMLAttributes<HTMLAnchorElement>) => (
    <a href={typeof to === 'string' ? to : '#'} {...rest}>
      {children}
    </a>
  ),
}))

// useProduct hook mock — drives loading / error / not-found / loaded states.
type UseProductReturn = {
  product: Product | undefined
  isLoading: boolean
  error: string | null
  refetch: () => Promise<unknown>
}

const mockUseProductReturn: UseProductReturn = {
  product: undefined,
  isLoading: false,
  error: null,
  refetch: vi.fn(),
}

vi.mock('../../../hooks/useProduct', () => ({
  useProduct: () => mockUseProductReturn,
}))

// useWishlist context mock.
const mockToggleWishlist = vi.fn()
const mockIsWishlisted = vi.fn(() => false)

vi.mock('../../../contexts/WishlistContext', () => ({
  useWishlist: () => ({
    toggleWishlist: mockToggleWishlist,
    isWishlisted: mockIsWishlisted,
    wishlist: new Set<string>(),
    wishlistIds: [] as string[],
    clearWishlist: vi.fn(),
  }),
}))

// react-slick may render the gallery; stub Slider so jsdom is happy.
vi.mock('react-slick', () => ({
  default: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}))

// --- Fixtures -------------------------------------------------------------

// Note: the new optional fields (`description`, `longDescription`, `category`,
// `sku`, `stock`, `status`) are added to the Product type by this change. The
// loaded fixture casts via `as Product` so the test file compiles even if the
// type extension hasn't landed yet.
const fullProduct = {
  id: '1',
  name: 'Apple Watch Series 4',
  price: 120,
  image: 'https://example.com/img-1.jpg',
  rating: 4,
  reviewCount: 131,
  images: [
    'https://example.com/img-1.jpg',
    'https://example.com/img-2.jpg',
  ],
  description: 'A premium smartwatch with health tracking.',
  longDescription:
    'The Apple Watch Series 4 redefines what a watch can do.\n\nWith advanced sensors, it tracks your activity all day.',
  category: 'Wearables',
  sku: 'AWS4-44-SLV',
  stock: 24,
  status: 'active' as const,
} as Product

function setLoaded(product: Product) {
  mockUseProductReturn.product = product
  mockUseProductReturn.isLoading = false
  mockUseProductReturn.error = null
}

function setLoading() {
  mockUseProductReturn.product = undefined
  mockUseProductReturn.isLoading = true
  mockUseProductReturn.error = null
}

function setError(message: string) {
  mockUseProductReturn.product = undefined
  mockUseProductReturn.isLoading = false
  mockUseProductReturn.error = message
}

function setNotFound() {
  mockUseProductReturn.product = undefined
  mockUseProductReturn.isLoading = false
  mockUseProductReturn.error = null
}

// --- Tests ----------------------------------------------------------------

describe('ProductDetail page', () => {
  beforeEach(() => {
    mockNavigate.mockClear()
    mockToggleWishlist.mockClear()
    mockIsWishlisted.mockReturnValue(false)
    mockUseParams.mockReturnValue({ id: '1' })
  })

  describe('loading state', () => {
    it('renders the spinner pattern while data is fetching', () => {
      setLoading()

      const { container } = render(<ProductDetail />)

      // SPEC: assumed the page reuses the Products listing's spinner pattern
      // (a div with a `spinner` class). Matches the existing
      // src/pages/Products/Products.module.scss `.spinner` rule.
      const spinner = container.querySelector('[class*="spinner"]')
      expect(spinner).toBeInTheDocument()
    })
  })

  describe('error state', () => {
    it('renders an error card with the error message', () => {
      setError('Network failed')

      render(<ProductDetail />)

      expect(screen.getByText('Network failed')).toBeInTheDocument()
    })
  })

  describe('not-found state', () => {
    it('renders the not-found empty state with a Back to Products button', () => {
      setNotFound()

      render(<ProductDetail />)

      // SPEC: keys live under dashboard.products.detail.* per design.md
      expect(
        screen.getByText('products.detail.notFound.title')
      ).toBeInTheDocument()
      expect(
        screen.getByRole('button', { name: 'products.detail.notFound.back' })
      ).toBeInTheDocument()
    })

    it('navigates to ROUTES.PRODUCTS when the Back to Products button is clicked', () => {
      setNotFound()

      render(<ProductDetail />)

      const backButton = screen.getByRole('button', {
        name: 'products.detail.notFound.back',
      })
      fireEvent.click(backButton)

      expect(mockNavigate).toHaveBeenCalledWith(ROUTES.PRODUCTS)
    })
  })

  describe('loaded happy path', () => {
    beforeEach(() => {
      setLoaded(fullProduct)
    })

    it('renders the product name in the page heading', () => {
      render(<ProductDetail />)
      // The product name also appears in the breadcrumb; assert against the
      // page heading specifically.
      expect(
        screen.getByRole('heading', { level: 1, name: 'Apple Watch Series 4' })
      ).toBeInTheDocument()
    })

    it('renders the price formatted as $xx.xx', () => {
      render(<ProductDetail />)
      expect(screen.getByText('$120.00')).toBeInTheDocument()
    })

    it('renders the review count in parentheses', () => {
      render(<ProductDetail />)
      expect(screen.getByText('(131)')).toBeInTheDocument()
    })

    it('renders the short description when present', () => {
      render(<ProductDetail />)
      expect(
        screen.getByText('A premium smartwatch with health tracking.')
      ).toBeInTheDocument()
    })

    it('renders 5 star icons in the rating row', () => {
      const { container } = render(<ProductDetail />)
      // Lucide Star icons render as SVGs with the `lucide-star` class.
      const stars = container.querySelectorAll('svg.lucide-star')
      expect(stars.length).toBe(5)
    })

    it('renders the Specifications section heading', () => {
      render(<ProductDetail />)
      expect(
        screen.getByText('products.detail.specifications')
      ).toBeInTheDocument()
    })

    it('renders the SKU row when sku is present', () => {
      render(<ProductDetail />)
      expect(
        screen.getByText('products.detail.specs.sku')
      ).toBeInTheDocument()
      expect(screen.getByText('AWS4-44-SLV')).toBeInTheDocument()
    })

    it('renders the Category row when category is present', () => {
      render(<ProductDetail />)
      expect(
        screen.getByText('products.detail.specs.category')
      ).toBeInTheDocument()
      expect(screen.getByText('Wearables')).toBeInTheDocument()
    })

    it('renders the Stock row label when stock/status are present', () => {
      render(<ProductDetail />)
      expect(
        screen.getByText('products.detail.specs.stock')
      ).toBeInTheDocument()
    })

    it('renders the Rating row in the "n / 5" format', () => {
      render(<ProductDetail />)
      // SPEC: spec.md "Specifications" requirement says e.g. "4.0 / 5".
      expect(screen.getByText('4.0 / 5')).toBeInTheDocument()
    })

    it('renders the Reviews row label', () => {
      render(<ProductDetail />)
      expect(
        screen.getByText('products.detail.specs.reviews')
      ).toBeInTheDocument()
    })

    it('renders the About section heading and both paragraphs', () => {
      const { container } = render(<ProductDetail />)

      expect(
        screen.getByText('products.detail.about')
      ).toBeInTheDocument()

      // The longDescription contains two paragraphs separated by \n\n.
      // SPEC: assumed each chunk is rendered as its own <p>.
      expect(
        screen.getByText(
          'The Apple Watch Series 4 redefines what a watch can do.'
        )
      ).toBeInTheDocument()
      expect(
        screen.getByText(
          'With advanced sensors, it tracks your activity all day.'
        )
      ).toBeInTheDocument()

      // Sanity: at least 2 <p> nodes exist beneath the about section heading.
      const paragraphs = container.querySelectorAll('p')
      expect(paragraphs.length).toBeGreaterThanOrEqual(2)
    })
  })

  describe('optional field handling', () => {
    it('omits the SKU row when product.sku is undefined', () => {
      const noSku = { ...fullProduct, sku: undefined } as Product
      setLoaded(noSku)

      render(<ProductDetail />)

      expect(
        screen.queryByText('products.detail.specs.sku')
      ).not.toBeInTheDocument()
    })

    it('does not render the About section when longDescription is undefined', () => {
      const noLong = { ...fullProduct, longDescription: undefined } as Product
      setLoaded(noLong)

      render(<ProductDetail />)

      expect(
        screen.queryByText('products.detail.about')
      ).not.toBeInTheDocument()
    })
  })

  describe('breadcrumb', () => {
    beforeEach(() => {
      setLoaded(fullProduct)
    })

    it('renders the "Products" breadcrumb link with href=/products', () => {
      render(<ProductDetail />)

      const productsLink = screen.getByRole('link', {
        name: 'products.detail.breadcrumb.products',
      })
      expect(productsLink).toHaveAttribute('href', ROUTES.PRODUCTS)
    })

    it('renders the current product name as plain text in the breadcrumb', () => {
      render(<ProductDetail />)

      // The breadcrumb's aria-label uses the i18n key (mock returns keys verbatim).
      const breadcrumb = screen.getByLabelText(
        'products.detail.breadcrumb.label'
      )
      expect(breadcrumb).toHaveTextContent('Apple Watch Series 4')
      // The current product name segment must NOT be a link.
      const currentSegment = breadcrumb.querySelector('[aria-current="page"]')
      expect(currentSegment).not.toBeNull()
      expect(currentSegment?.tagName).toBe('SPAN')
    })

    it('exposes the current product name via title for tooltip when truncated', () => {
      render(<ProductDetail />)

      const breadcrumb = screen.getByLabelText(
        'products.detail.breadcrumb.label'
      )
      const currentSegment = breadcrumb.querySelector('[aria-current="page"]')
      expect(currentSegment).toHaveAttribute('title', 'Apple Watch Series 4')
    })

    it('does not render a Back button in the action bar', () => {
      render(<ProductDetail />)

      expect(
        screen.queryByRole('button', { name: 'products.detail.actions.back' })
      ).not.toBeInTheDocument()
    })
  })

  describe('breadcrumb omitted on non-loaded states', () => {
    it('does not render the breadcrumb in the loading state', () => {
      setLoading()

      render(<ProductDetail />)

      expect(
        screen.queryByLabelText('products.detail.breadcrumb.label')
      ).not.toBeInTheDocument()
    })

    it('does not render the breadcrumb in the error state', () => {
      setError('Network failed')

      render(<ProductDetail />)

      expect(
        screen.queryByLabelText('products.detail.breadcrumb.label')
      ).not.toBeInTheDocument()
    })

    it('does not render the breadcrumb in the not-found state', () => {
      setNotFound()

      render(<ProductDetail />)

      expect(
        screen.queryByLabelText('products.detail.breadcrumb.label')
      ).not.toBeInTheDocument()
    })
  })

  describe('action bar', () => {
    beforeEach(() => {
      setLoaded(fullProduct)
    })

    it('renders the Edit action as a Link with href=/products/:id/edit', () => {
      render(<ProductDetail />)

      const editLink = screen.getByRole('link', {
        name: 'products.detail.actions.edit',
      })
      expect(editLink).toHaveAttribute('href', '/products/1/edit')
    })

    it('shows the "Add to Wishlist" label when not wishlisted and calls toggleWishlist on click', () => {
      mockIsWishlisted.mockReturnValue(false)

      render(<ProductDetail />)

      const wishlistButton = screen.getByRole('button', {
        name: 'products.detail.actions.addToWishlist',
      })

      // SPEC: spec.md "Action bar" requires the wishlist button to expose its
      // label via both `aria-label` and `title` (icon-only button — title is
      // the hover-tooltip affordance for sighted mouse users).
      expect(wishlistButton).toHaveAttribute(
        'title',
        'products.detail.actions.addToWishlist'
      )

      // SPEC: scenario "Wishlist button has no visible text" — the button
      // renders only the Heart icon, never the i18n key as visible text.
      expect(wishlistButton).not.toHaveTextContent(
        'products.detail.actions.addToWishlist'
      )
      expect(wishlistButton).not.toHaveTextContent(
        'products.detail.actions.removeFromWishlist'
      )

      // SPEC: spec.md "Hero section with gallery and info" — the wishlist overlay
      // is a descendant of the gallery container, NOT the action bar.
      expect(wishlistButton.closest('[class*="galleryContainer"]')).not.toBeNull()

      // SPEC: spec.md "Action bar" scenario "Action bar contains no Wishlist
      // control" — the action bar holds only the Edit link.
      expect(wishlistButton.closest('[class*="actionBar"]')).toBeNull()

      fireEvent.click(wishlistButton)

      expect(mockToggleWishlist).toHaveBeenCalledWith('1')
    })

    it('shows the "Remove from Wishlist" label when the product is already wishlisted', () => {
      mockIsWishlisted.mockReturnValue(true)

      render(<ProductDetail />)

      const wishlistButton = screen.getByRole('button', {
        name: 'products.detail.actions.removeFromWishlist',
      })
      expect(wishlistButton).toBeInTheDocument()

      // SPEC: spec.md "Action bar" requires the wishlist button to expose its
      // label via both `aria-label` and `title` in the wishlisted state.
      expect(wishlistButton).toHaveAttribute(
        'title',
        'products.detail.actions.removeFromWishlist'
      )

      // SPEC: scenario "Wishlist button has no visible text" — the button
      // renders only the Heart icon, never the i18n key as visible text.
      expect(wishlistButton).not.toHaveTextContent(
        'products.detail.actions.removeFromWishlist'
      )
      expect(wishlistButton).not.toHaveTextContent(
        'products.detail.actions.addToWishlist'
      )
    })
  })
})
