## 1. Setup

- [x] 1.1 Install `react-calendar` with pinned version (6.0.1; types are bundled, no @types needed)
- [x] 1.2 Import react-calendar base CSS where needed

## 2. Shared Theme Styling

- [x] 2.1 Add react-calendar CSS overrides using CSS custom properties for light/dark/forest themes (navigation, tiles, hover/active states, today highlight, selected state)

## 3. CalendarHeader Date Picker

- [x] 3.1 Add `currentDate` and `onDateSelect` props to CalendarHeader
- [x] 3.2 Make date label clickable with toggle state for picker visibility
- [x] 3.3 Render react-calendar in absolutely-positioned popup below the label
- [x] 3.4 Wire date selection: call `onDateSelect` and close popup on day click
- [x] 3.5 Add click-outside dismiss (ref + mousedown listener)
- [x] 3.6 Add Escape key dismiss
- [x] 3.7 Pass `currentDate` and `onDateSelect` from Calendar/index.tsx to CalendarHeader

## 4. Orders DateFilterPopup

- [x] 4.1 Replace custom 42-cell grid in DateFilterPopup with react-calendar
- [x] 4.2 Wire multi-date toggle selection via `onClickDay` + `tileClassName`
- [x] 4.3 Keep "Apply Now" footer and external API unchanged
- [x] 4.4 Remove now-unused custom grid code and helper functions

## 5. Verification

- [x] 5.1 Test CalendarHeader picker across all 3 views (Day/Week/Month) and all 3 themes
- [x] 5.2 Test Orders DateFilterPopup multi-select and apply flow
- [x] 5.3 Run `yarn build` and `yarn test` to verify no regressions
