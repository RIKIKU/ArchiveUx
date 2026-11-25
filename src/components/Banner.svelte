<script>
	// A banner (docs/design-system.md, section 4, "Alerts"; 0.5.0, ADR 0004):
	// an alert that stays on the page, a warning (the default), an error or
	// information. .banner in base.css draws it: the tone's fill and text, no
	// edge. A leading icon (warning, error, info) unless icon is false; it is
	// hidden from assistive technology, so the words say what it is.
	//
	// role: none by default, for a banner that is there when the page opens
	// (a disk warning). A banner that appears because something just went
	// wrong takes role="alert"; one that reports news politely, "status".
	import Icon from './Icon.svelte';

	/**
	 * @type {{
	 *   tone?: 'warning' | 'error' | 'info',
	 *   title?: string,
	 *   icon?: boolean,
	 *   role?: 'alert' | 'status',
	 *   children?: import('svelte').Snippet
	 * }}
	 */
	let { tone = 'warning', title, icon = true, role, children } = $props();
</script>

<div class="banner" data-tone={tone} {role}>
	{#if icon}<Icon name={tone} />{/if}
	<div class="banner-body">
		{#if title}<p class="banner-title">{title}</p>{/if}
		{@render children?.()}
	</div>
</div>

<style>
	.banner-body {
		display: flex;
		flex-direction: column;
		gap: var(--space-2xs);
		min-width: 0;
	}
	.banner-title {
		font-weight: var(--weight-strong);
	}
</style>
