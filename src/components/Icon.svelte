<script>
	// An icon (docs/design-system.md, "Every control"): never alone, so it's
	// hidden from assistive technology; the label or tooltip beside it names
	// it. Drawn in the text colour and sized with the text (.ui-icon in
	// base.css). name is one of the frame's icons (icons.js); an app's own
	// icon is passed as svg, the inner markup of a 24 x 24 outline SVG drawn
	// with currentColor, compiled into the app (never fetched).
	import { icons } from './icons.js';

	/** @type {{ name?: string, svg?: string }} */
	let { name, svg } = $props();
	const inner = $derived(svg ?? (name ? icons[name] : undefined) ?? '');
</script>

<svg class="ui-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">{@html inner}</svg>
