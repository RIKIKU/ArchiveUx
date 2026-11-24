import { test } from 'node:test';
import assert from 'node:assert/strict';
import { DEFAULT_LOOK, LOOKS, isLook, lookAttribute, lookCookie, lookFromCookies, pickLook } from '../src/look.js';

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
