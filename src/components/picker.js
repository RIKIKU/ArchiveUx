// A date or time field's own picker, opened by a pointer (0.5.1). Some
// browsers, Chrome on Android among them, show a native time field as
// segments to type into, and keep the clock behind a small icon; a tap on
// the field should show the picker instead. Use it as a field's onclick:
//
//   <input type="time" onclick={openPicker} />
//
// Only a pointer's click opens it: a click with no pointer (detail 0, as a
// keyboard or a screen reader sends) does nothing, so typing the value and
// the field's own keys stay as they are, and focus alone never opens it. A
// disabled or read-only field, a browser without showPicker, and a call it
// refuses (no user activation, a cross-origin frame, a type it has no
// picker for) are all left to the browser's own behaviour.

/** Open the field's picker if a pointer clicked it and the browser can. */
export function openPicker(/** @type {MouseEvent} */ e) {
	const field = /** @type {HTMLInputElement} */ (e.currentTarget);
	if (!field || e.detail === 0) return;
	if (field.disabled || field.readOnly || typeof field.showPicker !== 'function') return;
	try {
		field.showPicker();
	} catch {
		// The browser said no: the field still takes typing.
	}
}
