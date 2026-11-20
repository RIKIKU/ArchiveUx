# Changelog

Every release of `archiveux`. Apps pin a release tag (`github:RIKIKU/ArchiveUx#vX.Y.Z`), so read the entries between your tag and the new one before you upgrade.

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
