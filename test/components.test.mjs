// The frame's components, rendered on the server (Svelte's render) through
// Vite with the Svelte plugin, as an app's build compiles them. What they
// draw by default matters most: no app switcher and no dock unless the app
// asks (an app that doesn't, PagerArchive, sees nothing new).
import { after, before, test } from 'node:test';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
import { createServer } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';

let server;
// Svelte's own render and snippets, through the same Vite, so they share its copy of Svelte.
let render;
let createRawSnippet;
const c = {};
before(async () => {
	server = await createServer({
		configFile: false,
		root: fileURLToPath(new URL('..', import.meta.url)),
		plugins: [svelte()],
		server: { middlewareMode: true, hmr: false, ws: false },
		appType: 'custom',
		logLevel: 'silent'
	});
	({ render } = await server.ssrLoadModule('svelte/server'));
	({ createRawSnippet } = await server.ssrLoadModule('svelte'));
	for (const n of ['Frame', 'Menu', 'BottomBar', 'AccountMenu', 'AppSwitcher', 'LiveBadge', 'Icon']) c[n] = (await server.ssrLoadModule(`/src/components/${n}.svelte`)).default;
	c.index = await server.ssrLoadModule('/src/components/index.js');
});
after(() => server?.close());

const snip = (html) => createRawSnippet(() => ({ render: () => html }));
// Svelte's hydration markers (<!--[-->) taken out, so the tests read the markup.
const html = (C, props = {}) => render(C, { props }).body.replace(/<!--[^>]*-->/g, '');

test('every component is in the index', () => {
	for (const n of ['Frame', 'Menu', 'BottomBar', 'AccountMenu', 'AppSwitcher', 'LiveBadge', 'Icon']) assert.equal(typeof c.index[n], 'function', n);
	assert.ok(c.index.iconNames.includes('signin') && c.index.iconNames.includes('switch'));
});

test('the frame by default: no app switcher, no dock, nothing offset', () => {
	const out = html(c.Frame, { children: snip('<p>The page</p>'), account: snip('<span>account</span>') });
	assert.match(out, /<main id="main"/);
	assert.match(out, /The page/);
	assert.doesNotMatch(out, /data-app-switcher|Switch to/);
	assert.doesNotMatch(out, /class="dock|data-dock|--dock-offset/);
	// Unnamed or half-given, still no switcher.
	assert.doesNotMatch(html(c.Frame, { otherApp: null }), /data-app-switcher/);
	assert.doesNotMatch(html(c.Frame, { otherApp: { name: 'PagerArchive', href: '' } }), /data-app-switcher/);
});

test('the app switcher: the other app by name, in the same tab, before the account menu', () => {
	const out = html(c.Frame, { otherApp: { name: 'PagerArchive', href: 'https://pager.example.org/' }, account: snip('<span id="acct">account</span>') });
	const link = out.match(/<a[^>]*data-app-switcher[^>]*>/)?.[0];
	assert.ok(link, out);
	assert.match(link, /href="https:\/\/pager\.example\.org\/"/);
	assert.match(link, /aria-label="Switch to PagerArchive"/);
	assert.doesNotMatch(link, /target=/);
	assert.match(out, />PagerArchive</);
	assert.ok(out.indexOf('data-app-switcher') < out.indexOf('id="acct"'));
});

test('the dock: only when the app passes one, as a labelled region after the page', () => {
	const out = html(c.Frame, { dock: snip('<div>Now playing: Channel 5</div>'), dockLabel: 'Now playing', children: snip('<p>The page</p>') });
	assert.match(out, /<section class="dock[^"]*" aria-label="Now playing">/);
	assert.match(out, /data-dock=""/);
	assert.match(out, /class="frame[^"]*docked/);
	assert.ok(out.indexOf('Now playing: Channel 5') > out.indexOf('The page'));
});

test('notices render inside the frame, so they follow its menu width and dock offset', () => {
	const out = html(c.Frame, { notices: snip('<div class="notice-place">New release!</div>'), dock: snip('<div>dock</div>') });
	const frameAt = out.indexOf('class="frame');
	assert.ok(frameAt >= 0 && out.indexOf('notice-place') > frameAt);
});

test('the account menu signed out: Sign in, and the theme and look still choosable', () => {
	const out = html(c.AccountMenu, { account: null, theme: 'dark', look: 'console', signIn: '/auth/signin' });
	assert.match(out, /aria-label="Account menu, signed out"/);
	assert.match(out, /<a class="row[^"]*" href="\/auth\/signin"[^>]*>.*Sign in<\/a>/s);
	assert.match(out, /Not signed in/);
	assert.doesNotMatch(out, /Sign out/);
	const selects = out.match(/<select[^>]*>/g);
	assert.equal(selects.length, 2);
	for (const s of selects) assert.doesNotMatch(s, /disabled/);
	assert.match(out, /<option value="dark" selected/);
	assert.match(out, /<option value="console" selected/);
	// Sign in as a callback draws a button.
	assert.match(html(c.AccountMenu, { account: null, signIn: () => {} }), /<button class="row[^"]*" type="button"[^>]*>.*Sign in<\/button>/s);
});

test('the account menu signed in: who, the links, Sign out; no Sign in', () => {
	const out = html(c.AccountMenu, { account: { name: 'Sam Example', email: 'sam@example.org' }, links: [{ href: '/account', label: 'Profile', icon: 'profile' }] });
	assert.match(out, /aria-label="Account menu, Sam Example"/);
	assert.match(out, />SE</);
	assert.match(out, /sam@example\.org/);
	assert.match(out, /href="\/account"[^>]*>.*Profile/s);
	assert.match(out, /Sign out/);
	assert.doesNotMatch(out, /Sign in|Not signed in/);
});

test('the Live badge: its state and its words', () => {
	assert.match(html(c.LiveBadge, {}), /<span class="live-badge" data-state="live">Live<\/span>/);
	assert.match(html(c.LiveBadge, { behind: 12 }), /data-state="behind">Behind by 12 s</);
	assert.match(html(c.LiveBadge, { delay: 5 }), /data-state="delayed">Delayed 5 min</);
});

test('the side menu: the current page, counts said in words, a closed group stays closed unless it holds the page', () => {
	const groups = [
		{ id: 'a', label: 'Admin', href: '/admin', icon: 'shield', closed: true, entries: [{ href: '/admin/x', label: 'X', icon: 'list', count: 2, says: ', 2 waiting' }] },
		{ id: 'b', label: 'Help', href: '/help', icon: 'help', closed: true, entries: [{ href: '/help/start', label: 'Start', icon: 'help' }] }
	];
	const out = html(c.Menu, { brand: { name: 'Example', href: '/' }, current: '/help/start', top: [{ href: '/', label: 'Home', icon: 'list' }], groups, version: '1.2.3' });
	assert.match(out, /href="\/help\/start" aria-current="page"/);
	assert.match(out, /aria-label="X, 2 waiting"/);
	assert.match(out, /id="menu-a" class="entries[^"]*" hidden/);
	assert.doesNotMatch(out, /id="menu-b" class="entries[^"]*" hidden/);
	assert.match(out, /data-release-target[^>]*>v1\.2\.3/);
});

test("the bottom bar: three entries and More; More's sheet leaves out what's desktop only", () => {
	const entries = ['/a', '/b', '/c', '/d'].map((href) => ({ href, label: href.slice(1).toUpperCase(), icon: 'list' }));
	const groups = [
		{ id: 'admin', label: 'Admin', href: '/admin', icon: 'shield', desktopOnly: true, entries: [{ href: '/admin/x', label: 'X', icon: 'list' }] },
		{ id: 'help', label: 'Help', href: '/help', icon: 'help', entries: [{ href: '/help/start', label: 'Start', icon: 'help' }, { href: '/help/wide', label: 'Wide', icon: 'help', desktopOnly: true }] }
	];
	const out = html(c.BottomBar, { entries, groups, current: '/help/start' });
	assert.equal((out.match(/<nav class="bottom[^"]*" aria-label="Main">[\s\S]*?<\/nav>/)[0].match(/<li/g) ?? []).length, 4);
	assert.doesNotMatch(out, /href="\/d"/);
	assert.doesNotMatch(out, /Admin|\/help\/wide/);
	assert.match(out, /href="\/help\/start"[^>]*aria-current="page"/);
	assert.match(out, /aria-current="page"[^>]*data-release-target|data-release-target[^>]*aria-current="page"|aria-haspopup="dialog"[^>]*aria-current="page"/);
});

test('an icon is hidden from assistive technology; an app passes its own as svg', () => {
	assert.match(html(c.Icon, { name: 'switch' }), /<svg class="ui-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path/);
	assert.match(html(c.Icon, { svg: '<circle cx="12" cy="12" r="4" />' }), /<circle cx="12"/);
	assert.match(html(c.Icon, { name: 'no-such-icon' }), /<svg class="ui-icon"[^>]*><\/svg>/);
});
