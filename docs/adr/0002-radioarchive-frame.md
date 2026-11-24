# ADR 0002: The frame for two apps: app switcher, dock, signed-out account menu, shared look, LEDs and the Live badge

## Status

Accepted (owner, 2026-11-24: issue #6, items 1-6, approved for 0.3.0; RadioArchive's M2 waits for the release). Item 7 (`DateRange` with times of day) followed in 0.4.0 (ADR 0003). The agent's calls below (decisions 7-13) are open to the owner's review after the 0.3.0 demo, as decisions 8-12 of ADR 0001 were.

## Context

RadioArchive is the second app on ArchiveUx (ADR 0001). Its planning decided what it needs from the design system (RIKIKU/ArchiveUx#6, and RadioArchive's `SPEC.md`, section 6.13), under one rule: anything only one app uses stays in that app. So its live player, listening-set picker, download basket, call card and admin table stay in RadioArchive, built from tokens and the row pattern only. What both apps share, or what RadioArchive may not make for itself (R80 forbids app-specific tokens), comes here.

Until now ArchiveUx had no components: `docs/components-plan.md` planned PagerArchive's frame (`Menu`, `BottomBar`, `GroupPage`, `AccountMenu`, `Icon`, `ReleaseNotice`) as batch (a), unmoved. RadioArchive's frame needs that frame plus three things PagerArchive never had: an app switcher, a dock, and an account menu for people who never sign in. The owner (2026-11-24, on RadioArchive#53): "M2 waits for ArchiveUx. The frame, dock, signed-out AccountMenu, look cookie, LED tokens and Live/behind badge … are built in ArchiveUx and released, and M2's frame and dock use that release."

PagerArchive consumes ArchiveUx today (v0.2.1) for its tokens and base styles only, and draws its own frame. Nothing it draws may change unless it opts in.

## Decisions (the owner's, issue #6)

1. **App switcher in the frame.** The app hands the frame the other app's name and address, or none; with none, no switcher. It opens the other app in the same tab.
2. **Dock**: an optional bar in the frame that the app fills, on every page that asks for it. Phones: above the bottom bar, across the width. Desktops: along the foot of the content, beside the side menu, respecting the shrunk width. Notices and toasts move above the dock when one is shown. Its own height token and its pairings.
3. **`AccountMenu` works signed out**: a Sign in entry, with the theme and the look still choosable.
4. **The look's first paint can read a parent-domain `look` cookie** the app names (the combined deployment), falling back to the app's own setting when standalone.
5. **LED colour tokens**: a fixed set of about 8 named colours, each in both looks and both themes, measured as an edge (3:1) on `--bg` and `--surface`; never the only cue.
6. **Live / behind badge**: the pattern for "Live", "behind by N s" and "delayed N min", with any pairing it needs.

## How 0.3.0 applies them (the agent's calls)

7. **The frame moves now, as components, without `GroupPage` and `ReleaseNotice`.** Items 1-3 live in the frame, so the frame has to exist in ArchiveUx: `Frame` (new: the shell, from PagerArchive's layout), `Menu`, `BottomBar`, `AccountMenu` and `Icon` (moved from PagerArchive with their app modules cut loose: the tree, counts, version and account are props, saving is a callback), `AppSwitcher` and `LiveBadge` (new). `GroupPage` and `ReleaseNotice` stay in PagerArchive for a later release of batch (a): RadioArchive's M2 needs neither, and moving them means cutting `nav.ts` and the release API loose, which is PagerArchive's adoption work, not RadioArchive's. Svelte 5 in plain JavaScript with JSDoc types (no TypeScript preprocessing needed in the app), shipped as source: `archiveux/components`, `archiveux/components/<Name>.svelte`. Svelte is an optional peer dependency, so an app that takes only the CSS installs nothing new.
8. **Every part of the frame is a snippet**, so an app can use ArchiveUx's `Menu` or its own in the menu's place, and PagerArchive can adopt the frame a part at a time. The frame owns only the layout, the skip link, the switcher and the dock's place.
9. **The switcher sits in the top bar, before the account menu**, on desktops and phones alike: always in sight, never one of the bottom bar's four entries, and not hidden in the account menu, so switching is one tap. It shows the other app's name with an exchange icon, and its accessible name is "Switch to <name>" (which holds the words shown, WCAG 2.5.3).
10. **The dock is placed by the layout, and notices follow two tokens.** On desktops the dock is the grid's last row beside the side menu, `position: sticky; bottom: 0`, so it is as wide as the content whatever the menu's width, and the page keeps its room without padding. On phones it is fixed above the bottom bar, and the frame pads the page by both. It is `--surface` with a `--border` line above, like the bottom bar; `--dock-height` (4.5rem Harbour, 4rem Console) is its least height, and it grows with what the app puts in it. The frame sets `--dock-offset` (the dock's measured height, none without one) and `--frame-menu-width` (shrunk or not) on its root; `.notice-place` in `base.css` places a notice with them, so a notice in the frame's `notices` snippet sits beside the menu and above the dock. Both tokens default to what PagerArchive's notice uses today (no offset, `--menu-width`).
11. **The look's first paint is the server's**, as PagerArchive does it (its ADR 0028): it writes `data-look` on `<html>` in the page it sends. The order is the named cookie (if it holds a known look), then the app's own setting, then Harbour. The cookie's value is the look's name; it is `Domain=<parent>; Path=/; Max-Age=31536000; SameSite=Lax; Secure`, not `HttpOnly`, so either app's page can write it the moment the look is chosen. `archiveux/look.js` is the rule in code for a server in JavaScript and for the browser; RadioArchive's server is Go and follows the same steps, which the tests list as cases. The colour theme stays per browser, as before.
12. **Eight LEDs, by name, one colour in both looks**: red, orange, yellow, green, cyan, blue, purple and pink (`--led-<name>`), darker in light and brighter in dark. RadioArchive's spec leaves the names to the implementer. One value per name across the looks, so an admin who picks "yellow" sees yellow in both; Console's only colours were priorities, and an LED is a mark beside a name, like a priority's mark. Measured as edges on `--bg`, `--surface` and also `--hover` (a hovered row is where a list's LED would sit); the lowest is 4.12:1 (yellow on Harbour light's hover). Drawn as `.led[data-led=<name>]`, hidden from assistive technology, the name beside it. A colour not lit isn't drawn.
13. **The badge's three states, in words.** Live: the existing `--ok-fg` Live dot and "Live" in `--fg`. Behind: a hollow `--muted` ring and "Behind by 12 s" in `--muted`: calm, because being behind is the listener's to manage, and the ring's shape differs from Live's dot as well as its colour. Delayed: "Delayed 5 min", `--warn-fg` on `--warn-bg`, the existing caveat pairing, because a delay is a caveat an admin set; a delayed call is never Live. Live means within 2 s of the live edge (`LIVE_WITHIN`, RadioArchive's delay budget), and longer delays read "1 min 35 s", "1 h 4 min". New pairs: `live-text`, `behind-text`, `behind-ring`, `delayed-text`, all from existing tokens.

## PagerArchive is unaffected

Every token PagerArchive uses keeps its value in both looks and both themes; 0.3.0 only adds tokens (`--frame-menu-width`, `--dock-offset`, `--dock-height`, `--led-*`, `--led-size`) and classes (`.notice-place`, `.led`, `.live-badge`), none of whose names PagerArchive uses. The components are new files it doesn't import. So PagerArchive draws exactly as before until it adopts the frame in its own pull request.

## Consequences

- RadioArchive builds its frame from `Frame`, `Menu`, `BottomBar` and `AccountMenu`, with the dock on its listener pages and the switcher only when `PAGERARCHIVE_URL` is set.
- PagerArchive can adopt the frame when it chooses (its `Menu`, `BottomBar`, `AccountMenu` and layout become ArchiveUx's, with its counts as props), and gains the switcher by setting `RADIOARCHIVE_URL`. `GroupPage` and `ReleaseNotice` move in a later release.
- ArchiveUx now has code that runs in browsers, so its tests render the components (server-side, through Vite) as well as measuring contrast.
