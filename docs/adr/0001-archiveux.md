# ADR 0001: ArchiveUx, the shared design system

## Status

Accepted (owner, 2026-11-19). Stage 1 built on the branch `stage-1`; its findings decided by the owner on 2026-11-20 (decisions 8-12) and fixed in 0.1.0. Decision 8 (the alert edge) reversed by the owner after the 0.1.0 demo, the same day (decision 13), in 0.1.1.

## Context

PagerArchive and RadioArchive must feel like one application to the user, although they are different systems. RadioArchive is still at the spec stage with no code, so the shared design system sets the stack for both. The trigger: PagerArchive's "New release" notice was invisible in dark mode (a `--surface-2` box on `--bg`, about 1.1:1) and no rule caught it.

## Decisions (the owner's, 2026-11-19)

1. **Its own public repository**, `RIKIKU/ArchiveUx`, MIT licensed; npm package name `archiveux`. Neither app owns it.
2. **Generic**, as PagerArchive is: no agency, brigade, place or network names, and no real data, in code, docs or the gallery.
3. **The audience is mainly the agents building the apps**, so rules and machine checks matter more than prose (`docs/design-system.md` is short and normative; `contrast/pairs.json` is the machine-readable form of the pairings). The owner guides the look through demos and the built product, so a **gallery** is the owner's review tool.
4. **WCAG 2.1 AA is the floor** for both apps, both looks (Harbour, Console) and both themes (light, dark): text at least 4.5:1 on its own background; edges and controls at least 3:1; must-notice elements (notices, alerts, anything that appears on its own) have an edge of at least 4.5:1 against the page (admin alerts taken out of must-notice by decision 13). The owner's reason: standards that make the apps useful to more people. **Enforced by a CI check over the real token pairs** (`scripts/check-contrast.mjs`).
5. **No hosted design system** (no Claude Design System or design-sync): a second copy isn't worth keeping in sync. The repository is the single source.
6. **Consumed as a git dependency pinned to a release tag**: `"archiveux": "github:RIKIKU/ArchiveUx#vX.Y.Z"`, locked to the commit in `package-lock.json`. Not GitHub Packages (its npm registry needs a token even for public packages), not a submodule. Releases have a changelog, so each app upgrades deliberately. The cost: a change across both is two pull requests (an ArchiveUx release, then the app's bump).
7. **Svelte components**, as PagerArchive uses (Svelte 5).

## How stage 1 applies them

- **Tokens** moved from PagerArchive's `web/src/app.css` (main at 6dfa1f0, after PR #88) with names and values unchanged, so PagerArchive's look doesn't change when it imports them (stage 2). The generic base styles moved too. PagerArchive-specific things stay there: the map's tokens (`--map-*`, `--detail-map-width`, `--area-tag-*`) and the full-screen map's rule (`:root.map-full`).
- **Looks are complete**: Console sets every token Harbour sets (PagerArchive ADR 0028), checked by `scripts/check-tokens.mjs`.
- **Findings, not fixes**: pairs the current tokens fail are listed in `contrast/findings.json` and reported to the owner; their values are not changed, because the look is the owner's. The only values changed for contrast are those the owner already approved (the release notice, PagerArchive PR #88, already in the moved tokens). The check fails on any failure that isn't a listed finding, and on a listed finding that no longer fails.
- **Components** don't move in stage 1: `docs/components-plan.md` inventories them, and the owner picks the order after seeing the plan and the gallery (picked 2026-11-20: decision 12).
- **CI** follows PagerArchive's conventions: actions pinned to commit SHAs, least-privilege permissions per job, time limits. The gallery is published with GitHub Pages from `main`.

## Decided after stage 1 (the owner's, 2026-11-20)

Stage 1 reported five findings and three calls the agent had made; the owner decided them all ("agree with all your suggestions"). Fixed in 0.1.0:

8. **Admin alerts are must-notice**, and get a strong edge in every look and theme, at least 4.5:1 against `--bg`; their `--warn-bg` fill stays. The edge is a new token, `--alert-edge`, whose value is the notice's amber (`var(--notice-edge)`): one signal for everything that asks to be noticed, in a token of its own so alerts and the release notice can part later (`docs/design-system.md`, Alerts). *Reversed by decision 13 (0.1.1).*
9. **Heat grid text**: each heat step has its own text token, `--heat-0-fg`..`--heat-4-fg`, measured on its shade in every look and theme; the shades don't change. The owner asked that the darkest shades' counts use the page background colour instead of `--fg`. Measured, only Console dark's busiest shade fails with `--fg` (3.55:1), and `--bg` there is 4.43:1, just under the floor, so that one count is `--accent-fg` (`#111111`, 4.54:1), the darkest ink Console has; every other step keeps `--fg` (or `--muted` on the empty shade), where `--bg` would fail (`docs/design-system.md`, Charts).
10. **Only the map's tokens stay in PagerArchive** (`--map-*`, `--detail-map-width`, `--area-tag-*`); every other token is ArchiveUx's.
11. **`--border` dividers are decoration** and aren't measured (WCAG 1.4.11 doesn't apply); they may never be the only thing that shows a control or its state.
12. **Components**: `PriorityBadge` and `Scrubber` move; `ReportCaveat` stays. The move order is in `docs/components-plan.md`. Nothing moves in 0.1.0.

## Decided after the 0.1.0 demo (the owner's, 2026-11-20)

Having seen PagerArchive's backup and upgrade alerts with 0.1.0's edge: "The amber edge is very intense. I prefer it without." Done in 0.1.1:

13. **Admin alerts are the `--warn-bg` fill only, with no edge**, as before 0.1.0; decision 8 is reversed and `--alert-edge` is removed. They are noticed by their place and their wording, not their outline, so they are no longer must-notice elements (decision 4's edge rule still holds for notices, toasts and anything that appears on its own). The floor still holds for their text (4.5:1, the `warn` pair) and for controls (3:1). The fill isn't an edge, so, like `--border` dividers (decision 11), it isn't measured against the page: `contrast/pairs.json` drops the alert-edge pairs and `contrast/findings.json` stays empty.

## Releasing

Bump `version` in `package.json`, add the version's section to `CHANGELOG.md`, merge, then tag the merge commit `vX.Y.Z` and make a GitHub release with the changelog's section. Apps move to it by changing the tag in their `package.json` and running `npm install`.
