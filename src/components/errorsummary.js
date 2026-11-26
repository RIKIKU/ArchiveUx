// The error summary's words and links (docs/design-system.md, section 5;
// 0.6.0). Nothing here draws anything, so it is tested on its own
// (test/errorsummary.test.mjs); ErrorSummary.svelte uses it.

/** The summary's title: "1 field needs attention", "3 fields need attention". */
export function summaryTitle(/** @type {number} */ n) {
	return n === 1 ? '1 field needs attention' : `${n} fields need attention`;
}

/** A problem's link text: the field's name, then what to do ("Name: Give it a name."). */
export function problemText(/** @type {{ label: string, message: string }} */ p) {
	return p.label ? `${p.label}: ${p.message}` : p.message;
}

/**
 * A summary link's click: the focus to the field it names, and the field
 * scrolled to the middle of the screen, clear of a sticky top bar and of a
 * phone's bottom bar and dock. A field the page doesn't have (it went with
 * a change of option) leaves the link to the browser, which follows its
 * #id as far as it can. A field that can't take the focus itself (a group,
 * a custom control) should be named by its first control's id.
 */
export function focusField(/** @type {MouseEvent} */ e, /** @type {string} */ id, doc = globalThis.document) {
	const field = doc?.getElementById(id);
	if (!field) return false;
	e.preventDefault();
	field.focus({ preventScroll: true });
	field.scrollIntoView?.({ block: 'center' });
	return true;
}
