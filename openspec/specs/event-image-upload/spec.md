### Requirement: Image upload area in event modal
The Add/Edit Event modal SHALL display an image upload area above the form fields that allows users to select an image file via click or drag-and-drop. The upload area SHALL appear above the Event Title field. When no image is selected, the area SHALL display an upload icon and helper text. The area SHALL accept image files only (`image/*`). The upload area SHALL be a non-focusable visual area with a nested button, so the title input remains the first focusable element.

#### Scenario: User clicks to upload an image
- **WHEN** user clicks the upload area
- **THEN** a file picker opens, and upon selecting an image file the image is read as a data URL and a preview is displayed in the upload area

#### Scenario: User drags and drops an image
- **WHEN** user drags an image file over the upload area
- **THEN** the upload area shows a visual drag-over highlight (e.g., border color change)

#### Scenario: User drops a valid image file
- **WHEN** user drops an image file onto the upload area
- **THEN** the image is read as a data URL and a preview is displayed in the upload area

#### Scenario: User drops a non-image file
- **WHEN** user drops a non-image file onto the upload area
- **THEN** the file is rejected and no image is loaded

#### Scenario: User views upload area with no image
- **WHEN** the modal opens for a new event with no image
- **THEN** the upload area displays an upload icon and the translated text for "Upload Image"

#### Scenario: User edits an event with existing image
- **WHEN** the modal opens in edit mode for an event that has an image
- **THEN** the existing image is displayed as a preview in the upload area

#### Scenario: User removes uploaded image
- **WHEN** user clicks a remove/clear button on the image preview
- **THEN** the image is explicitly cleared and the upload area returns to the empty state

### Requirement: Image file size limit
The image upload SHALL enforce a maximum file size of 5MB. Files exceeding this limit SHALL be rejected with an error message.

#### Scenario: User uploads an image larger than 5MB
- **WHEN** user selects or drops an image file larger than 5MB
- **THEN** the file is not loaded, and a translated error message is displayed indicating the file is too large

#### Scenario: User uploads an image within size limit
- **WHEN** user selects or drops an image file of 5MB or less
- **THEN** the image is accepted and processed normally

### Requirement: Image data persisted on save
The `CalendarEvent` type SHALL include an optional `image?: string` field. When the user saves an event with an uploaded image, the image data URL SHALL be stored in this field. The modal SHALL always pass the current image state through `onSave` — if the user opens edit mode with an existing image and doesn't touch it, the existing data URL SHALL be passed through and preserved.

#### Scenario: Save event with image
- **WHEN** user uploads an image and clicks Save
- **THEN** the `onSave` callback includes the image data URL, and the event state is updated with the image

#### Scenario: Save event without image (new event)
- **WHEN** user saves a new event without uploading an image
- **THEN** the `onSave` callback includes `image` as `undefined`

#### Scenario: Edit event without changing image preserves existing image
- **WHEN** user edits an event with an existing image and saves without changing it
- **THEN** the existing image data URL is passed through `onSave` and preserved in the event state

#### Scenario: Edit event and explicitly remove image
- **WHEN** user edits an event, clicks the remove button to clear the image, and saves
- **THEN** the `onSave` callback includes `image` as `undefined`, clearing the previously stored image

### Requirement: Event detail popover displays uploaded image
The `EventDetailPopover` SHALL display the event's uploaded image in the image area instead of the static placeholder when an image exists.

#### Scenario: Popover shows uploaded image
- **WHEN** user clicks on an event that has an uploaded image
- **THEN** the popover image area displays the uploaded image

#### Scenario: Popover shows placeholder for events without image
- **WHEN** user clicks on an event that has no uploaded image
- **THEN** the popover image area displays the default placeholder background

### Requirement: Events sidebar displays event creator avatar
The `EventsSidebar` SHALL display the event creator's avatar as a circular thumbnail next to each event entry. The avatar is derived from the event's `organizer` field, not from the uploaded event image.

#### Scenario: Sidebar shows creator avatar
- **WHEN** the sidebar renders an event that has an organizer with an avatar
- **THEN** the circular thumbnail area displays the organizer's avatar image (object-fit cover)

#### Scenario: Sidebar shows fallback for organizer without avatar
- **WHEN** the sidebar renders an event whose organizer has no avatar
- **THEN** the circular thumbnail area displays a default placeholder (e.g., initials or generic user icon)
