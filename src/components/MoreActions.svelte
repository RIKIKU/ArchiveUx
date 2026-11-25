<script>
	// More actions (docs/design-system.md, section 4, "More actions"; 0.5.0,
	// ADR 0004): a button that shows a short list of a thing's other actions
	// under it, the disclosure pattern (aria-expanded, aria-controls), not an
	// ARIA menu: Tab moves through the actions, as through any buttons.
	//
	// - The button is a secondary icon button (the more icon) with a tooltip,
	//   or, with text, the icon and the words. Its accessible name says whose
	//   actions they are: label="More actions: Channel 5". While open it shows
	//   pressed (--accent-soft).
	// - The list: --surface-2 with a --control-border edge, under the button,
	//   lined up with its end (align="end", the default) or its start. Each
	//   button or link in it is a row at least --target high, hover --hover; a
	//   destructive one has class="danger" (--danger-text), and asks before it
	//   acts (Confirm).
	// - Escape closes it and gives the focus back to the button, and so does
	//   choosing an action; a click or focus outside closes it. The children
	//   snippet gets close, for an action that needs it.
	import Icon from './Icon.svelte';

	/**
	 * @type {{
	 *   label?: string,
	 *   tip?: string,
	 *   text?: string,
	 *   align?: 'start' | 'end',
	 *   open?: boolean,
	 *   children: import('svelte').Snippet<[{ close: () => void }]>
	 * }}
	 */
	let { label = 'More actions', tip = 'More actions', text, align = 'end', open = $bindable(false), children } = $props();

	const uid = $props.id();
	/** @type {HTMLDivElement} */
	let box;
	/** @type {HTMLButtonElement} */
	let toggle;
	let tipOff = $state(false);
	const close = () => (open = false);

	function outside(/** @type {Event} */ ev) {
		if (open && !box.contains(/** @type {Node} */ (ev.target))) open = false;
	}
	function keys(/** @type {KeyboardEvent} */ ev) {
		if (ev.key !== 'Escape') return;
		if (open) {
			open = false;
			toggle.focus();
		} else if (box.contains(document.activeElement)) tipOff = true;
	}
	// Choosing an action closes the list; the focus goes back to the button
	// rather than to nothing.
	function chosen(/** @type {MouseEvent} */ ev) {
		const hit = /** @type {Element} */ (ev.target).closest('button, a');
		if (!hit || hit.hasAttribute('disabled')) return;
		open = false;
		toggle.focus();
	}
</script>

<svelte:window onclick={outside} onfocusin={outside} onkeydown={keys} />

<div class="more-actions" bind:this={box}>
	<!-- svelte-ignore a11y_no_static_element_interactions (the tooltip comes back after Escape hid it: WCAG 1.4.13) -->
	<span class="has-tip" class:tip-off={tipOff || open || !!text} onpointerleave={() => (tipOff = false)} onfocusout={() => (tipOff = false)}>
		<button
			bind:this={toggle}
			type="button"
			class="secondary toggle"
			class:icon-only={!text}
			aria-expanded={open}
			aria-controls="{uid}-actions"
			aria-label={label}
			onclick={() => (open = !open)}><Icon name="more" />{#if text}<span>{text}</span>{/if}</button
		>
		{#if !text}<span class="tooltip" aria-hidden="true">{tip}</span>{/if}
	</span>
	<!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
	<div class="panel {align}" id="{uid}-actions" hidden={!open} onclick={chosen}>
		{@render children({ close })}
	</div>
</div>

<style>
	.more-actions {
		position: relative;
		display: inline-flex;
	}
	.icon-only {
		width: var(--target);
		padding: 0;
	}
	.toggle[aria-expanded='true'] {
		background: var(--accent-soft);
		border-color: var(--accent);
		color: var(--accent-soft-fg);
	}
	.panel {
		position: absolute;
		top: 100%;
		z-index: var(--layer-overlay);
		display: flex;
		flex-direction: column;
		gap: var(--space-3xs);
		min-width: var(--field-wide);
		max-width: var(--panel-max);
		margin-top: var(--space-2xs);
		padding: var(--space-2xs);
		background: var(--surface-2);
		color: var(--fg);
		border: var(--border-width) solid var(--control-border);
		border-radius: var(--radius);
		white-space: normal;
		text-align: start;
	}
	.panel[hidden] {
		display: none;
	}
	.panel.end {
		right: 0;
	}
	.panel.start {
		left: 0;
	}
	.panel > :global(:is(button, a)) {
		display: flex;
		align-items: center;
		justify-content: flex-start;
		gap: var(--space-sm);
		width: 100%;
		min-height: var(--target);
		padding: 0 var(--space-md);
		border: 0;
		border-radius: var(--radius-small);
		background: transparent;
		color: var(--fg);
		font-weight: var(--weight-normal);
		text-align: start;
		text-decoration: none;
	}
	.panel > :global(:is(button, a):hover) {
		background: var(--hover);
	}
	.panel > :global(:is(button, a):active) {
		background: var(--accent-soft);
		color: var(--accent-soft-fg);
	}
	.panel > :global(:is(button, a).danger) {
		background: transparent;
		color: var(--danger-text);
	}
	.panel > :global(:is(button, a).danger:hover) {
		background: var(--hover);
	}
	.panel > :global(hr) {
		width: 100%;
		margin: var(--space-3xs) 0;
		border: 0;
		border-top: var(--border-width) solid var(--border);
	}
</style>
