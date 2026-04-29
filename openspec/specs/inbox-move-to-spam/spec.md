# inbox-move-to-spam Specification

## Purpose
Allow users to move messages to a Spam folder from eligible folders (Inbox, Starred, Sent) via per-row buttons or bulk toolbar action, with localStorage persistence and restore support.

## Requirements

### Requirement: SpammedMessage type and localStorage persistence
The system SHALL define a `SpammedMessage` type with fields: `id` (string), `senderName` (string), `labelId` (string), `subject` (string), `time` (string), and `sourceFolder` (string — `"inbox"`, `"sent"`, or `"starred"`). For messages spammed from the sent folder, the type SHALL additionally include `recipientEmail` (string), `body` (string), and `sentAt` (string). Spammed messages SHALL be persisted in localStorage under the key `"inbox-spammed-messages"` using the `useLocalStorage` hook, and SHALL survive page refresh.

#### Scenario: Spam state persists across refresh
- **WHEN** user moves a message to spam and refreshes the page
- **THEN** the spammed message is still present in the Spam folder view and absent from its source folder

### Requirement: Per-row spam button on eligible folders
Each message row SHALL display an `AlertTriangle` icon button when the active folder is one of: `inbox`, `starred`, `sent`. The button SHALL be positioned between the Archive button and the Trash2 button. Clicking the spam button SHALL move the message to spam (add it to `spammedMessages` localStorage) and remove it from the current folder view. The button SHALL NOT appear on `draft`, `important`, `spam`, `bin`, or `archive` folder rows.

#### Scenario: Spam button visible on inbox row
- **WHEN** user is viewing the Inbox folder
- **THEN** each message row displays an AlertTriangle spam button between Archive and Trash2

#### Scenario: Spam button visible on starred row
- **WHEN** user is viewing the Starred folder
- **THEN** each message row displays an AlertTriangle spam button between Archive and Trash2

#### Scenario: Spam button visible on sent row
- **WHEN** user is viewing the Sent folder
- **THEN** each message row displays an AlertTriangle spam button between Archive and Trash2

#### Scenario: Spam button not visible on important row
- **WHEN** user is viewing the Important folder
- **THEN** rows do not display a spam button

#### Scenario: Spam button not visible on draft row
- **WHEN** user is viewing the Draft folder
- **THEN** rows do not display a spam button

#### Scenario: Spam button not visible on spam row
- **WHEN** user is viewing the Spam folder
- **THEN** rows do not display a spam button (they show "Not Spam" instead)

#### Scenario: Single spam moves message to spam folder
- **WHEN** user clicks the AlertTriangle spam button on a message row in the Inbox folder
- **THEN** the message disappears from the Inbox list, appears in the Spam folder, and the spam count increments by 1

### Requirement: Bulk spam via toolbar
The toolbar SHALL display an `AlertTriangle` button between the Info button and the Trash2 button when the active folder is one of: `inbox`, `starred`, `sent`. Clicking the button SHALL move all checkbox-selected messages to spam. After bulk spam, the selection state SHALL be cleared and a toast SHALL confirm the action. When no messages are selected, the button SHALL show a "No messages selected" toast. The spam toolbar button SHALL NOT appear on folders that are not spam-eligible.

#### Scenario: Bulk spam with multiple selected messages
- **WHEN** user checks 3 message checkboxes and clicks the toolbar spam button in the Inbox folder
- **THEN** all 3 messages are moved to spam, the selection is cleared, and the spam count increments by 3

#### Scenario: Bulk spam with no selection
- **WHEN** user clicks the toolbar spam button with no checkboxes selected in an eligible folder
- **THEN** a "No messages selected" toast is displayed

#### Scenario: Toolbar spam button not visible on non-eligible folder
- **WHEN** user is viewing the Draft folder
- **THEN** the toolbar does not display a spam button

### Requirement: Exclude spammed messages from source folders
Messages that have been moved to spam SHALL NOT appear in their source folder views (Inbox, Starred, Sent). The exclusion SHALL be based on matching message IDs against the `spammedMessages` array.

#### Scenario: Spammed inbox message hidden from inbox
- **WHEN** user moves a message to spam from the Inbox folder
- **THEN** that message no longer appears in the Inbox folder list

#### Scenario: Spammed sent message hidden from sent
- **WHEN** user moves a sent message to spam
- **THEN** that message no longer appears in the Sent folder list

#### Scenario: Spammed starred message hidden from starred
- **WHEN** user moves a starred message to spam from the Inbox folder
- **THEN** that message no longer appears in the Starred folder view

### Requirement: Starred state preservation through spam/restore
When a starred message is moved to spam, its `starredIds` entry SHALL be preserved. When a spammed message is restored via "Not Spam", its starred state SHALL be intact.

#### Scenario: Starred message retains star after restore
- **WHEN** user stars a message, moves it to spam, then marks it "Not Spam"
- **THEN** the restored message still appears as starred in the message list and in the Starred folder

### Requirement: Spam translations for move action
Translation keys `list.moveToSpam` and `list.movedToSpam` SHALL exist in both `en/inbox.json` and `jp/inbox.json` for the spam button aria-label and spam toast respectively.

#### Scenario: Translations exist in English
- **WHEN** the app is in English locale
- **THEN** the spam button and confirmation toast display English text

#### Scenario: Translations exist in Japanese
- **WHEN** the app is in Japanese locale
- **THEN** the spam button and confirmation toast display Japanese text
