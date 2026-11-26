// openPicker (src/components/picker.js, 0.5.1): a pointer's click on a date
// or time field opens its picker; a keyboard's or screen reader's click, a
// disabled field and a browser that says no leave the field as it is.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { openPicker } from '../src/components/picker.js';

/** A field whose showPicker counts its calls, or throws, or is missing. */
function field({ disabled = false, readOnly = false, picker = 'ok' } = {}) {
	const f = { disabled, readOnly, opened: 0 };
	if (picker === 'ok') f.showPicker = () => f.opened++;
	if (picker === 'throws')
		f.showPicker = () => {
			f.opened++;
			throw new DOMException('showPicker() requires a user gesture.', 'NotAllowedError');
		};
	return f;
}
const click = (f, detail = 1) => openPicker(/** @type {any} */ ({ currentTarget: f, detail }));

test('a tap or a click opens the picker', () => {
	const f = field();
	click(f);
	assert.equal(f.opened, 1);
	click(f, 2);
	assert.equal(f.opened, 2);
});

test('a click with no pointer (keyboard, screen reader) leaves typing alone', () => {
	const f = field();
	click(f, 0);
	assert.equal(f.opened, 0);
});

test('a disabled or read-only field opens nothing', () => {
	for (const f of [field({ disabled: true }), field({ readOnly: true })]) {
		click(f);
		assert.equal(f.opened, 0);
	}
});

test('a browser without showPicker, or one that refuses, throws nothing', () => {
	assert.doesNotThrow(() => click(field({ picker: 'none' })));
	const f = field({ picker: 'throws' });
	assert.doesNotThrow(() => click(f));
	assert.equal(f.opened, 1);
	assert.doesNotThrow(() => openPicker(/** @type {any} */ ({ currentTarget: null, detail: 1 })));
});
