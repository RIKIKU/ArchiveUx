import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { loadTokens } from '../scripts/load-tokens.mjs';
import { colourOf, looks, parseColour, ratio, resolve, tokensOf } from '../scripts/tokens.mjs';
import { judge, measure } from '../scripts/contrast.mjs';

const read = (p) => JSON.parse(readFileSync(new URL(`../${p}`, import.meta.url), 'utf8'));
const tokens = loadTokens();
const spec = read('contrast/pairs.json');
const findings = read('contrast/findings.json').findings;

test('the release notice that started this fails: --surface-2 on --bg in Harbour dark', () => {
	// The old notice was a surface-2 box on the page, about 1.1:1 in dark.
	const pair = { id: 'old-notice', what: 'the old release notice', fg: 'surface-2', on: ['bg'], kind: 'notice' };
	const r = measure(tokens, { ...spec, pairs: [pair] }).filter((m) => m.look === 'harbour' && m.theme === 'dark');
	assert.equal(r.length, 1);
	assert.equal(r[0].pass, false);
	assert.ok(r[0].ratio < 1.2, `ratio ${r[0].ratio}`);
	// As text, too.
	const t = measure(tokens, { ...spec, pairs: [{ ...pair, kind: 'text' }] }).find((m) => m.look === 'harbour' && m.theme === 'dark');
	assert.equal(t.pass, false);
	// And the check would fail on it: it's not a known finding.
	assert.equal(judge(r, findings).fresh.length, 1);
});

test('the real tokens: nothing below its floor but the known findings, and no finding is stale', () => {
	const { fresh, stale } = judge(measure(tokens, spec), findings);
	assert.deepEqual(fresh, []);
	assert.deepEqual(stale, []);
});

test("the approved release notice passes on its edge (PR #88's measured numbers)", () => {
	const r = measure(tokens, { ...spec, pairs: spec.pairs.filter((p) => p.id === 'notice-edge') });
	const at = (look, theme) => r.find((m) => m.look === look && m.theme === theme).ratio.toFixed(2);
	assert.equal(at('harbour', 'light'), '5.56');
	assert.equal(at('harbour', 'dark'), '8.37');
	assert.equal(at('console', 'light'), '5.93');
	assert.equal(at('console', 'dark'), '8.40');
});

test('alerts: the --warn-bg fill only, no edge and no --alert-edge; their text still passes (owner, 2026-11-20, 0.1.1)', () => {
	// "The amber edge is very intense. I prefer it without." The fill isn't an
	// edge, so no pair measures it against the page.
	for (const look of ['harbour', 'console']) assert.equal(tokensOf(tokens, look).has('alert-edge'), false, look);
	assert.deepEqual(spec.pairs.filter((p) => p.fg === 'alert-edge' || p.fg === 'warn-bg' || p.id.startsWith('alert')), []);
	const r = measure(tokens, { ...spec, pairs: spec.pairs.filter((p) => p.id === 'warn') });
	assert.equal(r.length, 4);
	assert.ok(r.every((m) => m.pass && m.ratio >= 4.5), r.map((m) => `${m.look} ${m.theme} ${m.ratio}`).join(', '));
});

test('heat grid: every step has its own text token, each at least 4.5:1 in every look and theme', () => {
	const ids = ['heat-0-text', 'heat-1-text', 'heat-2-text', 'heat-3-text', 'heat-4-text'];
	const r = measure(tokens, { ...spec, pairs: spec.pairs.filter((p) => ids.includes(p.id)) });
	assert.equal(r.length, ids.length * 4);
	assert.ok(r.every((m) => m.ratio >= 4.5), r.filter((m) => m.ratio < 4.5).map((m) => `${m.look} ${m.theme} ${m.pair} ${m.ratio}`).join(', '));
	// Console dark's busiest shade is light: its count is dark ink (--accent-fg), not --fg.
	assert.equal(resolve(tokensOf(tokens, 'console'), 'heat-4-fg', 'dark'), resolve(tokensOf(tokens, 'console'), 'accent-fg', 'dark'));
	assert.equal(resolve(tokensOf(tokens, 'console'), 'heat-4-fg', 'light'), resolve(tokensOf(tokens, 'console'), 'fg', 'light'));
});

test('forms: the Required tag, hints and errors are 4.5:1, the tag outline and invalid border 3:1, on the page, a card and a panel, everywhere (owner, 2026-11-20; tag "B", 0.2.1)', () => {
	const ids = ['required-tag', 'required-when', 'field-hint', 'field-error', 'required-tag-edge', 'field-invalid'];
	const r = measure(tokens, { ...spec, pairs: spec.pairs.filter((p) => ids.includes(p.id)) });
	// Six pairs, three backgrounds each, two looks, two themes.
	assert.equal(r.length, ids.length * 3 * 4);
	for (const m of r) {
		assert.ok(['bg', 'surface', 'surface-2'].includes(m.on), m.on);
		assert.equal(m.min, m.pair === 'field-invalid' || m.pair === 'required-tag-edge' ? 3 : 4.5, m.pair);
		assert.ok(m.pass, `${m.look} ${m.theme} ${m.pair} on --${m.on}: ${m.ratio}`);
	}
	// Built from existing tokens: --accent for the tag, --muted for the hints, --danger-text for the error, --danger for the border.
	const fg = Object.fromEntries(spec.pairs.filter((p) => ids.includes(p.id)).map((p) => [p.id, p.fg]));
	assert.deepEqual(fg, {
		'required-tag': 'accent',
		'required-when': 'muted',
		'field-hint': 'muted',
		'field-error': 'danger-text',
		'required-tag-edge': 'accent',
		'field-invalid': 'danger'
	});
	assert.equal(spec.pairs.some((p) => p.id === 'field-required'), false, 'the grey marker of 0.2.0 is gone');
});

test('a finding that no longer fails is stale', () => {
	const extra = { look: 'harbour', theme: 'light', pair: 'text', fg: 'fg', on: 'bg' };
	assert.deepEqual(judge(measure(tokens, spec), [...findings, extra]).stale, [extra]);
});

test('WCAG contrast: black on white is 21:1, a colour on itself 1:1', () => {
	assert.equal(ratio([0, 0, 0], [255, 255, 255]).toFixed(2), '21.00');
	assert.equal(ratio([0x77, 0x77, 0x77], [0x77, 0x77, 0x77]), 1);
	// #767676 on white is the well-known 4.54:1.
	assert.equal(ratio(parseColour('#767676'), parseColour('#fff')).toFixed(2), '4.54');
});

test('light-dark() follows the theme, and Console overrides Harbour token by token', () => {
	assert.equal(resolve(tokensOf(tokens, 'harbour'), 'bg', 'light'), '#f6f8f7');
	assert.equal(resolve(tokensOf(tokens, 'harbour'), 'bg', 'dark'), '#0f1614');
	assert.equal(resolve(tokensOf(tokens, 'console'), 'bg', 'dark'), '#141414');
	// var() through another token, then light-dark().
	assert.equal(resolve(tokensOf(tokens, 'harbour'), 'emergency-dot', 'dark'), '#ff6f62');
	assert.deepEqual(colourOf(tokens, 'harbour', 'light', 'scrim'), [0, 0, 0, 0x8c / 255]);
});

test('color-mix(in srgb) mixes as a browser does', () => {
	assert.deepEqual(parseColour('color-mix(in srgb, #ffffff 50%, #000000)').map(Math.round), [128, 128, 128, 1]);
	assert.deepEqual(parseColour('color-mix(in srgb, #ff0000 25%, transparent)'), [255, 0, 0, 0.25]);
});

test('a token that refers to a missing one is an error', () => {
	const t = looks(":root { --bg: #fff; --fg: var(--nope); }\n:root[data-look='console'] { --bg: #000; --fg: #fff; }");
	assert.throws(() => resolve(tokensOf(t, 'harbour'), 'fg', 'light'), /not a token/);
});

test('LEDs: eight named colours, each an edge of at least 3:1 on the page, a card and a hovered row, everywhere (0.3.0)', () => {
	const names = ['red', 'orange', 'yellow', 'green', 'cyan', 'blue', 'purple', 'pink'];
	for (const look of ['harbour', 'console']) for (const n of names) assert.ok(tokensOf(tokens, look).has(`led-${n}`), `${look} --led-${n}`);
	const ids = names.map((n) => `led-${n}`);
	const r = measure(tokens, { ...spec, pairs: spec.pairs.filter((p) => ids.includes(p.id)) });
	// Eight colours, three backgrounds (the page, a card, a hovered row), two looks, two themes.
	assert.equal(r.length, 8 * 3 * 4);
	for (const m of r) {
		assert.equal(m.kind, 'edge');
		assert.ok(['bg', 'surface', 'hover'].includes(m.on), m.on);
		assert.ok(m.pass, `${m.look} ${m.theme} ${m.pair} on --${m.on}: ${m.ratio}`);
	}
	// The same colour in both looks, so a name means one colour.
	for (const n of names) for (const theme of ['light', 'dark']) assert.equal(resolve(tokensOf(tokens, 'harbour'), `led-${n}`, theme), resolve(tokensOf(tokens, 'console'), `led-${n}`, theme));
});

test('the dock and the Live badge: their pairs pass on --surface (and the page), everywhere (0.3.0)', () => {
	const ids = ['dock-text', 'dock-muted', 'dock-link', 'dock-control', 'dock-focus', 'live', 'live-text', 'behind-text', 'behind-ring', 'delayed-text', 'app-switcher', 'account-signin'];
	const r = measure(tokens, { ...spec, pairs: spec.pairs.filter((p) => ids.includes(p.id)) });
	assert.deepEqual([...new Set(r.map((m) => m.pair))].sort(), [...ids].sort());
	assert.ok(r.every((m) => m.pass), r.filter((m) => !m.pass).map((m) => `${m.look} ${m.theme} ${m.pair} ${m.ratio}`).join(', '));
	for (const look of ['harbour', 'console']) assert.ok(tokensOf(tokens, look).has('dock-height'), look);
});

test("the frame's own tokens: no menu offset and no dock offset unless the frame sets them", () => {
	const shared = tokensOf(tokens, 'harbour');
	assert.equal(resolve(shared, 'dock-offset', 'light'), '0rem');
	assert.equal(resolve(shared, 'frame-menu-width', 'light'), resolve(shared, 'menu-width', 'light'));
	assert.equal(resolve(tokensOf(tokens, 'console'), 'frame-menu-width', 'dark'), resolve(tokensOf(tokens, 'console'), 'menu-width', 'dark'));
});
