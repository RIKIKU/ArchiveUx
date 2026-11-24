# Changelog

Every release of `archiveux`. Apps pin a release tag (`github:RIKIKU/ArchiveUx#vX.Y.Z`), so read the entries between your tag and the new one before you upgrade.

## 0.4.0

What RadioArchive needs from ArchiveUx to search recent calls (#6, item 7, approved by the owner on 2026-11-24; ADR 0003): `DateRange` with times of day, and `Suggest`. Both move from PagerArchive (batch (b) of `docs/components-plan.md`); `SearchBox` is still to move.

**Nothing changes for an app that doesn't opt in** (PagerArchive): no token and no rule in `base.css` changes, and the new components, module and icons have names no app imports yet. Moving from 0.3.0 needs no change in the app. Without `times`, `DateRange` draws what PagerArchive's draws today.

- **`DateRange`** (`archiveux/components`): the range calendar, moved from PagerArchive (main at e1a0b6a) with its markup, styles, keys and words as they are. Props `from`, `to` (`YYYY-MM-DD`), `timeZone`, `firstPage`, `lastPage`, `onchange(from, to)`; hidden fields `from` and `to`.
- **Times of day, opt-in**: `times` draws a From time and a To time (native time fields, `HH:MM`) under the days, usable once a day is picked; `fromTime` and `toTime` set them. An empty time is the whole day, and To includes its whole minute. On one day, a To time before the From time is swapped on closing. Enter in a time closes the calendar. The button says them ("23 Nov 21:30 – 24 Nov 06:15", "21 Nov until 16:30"); the form also gets `from_time` and `to_time`; `onchange(from, to, fromTime, toTime)`. **Without `times`, nothing of this is drawn.**
- **`archiveux/dates.js`** (new): `isoDate` (moved from PagerArchive's `format.ts`), `zonedInstant`, and `rangeBounds({ from, to, fromTime, toTime }, timeZone)`, the UTC instants a range covers (end excluded), across daylight saving.
- **`Suggest`** (`archiveux/components`): the ARIA combobox, moved from PagerArchive as it is, with `search.ts`'s suggest as the `suggest(text, caret)` prop and its types in `types.js` (`Suggestion`, `Suggestions`). New: a value may come without a key, and shows as its `value` (RadioArchive's talkgroups); a value with a key draws as before.
- **Icons**: `calendar`, `previous` and `next`, from PagerArchive's set.
- **Rules** (section 4, new "Dates" and "Suggestions"), the components plan and ADR 0003.
- **Contrast check**: new pairs `calendar-day`, `calendar-muted`, `calendar-picked`, `calendar-picked-cell`, `calendar-focus`, `calendar-today`, `calendar-hover-ring`, `calendar-time`, `suggest-option`, `suggest-muted`, `suggest-active`, `suggest-edge` and `suggest-focus`, all from existing tokens; 768 measurements, all passing (the lowest 3.19, today's ring on the range bar, Harbour light). `contrast/findings.json` stays empty.
- **Gallery**: a third page, `search.html`, with `DateRange` without and with times, each in a form whose fields it shows, and `Suggest`.
- **Tests**: `DateRange` and `Suggest` rendered on the server (no time fields without `times`; the labels and fields with them), and `dates.js`, including Melbourne's daylight-saving days.

## 0.3.0

What RadioArchive needs from ArchiveUx (#6, items 1-6, approved by the owner on 2026-11-24; ADR 0002). Item 7, `DateRange` with times of day, comes later.

**Nothing changes for an app that doesn't opt in** (PagerArchive): every existing token keeps its value in both looks and both themes, every existing class is unchanged, and the new tokens, classes and components have names no app uses yet. Moving from 0.2.1 needs no change in the app.

- **The frame, as Svelte 5 components** (`archiveux/components`; Svelte is an optional peer dependency). `Frame`, the shell, takes each part as a snippet: the side menu, the top bar's start and tools, the account menu, the bottom bar, notices, and the page. Moved from PagerArchive with their app modules cut loose: `Menu` (the tree, current page, counts, open groups and shrinking as props), `BottomBar` (three entries and More), `AccountMenu` (callbacks for saving the look, signing in and out) and `Icon` (the frame's icons by name; an app's own as `svg`). `GroupPage` and `ReleaseNotice` are still to move (`docs/components-plan.md`).
- **App switcher**: `Frame`'s `otherApp: { name, href }` draws a link to the other app, by name, in the top bar before the account menu, opening it in the same tab ("Switch to PagerArchive"). **None by default**: without `otherApp`, no switcher.
- **Dock**: `Frame`'s `dock` snippet (and `dockLabel`) draws a bar the app fills, `--surface` with a `--border` line above, at least the new **`--dock-height`** (4.5rem Harbour, 4rem Console). Phones: fixed above the bottom bar, across the width. Desktops: along the foot of the content beside the side menu, as wide as the content, shrunk or not. **None by default.** New pairs `dock-text`, `dock-muted`, `dock-link`, `dock-control`, `dock-focus`.
- **Notices above the dock**: new `.notice-place` (base.css) places a notice beside the menu and above the dock, from two new tokens the frame sets on its root, **`--frame-menu-width`** and **`--dock-offset`**. Outside a frame they are `--menu-width` and none, which is where a notice sits today (rules, section 4).
- **`AccountMenu` signed out** (`account: null`): Sign in (a link or a callback), "Not signed in", and the colour theme and look still choosable; no Sign out. New pair `account-signin`.
- **The look's first paint** (rules, section 1, rule 7): the server writes `data-look` on `<html>` from the parent-domain cookie the app names (combined deployment), else the app's own setting, else Harbour. **`archiveux/look.js`**: `pickLook`, `lookFromCookies`, `lookCookie` (`Domain`, `Path=/`, a year, `SameSite=Lax`, `Secure`), `lookAttribute`, `applyLook`.
- **LED colours**: eight new tokens, **`--led-red`, `--led-orange`, `--led-yellow`, `--led-green`, `--led-cyan`, `--led-blue`, `--led-purple`, `--led-pink`**, the same in both looks, and `--led-size`; drawn as `<span class="led" data-led="red" aria-hidden="true">` beside a name, never alone. Measured as edges on `--bg`, `--surface` and `--hover` in every look and theme (`led-*`); the lowest is 4.12:1.
- **Live badge**: `.live-badge[data-state=live|behind|delayed]` (base.css), `LiveBadge`, and **`archiveux/live.js`**'s `liveBadge({ behind, delay })` for the words: "Live" (the `--ok-fg` dot, `--fg`), "Behind by 12 s" (a hollow `--muted` ring, `--muted`), "Delayed 5 min" (`--warn-fg` on `--warn-bg`). Live is within 2 s. New pairs `live-text`, `behind-text`, `behind-ring`, `delayed-text`; and `app-switcher`.
- **Contrast check**: 676 measurements across the looks and themes, all passing; `contrast/findings.json` stays empty.
- **Gallery**: a second page, `frame.html`, with the whole frame and every optional part switchable; the main page shows the LEDs with their lowest ratio and the Live badge.
- **Tests** render the components on the server through Vite (no switcher and no dock by default; the signed-out account menu), and cover `look.js` and `live.js`.

## 0.2.1

The owner tried 0.2.0's grey "· required" and found it easy to miss: "there's no way to know which fields are mandatory before you hit save." Their pick was "B", an outlined Required tag (ADR 0001, decision 14, amended).

- **`.required` is now an outlined tag**: `--accent` text and a `--border-width` `--accent` outline, `--radius-small`, `--text-sm`, `--weight-strong`, reading "Required". The markup still says `required`, so accessible names don't change ("Name required"). The decorative dot is gone.
- **New `.required-when`**: a conditional field says when in muted words after its tag, `<span class="required">required</span> <span class="required-when">none saved yet</span>`. An app that put the condition inside `.required` ("required: none saved yet", "needed with a header name") **should** move it out, so the tag is the same everywhere.
- **Contrast check**: `field-required` is replaced by `required-tag` (text, 4.5:1), `required-tag-edge` (outline, 3:1) and `required-when` (text), each on `--bg`, `--surface` and `--surface-2`. The lowest is 6.16:1 for the tag and 6.65:1 for the words. `contrast/findings.json` stays empty.
- **Rules** (section 5) and the **gallery** show the tag, including the conditional cases. No token changes.

## 0.2.0

Required fields, a rule for every form (the owner, 2026-11-20: "The word required, every form. This should probably be a part of our design system."; ADR 0001, decision 14).

- **Rules** (`docs/design-system.md`, new section 5, Forms; the Gallery is now section 6): every required field says "required" in its label (the word, not an asterisk, part of the accessible name), and unmarked means optional, so drop every "(optional)"; a conditional field says when ("required: none saved yet") and shows as optional otherwise; a group's rule is a hint under the group, linked with `aria-describedby`; on save, each problem under its own field (`aria-invalid`, `aria-describedby`), focus to the first, and a top message that only summarises. Forms use `novalidate` and the app's own check, keeping `required` on the controls.
- **New classes** (`archiveux/base.css`): `.field`, `.required`, `.field-hint`, `.field-error`, `.field-group`, and a `--danger` border on any input, select or textarea with `aria-invalid="true"`. An app that marks fields today should move to these and take its own "(optional)" text and asterisks off.
- **No new tokens**: the classes use `--muted`, `--danger-text` and `--danger`. Every existing token is unchanged, so nothing that looks the same today looks different.
- **Contrast check**: new pairs `field-required`, `field-hint`, `field-error` (text, 4.5:1) and `field-invalid` (edge, 3:1), each on `--bg`, `--surface` and `--surface-2` in both looks and both themes; the lowest is 6.07:1. `contrast/findings.json` stays empty.
- **Gallery**: a working form with a required field, an optional one, a conditional one in both states, a group hint and a field in error.

## 0.1.1

The owner's decision after seeing 0.1.0's alert edge in PagerArchive (2026-11-20): "The amber edge is very intense. I prefer it without." (ADR 0001, decision 13).

- **Removed `--alert-edge`** (both looks, both themes). An admin alert that stays (backup, upgrade) is the `--warn-bg` fill with `--warn-fg` text only, **no edge**, as before 0.1.0: it is noticed by its place and its wording, and it is no longer a must-notice element. An app that draws a border in `var(--alert-edge)` **must** take that border off: the token no longer exists.
- **Rules** (`docs/design-system.md`, sections 3 and 4): must-notice elements are notices, toasts and anything that appears on its own; admin alerts are not. Text stays at 4.5:1 and controls at 3:1.
- **Contrast check**: the `alert-edge` and `alert-edge-card` pairs are gone. The fill isn't an edge, so it isn't measured against the page (like `--border` dividers); `contrast/findings.json` stays empty and the check passes.
- **Gallery**: the alert is drawn without an edge.
- Every other token is unchanged from 0.1.0 (the heat-grid text tokens stay).

## 0.1.0

The first release: stage 1 (ADR 0001), with stage 1's findings fixed as the owner decided on 2026-11-20 (ADR 0001, decisions 8-12).

What changes for an app moving from its own copy of the tokens (PagerArchive): every value is unchanged except where below, so the look doesn't change but for these two:

- **New `--alert-edge`** (both looks, both themes; `var(--notice-edge)`): an alert that stays (backup, upgrade) is must-notice and **must** draw a `--border-width-strong` edge in it. Against the page: Harbour 5.56 / 8.37, Console 5.93 / 8.40 (light / dark). The `--warn-bg` fill is unchanged.
- **New `--heat-0-fg`..`--heat-4-fg`**: a heat cell writes its count in its step's token. All are `--muted` (step 0) or `--fg` except Console dark's `--heat-4-fg`, which is `--accent-fg` (4.54:1, was 3.55:1 with `--fg`). The shades are unchanged.
- **No known findings**: `contrast/findings.json` is empty, and the check passes with none.

- **Tokens** (`archiveux/tokens.css`): PagerArchive's design tokens, Harbour and Console, light and dark, moved with names and values unchanged (from PagerArchive main at 6dfa1f0, including PR #88's `--highlight`, `--notice-edge` and `--notice-countdown-height`). PagerArchive's map tokens stay in PagerArchive.
- **Base styles** (`archiveux/base.css`): resets, type, links, focus rings, form controls, buttons, icons, tooltips, the release landing, reduced motion.
- **Rules** (`docs/design-system.md`): each colour token's purpose and allowed pairings, the WCAG AA floor, and the patterns for notices and toasts, page rows, the bottom bar and the side menu.
- **Contrast check** (`npm run check:contrast`, in CI) over every pairing in `contrast/pairs.json`, both looks, both themes, including the alert edge (on the page and on a card) and each heat step's text.
- **Gallery** (`npm run gallery`; GitHub Pages from `main`), with an alert and the heat grid.
- **Components plan** (`docs/components-plan.md`): the owner's move order, in four batches; no components yet.
