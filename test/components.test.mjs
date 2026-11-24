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
	for (const n of ['Frame', 'Menu', 'BottomBar', 'AccountMenu', 'AppSwitcher', 'LiveBadge', 'Icon', 'DateRange', 'Suggest']) c[n] = (await server.ssrLoadModule(`/src/components/${n}.svelte`)).default;
	c.index = await server.ssrLoadModule('/src/components/index.js');
});
after(() => server?.close());

const snip = (html) => createRawSnippet(() => ({ render: () => html }));
// Svelte's hydration markers (<!--[-->) taken out, so the tests read the markup.
const html = (C, props = {}) => render(C, { props }).body.replace(/<!--[^>]*-->/g, '');

test('every component is in the index', () => {
	for (const n of ['Frame', 'Menu', 'BottomBar', 'AccountMenu', 'AppSwitcher', 'LiveBadge', 'Icon', 'DateRange', 'Suggest']) assert.equal(typeof c.index[n], 'function', n);
	assert.ok(['signin', 'switch', 'calendar', 'previous', 'next'].every((n) => c.index.iconNames.includes(n)));
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

// DateRange (0.4.0). Days in 2020, so the labels carry the year whatever today is.
const range = { from: '2020-11-03', to: '2020-11-05', timeZone: 'Australia/Melbourne', firstPage: '2019-01-01', lastPage: '2020-12-31' };
const hidden = (out) => [...out.matchAll(/<input type="hidden" name="([^"]+)" value="([^"]*)"/g)].map((m) => `${m[1]}=${m[2]}`);

test('DateRange by default: whole days, the from and to fields only, no times', () => {
	const out = html(c.DateRange, range);
	assert.match(out, /aria-label="Dates: 3 Nov 2020 – 5 Nov 2020"/);
	assert.match(out, /<span class="label[^"]*">3 Nov 2020 – 5 Nov 2020<\/span>/);
	assert.deepEqual(hidden(out), ['from=2020-11-03', 'to=2020-11-05']);
	assert.doesNotMatch(out, /time/i);
	// Times given without times on are ignored.
	assert.deepEqual(hidden(html(c.DateRange, { ...range, fromTime: '14:00', toTime: '16:30' })), ['from=2020-11-03', 'to=2020-11-05']);
	// Nothing picked: the icon alone, named Dates.
	assert.match(html(c.DateRange, { timeZone: 'UTC' }), /aria-label="Dates"/);
});

test('DateRange with times: the time fields, and the times in the label', () => {
	const out = html(c.DateRange, { ...range, times: true, fromTime: '14:00', toTime: '09:30' });
	assert.match(out, /aria-label="Dates: 3 Nov 2020 14:00 – 5 Nov 2020 09:30"/);
	assert.deepEqual(hidden(out), ['from=2020-11-03', 'to=2020-11-05', 'from_time=14:00', 'to_time=09:30']);
	// An empty time is the whole day, and is sent empty.
	const half = html(c.DateRange, { ...range, times: true, fromTime: '14:00' });
	assert.match(half, /aria-label="Dates: 3 Nov 2020 14:00 – 5 Nov 2020"/);
	assert.deepEqual(hidden(half), ['from=2020-11-03', 'to=2020-11-05', 'from_time=14:00', 'to_time=']);
	// One day.
	const one = { ...range, to: '', times: true };
	assert.match(html(c.DateRange, { ...one, fromTime: '14:00', toTime: '16:30' }), /aria-label="Dates: 3 Nov 2020 14:00 – 16:30"/);
	assert.match(html(c.DateRange, { ...one, fromTime: '14:00' }), /aria-label="Dates: 3 Nov 2020 from 14:00"/);
	assert.match(html(c.DateRange, { ...one, toTime: '16:30' }), /aria-label="Dates: 3 Nov 2020 until 16:30"/);
	assert.match(html(c.DateRange, one), /aria-label="Dates: 3 Nov 2020"/);
	// No day, no times: a time means nothing without its day.
	assert.deepEqual(hidden(html(c.DateRange, { timeZone: 'UTC', times: true, fromTime: '14:00' })), ['from=', 'to=', 'from_time=', 'to_time=']);
});

test('DateRange: the calendar is a closed dialog until the button opens it', () => {
	const out = html(c.DateRange, { ...range, times: true });
	assert.match(out, /<button[^>]*aria-haspopup="dialog"[^>]*aria-expanded="false"/s);
	assert.match(out, /role="dialog" aria-label="Choose dates" hidden/);
	assert.doesNotMatch(out, /role="grid"/);
});

test('Suggest: an ARIA combobox, its list closed and labelled, the count announced politely', () => {
	const out = html(c.Suggest, { suggest: () => ({ options: [], what: 'suggestion' }), label: 'Channel', listLabel: 'Channels', icon: 'search' });
	const input = out.match(/<input[^>]*>/)[0];
	for (const a of ['role="combobox"', 'aria-autocomplete="list"', 'aria-expanded="false"', 'autocomplete="off"', 'type="text"']) assert.ok(input.includes(a), a);
	assert.match(input, /aria-controls="([^"]+)-list"/);
	assert.match(out, /role="listbox" aria-label="Channels" hidden/);
	assert.match(out, /<span class="visually-hidden[^"]*">Channel<\/span>/);
	assert.match(out, /aria-live="polite"/);
	assert.match(out, /<svg class="ui-icon"/);
	// Shown above, required, invalid (rules, section 5).
	const field = html(c.Suggest, { suggest: () => ({ options: [], what: 'suggestion' }), label: 'Channel', listLabel: 'Channels', showLabel: true, marker: 'required', invalid: true, id: 'ch' });
	assert.match(field, /<label class="above[^"]*" for="ch">Channel <span class="required">required<\/span><\/label>/);
	assert.match(field, /<input[^>]*id="ch"[^>]*required[^>]*aria-invalid="true"/);
});
