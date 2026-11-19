# Components plan

PagerArchive's `web/src/lib` components (main at 6dfa1f0), sorted into generic UI that could move to ArchiveUx and app-specific ones that stay. **Nothing moves in stage 1**: the owner picks the order after seeing this plan and the gallery.

What moving one takes: its styles already use only tokens (PagerArchive R82c), but most import app modules (`api.ts`, `nav.ts`, `menu.svelte.ts`, `release.ts`). A component moves when those become props or callbacks, so ArchiveUx never calls an app's API. "Needs" lists what has to be cut loose.

## Generic UI: candidates to move

| Component | What it is | Needs | Suggested order |
|---|---|---|---|
| `Icon` | An icon from the compiled set, hidden from assistive technology | `icons.ts` (Tabler subset) moves with it; each app adds its own meanings | 1 |
| `ReleaseNotice` | The "New release" notice: 8 s, countdown line, waits while held, tap or Esc closes, flies into its target | `api.releaseSeen()` and `releaseHref()` become props (version, link); `menu.shrunk` a prop | 2 |
| `Crumbs` | Breadcrumbs from the menu's tree | `nav.ts`'s tree becomes a prop (a shared nav type) | 3 |
| `Menu` | The side menu: groups, shrinking, flyouts, counts, version at the foot | `nav.ts`, `menu.svelte.ts`, `albums.svelte.ts`; app counts (waiting requests, print sheet, quiet receivers) become generic badges per entry | 4 |
| `BottomBar` | The phone bottom bar with the More sheet | `nav.ts`; its four entries become a prop | 4 (with Menu) |
| `GroupPage` | A group's start page listing its pages | `nav.ts` (with Menu) | 4 (with Menu) |
| `AccountMenu` | Who's signed in, theme, look, sign out | `api.ts` (the account, saving the look) becomes callbacks | 5 |
| `DateRange` | The range calendar (From/To, preview bar) | `format.ts`'s date helpers move with it | 6 |
| `Suggest` | An ARIA combobox with suggestions | `search.ts`'s suggest becomes a prop (a function returning suggestions) | 7 |
| `SearchBox` | One search box, Help, the dates and Clear all | `search.ts`, `searchValues.ts` (PagerArchive's query language) become props; after DateRange and Suggest | 8 |
| `BarChart`, `ColumnChart` | Simple SVG charts with values written beside the marks | `chartImage.ts` moves with them | 9 |
| `PriorityBadge` | A priority in words, with its dot or outline from the tokens | `api.ts`'s `Message` type becomes a priority prop; generic if RadioArchive marks priorities too (owner to say) | 10, or stays |
| `Scrubber` | The strip down a long list for big jumps by date | `api.ts` (its counts) becomes a prop; heavy (1,045 lines); generic if RadioArchive lists calls by time | later, or stays |
| `ReportCaveat` | A "these numbers may be wrong" caveat | Its text is PagerArchive's: generic only as a "caveat" box with the text as a prop | later |

## App-specific: stay in PagerArchive

| Component | Why it stays |
|---|---|
| `MessageList`, `MessageRow` | PagerArchive's pages and their fields (the row *pattern* is in the rules; the component isn't) |
| `MapView` | The map (MapLibre, PMTiles, areas): its tokens stay in PagerArchive too |
| `AgencyIcon` | Templates' agency artwork |
| `AliasForm`, `AliasHistory`, `AliasRequestForm`, `RequestCard`, `SelectionField` | Aliases and capcodes |
| `TemplateForm` | Templates |
| `IntegrationForm` | Integrations |
| `InviteTree` | PagerArchive's invite tree |
| `AddToAlbum`, `AlbumNote` | Albums of pages |
| `PrintTick` | The print sheet |
| `BackupAlert`, `UpgradeAlert` | PagerArchive's operations alerts (their *look* is a pattern: must-notice, so they need an edge; see the findings) |
| `ReportPage` | PagerArchive's report filters and API |
