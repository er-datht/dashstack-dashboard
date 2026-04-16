## ADDED Requirements

### Requirement: Language dropdown header
The dropdown panel SHALL display a translatable "Select Language" header at the top, separated from the language items by a bottom border. The header text SHALL use the i18n key `navigation:languageSwitcher.selectLanguage` and display in the current language (e.g. "Select Language" in English, translated equivalent in Japanese).

#### Scenario: Header is visible when dropdown opens
- **WHEN** the language dropdown is open
- **THEN** a "Select Language" text header is displayed at the top of the panel with a bottom border separator

#### Scenario: Header is translated in Japanese mode
- **WHEN** the current language is Japanese and the dropdown is open
- **THEN** the header displays "言語を選択" (the Japanese translation)

### Requirement: Flag image display
Each language item SHALL display a flag image next to the language name (in native form: "English" and "日本語"), replacing the previous emoji flags. Flag images SHALL be 44x30px. English uses a UK flag (from Figma assets), Japanese uses a Japan flag.

#### Scenario: English flag displays as UK flag image
- **WHEN** the language dropdown is open
- **THEN** the English language row displays a UK flag SVG image at 44x30px

#### Scenario: Japanese flag displays as Japan flag image
- **WHEN** the language dropdown is open
- **THEN** the Japanese language row displays a Japan flag SVG image at 44x30px

### Requirement: Checkmark selection indicator
The currently selected language SHALL display a checkmark icon (lucide-react Check) on the right side of its row. Non-selected languages SHALL NOT display a checkmark.

#### Scenario: Selected language shows checkmark
- **WHEN** the language dropdown is open and English is the current language
- **THEN** the English row displays a Check icon on the right side
- **AND** the Japanese row does NOT display a Check icon

#### Scenario: Checkmark moves on language change
- **WHEN** the user selects Japanese
- **THEN** the Japanese row displays the Check icon
- **AND** the English row no longer displays the Check icon

### Requirement: Click-based open/close
The dropdown SHALL open on click of the trigger button (not hover). The dropdown SHALL close when: (a) the user clicks the trigger button again, (b) the user clicks outside the dropdown, (c) the user presses the Escape key, or (d) the user selects a language.

#### Scenario: Opens on click
- **WHEN** the user clicks the language switcher trigger button
- **THEN** the dropdown panel opens

#### Scenario: Closes on click outside
- **WHEN** the dropdown is open and the user clicks outside the dropdown area
- **THEN** the dropdown closes

#### Scenario: Closes on Escape key
- **WHEN** the dropdown is open and the user presses the Escape key
- **THEN** the dropdown closes

#### Scenario: Closes on language selection
- **WHEN** the dropdown is open and the user clicks a language item
- **THEN** the language changes and the dropdown closes

### Requirement: Dropdown panel styling
The dropdown panel SHALL have a width of 220px, border-radius of 14px, a box-shadow, and theme-aware background/border colors. Each language row SHALL have 18px padding. The panel SHALL use an entry animation consistent with the UserMenu dropdown. Language rows SHALL NOT have separator borders between them. The selected language row SHALL NOT have a distinct background color — only the checkmark indicates selection.

#### Scenario: Panel renders with correct styling
- **WHEN** the dropdown is open
- **THEN** the panel has width 220px, rounded corners (14px), shadow, theme-aware background, and entry animation

#### Scenario: No separators between rows
- **WHEN** the dropdown is open
- **THEN** there are no border separators between language rows

### Requirement: Theme support
The language dropdown SHALL render correctly in all 3 themes (light, dark, forest) using existing CSS custom properties for backgrounds, text colors, borders, and hover states.

#### Scenario: Dark theme rendering
- **WHEN** the theme is set to dark and the dropdown is open
- **THEN** the dropdown uses dark theme colors for background, text, and borders

#### Scenario: Forest theme rendering
- **WHEN** the theme is set to forest and the dropdown is open
- **THEN** the dropdown uses forest theme colors for background, text, and borders

### Requirement: Mutual exclusivity with UserMenu
When the language dropdown opens, the UserMenu dropdown SHALL close, and vice versa. TopNav SHALL manage both dropdowns' open states to ensure only one is open at a time.

#### Scenario: Language dropdown closes UserMenu
- **WHEN** the UserMenu is open and the user clicks the language switcher trigger
- **THEN** the UserMenu closes and the language dropdown opens

#### Scenario: UserMenu closes language dropdown
- **WHEN** the language dropdown is open and the user clicks the UserMenu trigger
- **THEN** the language dropdown closes and the UserMenu opens

### Requirement: Trigger button display
The language switcher trigger button SHALL display the current language's flag image, the language name (hidden on small screens), and a ChevronDown icon. The chevron SHALL rotate 180 degrees when the dropdown is open.

#### Scenario: Trigger shows current language
- **WHEN** the current language is English
- **THEN** the trigger button shows the UK flag, "English" text, and a ChevronDown icon

#### Scenario: Chevron rotates when open
- **WHEN** the dropdown is open
- **THEN** the ChevronDown icon is rotated 180 degrees
