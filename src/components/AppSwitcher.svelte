<script>
	// The app switcher (docs/design-system.md, section 4, "App switcher";
	// 0.3.0, ADR 0002): in a combined deployment, a link in the top bar to the
	// other app, by name, opened in the same tab. The app hands the frame the
	// other app's name and address from its own setting; with none (a
	// standalone app), the frame draws no switcher. Its name says where it
	// goes: "Switch to PagerArchive", which holds the words shown (WCAG
	// 2.5.3).
	import Icon from './Icon.svelte';

	/** @type {{ name: string, href: string, onswitch?: (e: MouseEvent) => unknown }} */
	let { name, href, onswitch } = $props();
</script>

<a class="switcher" {href} aria-label="Switch to {name}" data-app-switcher onclick={(e) => onswitch?.(e)}><Icon name="switch" /><span>{name}</span></a>

<style>
	.switcher {
		display: inline-flex;
		align-items: center;
		gap: var(--space-xs);
		min-height: var(--target);
		padding: 0 var(--space-sm);
		border-radius: var(--radius-button);
		color: var(--fg);
		font-size: var(--text-sm);
		font-weight: var(--weight-strong);
		text-decoration: none;
		white-space: nowrap;
	}
	.switcher:hover {
		background: var(--hover);
	}
	.switcher:active {
		background: var(--accent-soft);
		color: var(--accent-soft-fg);
	}
	@media print {
		.switcher {
			display: none;
		}
	}
</style>
