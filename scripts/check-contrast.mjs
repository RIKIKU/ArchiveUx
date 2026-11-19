// The contrast check (docs/design-system.md, "Contrast"): every pairing in
// contrast/pairs.json, in both looks and both themes, must meet its floor.
// A pair the current tokens fail and the owner hasn't decided on yet is a
// known finding in contrast/findings.json: it is reported, not fixed here,
// and doesn't fail the check. Anything else below its floor fails, and so
// does a finding that no longer fails (take it off the list).
//
//   node scripts/check-contrast.mjs           check and print a summary
//   node scripts/check-contrast.mjs --all     also print every measurement
//   node scripts/check-contrast.mjs --json    every measurement as JSON
import { readFileSync } from 'node:fs';
import { loadTokens } from './load-tokens.mjs';
import { judge, measure } from './contrast.mjs';

const read = (p) => JSON.parse(readFileSync(new URL(`../${p}`, import.meta.url), 'utf8'));
const results = measure(loadTokens(), read('contrast/pairs.json'));
const { failing, fresh, stale } = judge(results, read('contrast/findings.json').findings);

if (process.argv.includes('--json')) {
	console.log(JSON.stringify(results, null, 2));
	process.exit(fresh.length || stale.length ? 1 : 0);
}

const fmt = (r) => `${r.look} ${r.theme}: ${r.pair}: --${r.fg} on --${r.on} is ${r.ratio.toFixed(2)}:1, needs ${r.min}:1`;
for (const look of ['harbour', 'console']) {
	for (const theme of ['light', 'dark']) {
		const mine = results.filter((r) => r.look === look && r.theme === theme);
		const bad = mine.filter((r) => !r.pass);
		console.log(`${look} ${theme}: ${mine.length} measured, ${mine.length - bad.length} pass, ${bad.length} below the floor`);
		if (process.argv.includes('--all')) for (const r of mine) console.log(`  ${r.pass ? 'ok  ' : 'FAIL'} ${r.pair}: --${r.fg} on --${r.on} ${r.ratio.toFixed(2)}:1 (needs ${r.min})`);
	}
}
if (failing.length) {
	console.log(`\nKnown findings (contrast/findings.json), for the owner to decide:`);
	for (const r of failing.filter((f) => !fresh.includes(f))) console.log(`  ${fmt(r)}`);
}
if (fresh.length) {
	console.error(`\nBelow the floor (not a known finding):`);
	for (const r of fresh) console.error(`  ${fmt(r)}`);
}
if (stale.length) {
	console.error(`\nKnown findings that no longer fail: take them off contrast/findings.json:`);
	for (const f of stale) console.error(`  ${f.look} ${f.theme}: ${f.pair}: --${f.fg} on --${f.on}`);
}
process.exit(fresh.length || stale.length ? 1 : 0);
