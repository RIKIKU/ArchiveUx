# ArchiveUx design system: the rules

For agents building PagerArchive, RadioArchive or any other archive app. The rules are normative: **must** means CI or review fails you, **should** means do it unless the rule's reason doesn't apply and you say why in the pull request.

The tokens are in `src/tokens.css`; the base styles in `src/base.css`; the pairings the contrast check measures in `contrast/pairs.json`; the gallery (`npm run gallery`) shows all of it in each look and theme. Decisions are in `docs/adr`.

## 1. Using tokens

1. Every value that styles the UI (colour, size, space, radius, font, shadow, layer) **must** be a token: components use `var(--name)` and nothing else. No hex, no `px`/`rem` literals in components. Exception: `0`, `100%`, `auto`, `none`, `inherit`, `currentColor`.
2. A colour token **must** only be drawn in the pairings this document allows (section 2). A new pairing **must** be added to `contrast/pairs.json` in the same pull request, so CI measures it.
3. There are two **looks**, Harbour (the default) and Console, each in **light** and **dark**. The app sets `data-look="console"` on `<html>` for Console (none for Harbour) and `data-theme="light"` or `"dark"` to override the system theme (none follows the system). Never test which look is on to choose a colour in a component: choose the token, and the look supplies its value.
4. Colours are written once as `light-dark(light, dark)`. A new colour token **must** be set in both looks (Console sets every token Harbour sets; `npm run check:tokens` fails otherwise) and in both themes.
5. A new token needs a purpose (one line in its comment in `tokens.css`), and, if it's a colour, its pairings here and in `pairs.json`.
6. App-specific tokens live in the app, follow the same rules, and the app checks them. Decided (owner, 2026-11-20): the only ones are PagerArchive's map tokens (`--map-*`, `--detail-map-width`, `--area-tag-*`); every other token is ArchiveUx's.

Example:

```css
/* Good: tokens only, an allowed pairing (text on its surface). */
.card { background: var(--surface); color: var(--fg); padding: var(--space-lg); border-radius: var(--radius); }

/* Bad: a literal colour, and --muted on --accent-soft, which is no allowed pairing. */
.card { background: #fff; }
.tag { background: var(--accent-soft); color: var(--muted); }
```

## 2. Colour tokens: purpose and allowed pairings

"On" lists the backgrounds a foreground may be drawn on. Anything not listed is not allowed. Kind: **text** 4.5:1, **edge** 3:1, **notice** 4.5:1 (section 3).

### Surfaces

| Token | Purpose |
|---|---|
| `--bg` | The page. Also the tooltip's text (on `--fg`). |
| `--surface` | Cards, the side menu, the bottom bar, the top bar. |
| `--surface-2` | Panes, form fields, secondary buttons, popovers, dialogs. **Never** a foreground and never the only thing that sets an element apart from `--bg` (in dark it is about 1.1:1 against it). |
| `--hover` | A hovered row, menu item, ghost or secondary button. |
| `--highlight` | What's new: a row just arrived, the release notice's fill, the release landing. |
| `--scrim` | Behind a modal dialog or sheet (see-through). Nothing is drawn on it. |
| `--icon-tile` | A light tile behind uploaded artwork, so dark artwork shows in both themes. |
| `--print-bg` | A printed sheet (white in every look and theme). |

### Text and marks

| Token | Purpose | On | Kind |
|---|---|---|---|
| `--fg` | Body text | `--bg`, `--surface`, `--surface-2`, `--hover`, `--highlight`, `--accent-soft`, plain and priority rows | text |
| `--muted` | Secondary text: times, hints, headings of groups | `--bg`, `--surface`, `--surface-2`, `--hover`, rows | text |
| `--accent` | Links; the selected row's ring | `--bg`, `--surface`, `--surface-2`, `--highlight`, rows | text |
| `--accent` | A switch that's on, a ticked box | `--surface-2` | edge |
| `--accent-fg` | Primary button text | `--accent`, `--accent-hover`, `--accent-pressed` | text |
| `--accent-soft-fg` | The current page in a menu, a pressed secondary button | `--accent-soft` | text |
| `--danger-fg` | Danger button text | `--danger`, `--danger-hover` | text |
| `--danger-text` | Error messages | `--bg`, `--surface`, `--surface-2` | text |
| `--warn-fg` | Warnings, caveats, flags | `--warn-bg` | text |
| `--ok-fg` | The Live dot | `--bg`, `--surface` | edge |
| `--heartbeat-fg` | A heartbeat page's label | `--bg`, `--surface` | text |
| `--focus` | The focus ring | `--bg`, `--surface`, `--surface-2`, `--highlight` | edge |
| `--control-border` | Borders of inputs, outlined buttons, popovers | `--bg`, `--surface`, `--surface-2` | edge |
| `--border` | Dividers between rows and around cards. **Decoration only**: it may never be the only thing that shows a control, its boundary or its state (WCAG 1.4.11 doesn't apply to it, so it isn't measured). | any surface | none |
| `--notice-edge` | A notice's edge and countdown line; the release landing's ring | edge on `--bg` (notice); line on `--highlight` (edge); ring on `--surface` (edge) | notice / edge |
| `--alert-edge` | The edge of an alert that stays (an admin's backup or upgrade alert) | `--bg` (notice); `--surface` (edge) | notice / edge |
| `--heat-0-fg`..`--heat-4-fg` | The count written in each heat shade (see Charts) | its own step, `--heat-0`..`--heat-4` | text |
| `--print-fg` | A printed sheet's text and rules | `--print-bg` | text |

### Fills that carry their own text

| Token (fill) | Its text | Purpose |
|---|---|---|
| `--accent`, `--accent-hover`, `--accent-pressed` | `--accent-fg` | Primary button, its hover and press |
| `--accent-soft` | `--accent-soft-fg`, or `--fg` (`.ok`) | Current page, pressed, a saved message |
| `--danger`, `--danger-hover` | `--danger-fg` | Danger button |
| `--warn-bg` | `--warn-fg` | Warnings, caveats, alerts (an alert also has an `--alert-edge`: section 4) |
| `--fg` | `--bg` | Tooltip |
| `--heat-N` (N = 0..4) | `--heat-N-fg`, its own step's | A heat grid's cells, none to most |

### Priorities and rows

Each priority (`emergency`, `nonemergency`, `admin`) has the same set; plain rows have `--plain-row` and `--plain-row-hover`.

| Token | Purpose | On | Kind |
|---|---|---|---|
| `--<p>-bg` | The priority's own colour, as a mark (a map marker, a chart key) | `--bg`, `--surface` | edge |
| `--<p>-row`, `--<p>-row-hover` | The row's fill (transparent: the row is the list's own background, `--bg` or `--surface`) | (background) | |
| `--<p>-edge` | The edge down the row (Console; transparent in Harbour) | the row | edge |
| `--<p>-badge-bg` | The label's fill (transparent in Console) | (background) | |
| `--<p>-badge-fg` | The label's text | `--<p>-badge-bg` | text |
| `--<p>-badge-border` | The label's outline (Console; transparent in Harbour) | the row | edge |
| `--<p>-dot` | The dot in the label (Harbour; Console sets `--badge-dot: none`) | `--<p>-badge-bg` | edge |
| `--fg`, `--muted`, `--accent` | Text, secondary text and links on a row | the row and its hover | text |

A priority **must** also be written in words (the label); colour is never the only cue (WCAG 1.4.1).

### Charts

`--chart-fill` (bars, edge on `--bg`/`--surface`), `--chart-previous` (the previous period's bar, edge), `--chart-text` and `--chart-muted` (labels and values, text on `--bg`/`--surface`), `--chart-grid` (axes; decoration, like `--border`). Every value is also written as text.

**Heat grid** (owner, 2026-11-20). Five shades, `--heat-0` (none) to `--heat-4` (the most); the shades are mixes of `--accent` into `--surface` and don't change. A cell with shade `--heat-N` **must** write its count in `--heat-N-fg`, never `--fg` or `--muted` directly, so the look picks the text that stays 4.5:1 on that shade (`heat-N-text` in `pairs.json`, every look and theme):

| Step | Harbour light | Harbour dark | Console light | Console dark |
|---|---|---|---|---|
| `--heat-0-fg` | `--muted` 7.09 | `--muted` 7.78 | `--muted` 6.70 | `--muted` 7.17 |
| `--heat-1-fg` | `--fg` 14.50 | `--fg` 11.41 | `--fg` 13.58 | `--fg` 11.05 |
| `--heat-2-fg` | `--fg` 12.42 | `--fg` 8.94 | `--fg` 10.84 | `--fg` 7.96 |
| `--heat-3-fg` | `--fg` 10.19 | `--fg` 6.56 | `--fg` 8.06 | `--fg` 5.33 |
| `--heat-4-fg` | `--fg` 8.10 | `--fg` 4.72 | `--fg` 5.63 | `--accent-fg` 4.54 |

Why only one switch: in Harbour's and Console's light themes the shades darken towards a dark accent, and `--fg` (dark) keeps its contrast while a light text would fail (`--bg` is 1.9-3.4:1 on `--heat-4`); in Harbour dark `--fg` still has 4.72:1 on `--heat-4` (`--bg` 3.23). Only Console dark's accent is light ink, so its busiest shade lightens towards `--fg` (3.55:1); there the count is dark. The owner asked for the page background colour; `--bg` measures 4.43:1 there, just under the floor, so it is `--accent-fg` (`#111111`, the accent's own text, 4.54:1). A look whose shades change **must** re-pick these per step so `npm run check:contrast` passes.

## 3. Contrast: the floor

WCAG 2.1 AA, in both looks and both themes, for every app:

- **Text** at least **4.5:1** against its own background (1.4.3). Large text gets no discount here.
- **Edges and controls** at least **3:1** (1.4.11): focus rings, control borders, the marks that carry meaning (priority edges and dots, chart bars, the Live dot, a switch that's on).
- **Must-notice elements** (notices, toasts, alerts, anything that appears on its own) have an **edge of at least 4.5:1 against the page** (`--bg`). Their fill may be close to the page; the edge carries it. Example: the release notice is `--highlight` (about 1.8:1 against the dark page) with a 2 px `--notice-edge` (8.37:1). An admin's alerts that stay (backup, upgrade) are must-notice too (owner, 2026-11-20): `--warn-bg` (1.09-1.48:1 against the page) with a 2 px `--alert-edge`.
- Exempt, as in WCAG: disabled controls, `--border` dividers (decided by the owner, 2026-11-20: decoration, not measured), decoration, logos.

`npm run check:contrast` (in CI) resolves every token for both looks and both themes and measures every pairing in `contrast/pairs.json`. A pairing below its floor fails CI unless it is a **known finding** in `contrast/findings.json`: a failure the owner hasn't decided on yet. Findings are never fixed by quietly changing a value: the look is the owner's. Report them; when the owner decides, change the value and take the finding off (the check fails while a fixed finding is still listed).

Example: a new toast drawn as `--surface-2` on `--bg` with no edge would be added to `pairs.json` as `{ "fg": "surface-2", "on": ["bg"], "kind": "notice" }`, measure 1.1:1 in Harbour dark, and fail. Give it `--notice-edge` instead.

## 4. Component patterns

### Notices and toasts

- One at a time, placed at the bottom: beside the side menu on a desktop (`left: calc(var(--menu-width) + var(--space-lg))`, or `--menu-width-shrunk` when it's shrunk), and above the bottom bar across the width on a phone (under 48rem). It covers no part of the menu or bar.
- Look: fill `--highlight`, text `--fg`, links `--accent`, a `--border-width-strong` edge in `--notice-edge`, `--radius`, `--notice-shadow`, at most `--notice-width`, `--text-sm`.
- **Timing** (the release notice; any notice that leaves by itself **must** follow it):
  - on screen **8 s**;
  - a **countdown line** along its foot (`--notice-countdown-height`, `--notice-edge`) shrinks steadily over the time left; it stays with reduced motion, because it shows the time left;
  - it **waits while touched, hovered or focused**, and so does the line; once released it stays at least 1 s more;
  - **a tap or click anywhere on it closes it**, and Esc closes it from anywhere; there is **no close (X) button**; a finger held on it waits, and lifting it is a tap;
  - leaving: it shrinks into what it's about (350 ms), which then lights up 1.5 s (`.release-landed`: `--highlight` with a `--notice-edge` ring); with reduced motion it fades (150 ms) where it is.
- Announced politely (`aria-live="polite"`), never takes focus; its link is reached with Tab. Not printed.

### Alerts

- Alerts that stay (an admin's backup or upgrade alert) are not toasts and have no timing, but they are must-notice (owner, 2026-11-20).
- Look: fill `--warn-bg`, text and links `--warn-fg`, a `--border-width-strong` edge in `--alert-edge`, `--radius`, padded `--space-sm` `--space-md`. The fill is unchanged from before 0.1.0; the edge carries it.
- `--alert-edge` is its own token with the notice's amber as its value (`var(--notice-edge)`): everything that asks to be noticed wears the same edge, so the user learns one signal, and amber sits with the amber `--warn-bg` fill as one element. A token of its own, because an alert's purpose (something an admin must act on) differs from the release notice's (something new), so either can change without the other. Against the page: Harbour light 5.56, Harbour dark 8.37, Console light 5.93, Console dark 8.40; on a card (`--surface`) 5.93, 7.70, 5.24, 7.77.
### Page rows

- A row is a list item across the list's width: `--row-pad-y` top and bottom, `--row-pad-x` at the start, `--row-pad-end` at the end, a `--border-width` `--border` divider below.
- Its priority shows through tokens only: fill `--<p>-row` (hover `--<p>-row-hover`), an edge `--edge-width` wide in `--<p>-edge` down its start, and a label (`--<p>-badge-*`, `--badge-*`) with the priority in words. A row without a priority uses `--plain-row`.
- The whole row is one link target; links inside it rise above it (`--layer-content`). The row open beside the list has an inset ring, `--border-width-strong`, `--accent`. A row that just arrived starts on `--highlight` and fades in 3 s (with reduced motion it stays on `--highlight`, no fade).
- Times in `--muted` and `--font-meta`, tabular numbers; the message text in `--font-page`, `--text-page`.

### Bottom bar (phones)

- Under 48rem only, fixed to the bottom, `--surface`, `--layer-header`, padded by `env(safe-area-inset-bottom)`, a `--border` line above, `--bottom-bar-height` high. Page content keeps that much room at its foot.
- At most four entries, each an icon over a label, each at least `--target` square; the current one is `--accent-soft` with `--accent-soft-fg` (`aria-current="page"`), hover `--hover`.
- The last is **More**: a modal sheet (a `<dialog>`, `--surface-2`, `--control-border` edge, top corners `--radius`, at most `--sheet-height`, `--scrim` behind) with the rest of the menu by group and a Close button; desktop-only pages are left out. The build's version sits at its foot (where the release notice lands on a phone).

### Side menu (desktops)

- 48rem and wider: down the left, `--menu-width`, `--surface`, full height, scrolling on its own, `--layer-header`.
- Groups under headings, each heading a link to its group's start page, each opening and closing; every page has an icon and a label; each entry at least `--target` high; current page `--accent-soft`/`--accent-soft-fg` and `aria-current="page"`; hover `--hover`.
- **Shrunk** (`--menu-width-shrunk`): only the group icons, each with a tooltip and an accessible name; hovering over one or focusing it opens a flyout of its pages (`--flyout-width`, `--surface-2`, `--control-border`, `--layer-overlay`).
- Counts (waiting requests and the like) are pills, `--count-min` wide. The build's version at the very foot (where the release notice lands on a desktop).

### Every control

- At least `--target` high and wide (44 px on touch screens: `--target-coarse`).
- A visible hover, a focus ring (`--focus-width` in `--focus`, `--focus-offset` out, from `:focus-visible` in `base.css`), and a pressed state; only the press moves (`--press-shift`), and not with reduced motion.
- Icons are hidden from assistive technology and never stand alone: a label or a tooltip with the same accessible name.

## 5. Gallery

`npm run gallery` serves it locally; CI builds it, and on `main` publishes it with GitHub Pages. It shows every token as a swatch with its contrast against `--bg` and `--fg`, every pairing with its ratio and result, the samples above (text, buttons, focus rings, an alert, the heat grid with each step's ratio, rows and labels, a working notice), and the other tokens' values, for the look and theme chosen at the top. Its numbers are measured from the page's own computed colours with the same pairs and floors as CI.
