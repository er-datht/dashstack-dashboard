## MODIFIED Requirements

### Requirement: Spam toolbar buttons unchanged
The Spam folder toolbar SHALL display 4 buttons: ShieldCheck "Not Spam" (bulk restore), Archive (bulk archive), Info, and Trash. The Not Spam button SHALL restore selected spam messages. The Archive button SHALL archive selected spam messages. The Info button SHALL show message info. The Trash button SHALL show "Coming soon" toast.

#### Scenario: Toolbar shows 4 buttons on spam folder
- **WHEN** user is viewing the Spam folder
- **THEN** the toolbar displays 4 buttons: Not Spam (ShieldCheck), Archive, Info, Trash

#### Scenario: Toolbar Archive on spam folder archives selected messages
- **WHEN** user selects messages in the Spam folder and clicks the toolbar Archive button
- **THEN** the selected messages are archived and the selection is cleared

#### Scenario: Toolbar Archive on spam folder with no selection
- **WHEN** user clicks the toolbar Archive button with no messages selected in the Spam folder
- **THEN** a "No messages selected" toast is displayed

### Requirement: Clicking a spam item opens ChatView
When user clicks a message row in the Spam folder, the right panel SHALL switch to the ChatView displaying a conversation for that message. The ChatView header SHALL include a "Not Spam" (ShieldCheck) button alongside Archive, Info, and Trash buttons. Clicking "Not Spam" SHALL restore the message from spam and navigate back to the message list. The Archive button SHALL archive the message from spam.

#### Scenario: Spam message ChatView shows Not Spam button
- **WHEN** user clicks a message row in the Spam folder to open ChatView
- **THEN** the ChatView header displays a ShieldCheck "Not Spam" button

#### Scenario: ChatView Not Spam restores message
- **WHEN** user clicks the "Not Spam" button in the ChatView header on a spam message
- **THEN** the message is restored from spam and the view navigates back to the message list

#### Scenario: ChatView Archive on spam message
- **WHEN** user clicks the Archive button in the ChatView header on a spam message
- **THEN** the message is archived
