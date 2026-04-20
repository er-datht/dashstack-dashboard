## Purpose

Contact page with responsive card grid layout, load-more pagination, mock data layer, and individual contact card components.

## Requirements

### Requirement: Contact page layout
The Contact page SHALL display a header row with an icon badge (Users icon on yellow background), the title "Contact" on the left, and an "Add New Contact" primary button on the right. Below the header, a responsive grid of contact cards SHALL be rendered. The grid SHALL use 3 columns on desktop (>=1024px), 2 columns on tablet (>=640px), and 1 column on mobile (<640px).

#### Scenario: Page renders with header and grid
- **WHEN** user navigates to the /contact route
- **THEN** the page displays an icon badge, "Contact" title, and an "Add New Contact" button in the header, and contact cards in a responsive grid below

#### Scenario: Responsive column layout
- **WHEN** the viewport width is >= 1024px
- **THEN** the grid displays 3 columns
- **WHEN** the viewport width is >= 640px and < 1024px
- **THEN** the grid displays 2 columns
- **WHEN** the viewport width is < 640px
- **THEN** the grid displays 1 column

### Requirement: Contact card display
Each contact card SHALL display a large photo area covering approximately 60% of the card height with rounded top corners, the contact's name (bold, centered, truncated to 1 line with tooltip on hover), the contact's email (smaller text, muted color, centered, truncated to 1 line with tooltip on hover), and a "Message" button with a `Mail` icon (outlined with border, centered). The card SHALL have rounded corners, a subtle shadow/border on the surface background, and a hover effect (shadow lift) on desktop.

#### Scenario: Card renders contact info
- **WHEN** a contact card is displayed
- **THEN** it shows the contact's avatar photo, name (truncated with tooltip), email (truncated with tooltip), and a "Message" button with border

#### Scenario: Card hover effect
- **WHEN** user hovers over a contact card on desktop
- **THEN** the card displays a subtle shadow lift effect

#### Scenario: Avatar image fails to load
- **WHEN** a contact's avatar image fails to load or avatar is undefined
- **THEN** a generic Lucide `User` icon SHALL be displayed in a neutral background area in place of the photo

#### Scenario: Long name or email truncation
- **WHEN** a contact's name or email exceeds the card width
- **THEN** text is truncated to 1 line with ellipsis, and hovering shows the full text in a tooltip

### Requirement: Load More pagination
The page SHALL display 6 contact cards initially. A "Load More" button (outline secondary style) SHALL appear below the grid, centered, when there are more contacts to display. Each click of "Load More" SHALL reveal 6 additional contacts. The button SHALL be hidden when all contacts are displayed.

#### Scenario: Initial load shows 6 contacts
- **WHEN** the Contact page first renders
- **THEN** exactly 6 contact cards are visible and a "Load More" button appears below the grid

#### Scenario: Load More reveals next batch
- **WHEN** user clicks the "Load More" button
- **THEN** 6 more contacts become visible (total 12) and the button remains if more contacts exist

#### Scenario: All contacts loaded
- **WHEN** user has loaded all available contacts
- **THEN** the "Load More" button is hidden

### Requirement: Mock data source
The page SHALL use a static array of at least 18 mock contacts conforming to the existing `Contact` type. Each mock contact SHALL have an id, name, email, avatar URL, and createdAt/updatedAt timestamps.

#### Scenario: Mock data is typed correctly
- **WHEN** mock contact data is defined
- **THEN** each entry conforms to the `Contact` type from `src/types/contact.ts`

### Requirement: Add New Contact button behavior
The "Add New Contact" button SHALL display as a primary/blue styled button. When clicked, it SHALL navigate to the `/contact/add` route using React Router's `useNavigate`.

#### Scenario: Add New Contact click
- **WHEN** user clicks the "Add New Contact" button
- **THEN** the app navigates to the `/contact/add` route

### Requirement: Message button behavior
The "Message" button on each contact card SHALL display with a `Mail` icon. When clicked, it SHALL navigate to the `/inbox` route using React Router.

#### Scenario: Message button click
- **WHEN** user clicks the "Message" button on a contact card
- **THEN** the app navigates to the `/inbox` route

### Requirement: Theme support
The Contact page and all contact cards SHALL support all 3 themes (light, dark, forest) using theme-aware utility classes and CSS custom properties. No hardcoded colors SHALL be used.

#### Scenario: Theme switching
- **WHEN** the user switches between light, dark, and forest themes
- **THEN** the Contact page, cards, text, and buttons adapt their colors appropriately

### Requirement: Internationalization
All user-visible text on the Contact page SHALL use the `t()` translation function with a `contact` namespace. Translation files SHALL be provided for English (en) and Japanese (jp).

#### Scenario: Language switch
- **WHEN** the user switches language from English to Japanese
- **THEN** all contact page labels (title, button text, load more) display in Japanese
