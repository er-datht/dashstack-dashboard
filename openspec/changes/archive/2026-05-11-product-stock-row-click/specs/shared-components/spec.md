## ADDED Requirements

### Requirement: TableCommon keyboard activation when onRowClick is provided

When the `TableCommon<T>` component is rendered with the optional `onRowClick?: (item: T) => void` prop, each rendered row `<tr>` SHALL receive `tabIndex={0}` and an `onKeyDown` handler that invokes `onRowClick(item)` when the user presses **Enter** or **Space** while the row is focused. The handler SHALL call `event.preventDefault()` on Space (and ONLY on Space) before invoking `onRowClick`, so that the browser does not scroll the page. The rendered `<tr>` SHALL remain a semantic `<tr>` element — NO `role="button"`, `role="row"`, `role="grid"`, or `role="gridcell"` attribute SHALL be added by this requirement. When `onRowClick` is NOT provided, the rendered DOM for each row SHALL be byte-identical to the behavior prior to this requirement: no `tabIndex` attribute, no `onKeyDown` handler, and no row-level focus or keyboard behavior.

#### Scenario: Enter activates row when onRowClick is provided

- **WHEN** `TableCommon` is rendered with an `onRowClick` callback AND the user focuses a row and presses Enter
- **THEN** the `onRowClick` callback is invoked exactly once with the focused row's item

#### Scenario: Space activates row and prevents default scroll when onRowClick is provided

- **WHEN** `TableCommon` is rendered with an `onRowClick` callback AND the user focuses a row and presses Space
- **THEN** the `onRowClick` callback is invoked exactly once with the focused row's item AND `event.preventDefault()` is called so the browser does not scroll the page

#### Scenario: Other keys do not activate the row

- **WHEN** `TableCommon` is rendered with an `onRowClick` callback AND the user focuses a row and presses any key other than Enter or Space (e.g., Tab, Escape, ArrowDown, the letter `a`)
- **THEN** the `onRowClick` callback is NOT invoked and the default browser behavior for that key is preserved

#### Scenario: tabIndex is set when onRowClick is provided

- **WHEN** `TableCommon` is rendered with an `onRowClick` callback
- **THEN** each rendered row `<tr>` has `tabIndex="0"` in the DOM

#### Scenario: No tabIndex and no keydown handler when onRowClick is absent

- **WHEN** `TableCommon` is rendered WITHOUT an `onRowClick` callback (i.e., the prop is omitted or `undefined`)
- **THEN** each rendered row `<tr>` has NO `tabIndex` attribute in the DOM AND pressing Enter or Space on a row does not trigger any callback

#### Scenario: Row remains a semantic tr element

- **WHEN** `TableCommon` is rendered with an `onRowClick` callback
- **THEN** each rendered row is a `<tr>` element with NO `role="button"`, `role="row"`, `role="grid"`, or `role="gridcell"` attribute added by this component
