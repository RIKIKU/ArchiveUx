<script>
	// The frame of every page in the app (docs/design-system.md, section 4,
	// "The frame"; 0.3.0, ADR 0002), from PagerArchive's layout: the side
	// menu on desktops, the top bar (the app's start, its tools, the app
	// switcher and the account menu), the page, and on phones the bottom bar
	// instead of the side menu. The app fills each part with a snippet (Menu,
	// BottomBar, AccountMenu, or its own).
	//
	// Two parts are optional and absent unless the app asks:
	// - the app switcher: pass otherApp, { name, href }, from the app's
	//   setting naming the other app (a combined deployment); with none, there
	//   is no switcher;
	// - the dock: pass a dock snippet on the pages that have one (a player's
	//   now playing and controls). Phones: above the bottom bar, across the
	//   width. Desktops: along the foot of the content beside the side menu,
	//   as wide as the content is (shrunk menu or not). The page keeps room
	//   for it at its foot.
	// Notices and toasts go in the notices snippet, with .notice-place on
	// each: the frame sets --frame-menu-width and --dock-offset on its root, so
	// they sit beside the menu and above the dock.

	import AppSwitcher from './AppSwitcher.svelte';

	/**
	 * @type {{
	 *   menu?: import('svelte').Snippet,
	 *   start?: import('svelte').Snippet,
	 *   tools?: import('svelte').Snippet,
	 *   account?: import('svelte').Snippet,
	 *   bottomBar?: import('svelte').Snippet,
	 *   dock?: import('svelte').Snippet,
	 *   dockLabel?: string,
	 *   notices?: import('svelte').Snippet,
	 *   otherApp?: import('./types.js').OtherApp | null,
	 *   onswitch?: (e: MouseEvent) => unknown,
	 *   shrunk?: boolean,
	 *   children?: import('svelte').Snippet
	 * }}
	 */
	let { menu, start, tools, account, bottomBar, dock, dockLabel = 'Player', notices, otherApp = null, onswitch, shrunk = false, children } = $props();

	let dockHeight = $state(0);
	let topHeight = $state(0);
</script>

<div
	class="frame"
	class:shrunk
	class:docked={!!dock}
	data-dock={dock ? '' : undefined}
	style:--dock-offset={dock && dockHeight ? `${dockHeight}px` : undefined}
	style:--topbar-height={topHeight ? `${topHeight}px` : undefined}
>
	<a class="skip" href="#main">Skip to content</a>
	{@render notices?.()}
	<nav class="side" aria-label="Main">{@render menu?.()}</nav>
	<header class="top" bind:clientHeight={topHeight}>
		<div class="start">{@render start?.()}</div>
		<div class="tools">
			{@render tools?.()}
			{#if otherApp?.name && otherApp?.href}<AppSwitcher name={otherApp.name} href={otherApp.href} {onswitch} />{/if}
			{@render account?.()}
		</div>
	</header>
	<main id="main">
		{@render children?.()}
	</main>
	{#if dock}
		<section class="dock" aria-label={dockLabel} bind:offsetHeight={dockHeight}>
			{@render dock()}
		</section>
	{/if}
	{@render bottomBar?.()}
</div>

<style>
	.frame {
		display: grid;
		grid-template-columns: var(--menu-width) minmax(0, 1fr);
		grid-template-rows: auto 1fr auto;
		grid-template-areas: 'side top' 'side main' 'side dock';
		min-height: var(--full-height);
	}
	.frame.shrunk {
		--frame-menu-width: var(--menu-width-shrunk);
		grid-template-columns: var(--menu-width-shrunk) minmax(0, 1fr);
	}
	/* Before the dock is measured: its least height. */
	.frame.docked {
		--dock-offset: var(--dock-height);
	}
	.side {
		grid-area: side;
		position: sticky;
		top: 0;
		z-index: var(--layer-header);
		height: var(--full-height);
		overflow-y: auto;
		background: var(--surface);
		border-right: var(--border-width) solid var(--border);
	}
	.shrunk .side {
		overflow: visible;
	}
	.top {
		grid-area: top;
		position: sticky;
		top: 0;
		z-index: var(--layer-header);
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: var(--space-sm) var(--space-lg);
		padding: var(--space-sm) var(--page-pad);
		background: var(--bg);
		border-bottom: var(--border-width) solid var(--border);
	}
	.start {
		display: flex;
		align-items: center;
		min-width: 0;
	}
	.tools {
		display: flex;
		flex: 1 1 auto;
		align-items: center;
		justify-content: flex-end;
		gap: var(--space-sm);
		min-width: 0;
	}
	main {
		grid-area: main;
		min-width: 0;
		padding: var(--page-pad);
		/* Its own stacking context: content stays below the top bar. */
		isolation: isolate;
	}
	/* Desktops: along the foot of the content, beside the side menu; it
	   stays at the foot of the screen while the page scrolls under it. */
	.dock {
		grid-area: dock;
		position: sticky;
		bottom: 0;
		z-index: var(--layer-header);
		display: flex;
		align-items: center;
		gap: var(--space-md);
		min-height: var(--dock-height);
		padding: var(--space-sm) var(--page-pad);
		background: var(--surface);
		color: var(--fg);
		border-top: var(--border-width) solid var(--border);
	}
	.skip {
		position: absolute;
		left: 0;
		top: 0;
		transform: translateY(-200%);
	}
	.skip:focus {
		transform: translate(var(--space-sm), var(--space-sm));
		z-index: var(--layer-overlay);
		background: var(--surface-2);
		padding: var(--space-sm) var(--space-lg);
	}
	/* Phones: no side menu; the bottom bar instead, and the dock above it,
	   across the width. The page keeps room for both at its foot. */
	@media (max-width: 47.99rem) {
		.frame,
		.frame.shrunk {
			display: block;
			padding-bottom: calc(var(--bottom-bar-height) + env(safe-area-inset-bottom) + var(--dock-offset));
		}
		.side {
			display: none;
		}
		.top {
			padding: var(--space-sm) var(--page-pad-phone);
		}
		main {
			padding: var(--page-pad-phone);
		}
		.dock {
			position: fixed;
			left: 0;
			right: 0;
			bottom: calc(var(--bottom-bar-height) + env(safe-area-inset-bottom));
			padding: var(--space-sm) var(--page-pad-phone);
		}
	}
	/* A printout has no frame. */
	@media print {
		.skip,
		.side,
		.top,
		.dock {
			display: none;
		}
		.frame {
			display: block;
			padding: 0;
		}
		main {
			padding: 0;
		}
	}
</style>
