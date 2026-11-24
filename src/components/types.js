// The frame's shared types, for apps that check their JavaScript or
// TypeScript (JSDoc only; nothing runs here).

/**
 * A page in the menu.
 * @typedef {object} Entry
 * @property {string} href
 * @property {string} label
 * @property {string} [icon] one of the frame's icons (icons.js)
 * @property {string} [svg] or the app's own icon's inner markup
 * @property {string} [text] what it's for, in a few words (the shrunk menu's tooltip for a top entry)
 * @property {boolean} [desktopOnly] left out of the phone's More sheet (it still opens from a link)
 * @property {number} [count] a pill; 0 or none shows none
 * @property {boolean} [quiet] the pill is soft: a count of things, not a call to act
 * @property {boolean} [dot] a dot, no number
 * @property {string} [says] the count or dot in words, added to the name (", 3 requests waiting")
 */

/**
 * A group of pages under a heading.
 * @typedef {object} Group
 * @property {string} id
 * @property {string} label
 * @property {string} [icon]
 * @property {string} [svg]
 * @property {string} [text] what's in it, in a few words: the shrunk menu's flyout heading
 * @property {string} href its start page
 * @property {boolean} [closed] closed until the person opens it (unless it holds the current page)
 * @property {boolean} [desktopOnly] left out of the phone's More sheet
 * @property {number} [count]
 * @property {boolean} [dot]
 * @property {string} [says]
 * @property {string} [fresh] a line in the shrunk flyout while it has a dot
 * @property {Entry[]} entries
 */

/**
 * The other app, for the app switcher (combined deployment only).
 * @typedef {object} OtherApp
 * @property {string} name its name as shown ("PagerArchive")
 * @property {string} href its address, opened in the same tab
 */

/**
 * Who's signed in, or null for nobody.
 * @typedef {{ name?: string, email?: string } | null} Account
 */

export {};
