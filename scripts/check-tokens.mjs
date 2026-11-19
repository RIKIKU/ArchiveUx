// Every look sets exactly the tokens Harbour sets (ADR 0001; PagerArchive ADR
// 0028), so nothing of Harbour shows through; and every token resolves in
// both themes (no var() to a missing token, no self-reference).
import { loadTokens } from './load-tokens.mjs';
import { LOOKS, THEMES, resolve, tokensOf } from './tokens.mjs';

const t = loadTokens();
const problems = [];
const harbour = new Set(t.harbour.keys());
const consoleSet = new Set(t.console.keys());
for (const n of harbour) if (!consoleSet.has(n)) problems.push(`Console doesn't set --${n}`);
for (const n of consoleSet) if (!harbour.has(n)) problems.push(`Console sets --${n}, which Harbour doesn't`);
for (const n of t.shared.keys()) if (harbour.has(n)) problems.push(`--${n} is both shared and Harbour's`);
for (const look of LOOKS) {
	const map = tokensOf(t, look);
	for (const theme of THEMES) {
		for (const n of map.keys()) {
			try {
				resolve(map, n, theme);
			} catch (e) {
				problems.push(`${look} ${theme}: ${e.message}`);
			}
		}
	}
}
if (problems.length) {
	console.error(problems.join('\n'));
	process.exit(1);
}
console.log(`tokens: ${t.shared.size} shared, ${harbour.size} per look, both looks complete, all resolve in light and dark`);
