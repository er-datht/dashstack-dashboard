## 1. Verify Route Configuration

- [ ] 1.1 Confirm ROUTES object in `src/routes/routes.ts` defines constants for all 18 pages
- [ ] 1.2 Confirm all page components in AppRoutes.tsx are lazy-loaded with `React.lazy()`
- [ ] 1.3 Confirm Suspense boundary wraps lazy routes with LoadingFallback
- [ ] 1.4 Confirm nested route `products/:id/edit` maps to EditProduct component
- [ ] 1.5 Confirm catch-all route redirects to Dashboard

## 2. Verify Layout Structure

- [ ] 2.1 Confirm DashboardLayout renders Sidebar, TopNav, and main content area
- [ ] 2.2 Confirm sidebar collapse toggles between 256px and 80px width
- [ ] 2.3 Confirm main content area margin adjusts smoothly with sidebar state
- [ ] 2.4 Confirm TopNav is fixed-position and adjusts with sidebar width

## 3. Verify Navigation Data

- [ ] 3.1 Confirm `getNavSections(t)` returns DASHBOARD section (6 items) and PAGES section (8 items)
- [ ] 3.2 Confirm `getBottomItems(t)` returns Settings, Theme toggle, and Logout
- [ ] 3.3 Confirm all navigation labels use i18n translation function
- [ ] 3.4 Confirm navigation items use lucide-react icons

## 4. Document Known Gaps

- [ ] 4.1 Note that withAuth HOC is a placeholder (always returns isAuthenticated = true)
- [ ] 4.2 Document the "Adding a new page" pattern: routes.ts → AppRoutes.tsx → navigationData.ts
