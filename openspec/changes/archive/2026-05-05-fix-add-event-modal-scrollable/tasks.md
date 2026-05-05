## 1. Styles (Calendar.module.scss)

- [x] 1.1 Update `.modalCard`: add `max-height: 90vh`, `min-height: 0`, `overflow: hidden`. Remove `gap: 20px` and `padding: 24px` (padding moves to per-region rules). Keep `max-width: 480px`, `width: 100%`, `display: flex`, `flex-direction: column`.
- [x] 1.2 Add `.modalHeader` rule: `padding: 24px 24px 16px`, `border-bottom: 1px solid var(--color-border)`, `flex: 0 0 auto`.
- [x] 1.3 Add `.modalBody` rule: `padding: 20px 24px`, `display: flex`, `flex-direction: column`, `gap: 20px`, `overflow-y: auto`, `flex: 1 1 auto`, `min-height: 0`.
- [x] 1.4 Add `.modalFooter` rule: `padding: 16px 24px 24px`, `border-top: 1px solid var(--color-border)`, `flex: 0 0 auto`, `display: flex`, `justify-content: flex-end`, `gap: 12px`.

## 2. Markup (AddEventModal.tsx)

- [x] 2.1 Move the existing `<h2 id="add-event-modal-title">` into a `<div className={styles.modalHeader}>` wrapper as the first child of `.modalCard`.
- [x] 2.2 Inside the `<form>`, wrap all field blocks (Image upload, Event Title, All Day toggle, Start Date, Time inputs, End Date, Location, Organizer, Guests) in a single `<div className={styles.modalBody}>` so they are the scroll container.
- [x] 2.3 Replace the existing buttons row's classes (`flex justify-end gap-3`) with `className={styles.modalFooter}` so it becomes the sticky footer. Keep this `<div>` inside the `<form>` so the Save button still submits natively.
- [x] 2.4 Remove the now-redundant `flex flex-col gap-5` classes from the `<form>` element (the body owns gap; form just composes body + footer in a flex column).
- [x] 2.5 Make the `<form>` a flex column that fills the remaining card height: add `className={styles.modalForm}` (new rule below) or apply utility classes; ensure `min-height: 0` propagates so the body can scroll.
- [x] 2.6 Add `.modalForm` rule in Calendar.module.scss: `display: flex`, `flex-direction: column`, `flex: 1 1 auto`, `min-height: 0`.

## 3. Verification

- [x] 3.1 Run `yarn lint` — expect zero new warnings.
- [x] 3.2 Run `yarn build` — expect a clean type-check + production build.
- [x] 3.3 Run `yarn test` — confirm all existing Calendar tests still pass (no test changes expected; no new testable units introduced).
- [x] 3.4 Manual smoke test: open Calendar, click "+ Add New Event", resize browser to ~600px height. Confirm: card never exceeds viewport, header and footer stay visible, fields scroll between them, Cancel/Save are always reachable, dividers visible in light/dark/forest themes, Tab/Shift-Tab cycles through fields without escaping the modal, Escape closes the modal, image upload + participant input still work.
