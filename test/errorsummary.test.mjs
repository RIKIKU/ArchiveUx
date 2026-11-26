// The error summary's words and its links (src/components/errorsummary.js,
// 0.6.0): a link moves the focus to the field it names and brings it into
// view; a field that's gone leaves the link to the browser.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { focusField, problemText, summaryTitle } from '../src/components/errorsummary.js';

test('the title counts the fields', () => {
	assert.equal(summaryTitle(1), '1 field needs attention');
	assert.equal(summaryTitle(3), '3 fields need attention');
});

test("a problem's link names its field, then says what to do", () => {
	assert.equal(problemText({ label: 'Name', message: 'Give it a name.' }), 'Name: Give it a name.');
	assert.equal(problemText({ label: '', message: 'Give it a name.' }), 'Give it a name.');
});

/** A page holding one field, which records what's done to it. */
function page() {
	const field = { focused: undefined, scrolled: undefined };
	field.focus = (o) => (field.focused = o);
	field.scrollIntoView = (o) => (field.scrolled = o);
	return { field, doc: { getElementById: (id) => (id === 'g-name' ? field : null) } };
}
const click = () => {
	const e = { prevented: false, preventDefault: () => (e.prevented = true) };
	return e;
};

test('a link moves the focus to its field, and brings it to the middle of the screen', () => {
	const { field, doc } = page();
	const e = click();
	assert.equal(focusField(/** @type {any} */ (e), 'g-name', doc), true);
	assert.equal(e.prevented, true);
	assert.deepEqual(field.focused, { preventScroll: true });
	assert.deepEqual(field.scrolled, { block: 'center' });
});

test("a link to a field that's gone is left to the browser", () => {
	const { doc } = page();
	const e = click();
	assert.equal(focusField(/** @type {any} */ (e), 'g-gone', doc), false);
	assert.equal(e.prevented, false);
	assert.equal(focusField(/** @type {any} */ (e), 'g-name', /** @type {any} */ ({ getElementById: () => null })), false);
});
