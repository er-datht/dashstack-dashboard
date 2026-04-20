## MODIFIED Requirements

### Requirement: Required field validation
Site Name, Copyright, SEO Title, and SEO Keywords SHALL be required fields. SEO Description is optional. Each required field label SHALL display a red asterisk (`*`) indicator using theme-aware `text-error` styling to visually distinguish required fields from optional ones before form submission.

#### Scenario: Required field left empty on save
- **WHEN** the user clicks Save with a required field empty
- **THEN** the empty required field SHALL show a visual error indicator
- **AND** the form SHALL NOT proceed with the save action

#### Scenario: Required fields show asterisk indicator
- **WHEN** the Settings page loads
- **THEN** the labels for Site Name, Copyright, SEO Title, and SEO Keywords SHALL each display a red asterisk (`*`) after the label text
- **AND** the SEO Description label SHALL NOT display an asterisk
