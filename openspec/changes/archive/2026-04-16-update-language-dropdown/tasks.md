## 1. Assets & i18n

- [x] 1.1 Add flag image assets: download UK flag from Figma to `src/assets/icons/flags/en.svg`, create Japan flag as `src/assets/icons/flags/jp.svg`
- [x] 1.2 Add i18n translation key `languageSwitcher.selectLanguage` to `navigation` namespace in both `en` and `jp` locale files ("Select Language" / "言語を選択")

## 2. LanguageSwitcher Component Rewrite

- [x] 2.1 Refactor LanguageSwitcher to accept `isOpen`/`onClose` props (matching UserMenu API) instead of managing its own open state with hover events. Use native language labels ("English", "日本語")
- [x] 2.2 Add translated "Select Language" header with bottom border separator at top of dropdown panel (using `t("navigation:languageSwitcher.selectLanguage")`)
- [x] 2.3 Replace emoji flags with imported flag images (44x30px) in both trigger button and dropdown items
- [x] 2.4 Add lucide-react Check icon on the right side of the currently selected language row (no background highlight on selected row)
- [x] 2.5 Style dropdown panel: w-[220px], 14px border-radius, shadow, 18px padding per row, no separators between rows, `animate-usermenu-enter` animation, theme-aware colors using `usermenu-*` CSS variables
- [x] 2.6 Add Escape key handler to close dropdown (matching UserMenu pattern)
- [x] 2.7 Add ChevronDown rotation (180deg) when dropdown is open (matching UserMenu chevron behavior)

## 3. TopNav Integration

- [x] 3.1 Refactor TopNav to manage `isLangOpen` state alongside `isUserMenuOpen`, replacing `forceClose`/`langForceClose` coordination with direct state control. Language dropdown behavior matches UserMenu exactly (click-based toggle, same state management pattern)
- [x] 3.2 Add click-outside detection for language dropdown (ref-based, matching UserMenu pattern in TopNav)
- [x] 3.3 Ensure mutual exclusivity: opening one dropdown closes the other

## 4. Tests

- [x] 4.1 Update LanguageSwitcher tests for click-based open/close, translated header display, flag images, checkmark indicator, Escape key close, and theme support
