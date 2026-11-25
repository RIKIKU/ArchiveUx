# Components plan

PagerArchive's `web/src/lib` components (main at 6dfa1f0), sorted into generic UI that moves to ArchiveUx and app-specific ones that stay. **0.3.0 moved most of batch (a)** for RadioArchive (ADR 0002): `Menu`, `BottomBar`, `AccountMenu` and `Icon`, with three new parts of the frame, `Frame`, `AppSwitcher` and `LiveBadge`; `GroupPage` and `ReleaseNotice` are still to move. **0.4.0 moved `Suggest` and `DateRange`** from batch (b), for RadioArchive's search of recent calls, with times of day added to `DateRange` (ADR 0003); `SearchBox` (PagerArchive's query language) is still to move. **0.5.0 added the admin pages' building blocks** (ADR 0004), new in ArchiveUx, below. PagerArchive still draws its own copies until it adopts them. What moves, and in what order, is the owner's decision of 2026-11-20 (ADR 0001, decision 12).

What moving one takes: its styles already use only tokens (PagerArchive R82c), but most import app modules (`api.ts`, `nav.ts`, `menu.svelte.ts`, `release.ts`). A component moves when those become props or callbacks, so ArchiveUx never calls an app's API. "Needs" lists what has to be cut loose.

## Move order

Four batches, each its own ArchiveUx release and PagerArchive bump, in this order:

| Batch | Components |
|---|---|
| (a) | `Menu`, `BottomBar` and `GroupPage`; `AccountMenu`; `Icon`; `ReleaseNotice` (0.3.0: all but `GroupPage` and `ReleaseNotice`, with the new `Frame`, `AppSwitcher` and `LiveBadge`) |
| (b) | `SearchBox`, `Suggest` and `DateRange` (0.4.0: `Suggest` and `DateRange`, with times of day) |
| (c) | `BarChart` and `ColumnChart` |
| (d) | `Crumbs`, `PriorityBadge` and `Scrubber` |

Within batch (a), `Menu`, `BottomBar`, `GroupPage`, `AccountMenu` (and, in (b), `SearchBox`) import `Icon`, so `Icon` must be in ArchiveUx no later than the first of them: it travels with `Menu` in the same release if they ship one at a time.

## New in ArchiveUx (0.3.0, ADR 0002)

Parts of the frame that neither app had, made for RadioArchive (RIKIKU/ArchiveUx#6) and open to PagerArchive:

| Component | What it is |
|---|---|
| `Frame` | The shell: side menu, top bar, page, bottom bar, each a snippet; the optional app switcher and dock; notices placed above the dock |
| `AppSwitcher` | A link in the top bar to the other app, by name, in the same tab; drawn by `Frame` only when the app names the other app |
| `LiveBadge` | Live, Behind by N s, Delayed N min, in words (`.live-badge`, `live.js`) |

## New in ArchiveUx (0.5.0, ADR 0004)

The admin pages' building blocks, which RadioArchive's first admin pages drew as stand-ins (its ADR 0027) and both apps' admin pages share. Built new, not moved: PagerArchive's admin tables and inline confirmations draw their own, which the rules follow, and can move to these when it chooses.

| Component | What it is |
|---|---|
| `StateBadge` | A thing's state in a word: OK, Warning, Error, neutral (`.state-badge`) |
| `Banner` | An alert that stays: warning, error or info, no edge (`.banner`) |
| `DataTable` | Sortable headers, an actions column, cards under 40rem (`table.js` for the order) |
| `Confirm` | Asking before a destructive action, inline or in a modal dialog |
| `MoreActions` | A disclosure button with a thing's other actions |

## Generic UI: to move

| Component | What it is | Needs | Batch |
|---|---|---|---|
| `Menu` | The side menu: groups, shrinking, flyouts, counts, version at the foot | `nav.ts`, `menu.svelte.ts`, `albums.svelte.ts`; app counts (waiting requests, print sheet, quiet receivers) become generic badges per entry; `Icon` | (a), **moved in 0.3.0**: the tree, current page, counts (`count`, `dot`, `says`), open groups and shrinking are props |
| `BottomBar` | The phone bottom bar with the More sheet | `nav.ts`; its four entries become a prop; `Icon` | (a), **moved in 0.3.0**: up to three entries and the More groups are props |
| `GroupPage` | A group's start page listing its pages | `nav.ts` (with Menu); `Icon` | (a), with Menu |
| `AccountMenu` | Who's signed in, theme, look, sign out; signed out, Sign in with the theme and look still choosable (0.3.0) | `api.ts` (the account, saving the look) becomes callbacks; `Icon` | (a), **moved in 0.3.0**: `account` (or null), `onlook`, `signIn`, `onsignout`, `links` |
| `Icon` | An icon from the compiled set, hidden from assistive technology | `icons.ts` (Tabler subset) moves with it; each app adds its own meanings | (a), **moved in 0.3.0**: the frame's icons by name; an app's own as `svg` |
| `ReleaseNotice` | The "New release" notice: 8 s, countdown line, waits while held, tap or Esc closes, flies into its target | `api.releaseSeen()` and `releaseHref()` become props (version, link); `menu.shrunk` a prop | (a) |
| `SearchBox` | One search box, Help, the dates and Clear all | `search.ts`, `searchValues.ts` (PagerArchive's query language) become props; uses Suggest and DateRange | (b) |
| `Suggest` | An ARIA combobox with suggestions | `search.ts`'s suggest becomes a prop (a function returning suggestions) | (b), **moved in 0.4.0**: `suggest(text, caret)` is a prop; a value may come without a key |
| `DateRange` | The range calendar (From/To, preview bar); times of day, opt-in (0.4.0) | `format.ts`'s date helpers move with it | (b), **moved in 0.4.0**: `isoDate` is in `archiveux/dates.js`, with `rangeBounds`; `times` adds From and To times (ADR 0003) |
| `BarChart`, `ColumnChart` | Simple SVG charts with values written beside the marks | `chartImage.ts` moves with them | (c) |
| `Crumbs` | Breadcrumbs from the menu's tree | `nav.ts`'s tree becomes a prop (a shared nav type) | (d) |
| `PriorityBadge` | A priority in words, with its dot or outline from the tokens | `api.ts`'s `Message` type becomes a priority prop | (d) |
| `Scrubber` | The strip down a long list for big jumps by date | `api.ts` (its counts) becomes a prop; heavy (1,045 lines) | (d) |

## App-specific: stay in PagerArchive

| Component | Why it stays |
|---|---|
| `ReportCaveat` | Stays (owner, 2026-11-20): its text is PagerArchive's, and a caveat box is just the rules' `--warn-fg` on `--warn-bg` |
| `MessageList`, `MessageRow` | PagerArchive's pages and their fields (the row *pattern* is in the rules; the component isn't) |
| `MapView` | The map (MapLibre, PMTiles, areas): its tokens stay in PagerArchive too |
| `AgencyIcon` | Templates' agency artwork |
| `AliasForm`, `AliasHistory`, `AliasRequestForm`, `RequestCard`, `SelectionField` | Aliases and capcodes |
| `TemplateForm` | Templates |
| `IntegrationForm` | Integrations |
| `InviteTree` | PagerArchive's invite tree |
| `AddToAlbum`, `AlbumNote` | Albums of pages |
| `PrintTick` | The print sheet |
| `BackupAlert`, `UpgradeAlert` | PagerArchive's operations alerts; their *look* is the rules' Alerts pattern (the `--warn-bg` fill, no edge: 0.1.1) |
| `ReportPage` | PagerArchive's report filters and API |
