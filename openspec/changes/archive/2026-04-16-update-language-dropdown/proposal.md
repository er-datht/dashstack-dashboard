## Why

The current LanguageSwitcher dropdown uses emoji flags and a hover-based interaction pattern that is inconsistent with the rest of the TopNav dropdowns (UserMenu uses click-based). The Figma design (node 5:3858) specifies a polished dropdown with a "Select Language" header, actual flag images, and a checkmark indicator for the selected language. Updating this component brings visual consistency and a better UX.

## What Changes

- Redesign LanguageSwitcher dropdown to match Figma: "Select Language" header with border separator, flag images (44x30px), checkmark for selected language, rounded card (14px) with shadow
- Replace emoji flags with SVG flag image assets (UK flag for English, Japan flag for Japanese)
- Change interaction from hover-based to click-based (matching UserMenu pattern)
- Add click-outside close, Escape key close, and entry animation (consistent with UserMenu)
- Keep existing forceClose/onOpen coordination with TopNav for multi-dropdown management
- Maintain all 3 theme support (light/dark/forest)

## Capabilities

### New Capabilities

- `language-dropdown`: Redesigned LanguageSwitcher dropdown with flag images, "Select Language" header, checkmark selection indicator, and click-based interaction pattern

### Modified Capabilities

_(none — this is a self-contained UI component redesign with no spec-level requirement changes to existing capabilities)_

## Impact

- **Components**: `src/components/LanguageSwitcher/index.tsx` — full rewrite of dropdown rendering and interaction logic
- **Assets**: New SVG flag files in `src/assets/icons/flags/` (en.svg, jp.svg)
- **Styles**: New CSS custom properties for language dropdown theming in `src/index.css` (reuse existing topnav vars where possible, add lang-dropdown-specific vars if needed)
- **Tests**: Update `src/components/LanguageSwitcher/__tests__/LanguageSwitcher.test.tsx` for click-based behavior
- **Dependencies**: None new — uses existing lucide-react (Check icon), classnames (cn helper)
