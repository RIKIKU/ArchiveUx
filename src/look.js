// The look's and the colour theme's first paint (docs/design-system.md, section 1,
// rules 7 and 8; ADR 0002). The theme's rule is at the end of this file.
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

// The colour theme's first paint (0.7.0; docs/design-system.md, section 1,
// rule 8). The owner (2026-11-28): "Light/dark should also be shared". The
// same rule as the look's, with the same cookie attributes, in a cookie of
// its own (the apps name it `theme`), so an app on an older ArchiveUx, which
// reads only the look's, is unaffected. Its value is `light` or `dark`;
// absent means follow the system, so choosing System deletes it
// (Max-Age=0). The server writes data-theme="light" or "dark" on <html>, or
// nothing for the system's. Where it comes from:
//
//   1. the parent-domain cookie the app names, when it holds light or dark;
//   2. else the app's own setting (what this browser chose, kept as the app
//      keeps it today: a host-only cookie, localStorage, a profile);
//   3. else the system's (no data-theme).

/** The themes a person can choose; System is none of them (no data-theme). */
export const THEMES = Object.freeze(['light', 'dark']);

/** The theme with nothing chosen: follow the system. */
export const DEFAULT_THEME = 'system';

/** Whether a value is a theme that overrides the system's (light or dark). */
export const isTheme = (v) => typeof v === 'string' && THEMES.includes(v);

/**
 * The theme in a Cookie header (or document.cookie), or null when the cookie
 * is absent, empty or neither light nor dark. Its value is the theme, as is.
 * @param {string | null | undefined} cookies
 * @param {string} name
 * @returns {'light' | 'dark' | null}
 */
export function themeFromCookies(cookies, name) {
	if (!cookies || !name) return null;
	for (const part of cookies.split(';')) {
		const at = part.indexOf('=');
		if (at < 0) continue;
		if (part.slice(0, at).trim() !== name) continue;
		let v = part.slice(at + 1).trim();
		if (v.startsWith('"') && v.endsWith('"') && v.length >= 2) v = v.slice(1, -1);
		if (isTheme(v)) return v;
		// An empty or unknown one is passed over: a browser that still holds a
		// host-only cookie of the same name sends both.
	}
	return null;
}

/**
 * The theme for the first paint: the named cookie's, else the app's own,
 * else the system's.
 * @param {{ cookies?: string | null, cookie?: string | null, own?: string | null }} from
 *   cookies: the request's Cookie header (or document.cookie); cookie: the
 *   name of the shared theme cookie (none when standalone); own: the app's
 *   own setting ('light', 'dark', or anything else for the system's).
 * @returns {'system' | 'light' | 'dark'}
 */
export function pickTheme({ cookies, cookie, own } = {}) {
	return (cookie && themeFromCookies(cookies, cookie)) || (isTheme(own) ? own : DEFAULT_THEME);
}

/**
 * The cookie that shares a theme across the apps on one parent domain: for a
 * Set-Cookie header, or for document.cookie in the browser. The same
 * attributes as lookCookie's. Light or dark is written for a year; System
 * (or null) deletes the cookie (an empty value, Max-Age=0) with the same
 * Domain and Path, so the system's theme is followed again.
 * @param {'system' | 'light' | 'dark' | null | undefined} theme
 * @param {{ name: string, domain?: string, maxAge?: number, secure?: boolean }} options
 *   domain: the parent domain (example.org for radio.example.org and
 *   pager.example.org); none makes a host-only cookie. secure: false only
 *   for a plain-HTTP test.
 * @returns {string}
 */
export function themeCookie(theme, { name, domain, maxAge = 60 * 60 * 24 * 365, secure = true }) {
	const system = theme === DEFAULT_THEME || theme === null || theme === undefined;
	if (!system && !isTheme(theme)) throw new Error(`not a theme: ${theme}`);
	if (!name || !/^[!#$%&'*+.^_`|~0-9A-Za-z-]+$/.test(name)) throw new Error(`not a cookie name: ${name}`);
	if (domain !== undefined && !/^[A-Za-z0-9.-]+$/.test(domain)) throw new Error(`not a domain: ${domain}`);
	const parts = [`${name}=${system ? '' : theme}`, 'Path=/', `Max-Age=${system ? 0 : Math.round(maxAge)}`, 'SameSite=Lax'];
	if (domain) parts.splice(1, 0, `Domain=${domain}`);
	if (secure) parts.push('Secure');
	return parts.join('; ');
}

/**
 * The attribute the server writes on <html>: data-theme="dark", or nothing
 * (an empty string) for the system's theme or anything unknown.
 * @param {string | null | undefined} theme
 */
export const themeAttribute = (theme) => (isTheme(theme) ? `data-theme="${theme}"` : '');

/**
 * Applies a theme now, without reloading (the account menu's choice), and,
 * with a cookie named, writes it (or deletes it, for System) so the other
 * app's next page paints with it. With a domain, a host-only cookie of the
 * same name (an app's own, from before the theme was shared) is deleted too,
 * so it can't outlast the shared one. Browser only.
 * @param {'system' | 'light' | 'dark' | null | undefined} theme
 * @param {{ name: string, domain?: string, secure?: boolean }} [cookie]
 */
export function applyTheme(theme, cookie) {
	const v = isTheme(theme) ? theme : DEFAULT_THEME;
	if (v === DEFAULT_THEME) delete document.documentElement.dataset.theme;
	else document.documentElement.dataset.theme = v;
	if (!cookie?.name) return;
	if (cookie.domain) document.cookie = themeCookie(null, { ...cookie, domain: undefined });
	document.cookie = themeCookie(v, cookie);
}
