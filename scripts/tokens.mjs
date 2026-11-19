// Reads src/tokens.css and resolves its tokens the way a browser does, for a
// look (harbour, console) and a theme (light, dark): var() references,
// light-dark(), and the colours the tokens use (#rgb, #rrggbb, #rrggbbaa,
// transparent, rgb(), color-mix(in srgb, …)). And WCAG 2.1 contrast.
// No dependencies: the contrast check and its tests run on a bare Node.

export const LOOKS = ['harbour', 'console'];
export const THEMES = ['light', 'dark'];

/** The top-level rule blocks of a stylesheet: [{ selector, decls: Map }]. Blocks inside @media are skipped. */
export function blocks(css) {
	const src = css.replace(/\/\*[\s\S]*?\*\//g, '');
	const out = [];
	let i = 0;
	while (i < src.length) {
		const open = src.indexOf('{', i);
		if (open < 0) break;
		const selector = src.slice(i, open).trim();
		let depth = 1;
		let j = open + 1;
		for (; j < src.length && depth > 0; j++) {
			if (src[j] === '{') depth++;
			else if (src[j] === '}') depth--;
		}
		const body = src.slice(open + 1, j - 1);
		if (!selector.startsWith('@')) {
			const decls = new Map();
			for (const d of splitTop(body, ';')) {
				const m = d.match(/^\s*(--[\w-]+)\s*:\s*([\s\S]*?)\s*$/);
				if (m) decls.set(m[1].slice(2), m[2]);
			}
			out.push({ selector, decls });
		}
		i = j;
	}
	return out;
}

/** The tokens of each look: { shared, harbour, console } as Maps of name to value. */
export function looks(css) {
	const all = blocks(css);
	const roots = all.filter((b) => b.selector === ':root');
	const harbour = roots.find((b) => b.decls.has('bg'));
	if (!harbour) throw new Error("tokens.css: no :root block sets --bg (Harbour's)");
	const shared = new Map(roots.filter((b) => b !== harbour).flatMap((b) => [...b.decls]));
	const consoleBlock = all.find((b) => b.selector === ":root[data-look='console']");
	if (!consoleBlock) throw new Error("tokens.css: no :root[data-look='console'] block");
	return { shared, harbour: harbour.decls, console: consoleBlock.decls };
}


/** Every token of a look as the page sees it: the shared ones, Harbour's, then the look's own. */
export function tokensOf(t, look) {
	if (!LOOKS.includes(look)) throw new Error(`unknown look ${look}`);
	return new Map([...t.shared, ...t.harbour, ...(look === 'console' ? t.console : [])]);
}

/** Splits at a separator outside parentheses. */
function splitTop(s, sep) {
	const parts = [];
	let depth = 0;
	let start = 0;
	for (let i = 0; i < s.length; i++) {
		if (s[i] === '(') depth++;
		else if (s[i] === ')') depth--;
		else if (s[i] === sep && depth === 0) {
			parts.push(s.slice(start, i));
			start = i + 1;
		}
	}
	parts.push(s.slice(start));
	return parts.map((p) => p.trim()).filter((p) => p !== '');
}

/** The function call starting at s[at] (name then parentheses): its arguments and where it ends. */
function call(s, at, name) {
	const open = at + name.length;
	let depth = 0;
	for (let i = open; i < s.length; i++) {
		if (s[i] === '(') depth++;
		else if (s[i] === ')' && --depth === 0) return { args: splitTop(s.slice(open + 1, i), ','), end: i + 1 };
	}
	throw new Error(`unbalanced ${name}( in ${s}`);
}

/** A token's value for a look and theme, with var() and light-dark() resolved. */
export function resolve(map, name, theme, seen = []) {
	if (!THEMES.includes(theme)) throw new Error(`unknown theme ${theme}`);
	if (seen.includes(name)) throw new Error(`--${name}: refers to itself (${[...seen, name].join(' -> ')})`);
	if (!map.has(name)) throw new Error(`--${name}: no such token`);
	return substitute(map, map.get(name), theme, [...seen, name]);
}

function substitute(map, value, theme, seen) {
	let s = value;
	for (;;) {
		const at = s.search(/var\(|light-dark\(/);
		if (at < 0) return s.trim();
		if (s.startsWith('var(', at)) {
			const { args, end } = call(s, at, 'var');
			const ref = args[0].replace(/^--/, '');
			const v = map.has(ref) ? resolve(map, ref, theme, seen) : args[1] !== undefined ? substitute(map, args[1], theme, seen) : null;
			if (v === null) throw new Error(`--${seen.at(-1)}: var(--${ref}) is not a token`);
			s = s.slice(0, at) + v + s.slice(end);
		} else {
			const { args, end } = call(s, at, 'light-dark');
			if (args.length !== 2) throw new Error(`light-dark() needs two values: ${s}`);
			s = s.slice(0, at) + args[theme === 'light' ? 0 : 1] + s.slice(end);
		}
	}
}

/** A colour as [r, g, b, a], r g b 0-255 and a 0-1, or null when the value isn't one. */
export function parseColour(v) {
	const s = v.trim().toLowerCase();
	if (s === 'transparent') return [0, 0, 0, 0];
	let m = s.match(/^#([0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})$/);
	if (m) {
		let h = m[1];
		if (h.length <= 4) h = [...h].map((c) => c + c).join('');
		const n = (i) => parseInt(h.slice(i, i + 2), 16);
		return [n(0), n(2), n(4), h.length === 8 ? n(6) / 255 : 1];
	}
	m = s.match(/^rgba?\(([^)]*)\)$/);
	if (m) {
		const p = m[1].split(/[\s,/]+/).filter(Boolean);
		const ch = p.slice(0, 3).map((x) => (x.endsWith('%') ? (parseFloat(x) * 255) / 100 : parseFloat(x)));
		const a = p[3] === undefined ? 1 : p[3].endsWith('%') ? parseFloat(p[3]) / 100 : parseFloat(p[3]);
		return [...ch, a];
	}
	// How a browser reports a mixed colour: color(srgb r g b / a), 0-1.
	m = s.match(/^color\(srgb\s+([^)]*)\)$/);
	if (m) {
		const p = m[1].split(/[\s/]+/).filter(Boolean).map(parseFloat);
		return [p[0] * 255, p[1] * 255, p[2] * 255, p[3] ?? 1];
	}
	if (s.startsWith('color-mix(')) {
		const { args } = call(s, 0, 'color-mix');
		if (args[0] !== 'in srgb' || args.length !== 3) return null;
		const part = (x) => {
			const mm = x.match(/^([\s\S]*?)(?:\s+([\d.]+)%)?$/);
			return { c: parseColour(mm[1]), p: mm[2] === undefined ? null : parseFloat(mm[2]) / 100 };
		};
		const [a, b] = [part(args[1]), part(args[2])];
		if (!a.c || !b.c) return null;
		const pa = a.p ?? (b.p === null ? 0.5 : 1 - b.p);
		const pb = b.p ?? 1 - pa;
		// Premultiplied, as CSS mixes colours with alpha.
		const alpha = a.c[3] * pa + b.c[3] * pb;
		const rgb = [0, 1, 2].map((i) => (alpha === 0 ? 0 : (a.c[i] * a.c[3] * pa + b.c[i] * b.c[3] * pb) / alpha));
		return [...rgb, alpha];
	}
	return null;
}

/** A colour drawn over an opaque one. */
export function over(top, under) {
	const a = top[3];
	return [0, 1, 2].map((i) => top[i] * a + under[i] * (1 - a)).concat(1);
}

/** WCAG 2.1 relative luminance of an opaque colour. */
export function luminance([r, g, b]) {
	const lin = (v) => {
		const c = v / 255;
		return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
	};
	return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
}

/** WCAG 2.1 contrast ratio of two opaque colours, 1 to 21. */
export function ratio(a, b) {
	const [x, y] = [luminance(a), luminance(b)].sort((p, q) => q - p);
	return (x + 0.05) / (y + 0.05);
}

/** A token's colour for a look and theme, or null when it isn't a colour. */
export function colourOf(t, look, theme, name) {
	return parseColour(resolve(tokensOf(t, look), name, theme));
}
