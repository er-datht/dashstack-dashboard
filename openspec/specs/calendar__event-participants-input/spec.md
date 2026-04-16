### Requirement: Participants input field in event modal
The Add/Edit Event modal SHALL include a participants input section below the Organizer field. Users SHALL be able to type a participant name and press Enter or comma to add them. Each added participant SHALL appear as a removable chip/tag.

#### Scenario: User adds a participant
- **WHEN** user types a name in the participants input and presses Enter or comma
- **THEN** a new participant chip is created with the entered name and a generated ID, the input is cleared, and the chip is displayed in the participants area

#### Scenario: User removes a participant
- **WHEN** user clicks the remove button (X) on a participant chip
- **THEN** the participant is removed from the list

#### Scenario: User tries to add empty participant
- **WHEN** user presses Enter or comma with an empty or whitespace-only input
- **THEN** no participant is added and the input remains empty

#### Scenario: Edit mode loads existing participants
- **WHEN** the modal opens in edit mode for an event with existing participants
- **THEN** all existing participants are displayed as chips in the participants area

### Requirement: Participants data persisted on save
When the user saves an event, the `onSave` callback SHALL include the current list of participants. The parent component SHALL store participants in the `CalendarEvent` state.

#### Scenario: Save event with participants
- **WHEN** user adds participants and clicks Save
- **THEN** the `onSave` callback includes the `participants` array with all added participants

#### Scenario: Save event with no participants
- **WHEN** user saves an event without adding any participants
- **THEN** the `onSave` callback includes an empty `participants` array

#### Scenario: Edit event and modify participants
- **WHEN** user edits an event, adds or removes participants, and saves
- **THEN** the updated `participants` array replaces the previous one in the event state

### Requirement: i18n support for new fields
All new labels (image upload text, participants label, chip remove aria-label) SHALL use i18n translation keys from the `calendar` namespace.

#### Scenario: Labels render in selected language
- **WHEN** the app language is set to en or jp
- **THEN** the image upload text and participants label display in the selected language
