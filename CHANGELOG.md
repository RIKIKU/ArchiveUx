# Changelog

Every release of `archiveux`. Apps pin a release tag (`github:RIKIKU/ArchiveUx#vX.Y.Z`), so read the entries between your tag and the new one before you upgrade.

## 0.7.0

The owner (2026-11-28): "Light/dark should also be shared" across the apps on one parent domain, as the look is.

**Nothing changes for an app that doesn't opt in**: the `look` cookie and every look function are as they were, no token, class or pairing changes, and the new functions and the menu's `ontheme` have names neither app uses. An app on an older ArchiveUx ignores the new cookie, and a browser holding only the `look` cookie paints as before. Moving from 0.6.0 needs no change in the app; to share the theme, see below.

- **The shared theme cookie** (`archiveux/look.js`; rules, section 1, rule 8): a cookie of its own, named by the app (`theme`), holding `light` or `dark`; absent follows the system. The look cookie's attributes: the app's parent domain (none for host-only), `Path=/`, a year, `SameSite=Lax`, `Secure` on https, not `HttpOnly`. Choosing Auto deletes it (`Max-Age=0`, the same Domain and Path).
- **New in `look.js`**, mirroring the look's: `THEMES` (`['light', 'dark']`), `DEFAULT_THEME` (`'system'`), `isTheme(v)`, `themeFromCookies(cookies, name)` (`'light' | 'dark' | null`; anything else is absent, and an empty or unknown one is passed over for a second of the same name), `pickTheme({ cookies, cookie, own })` (the cookie's, else the app's own, else `'system'`), `themeCookie(theme, { name, domain?, maxAge?, secure? })` (`'system'` or null writes the deletion), `themeAttribute(theme)` (`data-theme="dark"`, or `''` for the system's) and `applyTheme(theme, cookie?)` (sets or removes `data-theme`; with a cookie, writes or deletes it; with a domain, deletes a host-only cookie of the same name first).
- **`AccountMenu`** takes `ontheme(theme)`, called when the colour theme is chosen, as `onlook` is for the look: the app saves it as it does today and, in a combined deployment, calls `applyTheme(theme, { name: 'theme', domain })`. If it throws, the old theme comes back and the menu says "Couldn't save the theme. Try again." `theme` stays bindable; without `ontheme` the menu works as before.
- **To share the theme**, an app: renders `data-theme` on `<html>` from `pickTheme({ cookies: <Cookie header>, cookie: 'theme', own: <its own choice> })` (with `themeAttribute`), and writes the cookie on a change with `applyTheme(theme, { name: 'theme', domain: <its LOOK_COOKIE_DOMAIN>, secure })`. One that keeps its own choice in `localStorage` should forget it once it writes the cookie.
- **Gallery**: the frame page applies the theme with `applyTheme`.
- **Tests**: the theme cookie read, written and deleted, the first-paint order, the attribute, and `applyTheme`'s cookies.

## 0.6.0

RadioArchive's owner, testing its Recent page on a phone (2026-11-27): the calendar's times were out of reach behind the player and the bottom bar, and "There is red text that says there's a problem with one of the fields. It doesn't say which field though so I have to guess."

**Nothing changes for an app that doesn't opt in**, except DateRange's calendar on a phone: no token changes its value, the new classes, component and pairs have names neither app uses, and `openPicker` stays as it was. Moving from 0.5.1 needs no change in the app; to follow the new forms rule, a form moves its top message to `ErrorSummary`.

- **`DateRange` on a phone** (under 48rem): the calendar is a panel fixed across the screen, its foot just above the bottom bar and the dock (`--bottom-bar-height`, the safe area, `--dock-offset`), never taller than the space up to the top bar (`--topbar-height`, set by `Frame`; none without it), and it scrolls on its own. The days and both times can always be reached, with a player showing or not. On desktops it is unchanged, under its button.
- **`DateRange`'s button** takes `id` (so an error summary can link to it), `invalid` (its border `--danger`, as an invalid field's) and `describedby` (the field's hint and error). All optional; without them it draws as before.
- **`ErrorSummary`** (`archiveux/components`) and **`.error-summary`**, after the GOV.UK error summary: the title "2 fields need attention" and, under it, a link for each problem naming its field and saying what to do ("Name: Give it a name."), which moves the focus to that field and brings it to the middle of the screen. Props `problems` (`{ id, label, message }[]`), `title`, `level`; `focus()` through `bind:this`. Also exported: `focusField`, `problemText`, `summaryTitle`.
- **Rules** (section 5, rule 4, changed): the summary names and links each field, where it only counted them; the focus goes to the summary after a save that finds problems, where it went to the first problem; and a group's error goes beside the option or part it is about. Section 4, "Dates": the calendar on a phone.
- **Contrast check**: new pairs `summary-title`, `summary-link` (text), `summary-edge`, `summary-focus` (edges), on `--bg`, `--surface` and `--surface-2`, from existing tokens. `contrast/findings.json` stays empty.
- **Gallery**: the working form's summary is an `ErrorSummary`, which takes the focus and links to each field.
- **Tests**: `ErrorSummary` rendered on the server; its words and its links' focus (`errorsummary.js`); the calendar's phone rule.

## 0.5.1

A tap on a time field opens the browser's own time picker (RadioArchive's owner, on Chrome for Android, where the fields showed as segments to type into and the clock hid behind a small icon).

**Nothing else changes**: no token, class, pairing or word. Moving from 0.5.0 needs no change in the app.

- **`DateRange`'s From time and To time** open their picker on a tap or a click (`showPicker()`). Typing still works: a click without a pointer (a keyboard's or a screen reader's, `detail` 0) and focus alone open nothing, and Enter still closes the calendar. While no day is picked the fields stay disabled, and nothing opens. A browser without `showPicker`, or one that refuses (no user activation, a cross-origin frame), keeps its own behaviour.
- **`openPicker`** (`archiveux/components`): the same for an app's own date or time field, as its `onclick`.
- **Rules** (section 4, "Dates": the time fields).
- **Tests**: `openPicker` on a click, a keyboard's click, a disabled or read-only field, and a browser without it or that refuses.

## 0.5.0

The admin pages' building blocks, which RadioArchive's first admin pages (its ADR 0027) found missing and drew from tokens as stand-ins: a state badge, a banner, a data table, a way to ask before a destructive action, and More actions (ADR 0004, proposed: the implementer's calls, for the owner's review).

**Nothing changes for an app that doesn't opt in** (PagerArchive, RadioArchive today): every existing token keeps its value in both looks and both themes, no existing rule in `base.css` changes, and the new token, classes, components and icons have names neither app uses. Moving from 0.4.1 needs no change in the app.

- **`StateBadge`** and **`.state-badge[data-state=ok|warning|error|neutral]`**: a thing's state in a word. OK `--accent-soft-fg` on `--accent-soft`, Warning `--warn-fg` on `--warn-bg`, Error `--danger-text` on `--danger-soft`, neutral `--muted` in a `--control-border` outline. Props `state`, `text` (or children); words default to OK, Warning, Error.
- **`Banner`** and **`.banner[data-tone=warning|error|info]`**: the alert that stays (rules, section 4, "Alerts") as a class, in three tones, each its fill and its own text, no edge. `Banner` adds the tone's icon (`icon={false}` for none), an optional `title`, and `role` (none by default; `alert` or `status`). An app drawing its own `--warn-bg` alert **may** move to `<div class="banner">`, which draws the same.
- **`DataTable`**: `columns` (`key`, `label`, `sortable`, `firstDir`, `align`, `primary`, `custom`, `value`, `text`), `rows`, `caption`, `key`, bindable `sort` (`{ key, dir }`), `onsort`, `sortRows` (false when the server sorts), `cell(row, column)` and `actions(row)` snippets, `actionsLabel`, `empty`, `stack` (`auto`, `never`), `rowProps(row)`. Sortable headers are buttons with `aria-sort` and an announcement; under 40rem of its own width each row becomes a card and the headers a Sort by select.
- **`table.js`** (`archiveux/components`): `sortRows`, `nextSort`, `sortWords`, `valueOf`, `textOf`, `compare`; the order a server sorting for a table follows.
- **`Confirm`**: `title` (the question), children (what happens), `confirmLabel` (the action), `cancelLabel`, `onconfirm` (may be async), `oncancel`, `danger` (default true), `modal` (a `<dialog>`; default inline), `busy`, `error`, `level`. Focus to the heading (inline) or Cancel (modal), Escape cancels, focus back to what asked.
- **`MoreActions`**: a disclosure button (`label`, `tip`, `text`, `align`, bindable `open`) and its list of the children's buttons and links (`class="danger"` for a destructive one, `<hr>` between groups); Escape, an outside click or choosing an action closes it, the focus back on the button.
- **New token `--danger-soft`** (both looks, both themes): an error's soft fill. Harbour `#fde4e1` / `#4b1f1b` (its Emergency label's), Console `#fbe4e4` / `#3a1515`.
- **Icons**: `sort-none`, `sort-up`, `sort-down`, `info`, `error`.
- **Rules** (section 4: "Alerts" gains `.banner`; new "State badges", "Data tables", "Confirming", "More actions"; section 2's tables), the components plan, and ADR 0004.
- **Contrast check**: new pairs `state-ok`, `state-warning`, `state-error`, `state-neutral`, `state-neutral-edge`, `banner-warning`, `banner-error`, `banner-info`, `banner-focus`, `table-text`, `table-muted`, `table-link`, `table-sort-pressed`, `table-sort-icon`, `table-focus`, `table-control`, `confirm-text`, `confirm-error`, `confirm-edge`, `confirm-focus`, `more-item`, `more-danger`, `more-open`, `more-edge`, `more-open-edge`, `more-focus`; 976 measurements, all passing (the lowest new one 3.36, a control's border on a hovered row, Harbour light). `contrast/findings.json` stays empty.
- **Gallery**: a fourth page, `admin.html`, with every state and tone, a table that sorts with actions and More actions, the same table narrow, and asking inline and in a dialog.
- **Tests**: the five components rendered on the server, and `table.js`'s order.

## 0.4.1

The owner's review of ADR 0002's decisions 7-13 (2026-11-25): all accepted, with one change. **Live now means within 5 s of the live edge, not 2 s.**

- **`LIVE_WITHIN` is 5** (`archiveux/live.js`), so `liveBadge()` and `LiveBadge` say "Live" up to 5 s behind and "Behind by 5 s" from there. An app that passes its own `liveWithin` is unaffected. An app that shows Jump to live while behind should compare with `LIVE_WITHIN`, not a number of its own.
- **ADR 0002** is marked accepted by the owner, with the change in decision 13; the rules (section 4, "Live badge") say 5 s.
- **Gallery**: the frame page's Jump to live follows `LIVE_WITHIN`.
- **Tests**: Live at 2 s and 4.9 s, Behind from 5 s.

No token, class or pairing changes; the contrast check is as in 0.4.0. Moving from 0.4.0 needs no change in the app, unless it hard-codes 2 s.

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
