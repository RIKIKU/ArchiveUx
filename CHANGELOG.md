# Changelog

Every release of `archiveux`. Apps pin a release tag (`github:RIKIKU/ArchiveUx#vX.Y.Z`), so read the entries between your tag and the new one before you upgrade.

## 0.1.0 (unreleased)

The first release: stage 1 (ADR 0001).

- **Tokens** (`archiveux/tokens.css`): PagerArchive's design tokens, Harbour and Console, light and dark, moved with names and values unchanged (from PagerArchive main at 6dfa1f0, including PR #88's `--highlight`, `--notice-edge` and `--notice-countdown-height`). PagerArchive's map tokens stay in PagerArchive.
- **Base styles** (`archiveux/base.css`): resets, type, links, focus rings, form controls, buttons, icons, tooltips, the release landing, reduced motion.
- **Rules** (`docs/design-system.md`): each colour token's purpose and allowed pairings, the WCAG AA floor, and the patterns for notices and toasts, page rows, the bottom bar and the side menu.
- **Contrast check** (`npm run check:contrast`, in CI) over every pairing in `contrast/pairs.json`, both looks, both themes. Five known findings (`contrast/findings.json`) for the owner: alerts have no edge against the page (all four), and Console dark's busiest heat cell (3.55:1).
- **Gallery** (`npm run gallery`; GitHub Pages from `main`).
- **Components plan** (`docs/components-plan.md`): no components yet.
