## Context

The Calendar page's Add/Edit Event modal captures title, dates, location, and organizer. The `CalendarEvent` type already includes a `participants: Participant[]` array, and the `EventDetailPopover` renders participants and a static image placeholder. The modal needs to expose image upload and participant management to fully utilize the existing data model.

## Goals / Non-Goals

**Goals:**
- Allow users to upload and preview a background image for an event via the modal
- Allow users to add/remove participants by name in the modal
- Persist image and participant data through the save flow to `CalendarEvent` state
- Display uploaded images in the `EventDetailPopover`
- Display event creator avatars as circular thumbnails in the `EventsSidebar`
- Support drag-and-drop for image upload
- Enforce a 5MB file size limit on uploaded images

**Non-Goals:**
- Server-side image storage or CDN upload (images stored as data URLs in client state)
- Image cropping, resizing, or editing tools
- Participant search/autocomplete against a user directory
- Avatar upload for individual participants

## Decisions

### 1. Image storage as data URL
Store the uploaded image as a base64 data URL string in an optional `image?: string` field on `CalendarEvent`. This keeps things simple with no server dependency. Alternative considered: blob URLs — rejected because they don't survive state serialization and are tied to the page session.

### 2. Participant input as tag-style chips
Use a text input with Enter/comma to add participants, rendered as removable chips/tags above or below the input. Each new participant gets a generated UUID. Alternative considered: textarea with comma-separated names — rejected because it's harder to edit individual entries and provides worse UX.

### 3. Native file input with drag-and-drop for image upload
Use a hidden `<input type="file" accept="image/*">` triggered by a clickable upload area, plus `onDragOver`/`onDrop` handlers on the upload zone. The `FileReader` API converts to data URL for preview and storage. Files are validated for type (`image/*`) and size (max 5MB) before processing. No third-party upload library needed.

### 4. Extend onSave callback
Add `image` and `participants` to the `onSave` data shape. The parent `Calendar` component will pass these through to event creation/update.

### 5. Image state semantics on edit
When the modal opens in edit mode, the image state is pre-populated from `editEvent.image`. The modal always passes the current image state through `onSave`. If the user doesn't touch the image, the original data URL is passed through and preserved. If the user explicitly clicks remove, the state is set to `undefined`. This eliminates ambiguity between "not touched" and "explicitly cleared".

## Risks / Trade-offs

- **Large images bloat client state** → Mitigated with 5MB file size limit. Acceptable for a demo/dashboard app with local state. In production, would need server upload + URL reference.
- **Participant names are free-text** → No deduplication or validation. Acceptable for this scope.
