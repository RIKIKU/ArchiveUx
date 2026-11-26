# ArchiveUx

The shared design system of the archive apps (PagerArchive, RadioArchive): one look across different systems. It holds:

- **Tokens**: every value that styles the UI, as CSS custom properties, in two looks (Harbour, the default, and Console), each light and dark (`src/tokens.css`).
- **Base styles**: resets, type, focus rings, controls, buttons, reduced motion (`src/base.css`).
- **Rules** for agents building the apps: each token's purpose and allowed pairings, the WCAG AA contrast floor, and component patterns ([docs/design-system.md](docs/design-system.md)). Decisions: [docs/adr](docs/adr).
- **A contrast check**, run in CI, over every allowed pairing in both looks and both themes ([contrast/pairs.json](contrast/pairs.json)).
- **A gallery** of every token, pairing and pattern, the owner's review tool.
- **Svelte components**: the frame (0.3.0) with its optional app switcher and dock, the side menu, the bottom bar, the account menu (signed in or out), the Live badge and icons; the range calendar `DateRange`, with times of day if the app asks, and the combobox `Suggest` (0.4.0); the admin pages' `StateBadge`, `Banner`, `DataTable`, `Confirm` and `MoreActions` (0.5.0); a form's `ErrorSummary` (0.6.0) (`src/components`); the look's first-paint rule (`src/look.js`), the Live badge's words (`src/live.js`) and a range as instants (`src/dates.js`). The rest move as [docs/components-plan.md](docs/components-plan.md) says.

## Using it in an app

Install a release tag as a git dependency; `package-lock.json` locks it to the tag's commit:

```sh
npm install github:RIKIKU/ArchiveUx#v0.1.0
```

```json
"dependencies": { "archiveux": "github:RIKIKU/ArchiveUx#v0.1.0" }
```

Import the styles once, before the app's own (with Vite or SvelteKit):

```css
@import 'archiveux/archiveux.css'; /* tokens and base styles */
/* or one at a time: */
@import 'archiveux/tokens.css';
@import 'archiveux/base.css';
```

Choose the look and theme on `<html>`: `data-look="console"` for Console (none for Harbour), and `data-theme="light"` or `"dark"` to override the system (none follows it). Then use only tokens (`var(--fg)`, `var(--space-lg)`) in components, in the pairings the rules allow.

The components are Svelte 5, for an app built with Vite or SvelteKit (rules, section 4); the app switcher, the dock and `DateRange`'s times are there only when the app asks for them:

```svelte
<script>
  import { Frame, Menu, BottomBar, AccountMenu } from 'archiveux/components';
  import { applyLook, lookCookie, pickLook } from 'archiveux/look.js';
  import { liveBadge } from 'archiveux/live.js';
  // 0.4.0: search controls, and a range picked with times as UTC instants
  import { DateRange, Suggest } from 'archiveux/components';
  import { rangeBounds } from 'archiveux/dates.js';
  // 0.5.0: admin pages
  import { StateBadge, Banner, DataTable, Confirm, MoreActions } from 'archiveux/components';
</script>
```

`DateRange` with times sends `from`, `to`, `from_time` and `to_time` in a form, or tells `onchange`:

```svelte
<DateRange {from} {to} times {fromTime} {toTime} timeZone="Australia/Melbourne"
  onchange={(from, to, fromTime, toTime) => search(rangeBounds({ from, to, fromTime, toTime }, "Australia/Melbourne"))} />
```

An admin table with a state, its actions, and a question before deleting (rules, section 4):

```svelte
<DataTable caption="Talkgroups" {columns} rows={talkgroups} key={(t) => t.id} bind:sort>
  {#snippet cell(t)}<StateBadge state={t.hidden ? 'neutral' : 'ok'} text={t.hidden ? 'Hidden' : 'Listed'} />{/snippet}
  {#snippet actions(t)}
    <MoreActions label="More actions: {t.name}"><button type="button" class="danger" onclick={() => (asking = t)}>Delete…</button></MoreActions>
  {/snippet}
</DataTable>
{#if asking}
  <Confirm title="Delete {asking.name}?" confirmLabel="Delete {asking.name}" onconfirm={() => remove(asking)} oncancel={() => (asking = null)} />
{/if}
```

To upgrade, read [CHANGELOG.md](CHANGELOG.md) from your tag to the new one, change the tag in `package.json` and run `npm install`.

## Working on it

Node 24.

```sh
npm ci
npm run check          # every look sets every token; the contrast check
npm test               # the checks' own tests
npm run gallery        # the gallery on http://localhost:5173
npm run build:gallery  # into dist-gallery
```

A new colour pairing goes into `contrast/pairs.json` in the same pull request. A pairing below its floor fails CI unless the owner has yet to decide on it and it's listed in `contrast/findings.json`; never change a look's values to pass without the owner's say.

## Releasing

1. In a pull request: set `version` in `package.json` (and `package-lock.json`, `npm install --package-lock-only`), and move the changelog's "unreleased" entries under the new version with the date.
2. Merge it, then tag the merge commit and make the GitHub release with that changelog section:

   ```sh
   git tag vX.Y.Z <merge commit> && git push origin vX.Y.Z
   gh release create vX.Y.Z --notes-file <the section>
   ```

3. Each app moves to the tag in its own pull request.

## Licence

MIT.
