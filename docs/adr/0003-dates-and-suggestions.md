# ADR 0003: Dates with times of day, and suggestions, for searching recent calls

## Status

Accepted (owner, 2026-11-24: issue #6, item 7, approved). Done in 0.4.0. The agent's calls below (decisions 2-8) are open to the owner's review after the 0.4.0 demo, as those of ADR 0002 were.

## Context

RadioArchive searches recent calls by talkgroup, date and time range, and unit (its `SPEC.md`, R83: "From ArchiveUx: … `Suggest` and `DateRange` (batch (b), with times of day)"). Its search runs over at most 31 days and pages by start time, so a listener needs times as well as days: "last night, 21:30 to 06:15".

`docs/components-plan.md` planned `SearchBox`, `Suggest` and `DateRange` as batch (b), moved from PagerArchive, whose search box and capcode report use them. 0.3.0 moved only the frame, so neither `Suggest` nor `DateRange` was in ArchiveUx yet. PagerArchive draws its own copies, and nothing it draws may change unless it opts in.

## Decision (the owner's, issue #6)

1. **`DateRange` takes times of day, optionally**, for searching recent calls by date and time range. RadioArchive uses `Suggest` and `DateRange`, not `SearchBox` (PagerArchive's query language).

## How 0.4.0 applies it (the agent's calls)

2. **`Suggest` and `DateRange` move now, `SearchBox` later.** RadioArchive needs the two and not the third, and `SearchBox` is PagerArchive's query language (`search.ts`, `searchValues.ts`), which is PagerArchive's adoption work. Like the frame (ADR 0002, decision 7): Svelte 5 in plain JavaScript with JSDoc types, shipped as source, `archiveux/components`.
3. **Moved as they are.** Their markup, styles, keys and words are PagerArchive's (main at e1a0b6a), with only the TypeScript turned into JSDoc and their app modules cut loose: `DateRange`'s `isoDate` (from `format.ts`) is in the new `archiveux/dates.js`, and `Suggest`'s types (from `search.ts`) are in `types.js`, a key being any string. So PagerArchive can adopt them with no change to what it draws. Checked: the same steps on both copies give the same markup, pixels, focus, form fields and callbacks.
4. **Times are opt-in (`times`), and without it nothing is drawn.** The same calendar, not a second component, so both apps' calendars stay one pattern; with `times` off, it renders PagerArchive's markup exactly.
5. **Two native time fields under the days, From time and To time**, rather than a time grid of the component's own. `<input type="time">` is accessible, labelled, keyboard-ready and gives a phone its own time picker; a grid would be a second widget to learn and to test. Minutes are enough for recent calls. They show in the days view only, and are usable once a day is picked, because a time means nothing without its day. They are independent of the days: picking days again keeps them.
6. **An empty time is the whole day, and To includes its whole minute.** So a range without times means what it always did, and "to 16:30" includes 16:30's calls, as "to 5 Nov" includes 5 Nov. On one day, a To time before the From time swaps them, as a second day before the first does.
7. **Times travel beside the days, not inside them.** The days stay `from` and `to` (`YYYY-MM-DD`) and the times are `from_time` and `to_time` (`HH:MM` or empty), in hidden fields and as `onchange`'s third and fourth arguments, both on the deployment's clock (`timeZone`). An app that reads days only is unaffected. `rangeBounds` in `archiveux/dates.js` turns them into UTC instants (end excluded) across daylight saving: a time the clock skips is an hour on, one it shows twice is the first. RadioArchive's server is Go and follows the same cases, which the tests list. Enter in a time closes the calendar rather than sending the form half set.
8. **`Suggest` may suggest a value without a key**, shown as its `value`. PagerArchive's values always have one ("agency:North Fire"); RadioArchive's talkgroups don't. A value with a key draws exactly as before.

New pairs, from existing tokens: `calendar-*` and `suggest-*` (rules, section 4, "Dates" and "Suggestions"). The lowest is 3.19:1, today's ring on the range bar in Harbour light.

## PagerArchive is unaffected

No token and no rule in `base.css` changes; 0.4.0 adds two components, a module (`dates.js`), three icons and pairs. PagerArchive imports none of them and draws its own copies until it adopts these in its own pull request; adopting them without `times` draws what it draws today.

## Consequences

- RadioArchive's recent calls use `DateRange` with `times` and `Suggest` for talkgroups, and its server reads `from`, `to`, `from_time` and `to_time` as `rangeBounds` does.
- PagerArchive can replace its `Suggest` and `DateRange` with these (and its `format.ts`'s `isoDate` with `dates.js`'s) and gains times by passing `times`. `SearchBox` moves in a later release.
