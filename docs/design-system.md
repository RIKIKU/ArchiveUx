# ArchiveUx design system: the rules

For agents building PagerArchive, RadioArchive or any other archive app. The rules are normative: **must** means CI or review fails you, **should** means do it unless the rule's reason doesn't apply and you say why in the pull request.

The tokens are in `src/tokens.css`; the base styles in `src/base.css`; the Svelte components in `src/components` (the frame, 0.3.0; `DateRange` and `Suggest`, 0.4.0; the admin pages' `StateBadge`, `Banner`, `DataTable`, `Confirm` and `MoreActions`, 0.5.0), with `archiveux/dates.js`; the pairings the contrast check measures in `contrast/pairs.json`; the gallery (`npm run gallery`) shows all of it in each look and theme. Decisions are in `docs/adr`.

## 1. Using tokens

1. Every value that styles the UI (colour, size, space, radius, font, shadow, layer) **must** be a token: components use `var(--name)` and nothing else. No hex, no `px`/`rem` literals in components. Exception: `0`, `100%`, `auto`, `none`, `inherit`, `currentColor`.
2. A colour token **must** only be drawn in the pairings this document allows (section 2). A new pairing **must** be added to `contrast/pairs.json` in the same pull request, so CI measures it.
3. There are two **looks**, Harbour (the default) and Console, each in **light** and **dark**. The app sets `data-look="console"` on `<html>` for Console (none for Harbour) and `data-theme="light"` or `"dark"` to override the system theme (none follows the system). Never test which look is on to choose a colour in a component: choose the token, and the look supplies its value.
4. Colours are written once as `light-dark(light, dark)`. A new colour token **must** be set in both looks (Console sets every token Harbour sets; `npm run check:tokens` fails otherwise) and in both themes.
5. A new token needs a purpose (one line in its comment in `tokens.css`), and, if it's a colour, its pairings here and in `pairs.json`.
6. App-specific tokens live in the app, follow the same rules, and the app checks them. Decided (owner, 2026-11-20): the only ones are PagerArchive's map tokens (`--map-*`, `--detail-map-width`, `--area-tag-*`); every other token is ArchiveUx's.
7. **The look's first paint** (0.3.0, ADR 0002). The server writes the look on the root of the page it sends, `<html data-look="console">` (every look, Harbour too), so the first paint is already the person's look and no script runs first. The look comes from, in order:
   1. the **parent-domain cookie** the app names, when the apps share one look (a combined deployment), if it holds a known look (`harbour` or `console`);
   2. else the **app's own setting**: a signed-in profile's look, or what this browser chose, kept as the app keeps its other settings;
   3. else **Harbour**.

   A standalone app names no cookie and starts at 2. A look chosen in the account menu applies at once (no reload) and, with a cookie named, is written to it for the other app: `name=look; Domain=<parent>; Path=/; Max-Age=31536000; SameSite=Lax; Secure` (not `HttpOnly`, so either app's page can write it). `archiveux/look.js` is this rule in code (`pickLook`, `lookFromCookies`, `lookCookie`, `lookAttribute`, `applyLook`); a server in another language follows the same steps, and `test/look.test.mjs` holds the cases. The colour theme stays per browser (`data-theme`), as before.

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
| `--muted` | Secondary text: times, hints, headings of groups; a field's hint, and when a conditional field is required (section 5) | `--bg`, `--surface`, `--surface-2`, `--hover`, rows | text |
| `--accent` | Links; the selected row's ring | `--bg`, `--surface`, `--surface-2`, `--highlight`, rows | text |
| `--accent` | The Required tag's text and outline (section 5) | `--bg`, `--surface`, `--surface-2` | text; edge for the outline |
| `--accent` | A switch that's on, a ticked box | `--surface-2` | edge |
| `--accent-fg` | Primary button text | `--accent`, `--accent-hover`, `--accent-pressed` | text |
| `--accent-soft-fg` | The current page in a menu, a pressed secondary button | `--accent-soft` | text |
| `--danger-fg` | Danger button text | `--danger`, `--danger-hover` | text |
| `--danger-text` | Error messages; a field's error under it (section 5) | `--bg`, `--surface`, `--surface-2` | text |
| `--danger-text` | A destructive action in More actions (section 4) | `--surface-2`, `--hover` | text |
| `--control-border` | A neutral state badge's outline (section 4) | `--bg`, `--surface`, `--surface-2`, `--hover` | edge |
| `--danger` | An invalid control's border (`aria-invalid`, section 5) | `--bg`, `--surface`, `--surface-2` | edge |
| `--warn-fg` | Warnings, caveats, flags | `--warn-bg` | text |
| `--ok-fg` | The Live dot, and the Live badge's dot (section 4) | `--bg`, `--surface` | edge |
| `--fg` | The Live badge's word "Live"; the app switcher; the account menu's Sign in | `--bg`, `--surface`; the switcher on `--bg`, `--hover`; Sign in on `--surface-2`, `--hover` | text |
| `--muted` | The Behind badge's words and its hollow ring (section 4) | `--bg`, `--surface` | text; edge for the ring |
| `--led-red`, `--led-orange`, `--led-yellow`, `--led-green`, `--led-cyan`, `--led-blue`, `--led-purple`, `--led-pink` | An LED: a lit mark beside a name (see LEDs) | `--bg`, `--surface`, `--hover` | edge |
| `--heartbeat-fg` | A heartbeat page's label | `--bg`, `--surface` | text |
| `--focus` | The focus ring | `--bg`, `--surface`, `--surface-2`, `--highlight` | edge |
| `--control-border` | Borders of inputs, outlined buttons, popovers | `--bg`, `--surface`, `--surface-2` | edge |
| `--border` | Dividers between rows and around cards. **Decoration only**: it may never be the only thing that shows a control, its boundary or its state (WCAG 1.4.11 doesn't apply to it, so it isn't measured). | any surface | none |
| `--notice-edge` | A notice's edge and countdown line; the release landing's ring | edge on `--bg` (notice); line on `--highlight` (edge); ring on `--surface` (edge) | notice / edge |
| `--heat-0-fg`..`--heat-4-fg` | The count written in each heat shade (see Charts) | its own step, `--heat-0`..`--heat-4` | text |
| `--print-fg` | A printed sheet's text and rules | `--print-bg` | text |

### Fills that carry their own text

| Token (fill) | Its text | Purpose |
|---|---|---|
| `--accent`, `--accent-hover`, `--accent-pressed` | `--accent-fg` | Primary button, its hover and press |
| `--accent-soft` | `--accent-soft-fg`, or `--fg` (`.ok`) | Current page, pressed, a saved message; the OK state badge and the info banner (0.5.0) |
| `--danger-soft` | `--danger-text` | An error's soft fill: the Error state badge and the error banner (0.5.0, ADR 0004) |
| `--danger`, `--danger-hover` | `--danger-fg` | Danger button |
| `--warn-bg` | `--warn-fg` | Warnings, caveats, alerts (an alert is the fill only, no edge: section 4); the Delayed badge; the Warning state badge and the warning banner |
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

### LEDs

0.3.0 (ADR 0002), for RadioArchive's talkgroups. Eight named colours, `--led-red`, `--led-orange`, `--led-yellow`, `--led-green`, `--led-cyan`, `--led-blue`, `--led-purple` and `--led-pink`, the same in both looks so a name means one colour, darker in light and brighter in dark. An app stores the **name** (`red`), never a hex value, and draws the mark with `<span class="led" data-led="red" aria-hidden="true"></span>` beside the name it belongs to (`.led` in `base.css`, `--led-size` across, round). It is lit only while its thing is happening (a talkgroup's call playing); an LED that isn't lit isn't drawn.

- **Never the only cue** (WCAG 1.4.1): the name is always beside it, and the mark is hidden from assistive technology.
- Each is an **edge** of at least 3:1 on `--bg`, `--surface` and `--hover` (a hovered row) in every look and theme (`led-*` in `pairs.json`). Lowest of the three:

| LED | Harbour light | Harbour dark | Console light | Console dark |
|---|---|---|---|---|
| red | 4.68 | 5.41 | 4.75 | 5.70 |
| orange | 4.31 | 7.40 | 4.37 | 7.80 |
| yellow | 4.12 | 9.97 | 4.18 | 10.50 |
| green | 4.47 | 7.97 | 4.53 | 8.40 |
| cyan | 4.32 | 8.13 | 4.38 | 8.57 |
| blue | 4.61 | 6.01 | 4.67 | 6.33 |
| purple | 5.06 | 5.94 | 5.13 | 6.26 |
| pink | 4.80 | 6.38 | 4.87 | 6.72 |

- Not on `--surface-2` or a fill that carries its own text: those aren't measured, so an LED isn't drawn there.

## 3. Contrast: the floor

WCAG 2.1 AA, in both looks and both themes, for every app:

- **Text** at least **4.5:1** against its own background (1.4.3). Large text gets no discount here.
- **Edges and controls** at least **3:1** (1.4.11): focus rings, control borders, the marks that carry meaning (priority edges and dots, chart bars, the Live dot, a switch that's on).
- **Must-notice elements** (notices, toasts, anything that appears on its own) have an **edge of at least 4.5:1 against the page** (`--bg`). Their fill may be close to the page; the edge carries it. Example: the release notice is `--highlight` (about 1.8:1 against the dark page) with a 2 px `--notice-edge` (8.37:1).
- **An admin's alerts that stay (backup, upgrade) are not must-notice** (the owner, 2026-11-20, after seeing 0.1.0's alert edge: "The amber edge is very intense. I prefer it without."). They are the `--warn-bg` fill only, with no edge, as before 0.1.0: they are noticed by their place and their wording, not their outline. Their text still meets 4.5:1 (`warn` in `pairs.json`); the fill isn't an edge, so, like a `--border` divider, it isn't measured against the page. Don't give them an edge.
- Exempt, as in WCAG: disabled controls, `--border` dividers (decided by the owner, 2026-11-20: decoration, not measured), decoration, logos.

`npm run check:contrast` (in CI) resolves every token for both looks and both themes and measures every pairing in `contrast/pairs.json`. A pairing below its floor fails CI unless it is a **known finding** in `contrast/findings.json`: a failure the owner hasn't decided on yet. Findings are never fixed by quietly changing a value: the look is the owner's. Report them; when the owner decides, change the value and take the finding off (the check fails while a fixed finding is still listed).

Example: a new toast drawn as `--surface-2` on `--bg` with no edge would be added to `pairs.json` as `{ "fg": "surface-2", "on": ["bg"], "kind": "notice" }`, measure 1.1:1 in Harbour dark, and fail. Give it `--notice-edge` instead.

## 4. Component patterns

### The frame

0.3.0 (ADR 0002). Every page of an app sits in one frame: the **side menu** on desktops (48rem and wider), the **top bar** (the app's start, such as breadcrumbs; its tools, such as a search box; the **app switcher**; the **account menu**), the page itself, and the **bottom bar** on phones instead of the side menu. Two parts are **optional and absent unless the app asks**: the app switcher and the dock. The components are in `archiveux/components` (`Frame`, `Menu`, `BottomBar`, `AccountMenu`, `AppSwitcher`, `LiveBadge`, `Icon`); `Frame` takes each part as a snippet, so an app may put its own in any part.

```svelte
<Frame otherApp={pagerUrl ? { name: 'PagerArchive', href: pagerUrl } : null} dock={listening ? player : undefined} dockLabel="Now playing">
  {#snippet menu()}<Menu brand={{ name: 'RadioArchive', mark: 'RA', href: '/' }} {current} {top} {groups} />{/snippet}
  {#snippet account()}<AccountMenu account={me} bind:theme bind:look onlook={saveLook} signIn="/signin" />{/snippet}
  {#snippet bottomBar()}<BottomBar entries={top} {groups} {current} />{/snippet}
  {#snippet notices()}<ReleaseNotice />{/snippet} <!-- the app's own, placed with .notice-place -->
  {@render children()}
</Frame>
```

The frame sets two tokens on its root for what it holds: `--frame-menu-width` (the side menu as drawn, `--menu-width` or `--menu-width-shrunk`) and `--dock-offset` (the dock's measured height, or none without a dock). The page's `main` has the id `main`, and a "Skip to content" link leads there. Nothing of the frame is printed.

### App switcher

0.3.0 (ADR 0002). For two apps deployed together: a link in the top bar, before the account menu, to the **other app, by name**, opening it **in the same tab**. The app hands the frame the other app's name and address from its own setting (`otherApp: { name, href }`); with none, which is the standalone case, there is **no switcher**, and nothing is discovered at runtime. Look: the `switch` icon then the name, `--fg` on the top bar's `--bg`, `--weight-strong`, `--text-sm`, at least `--target` high, hover `--hover`, pressed `--accent-soft` (`app-switcher` in `pairs.json`). Its accessible name is "Switch to PagerArchive", which holds the words shown (WCAG 2.5.3). `onswitch` lets the app act first (stop audio, say).

### Dock

0.3.0 (ADR 0002). An optional bar the app fills (RadioArchive's now playing and its controls), on every page that passes one (`dock` snippet, and `dockLabel` naming the region, "Now playing").

- **Phones**: fixed above the bottom bar, across the width. **Desktops**: along the foot of the content beside the side menu, as wide as the content whether the menu is shrunk or not; it stays at the foot of the screen while the page scrolls under it. The page keeps room for it at its foot (and for the bottom bar on phones), so nothing is hidden behind it.
- At least `--dock-height` high (it grows with what's in it), `--surface` like the bottom bar, a `--border-width` `--border` line above, padded `--space-sm` and the page's side padding, `--layer-header`. A `<section>` with an accessible name.
- What's in it keeps to the pairs on `--surface`: text `--fg`, secondary text `--muted`, links `--accent`, controls' borders `--control-border`, focus `--focus` (`dock-text`, `dock-muted`, `dock-link`, `dock-control`, `dock-focus`), the Live badge, and LEDs. Its controls follow "Every control": at least `--target`, icon buttons with an accessible name.
- **Notices and toasts sit above it** (next section).

### Account menu

From PagerArchive's; 0.3.0 makes it **work signed out** (ADR 0002), because an app may have people who never sign in (a listener).

- Signed in (`account: { name, email }`): their initials as the button, then who they are, the app's links (`links`: Profile…), Colour theme, Look, the app's extras, and **Sign out**.
- Signed out (`account: null`): an outline of a person as the button ("Account menu, signed out"), "Not signed in", **Sign in** (a link, `signIn="/signin"`, or a callback), and **the colour theme and the look, still choosable**. No Sign out.
- The theme and the look apply at once, without reloading. The look is saved by the app's `onlook`: on the account when signed in, else as the app keeps its other settings, and in the shared look cookie when there is one (section 1, rule 7); if `onlook` throws, the old look comes back and the menu says "Couldn't save the look. Try again."
- Look: a `--surface-2` panel with a `--control-border` edge, entries at least `--target` high, hover `--hover` (`account-signin` in `pairs.json`).

### Live badge

0.3.0 (ADR 0002). Where playback is, always **in words**, so the dot is never the only cue: `<span class="live-badge" data-state="live">Live</span>` (`.live-badge` in `base.css`, or `LiveBadge`; the words from `liveBadge()` in `archiveux/live.js`).

| State | When | Look | Pairs |
|---|---|---|---|
| `live` | within 5 s of the live edge (`LIVE_WITHIN`) | a filled `--ok-fg` dot (`--pulse-size`), "Live" in `--fg`, `--weight-strong` | `live`, `live-text` |
| `behind` | further behind | a hollow ring, `--border-width-strong` `--muted`, "Behind by 12 s" in `--muted` (then "1 min 35 s", "1 h 4 min") | `behind-ring`, `behind-text` |
| `delayed` | a delay an admin set, however close | no dot, "Delayed 5 min" in `--warn-fg` on a `--warn-bg` fill, `--radius-badge` | `delayed-text` |

On `--bg` or `--surface` (the dock). A delayed call is never Live. The app offers a way back to live (Jump to live) while behind; the badge only says where playback is.

### Notices and toasts

- One at a time, placed at the bottom: beside the side menu on a desktop (`left: calc(var(--frame-menu-width) + var(--space-lg))`: `--menu-width`, or `--menu-width-shrunk` when it's shrunk), and above the bottom bar across the width on a phone (under 48rem). It covers no part of the menu or bar. **With a dock, it sits above the dock** (0.3.0): `bottom` adds `--dock-offset`. `.notice-place` in `base.css` places it so, inside the frame (its `notices` snippet), where the frame sets both tokens; outside a frame `--dock-offset` is none and `--frame-menu-width` is `--menu-width`, so a notice placed as before 0.3.0 is where it was.
- Look: fill `--highlight`, text `--fg`, links `--accent`, a `--border-width-strong` edge in `--notice-edge`, `--radius`, `--notice-shadow`, at most `--notice-width`, `--text-sm`.
- **Timing** (the release notice; any notice that leaves by itself **must** follow it):
  - on screen **8 s**;
  - a **countdown line** along its foot (`--notice-countdown-height`, `--notice-edge`) shrinks steadily over the time left; it stays with reduced motion, because it shows the time left;
  - it **waits while touched, hovered or focused**, and so does the line; once released it stays at least 1 s more;
  - **a tap or click anywhere on it closes it**, and Esc closes it from anywhere; there is **no close (X) button**; a finger held on it waits, and lifting it is a tap;
  - leaving: it shrinks into what it's about (350 ms), which then lights up 1.5 s (`.release-landed`: `--highlight` with a `--notice-edge` ring); with reduced motion it fades (150 ms) where it is.
- Announced politely (`aria-live="polite"`), never takes focus; its link is reached with Tab. Not printed.

### Alerts

- Alerts that stay (an admin's backup or upgrade alert) are not toasts and have no timing, and they are not must-notice (section 3): they are noticed by where they sit and what they say.
- Look: fill `--warn-bg`, text and links `--warn-fg`, `--radius`, padded `--space-sm` `--space-md`, and **no edge** (the owner, 2026-11-20: "The amber edge is very intense. I prefer it without."). 0.1.0 gave them a `--border-width-strong` amber `--alert-edge`; 0.1.1 took the edge and the token off.
- **The class is `.banner`** (0.5.0, ADR 0004), or `Banner`, which adds the tone's icon and an optional title. Three tones, each its fill and its own text, all without an edge:

| Tone (`data-tone`) | When | Fill | Text and links | Icon |
|---|---|---|---|---|
| `warning` (the default) | Something needs an admin's eye: the disk filling, a backup old | `--warn-bg` | `--warn-fg` | `warning` |
| `error` | Something failed and the page can't do its job: the server unreachable, a save refused | `--danger-soft` | `--danger-text` | `error` |
| `info` | A fact about the page worth saying once: where things are added | `--accent-soft` | `--accent-soft-fg` | `info` |

  ```html
  <div class="banner" data-tone="error"><p>Couldn't reach the server. The page will try again in a minute.</p></div>
  ```
  ```svelte
  <Banner tone="error" title="Couldn't reach the server" role="alert"><p>The page will try again in a minute.</p></Banner>
  ```
- The words say the tone; the icon is hidden. Links in it take its text colour, underlined and `--weight-strong`. At most `--measure` wide. A banner there when the page opens has no role; one that appears because something just went wrong has `role="alert"` (`role="status"` for good news). A form's problems are not a banner: they go under their fields (section 5).
- Pairs: `banner-warning`, `banner-error`, `banner-info` (text), `banner-focus` (a focused link's ring on each fill). The lowest: the error text 5.66 (Console light), the ring 4.78.

### State badges

0.5.0 (ADR 0004). A thing's state in **a word**: a recorder Connected, a talkgroup Hidden, a job Failed. `<span class="state-badge" data-state="warning">Warning</span>` (`.state-badge` in `base.css`), or `StateBadge` (`state`, and `text` or children; the words default to OK, Warning and Error).

| State | Means | Look | Pair |
|---|---|---|---|
| `ok` | Working, as it should be | `--accent-soft-fg` on `--accent-soft` | `state-ok` |
| `warning` | Working, but look at it | `--warn-fg` on `--warn-bg` | `state-warning` |
| `error` | Not working | `--danger-text` on `--danger-soft` | `state-error` |
| `neutral` | Neither: off, hidden, retired, never seen | `--muted`, a `--border-width` `--control-border` outline, no fill | `state-neutral`, `state-neutral-edge` |

- The word is the cue, never the colour (WCAG 1.4.1), and it is the app's: say what the state is ("Quiet", "Deaf", "Retired") rather than only OK or Warning. A neutral state always has its own word.
- Sized and cased as the priority labels (`--badge-pad-*`, `--radius-badge`, `--badge-case`, `--badge-tracking`, `--text-xs`, `--weight-strong`), so Console writes it in capitals. On `--bg`, `--surface`, `--surface-2` or a hovered row. It is not a control: a badge that does something is a button.
- Lowest: the error 5.66 (Console light), the neutral word 6.19 and its outline 3.36 (Harbour light, on a hovered row).

### Data tables

0.5.0 (ADR 0004). `DataTable`: an admin page's things, one row each (talkgroups, units, accounts, the audit log). Not for a page's own list of records, which is page rows (above).

```svelte
<DataTable caption="Talkgroups" {columns} rows={talkgroups} key={(t) => t.id} bind:sort>
  {#snippet cell(t, column)}<StateBadge state={t.hidden ? 'neutral' : 'ok'} text={t.hidden ? 'Hidden' : 'Listed'} />{/snippet}
  {#snippet actions(t)}
    <a class="button secondary" href="/admin/talkgroups/{t.id}" aria-label="Edit {t.name}">Edit</a>
    <MoreActions label="More actions: {t.name}"><button type="button" class="danger" onclick={() => (asking = t)}>Delete…</button></MoreActions>
  {/snippet}
</DataTable>
```

- **Columns** (`table.js`'s `Column`): `key` (the row's field), `label`, and as needed `sortable`, `firstDir` (`'descending'` for newest or most first), `align: 'end'` (numbers; the table uses tabular figures), `primary` (the row's name: a row header, `th scope="row"`), `custom` (drawn by the `cell` snippet), `value(row)` (what it sorts by, if not `row[key]`) and `text(row)` (what it shows). Every table has a `caption` (its accessible name; `showCaption` to show it).
- **Sorting**: a sortable header is a button with the label and an arrow (`sort-none` in `--muted`; `sort-up` or `sort-down` in `--fg` on the sorted one), and the sorted column has `aria-sort`. Pressing a header sorts by it in its first direction, again reverses it. The change is announced politely ("Sorted by Calls, descending"). Text sorts by the collator, numbers as numbers ("TG 9" before "TG 10"), and empty values go last either way, ties keeping their order (`sortRows` in `table.js`). The table sorts its rows itself; when the server sorts (a paged list), pass `sortRows={false}` and fetch on `onsort`, in the same order.
- **Actions**: the `actions` snippet fills a last column whose header is for screen readers only ("Actions", `actionsLabel`). One or two plain actions as secondary buttons, the rest in `MoreActions`; each action's accessible name names its row ("Edit North Fire"). A destructive one asks first (Confirming).
- **Narrow**: under 40rem of its own width (a container query, so a phone's 375 px and a narrow card alike), each row is a card: the row's name as its title, each value under its label (`--muted`, `--label-min` wide), the actions at its foot, and the headers become a **Sort by** select. The cells keep their table roles, so a screen reader still reads a table. `stack="never"` keeps the table and scrolls it sideways instead (a wide log where a card per row would be too long); there a More actions list can be clipped, so prefer buttons.
- No rows: the `empty` line (`--muted`) instead of the table.
- Look: `--text-sm`, cells padded `--space-xs` `--space-md`, `--border` dividers (a `--border-width-strong` one under the headers), a hovered row `--hover`, headers `--fg` `--weight-strong`. On `--bg` or `--surface`.
- Pairs: `table-text`, `table-muted`, `table-link`, `table-sort-pressed` (text), `table-sort-icon`, `table-focus`, `table-control` (edges), each on `--bg`, `--surface` and `--hover`. The lowest: the buttons' borders 3.36 on a hovered row (Harbour light), links 5.73.

### Confirming

0.5.0 (ADR 0004). A destructive action (delete, retire, shorten retention, sign everyone out) **asks first**, with `Confirm`; anything that can be undone in a click doesn't.

```svelte
{#if asking}
  <Confirm title="Delete {asking.name}?" confirmLabel="Delete {asking.name}" level={3}
    onconfirm={() => remove(asking)} oncancel={() => (asking = null)}>
    <p>Its 40 calls are deleted with it. This can't be undone.</p>
  </Confirm>
{/if}
```

- **The question is the heading** and names the thing ("Delete North Fire?"); what follows says what will happen and whether it can be undone, with counts where there are any. **The confirm button says the action** ("Delete North Fire", "Shorten to 30 days"), never "OK" or "Yes", and is a **danger** button (`danger={false}` for a primary one); **Cancel** (a secondary button) comes after it.
- **Inline, by default**: a panel where it's drawn, under the form or the table it's about, `--surface-2` with a `--border-width` `--control-border` edge, `--radius`, at most `--measure`. Its heading takes the focus, so the question is read first. Use it when the question belongs next to what's asked about.
- **`modal`**: a modal `<dialog>` over `--scrim`, at most `--dialog-width` (and `--panel-max`), labelled by its heading and described by its words. **Cancel takes the focus**, so Enter never confirms by accident. Use it when the question would otherwise be off-screen (a row's action in a long table on a phone).
- Escape cancels either. When it goes, the focus returns to what asked (the button, or More actions), if that is still on the page.
- `onconfirm` may be async: both buttons wait while it runs. If it throws, the panel stays and says so (`error`, or "That didn't work. Try again.") in `--danger-text`. `level` sets the heading's level (2 by default).
- Pairs: `confirm-text`, `confirm-error` (text on `--surface-2`), `confirm-edge` (on `--bg` and `--surface`), `confirm-focus`; the buttons keep theirs (`button`, `danger-button`, `control-border`). The lowest: the edge 3.62 (Harbour light, on the page).

### More actions

0.5.0 (ADR 0004). `MoreActions`: a button that shows a short list of a thing's other actions, where there's room for one or two buttons only (a table row, a card, a phone). It is the **disclosure** pattern (`aria-expanded`, `aria-controls`), not an ARIA menu: Tab moves through the actions, as through any buttons, and there are no arrow-key rules to learn.

- **The button**: a secondary button with the `more` icon, `--target` square, with the tooltip "More actions" (`tip`); with `text`, the icon and the words. Its accessible name says whose actions they are: `label="More actions: North Fire"`. Open, it shows pressed (`--accent-soft`, `--accent-soft-fg`, an `--accent` edge).
- **The list**: under the button, lined up with its end (`align="end"`, the default) or start, `--surface-2` with a `--control-border` edge, `--radius`, at least `--field-wide`, `--layer-overlay`. Its children are buttons and links, each a row at least `--target` high, `--fg`, hover `--hover`; `<hr>` divides groups; a destructive one has `class="danger"` (`--danger-text`), ends in "…" and asks first.
- Choosing an action closes it and puts the focus back on the button (a `Confirm` that opens then takes it, and gives it back to the button). Escape closes it and gives the focus back; a click or focus outside closes it. Escape also hides the tooltip (WCAG 1.4.13).
- Pairs: `more-item`, `more-danger`, `more-open` (text), `more-edge`, `more-open-edge`, `more-focus` (edges). The lowest: the list's edge 3.36 over a hovered row (Harbour light), the danger words 6.13.

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

### Dates

0.4.0 (ADR 0003). `DateRange`, moved from PagerArchive: a calendar icon button that opens one month's calendar to pick a range of days, and, **only when the app asks** (`times`), the times of day too.

- **The button** is a secondary button with the calendar icon and, once a range is picked, the range in words beside it ("18 Nov – 22 Nov"; the year when it isn't this one), outlined `--accent` while set. Its accessible name is "Dates", or "Dates: 18 Nov – 22 Nov". Its tooltip says "Dates", and Escape hides it (WCAG 1.4.13). In a form (0.6.0) it takes the app's `id` (an error summary links to it), `describedby` (the field's hint and error) and `invalid`, which turns its border `--danger` as an invalid field's (`field-invalid`); a button takes no `aria-invalid`, so the error is in its description.
- **The calendar** is a dialog under the button: `--surface-2`, a `--control-border` edge, `--radius`, `--calendar-width` wide (at most `--panel-max`). **On a phone** (under 48rem, 0.6.0) it is instead a panel fixed across the screen, `--page-pad-phone` from each side, its foot `--space-2xs` above the bottom bar and the dock (`--bottom-bar-height`, the safe area and `--dock-offset`), never taller than the space between them and the top bar (`--topbar-height`, which the frame sets), scrolling on its own when it needs more, with `--notice-shadow`. Under the button it ran behind the bottom bar and the dock, and the page could scroll no further than its foot, so the times were out of reach (RadioArchive's owner, 2026-11-27). The first day picked is From and the second To; the days between are joined by an `--accent-soft` bar, previewed (`--preview-opacity`) as the pointer or the focus moves. A second day before the first swaps them, the same day twice is one day, a third pick starts again, and closing after one pick is that one day. No day after today. The picked days are `--accent` with `--accent-fg`, today has a `--control-border` ring, days of other months are `--muted`.
- **The month-and-year title** switches to the year's months, and the year to 12 years; years with no records (outside `firstPage` and `lastPage`) and months after this one are greyed out.
- **Keys**: arrows move the day (Page Up and Page Down a month, with Shift a year; Home and End the week), Enter picks, Escape closes and gives the focus back to the button. In the months and years, arrows move and Page Up and Page Down go a year or 12.
- **Days are the deployment's** (`timeZone`, an IANA name), never the browser's, and are `YYYY-MM-DD`. In a form the range is the hidden fields `from` and `to`; `onchange(from, to)` is told when the calendar closes with a different range.

**Times of day** (`times`, opt-in; RadioArchive's search of recent calls). Without `times`, nothing of this is drawn, and the calendar is PagerArchive's, unchanged.

- Under the days, behind a `--border` line: **From time** and **To time**, native time fields (`<input type="time">`, minutes) side by side, each with its visible label, and the hint "Leave a time empty for the whole day." (`--muted`, linked from both with `aria-describedby`). They show in the days view only, and are disabled until a first day is picked. **A tap or a click opens the browser's own time picker** (0.5.1, `openPicker`); typing still works, from the keyboard (whose clicks and focus open nothing) and after the tap. The fields show the browser's own clock format (12- or 24-hour); their value is always `HH:MM`, 24-hour.
- **An empty time is the whole day**: From's day from its start, To's day to its end. **To includes its whole minute**: "to 16:30" includes what started at 16:30, as "to 5 Nov" includes 5 Nov.
- On one day, a To time before the From time **swaps them** when the calendar closes, as the days do. **Enter in a time closes the calendar** (it never sends the form half set) and gives the focus back to the button.
- The button says the times: "23 Nov 21:30 – 24 Nov 06:15"; on one day "21 Nov 09:00 – 16:30", "21 Nov from 09:00", "21 Nov until 16:30".
- In a form, also the hidden fields `from_time` and `to_time` (`HH:MM`, or empty); `onchange(from, to, fromTime, toTime)`. The times are on the same clock as the days. `rangeBounds({ from, to, fromTime, toTime }, timeZone)` in `archiveux/dates.js` gives the instants for an API (`start`, and `end`, which is excluded), across daylight saving; a server in another language follows its tests.

Pairs (`pairs.json`): `calendar-day`, `calendar-muted`, `calendar-picked`, `calendar-picked-cell` (text), `calendar-focus`, `calendar-today`, `calendar-hover-ring`, `calendar-time` (edges), from existing tokens. The lowest: today's ring 3.19 (Harbour light, on the bar), the time fields' borders 3.86, muted words 5.55.

### Suggestions

0.4.0 (ADR 0003). `Suggest`, moved from PagerArchive: a text box with suggestions, the ARIA combobox pattern (`role="combobox"`, `aria-expanded`, `aria-controls` to a `listbox`, `aria-activedescendant`). What it suggests is the app's: `suggest(text, caret)` returns the options for the word at the caret, so ArchiveUx knows no app's search.

- Arrow keys move through the options (and open the list), Enter picks one, Escape closes the list; the number of options is announced politely ("3 suggestions"). Enter with nothing picked is left to the form.
- Options come in runs under a heading (`section`): a **value** replaces the word it was suggested for with its `insert` (shown as `key:` and the rest when it has a key, else as its `value`); a **key** ("agency:", PagerArchive's query language) goes in at the cursor and its values follow; **text** ("Search text: …") searches for the words as typed. An app without a query language suggests values only.
- The box: `--surface-2`, a `--control-border` edge, the focus ring round the whole box, an optional icon in `--muted`; the label above (`showLabel`) or for screen readers only, and Required and `aria-invalid` as the rules for forms say (section 5). The list: `--surface-2`, `--control-border`, at most `--suggestions-height`; options at least `--target` high, hover `--hover`, the active one `--accent-soft` with `--accent-soft-fg`, headings and hints `--muted`.

Pairs: `suggest-option`, `suggest-muted`, `suggest-active` (text), `suggest-edge`, `suggest-focus` (edges). The lowest: the borders 3.62 (Harbour light), muted words 6.19.

### Every control

- At least `--target` high and wide (44 px on touch screens: `--target-coarse`).
- A visible hover, a focus ring (`--focus-width` in `--focus`, `--focus-offset` out, from `:focus-visible` in `base.css`), and a pressed state; only the press moves (`--press-shift`), and not with reduced motion.
- Icons are hidden from assistive technology and never stand alone: a label or a tooltip with the same accessible name.

## 5. Forms

Decided (owner, 2026-11-20): "at the moment there's no way to know what you must fill out." "The word required, every form. This should probably be a part of our design system." **The** rule for every form in every app that uses ArchiveUx (ADR 0001, decision 14). Its look is an outlined **Required** tag, the owner's pick after seeing 0.2.0's grey "· required" was easy to miss (2026-11-20, "B"; 0.2.1). The classes are in `base.css`; the gallery has a working form.

1. **Every required field says `required` in its label**, as an outlined tag after the label's own text: Name `Required`. It is the **word**, never an asterisk, and it is part of the label's accessible name. **Unmarked means optional**: never write "(optional)".
   - Markup: `<label for="name">Name <span class="required">required</span></label>`. `.required` is an outlined tag: `--accent` text with a `--border-width` `--accent` outline, `--radius-small`, padded `--space-xs` at the sides, `--text-sm`, `--weight-strong`, on the label's baseline. The markup says `required` and the tag shows a capital (`::first-letter`), so the name reads "Name required". Nothing in it is decoration.
   - The control keeps the native `required` attribute (it gives `aria-required` and the browser's validity state).
2. **A conditional field says when it is required**, in muted words after its tag: `<span class="required">required</span> <span class="required-when">none saved yet</span>` shows as Secret `Required` none saved yet (a secret already saved needn't be entered again), and Header value `Required` with a header name. The tag is the same on every required field, so it is found the same way everywhere; the words after it say when. When the condition is false, the field shows as **optional** (no tag), and its `required` attribute is off: the attribute follows the condition, so the browser's validity state and the label always agree.
3. **A rule over a group goes in a hint under the group**, not on each field: `<fieldset class="field-group" aria-describedby="pages-hint"><legend>Pages</legend><p class="field-hint" id="pages-hint">Choose at least one capcode or alias.</p>…</fieldset>`. The group's legend takes `required` the same way when the group as a whole must be filled. A field's own hint is a `.field-hint` under it, linked from the control with `aria-describedby`.
4. **On save, each problem shows under its own field and in an error summary at the top, which names each field and links to it** (0.6.0, after the GOV.UK error summary; until then the top only counted the fields, and RadioArchive's owner, 2026-11-27: "It doesn't say which field though so I have to guess. I actually can't work out where the problem is."):
   - the control gets `aria-invalid="true"` and `aria-describedby` naming a `.field-error` under it that says what to do ("Give it a name."), in words; the border turns `--danger` (from `aria-invalid` only, never `:invalid`, so an untouched empty field isn't red);
   - **the error goes beside the control it is about**: under the field, or for a group (a fieldset of options) under the option or the part of the group it is about, never under another option of the group;
   - a group's problem goes in its own `.field-error`, the fieldset gets `aria-describedby` to it (with the hint);
   - **the summary** (`ErrorSummary`, or `.error-summary` by hand) is the title "2 fields need attention", then one link for each problem, in the form's order, that names its field and says what to do: "Name: Give it a name." Each link is `href="#<the control's id>"` (a group's: the control the problem is about, else its first) and moves the focus to that control, bringing it to the middle of the screen (`focusField`), so a sticky top bar or a phone's bottom bar and dock never hide it;
   - **focus moves to the summary** after a save that finds problems (it has `tabindex="-1"`), so a screen reader reads the title and the links, and the first link is one Tab away;
   - a problem clears when the field is fixed and saved again (or as it is fixed, if the app checks as you type; either way the field's message, its link in the summary and `aria-invalid` go together).
5. **The app's own messages replace the browser's bubbles**: the form has `novalidate`, keeps `required` (and `type`, `min`, `pattern`…) on its controls, and on submit runs its own check, which reads each control's `validity` and adds the app's own rules (a group, a condition, what the server says). Why not keep the native bubbles: they show one problem at a time, at the browser's place and in its words, can't be styled to the look or measured, vanish on their own, and can't say a group's or a condition's rule, so a form would mix two kinds of message. With `novalidate` the attributes still give `aria-required`, `:required` and `checkValidity()`, so there is one source of truth and one kind of message. A problem the server finds is shown the same way, under its field.

Classes (all from existing tokens; no new token):

| Class | What | Tokens | Pair (`pairs.json`) |
|---|---|---|---|
| `.field` | A field: label, control, hint, error, stacked | `--space-2xs` apart, `--space-lg` below | |
| `.required` | The Required tag in the label | `--accent` text and `--border-width` outline, `--radius-small`, `--space-xs`, `--text-sm`, `--weight-strong` | `required-tag`: text, and `required-tag-edge`: edge, on `--bg`, `--surface`, `--surface-2` |
| `.required-when` | When a conditional field is required, after its tag | `--muted`, `--text-sm` | `required-when`: text on `--bg`, `--surface`, `--surface-2` |
| `.field-hint` | A hint under a field or a group | `--muted`, `--text-sm` | `field-hint`: text on `--bg`, `--surface`, `--surface-2` |
| `.field-error` | A field's or group's problem | `--danger-text`, `--text-sm`, `--weight-strong` | `field-error`: text on `--bg`, `--surface`, `--surface-2` |
| `[aria-invalid='true']` | An invalid input, select or textarea | border and inner ring `--danger`, `--border-width` | `field-invalid`: edge on `--bg`, `--surface`, `--surface-2` |
| `.field-group` | A fieldset with a legend | no border or padding; legend `--weight-strong` | |
| `.error-summary` | The error summary at the top (0.6.0; `ErrorSummary`): `.error-summary-title`, then `.error-summary-list` of links | edge `--border-width-strong` `--danger`, `--radius`, padded `--space-md` `--space-lg`; title `--fg` `--weight-strong` with the `error` icon in `--danger-text`; links `--danger-text`, `--weight-strong`, underlined; its focus `--focus-width` `--focus` | `summary-title`, `summary-link`: text, `summary-edge`, `summary-focus`: edges, on `--bg`, `--surface`, `--surface-2` |

Measured (lowest of `--bg`, `--surface`, `--surface-2`): the Required tag, its text and outline, 6.16 / 8.80 (Harbour light / dark), 16.71 / 15.22 (Console); the hints and the "when" 6.65 / 7.30 and 6.70 / 7.17; the error 7.45 / 9.52 and 6.07 / 7.26; the invalid border 6.13 / 6.93 and 6.07 / 6.75. The error summary's links and edge are the error's and the invalid border's tokens on the same surfaces, so they measure the same.

`ErrorSummary` (`archiveux/components`, 0.6.0): `problems` (`{ id, label, message }[]`: the control's id, the field's name as its label or legend says it, what to do), `title` (default "N fields need attention"), `level` (the title's heading, 2 by default). With no problems it draws nothing. `focus()` (through `bind:this`) moves the focus to it. `focusField(event, id)`, `problemText` and `summaryTitle` are exported for an app that draws its own.

Example:

```html
<form novalidate>
  <div class="error-summary" tabindex="-1" role="group" aria-labelledby="problems-title">
    <h2 class="error-summary-title" id="problems-title">1 field needs attention</h2>
    <ul class="error-summary-list"><li><a href="#name">Name: Give it a name.</a></li></ul>
  </div>
  <div class="field">
    <label for="name">Name <span class="required">required</span></label>
    <input id="name" required aria-invalid="true" aria-describedby="name-error" />
    <p class="field-error" id="name-error">Give it a name.</p>
  </div>
  <div class="field">
    <label for="note">Note</label>
    <input id="note" />
  </div>
  <div class="field">
    <label for="secret">Secret <span class="required">required</span> <span class="required-when">none saved yet</span></label>
    <input id="secret" type="password" required />
  </div>
</form>
```

Bad: `Name *`, `Note (optional)`, a marker that is easy to miss (0.2.0's grey "· required"), a red border with no words, a top message that counts problems without saying which fields, an error under one option of a group that is about another, the browser's bubble beside a message of the app's own.

## 6. Gallery

`npm run gallery` serves it locally; CI builds it, and on `main` publishes it with GitHub Pages. It shows every token as a swatch with its contrast against `--bg` and `--fg`, every pairing with its ratio and result, the samples above (text, buttons, focus rings, an alert, the heat grid with each step's ratio, rows and labels, a working notice, a working form, the LEDs with their lowest ratio, the Live badge), and the other tokens' values, for the look and theme chosen at the top. Its second page, `frame.html`, is the whole frame with made-up content: the side menu, the bottom bar, the account menu signed in or out, the app switcher, the dock and a notice above it, each switched on and off on the page or from the address (`?dock=0`, `?switcher=0`, `?signedin=1`, `?shrunk=1`, `?notice=1`, `?look=console`, `?theme=dark`). Its third page, `search.html`, has `DateRange` without and with times, each in a form whose fields it shows (with `rangeBounds`), and `Suggest` with made-up channels. Its fourth page, `admin.html` (0.5.0), has the state badges, the banners, a `DataTable` that sorts with actions and More actions (and the same table in a narrow card, stacked), `Confirm` inline and in a dialog, and `MoreActions` alone (`?ask=inline`, `?ask=modal` and `?menu=1` open them). Its numbers are measured from the page's own computed colours with the same pairs and floors as CI.
