## ADDED Requirements

### Requirement: Language dropdown with flag icons
The LanguageSwitcher component SHALL display a dropdown menu with language options showing flag emoji, language name, and a checkmark for the currently selected language.

#### Scenario: Dropdown display
- **WHEN** the user interacts with the LanguageSwitcher
- **THEN** a dropdown shows "🇺🇸 English" and "🇯🇵 日本語" with a checkmark next to the current language

### Requirement: Hover to open interaction
The LanguageSwitcher dropdown SHALL open on mouse hover, not on click.

#### Scenario: Hover activation
- **WHEN** the user hovers over the LanguageSwitcher trigger
- **THEN** the language dropdown opens

### Requirement: Language change via i18n API
Selecting a language in the dropdown SHALL call `i18n.changeLanguage(langCode)` to switch the application language.

#### Scenario: Switch to Japanese
- **WHEN** the user selects "🇯🇵 日本語" from the dropdown
- **THEN** `i18n.changeLanguage('jp')` is called, all translated text updates to Japanese, and the selection is persisted to localStorage

### Requirement: TopNav integration
The LanguageSwitcher component SHALL be rendered within the TopNav component alongside search, notifications, and user profile.

#### Scenario: LanguageSwitcher position
- **WHEN** the TopNav renders
- **THEN** the LanguageSwitcher appears in the top navigation bar
