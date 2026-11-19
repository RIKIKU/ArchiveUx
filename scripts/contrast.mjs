// Measures every pairing in contrast/pairs.json in each look and theme, and
// compares the failures with the known findings (contrast/findings.json).
import { LOOKS, THEMES, colourOf, over, ratio, resolve, tokensOf } from './tokens.mjs';

/** Every measurement: { look, theme, pair, what, kind, fg, on, ratio, min, pass }. */
export function measure(tokens, spec) {
	const out = [];
	for (const look of LOOKS) {
		for (const theme of THEMES) {
			const map = tokensOf(tokens, look);
			const colour = (name) => {
				const c = colourOf(tokens, look, theme, name);
				if (!c) throw new Error(`${look} ${theme}: --${name} is not a colour (${resolve(map, name, theme)})`);
				return c;
			};
			const page = colour('bg');
			for (const p of spec.pairs) {
				const min = spec.floors[p.kind];
				if (min === undefined) throw new Error(`pair ${p.id}: unknown kind ${p.kind}`);
				if (p.when && resolve(map, p.when.token, theme) === p.when.isNot) continue;
				const fg = colour(p.fg);
				if (p.skipIfTransparent && fg[3] === 0) continue;
				const ons = p.on.flatMap((n) => (colour(n)[3] === 0 ? spec.transparentOn : [n]));
				for (const on of [...new Set(ons)]) {
					const back = over(colour(on), page);
					const r = ratio(over(fg, back), back);
					out.push({ look, theme, pair: p.id, what: p.what, kind: p.kind, fg: p.fg, on, ratio: r, min, pass: r >= min });
				}
			}
		}
	}
	return out;
}

const key = (f) => `${f.look}/${f.theme}/${f.pair}/${f.fg}/${f.on}`;

/** New failures (not known findings) and stale findings (known, but no longer failing or no longer measured). */
export function judge(results, findings) {
	const known = new Set(findings.map(key));
	const failing = results.filter((r) => !r.pass);
	const failingKeys = new Set(failing.map(key));
	return {
		failing,
		fresh: failing.filter((r) => !known.has(key(r))),
		stale: findings.filter((f) => !failingKeys.has(key(f)))
	};
}
