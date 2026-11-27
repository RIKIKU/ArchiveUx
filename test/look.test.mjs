import { test } from 'node:test';
import assert from 'node:assert/strict';
import { DEFAULT_LOOK, DEFAULT_THEME, LOOKS, THEMES, applyTheme, isLook, isTheme, lookAttribute, lookCookie, lookFromCookies, pickLook, pickTheme, themeAttribute, themeCookie, themeFromCookies } from '../src/look.js';

test('the looks: Harbour first and the default', () => {
	assert.deepEqual(LOOKS, ['harbour', 'console']);
	assert.equal(DEFAULT_LOOK, 'harbour');
	assert.equal(isLook('console'), true);
	assert.equal(isLook('Console'), false);
	assert.equal(isLook(undefined), false);
});

test('the named cookie is read from a Cookie header, a known look only', () => {
	assert.equal(lookFromCookies('session=abc; look=console; other=1', 'look'), 'console');
	assert.equal(lookFromCookies('look=harbour', 'look'), 'harbour');
	assert.equal(lookFromCookies('look="console"', 'look'), 'console');
	assert.equal(lookFromCookies('  shared_look = console ', 'shared_look'), 'console');
	// Another cookie whose name ends the same isn't it.
	assert.equal(lookFromCookies('mylook=console', 'look'), null);
	assert.equal(lookFromCookies('look=neon', 'look'), null);
	assert.equal(lookFromCookies('look=', 'look'), null);
	assert.equal(lookFromCookies('', 'look'), null);
	assert.equal(lookFromCookies(undefined, 'look'), null);
	assert.equal(lookFromCookies('look=console', ''), null);
});

test("first paint: the named cookie wins, then the app's own setting, then Harbour", () => {
	// Combined deployment: the cookie is named and set.
	assert.equal(pickLook({ cookies: 'look=console', cookie: 'look', own: 'harbour' }), 'console');
	// Named but absent or unknown: the app's own.
	assert.equal(pickLook({ cookies: 'session=1', cookie: 'look', own: 'console' }), 'console');
	assert.equal(pickLook({ cookies: 'look=neon', cookie: 'look', own: 'console' }), 'console');
	// Standalone: no cookie named, so a stray cookie is ignored.
	assert.equal(pickLook({ cookies: 'look=console', own: 'harbour' }), 'harbour');
	assert.equal(pickLook({ cookies: 'look=console', own: null }), 'harbour');
	// Nothing at all.
	assert.equal(pickLook(), 'harbour');
	assert.equal(pickLook({ own: 'neon' }), 'harbour');
});

test('the shared cookie: the parent domain, every path, a year, Lax, Secure', () => {
	assert.equal(lookCookie('console', { name: 'look', domain: 'example.org' }), 'look=console; Domain=example.org; Path=/; Max-Age=31536000; SameSite=Lax; Secure');
	// Host-only without a domain; not Secure only when asked (a plain-HTTP test).
	assert.equal(lookCookie('harbour', { name: 'look', secure: false, maxAge: 60 }), 'look=harbour; Path=/; Max-Age=60; SameSite=Lax');
	assert.throws(() => lookCookie('neon', { name: 'look' }), /not a look/);
	assert.throws(() => lookCookie('console', { name: 'lo ok' }), /not a cookie name/);
	assert.throws(() => lookCookie('console', { name: 'look', domain: 'example.org; Path=/x' }), /not a domain/);
	// What it writes, it reads back.
	const written = lookCookie('console', { name: 'look', domain: 'example.org' }).split(';')[0];
	assert.equal(lookFromCookies(written, 'look'), 'console');
});

test("the root's attribute: always written, Harbour for anything unknown", () => {
	assert.equal(lookAttribute('console'), 'data-look="console"');
	assert.equal(lookAttribute('harbour'), 'data-look="harbour"');
	assert.equal(lookAttribute('"><script>'), 'data-look="harbour"');
});

// The colour theme (0.7.0): the same rule in a cookie of its own.

test('the themes: light and dark; nothing chosen follows the system', () => {
	assert.deepEqual(THEMES, ['light', 'dark']);
	assert.equal(DEFAULT_THEME, 'system');
	assert.equal(isTheme('dark'), true);
	assert.equal(isTheme('system'), false);
	assert.equal(isTheme('Dark'), false);
	assert.equal(isTheme(undefined), false);
});

test('the theme cookie is read from a Cookie header, light or dark only', () => {
	assert.equal(themeFromCookies('session=abc; look=console; theme=dark', 'theme'), 'dark');
	assert.equal(themeFromCookies('theme=light', 'theme'), 'light');
	assert.equal(themeFromCookies('theme="dark"', 'theme'), 'dark');
	assert.equal(themeFromCookies('  shared_theme = light ', 'shared_theme'), 'light');
	assert.equal(themeFromCookies('mytheme=dark', 'theme'), null);
	assert.equal(themeFromCookies('theme=system', 'theme'), null);
	assert.equal(themeFromCookies('theme=neon', 'theme'), null);
	assert.equal(themeFromCookies('theme=', 'theme'), null);
	assert.equal(themeFromCookies('', 'theme'), null);
	assert.equal(themeFromCookies(undefined, 'theme'), null);
	assert.equal(themeFromCookies('theme=dark', ''), null);
	// Two of the same name (a host-only one and the shared one): an empty or
	// unknown one is passed over.
	assert.equal(themeFromCookies('theme=; theme=dark', 'theme'), 'dark');
	assert.equal(themeFromCookies('theme=light; theme=dark', 'theme'), 'light');
	// The look's cookie alone (an older app): no theme.
	assert.equal(themeFromCookies('look=console', 'theme'), null);
});

test("first paint: the named theme cookie wins, then the app's own setting, then the system's", () => {
	assert.equal(pickTheme({ cookies: 'theme=dark', cookie: 'theme', own: 'light' }), 'dark');
	// Named but absent or unknown: the app's own (a choice kept from before).
	assert.equal(pickTheme({ cookies: 'look=console', cookie: 'theme', own: 'dark' }), 'dark');
	assert.equal(pickTheme({ cookies: 'theme=neon', cookie: 'theme', own: 'light' }), 'light');
	assert.equal(pickTheme({ cookies: 'theme=neon', cookie: 'theme', own: 'system' }), 'system');
	// Standalone: no cookie named, so a stray cookie is ignored.
	assert.equal(pickTheme({ cookies: 'theme=dark', own: 'light' }), 'light');
	assert.equal(pickTheme({ cookies: 'theme=dark', own: null }), 'system');
	// Nothing at all.
	assert.equal(pickTheme(), 'system');
	assert.equal(pickTheme({ own: 'neon' }), 'system');
});

test('the shared theme cookie: as the look\'s; System deletes it', () => {
	assert.equal(themeCookie('dark', { name: 'theme', domain: 'example.org' }), 'theme=dark; Domain=example.org; Path=/; Max-Age=31536000; SameSite=Lax; Secure');
	assert.equal(themeCookie('light', { name: 'theme', secure: false, maxAge: 60 }), 'theme=light; Path=/; Max-Age=60; SameSite=Lax');
	// System (or nothing): the same Domain and Path, emptied, Max-Age=0.
	assert.equal(themeCookie('system', { name: 'theme', domain: 'example.org' }), 'theme=; Domain=example.org; Path=/; Max-Age=0; SameSite=Lax; Secure');
	assert.equal(themeCookie(null, { name: 'theme', maxAge: 60 }), 'theme=; Path=/; Max-Age=0; SameSite=Lax; Secure');
	assert.equal(themeCookie(undefined, { name: 'theme', secure: false }), 'theme=; Path=/; Max-Age=0; SameSite=Lax');
	assert.throws(() => themeCookie('neon', { name: 'theme' }), /not a theme/);
	assert.throws(() => themeCookie('dark', { name: 'the me' }), /not a cookie name/);
	assert.throws(() => themeCookie('dark', { name: 'theme', domain: 'example.org; Path=/x' }), /not a domain/);
	const written = themeCookie('dark', { name: 'theme', domain: 'example.org' }).split(';')[0];
	assert.equal(themeFromCookies(written, 'theme'), 'dark');
	const deleted = themeCookie('system', { name: 'theme' }).split(';')[0];
	assert.equal(themeFromCookies(deleted, 'theme'), null);
});

test("the root's theme attribute: light or dark, nothing for the system's", () => {
	assert.equal(themeAttribute('dark'), 'data-theme="dark"');
	assert.equal(themeAttribute('light'), 'data-theme="light"');
	assert.equal(themeAttribute('system'), '');
	assert.equal(themeAttribute(null), '');
	assert.equal(themeAttribute('"><script>'), '');
});

test('applyTheme: sets data-theme and writes the cookie; System removes both', () => {
	const written = [];
	const dataset = {};
	globalThis.document = { documentElement: { dataset }, set cookie(v) { written.push(v); } };
	try {
		applyTheme('dark');
		assert.equal(dataset.theme, 'dark');
		assert.deepEqual(written, []);
		applyTheme('light', { name: 'theme', secure: false });
		assert.equal(dataset.theme, 'light');
		assert.deepEqual(written, ['theme=light; Path=/; Max-Age=31536000; SameSite=Lax']);
		// With a domain, an app's own host-only cookie of the same name goes first.
		written.length = 0;
		applyTheme('dark', { name: 'theme', domain: 'example.org' });
		assert.deepEqual(written, ['theme=; Path=/; Max-Age=0; SameSite=Lax; Secure', 'theme=dark; Domain=example.org; Path=/; Max-Age=31536000; SameSite=Lax; Secure']);
		written.length = 0;
		applyTheme('system', { name: 'theme', domain: 'example.org' });
		assert.equal('theme' in dataset, false);
		assert.deepEqual(written, ['theme=; Path=/; Max-Age=0; SameSite=Lax; Secure', 'theme=; Domain=example.org; Path=/; Max-Age=0; SameSite=Lax; Secure']);
		// Anything unknown is the system's.
		applyTheme('neon');
		assert.equal('theme' in dataset, false);
	} finally {
		delete globalThis.document;
	}
});
