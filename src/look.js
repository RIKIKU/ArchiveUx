// The look's first paint (docs/design-system.md, section 1.7; ADR 0002).
// The server writes the look onto <html data-look="…"> in the page it sends,
// so the first paint is already the person's look and no script has to run
// first. Where it comes from:
//
//   1. the parent-domain cookie the app names (a combined deployment, where
//      the apps share one look), when it holds a known look;
//   2. else the app's own setting (a signed-in profile's look, or what this
//      browser chose, saved as the app saves its other settings);
//   3. else Harbour.
//
// A standalone app names no cookie and goes straight to 2. These functions
// are the rule in code, for a server written in JavaScript and for the
// browser; a server in another language follows the same steps (the tests in
// test/look.test.mjs are the cases). No dependencies: runs in Node and in the
// browser.

/** The looks, Harbour (the default) first. */
export const LOOKS = Object.freeze(['harbour', 'console']);

/** The look with nothing chosen. */
export const DEFAULT_LOOK = 'harbour';

/** Whether a value is a known look. */
export const isLook = (v) => typeof v === 'string' && LOOKS.includes(v);

/**
 * The look in a Cookie header (or document.cookie), or null when the cookie
 * is absent, empty or not a known look. Its value is the look's name, as is.
 * @param {string | null | undefined} cookies
 * @param {string} name
 * @returns {'harbour' | 'console' | null}
 */
export function lookFromCookies(cookies, name) {
	if (!cookies || !name) return null;
	for (const part of cookies.split(';')) {
		const at = part.indexOf('=');
		if (at < 0) continue;
		if (part.slice(0, at).trim() !== name) continue;
		let v = part.slice(at + 1).trim();
		if (v.startsWith('"') && v.endsWith('"') && v.length >= 2) v = v.slice(1, -1);
		return isLook(v) ? v : null;
	}
	return null;
}

/**
 * The look for the first paint: the named cookie's, else the app's own,
 * else Harbour.
 * @param {{ cookies?: string | null, cookie?: string | null, own?: string | null }} from
 *   cookies: the request's Cookie header (or document.cookie); cookie: the
 *   name of the shared look cookie (none when standalone); own: the app's own
 *   setting.
 * @returns {'harbour' | 'console'}
 */
export function pickLook({ cookies, cookie, own } = {}) {
	return (cookie && lookFromCookies(cookies, cookie)) || (isLook(own) ? own : DEFAULT_LOOK);
}

/**
 * The cookie that shares a look across the apps on one parent domain: for a
 * Set-Cookie header, or for document.cookie in the browser. It lasts a year,
 * is sent to every path, and is Secure and SameSite=Lax. Not HttpOnly, so
 * the apps' pages can change it at once when the look is chosen.
 * @param {string} look
 * @param {{ name: string, domain?: string, maxAge?: number, secure?: boolean }} options
 *   domain: the parent domain (example.org for radio.example.org and
 *   pager.example.org); none makes a host-only cookie. secure: false only
 *   for a plain-HTTP test.
 * @returns {string}
 */
export function lookCookie(look, { name, domain, maxAge = 60 * 60 * 24 * 365, secure = true }) {
	if (!isLook(look)) throw new Error(`not a look: ${look}`);
	if (!name || !/^[!#$%&'*+.^_`|~0-9A-Za-z-]+$/.test(name)) throw new Error(`not a cookie name: ${name}`);
	if (domain !== undefined && !/^[A-Za-z0-9.-]+$/.test(domain)) throw new Error(`not a domain: ${domain}`);
	const parts = [`${name}=${look}`, 'Path=/', `Max-Age=${Math.round(maxAge)}`, 'SameSite=Lax'];
	if (domain) parts.splice(1, 0, `Domain=${domain}`);
	if (secure) parts.push('Secure');
	return parts.join('; ');
}

/**
 * The attribute the server writes on <html>: data-look="console". Every look
 * is written, Harbour too, so a test can tell "Harbour" from "nothing
 * written".
 * @param {string} look
 */
export const lookAttribute = (look) => `data-look="${isLook(look) ? look : DEFAULT_LOOK}"`;

/**
 * Applies a look now, without reloading (the account menu's choice), and,
 * with a cookie named, writes it so the other app's next page paints with it.
 * Browser only.
 * @param {string} look
 * @param {{ name: string, domain?: string, secure?: boolean }} [cookie]
 */
export function applyLook(look, cookie) {
	const v = isLook(look) ? look : DEFAULT_LOOK;
	document.documentElement.dataset.look = v;
	if (cookie?.name) document.cookie = lookCookie(v, cookie);
}
