# Writing style

Shared by the `pr`, `bug-ticket` and `task-ticket` skills — everything written for a human to read, rather than for the codebase.

- Write everything in **English**. English is this repo's source language; the `jp`
  locale is a translation of it.
- Use plain English, avoid jargon.
- Write for a reader who has not read the code: state the behavior **before and after**, not just the code change.

## Naming things precisely

- **Identify a UI string by its i18n key, not by what it renders as.** `products:outOfStock`
  is exact; "Out of Stock" and "在庫切れ" are two renderings of it, and a ticket that
  names only one of them is ambiguous about which locale broke. Give the key, then
  the English rendering in quotes if it helps — e.g. `products:outOfStock` ("Out of
  Stock").
- **Verify every key before using it.** Grep `public/locales/en/<namespace>.json`;
  if the key is not there, you guessed it. There are 21 namespace pairs under
  `public/locales/` and `en`/`jp` are key-for-key parallel — a key missing from
  either side is itself the bug, so say so rather than quietly using the other one.
- **Quote a Japanese label verbatim** when the point is jp-specific — layout
  overflow, a truncation, a missing translation. Copy it from
  `public/locales/jp/<namespace>.json`, never transliterate or translate it back,
  and pair it with the English on first use: `在庫切れ` (Out of Stock).
- Point at code as `path/to/file.tsx:42` — it is exact and clickable.
- Name the **theme** and **locale** for any visual claim. "The ring is invisible" is
  incomplete; "the ring is invisible in forest, both locales" is a bug report.

## Section content

- Short, but complete. Cut words, never facts — keep every file path, i18n key,
  route, component name, theme name and measured value (px, resolved colour).
- One idea per bullet, one line per bullet. Split a bullet that needs an "and".
- Plain statements only. No filler openers ("This PR aims to…"), no restating the
  title, no repeating the same point in two sections.
- Never pad a section to make it look full — an empty section beats a guessed one
  (see `accuracy.md`).
