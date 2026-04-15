## MODIFIED Requirements

### Requirement: Supported language registration
The i18n system SHALL register exactly two supported languages: English (`en`) and Japanese (`jp`). Korean (`ko`) SHALL NOT be registered.

#### Scenario: i18n config contains only en and jp
- **WHEN** the i18n configuration is initialized
- **THEN** `supportedLngs` contains `["en", "jp"]` and `preload` contains `["en", "jp"]`

### Requirement: Language switcher options
The LanguageSwitcher component SHALL display exactly two language options: English and Japanese.

#### Scenario: Language dropdown shows two options
- **WHEN** the user opens the language switcher
- **THEN** only English and Japanese options are available

## REMOVED Requirements

### Requirement: Korean language support
**Reason**: Korean language is being removed from the project.
**Migration**: Users with Korean selected will automatically fall back to English via i18next's `fallbackLng` setting. No manual action required.

#### Scenario: Korean translation files removed
- **WHEN** the application is built
- **THEN** no Korean translation files exist in `public/locales/ko/`

### Requirement: Korean language UI selection
**Reason**: Korean option removed from LanguageSwitcher.
**Migration**: Automatic fallback to English.

#### Scenario: Korean not selectable
- **WHEN** the user opens the language switcher
- **THEN** Korean is not listed as an option
