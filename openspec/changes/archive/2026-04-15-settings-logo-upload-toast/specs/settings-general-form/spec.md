## MODIFIED Requirements

### Requirement: Logo upload area
The Settings page SHALL display a centered logo upload area. After a valid image is successfully selected (via click or drag & drop), a success toast notification SHALL appear.

#### Scenario: Toast shown after logo upload via click
- **WHEN** the user selects a valid image file via the file picker
- **THEN** a success toast with localized "Logo uploaded successfully" text SHALL appear
- **AND** the toast SHALL auto-dismiss after 3 seconds

#### Scenario: Toast shown after logo upload via drag & drop
- **WHEN** the user drops a valid image file onto the upload area
- **THEN** a success toast with localized "Logo uploaded successfully" text SHALL appear

#### Scenario: No toast on invalid file
- **WHEN** the user selects or drops an invalid file (wrong type or too large)
- **THEN** no toast SHALL appear

### Requirement: Save button with loading and toast
The save success toast SHALL continue to work as before, reusing the same toast element with a different message.

#### Scenario: Save toast still works
- **WHEN** the user clicks Save with valid data
- **THEN** the toast SHALL show the "Settings saved successfully" message
