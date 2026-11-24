<script>
	// The bottom bar on phones (docs/design-system.md, section 4, "Bottom
	// bar"), moved from PagerArchive's BottomBar.svelte with its entries as
	// props. Up to three entries, then More: a modal sheet with the rest of the
	// menu by group, leaving out what's desktop only, and the version at its
	// foot (where the release notice lands on a phone: More is the
	// data-release-target). Under 48rem only; on a desktop it draws nothing.
	import Icon from './Icon.svelte';

	/** @typedef {import('./types.js').Entry} Entry */
	/** @typedef {import('./types.js').Group} Group */

	/**
	 * @type {{
	 *   entries?: Entry[],
	 *   groups?: Group[],
	 *   current?: string,
	 *   moreDot?: boolean,
	 *   moreSays?: string,
	 *   version?: string,
	 *   versionHref?: string
	 * }}
	 */
	let { entries = [], groups = [], current = '', moreDot = false, moreSays = '', version = '', versionHref } = $props();

	/** @type {HTMLDialogElement} */
	let dialog;
	let more = $state(false);
	const shown = $derived(entries.slice(0, 3));
	const sheet = $derived(
		groups
			.filter((g) => !g.desktopOnly)
			.map((g) => ({ ...g, entries: g.entries.filter((e) => !e.desktopOnly) }))
			.filter((g) => g.entries.length > 0)
	);
	const inMore = $derived(!shown.some((e) => e.href === current) && sheet.some((g) => g.href === current || g.entries.some((e) => e.href === current)));
	const named = (/** @type {Entry | Group} */ x) => (x.says ? `${x.label}${x.says}` : x.count ? `${x.label}, ${x.count}` : undefined);

	function show() {
		dialog.showModal();
		more = true;
	}
	function hide() {
		dialog.close();
	}
</script>

<nav class="bottom" aria-label="Main">
	<ul>
		{#each shown as e (e.href)}
			<li>
				<a href={e.href} aria-current={current === e.href ? 'page' : undefined} aria-label={named(e) ?? (e.dot ? `${e.label}${e.says ?? ''}` : undefined)}
					><span class="spot"><Icon name={e.icon} svg={e.svg} />{#if e.dot}<span class="dot" aria-hidden="true"></span>{/if}</span><span>{e.label}</span></a
				>
			</li>
		{/each}
		<li>
			<button
				type="button"
				aria-haspopup="dialog"
				aria-expanded={more}
				aria-current={inMore ? 'page' : undefined}
				aria-label={moreDot || moreSays ? `More${moreSays}` : undefined}
				data-release-target
				onclick={show}
				><span class="spot"><Icon name="more" />{#if moreDot}<span class="dot" aria-hidden="true"></span>{/if}</span><span>More</span></button
			>
		</li>
	</ul>
</nav>

<dialog class="more" bind:this={dialog} aria-labelledby="more-title" onclose={() => (more = false)}>
	<div class="head">
		<h2 id="more-title">More</h2>
		<button class="ghost" type="button" onclick={hide}><Icon name="close" />Close</button>
	</div>
	{#each sheet as g (g.id)}
		<h3>
			<Icon name={g.icon} svg={g.svg} /><a href={g.href} onclick={hide} aria-label={named(g)}>{g.label}</a>{#if g.dot}<span class="dot" aria-hidden="true"></span>{/if}
		</h3>
		<ul>
			{#each g.entries as e (e.href)}
				<li>
					<a href={e.href} onclick={hide} aria-current={current === e.href ? 'page' : undefined} aria-label={named(e)}
						><Icon name={e.icon} svg={e.svg} />{e.label}{#if e.dot}<span class="dot" aria-hidden="true"></span>{/if}{#if e.count}<span class="count" class:quiet={e.quiet} aria-hidden="true"
								>{e.count}</span
							>{/if}</a
					>
				</li>
			{/each}
		</ul>
	{/each}
	{#if version}
		<p class="version">
			{#if versionHref}<a href={versionHref} target="_blank" rel="noopener noreferrer" aria-label={`Release notes for v${version}`}>v{version}</a>{:else}v{version}{/if}
		</p>
	{/if}
</dialog>

<style>
	.bottom {
		display: none;
	}
	.more {
		width: 100%;
		max-width: 100%;
		max-height: var(--sheet-height);
		margin: auto 0 0;
		padding: var(--space-lg);
		background: var(--surface-2);
		color: var(--fg);
		border: var(--border-width) solid var(--control-border);
		border-radius: var(--radius) var(--radius) 0 0;
	}
	.more::backdrop {
		background: var(--scrim);
	}
	.head {
		display: flex;
		align-items: center;
		justify-content: space-between;
	}
	h2 {
		margin: 0;
	}
	h3 {
		display: flex;
		align-items: center;
		gap: var(--space-sm);
		margin: var(--space-lg) 0 var(--space-2xs);
		color: var(--muted);
		font-size: var(--text-sm);
	}
	h3 a {
		color: inherit;
	}
	.version {
		margin: var(--space-lg) 0 0;
		padding: 0 var(--space-md);
		color: var(--muted);
		font-size: var(--text-xxs);
		overflow-wrap: anywhere;
	}
	.version a {
		color: inherit;
	}
	.dot {
		flex: none;
		width: var(--badge-dot-size);
		height: var(--badge-dot-size);
		border-radius: var(--radius-pill);
		background: var(--accent);
	}
	.more li .dot,
	.more li .count {
		margin-left: auto;
	}
	.count {
		min-width: var(--count-min);
		padding: 0 var(--space-xs);
		border-radius: var(--radius-pill);
		background: var(--accent);
		color: var(--accent-fg);
		font-size: var(--text-xxs);
		font-weight: var(--weight-strong);
		line-height: var(--leading);
		text-align: center;
	}
	.count.quiet {
		background: var(--accent-soft);
		color: var(--accent-soft-fg);
	}
	.spot {
		position: relative;
		display: inline-flex;
	}
	.spot .dot {
		position: absolute;
		top: 0;
		right: var(--space-xs);
	}
	.more ul {
		margin: 0;
		padding: 0;
		list-style: none;
	}
	.more li a {
		display: flex;
		align-items: center;
		gap: var(--space-sm);
		min-height: var(--target);
		padding: 0 var(--space-md);
		border-radius: var(--radius-small);
		color: var(--fg);
		text-decoration: none;
	}
	.more li a:hover {
		background: var(--hover);
	}
	.more li a[aria-current] {
		background: var(--accent-soft);
		color: var(--accent-soft-fg);
		font-weight: var(--weight-strong);
	}
	@media (max-width: 47.99rem) {
		.bottom {
			display: block;
			position: fixed;
			left: 0;
			right: 0;
			bottom: 0;
			z-index: var(--layer-header);
			padding-bottom: env(safe-area-inset-bottom);
			background: var(--surface);
			border-top: var(--border-width) solid var(--border);
		}
		.bottom ul {
			display: grid;
			grid-auto-columns: 1fr;
			grid-auto-flow: column;
			margin: 0;
			padding: 0;
			list-style: none;
		}
		.bottom a,
		.bottom button {
			display: flex;
			flex-direction: column;
			align-items: center;
			justify-content: center;
			gap: var(--space-3xs);
			width: 100%;
			min-height: var(--bottom-bar-height);
			padding: 0;
			border: 0;
			border-radius: 0;
			background: transparent;
			color: var(--muted);
			font-size: var(--text-xs);
			font-weight: var(--weight-normal);
			text-decoration: none;
		}
		.bottom :global(.ui-icon) {
			width: var(--target);
			height: var(--avatar-size);
			padding: var(--space-3xs) var(--space-md);
			border-radius: var(--radius-pill);
		}
		.bottom a:hover :global(.ui-icon),
		.bottom button:hover :global(.ui-icon) {
			background: var(--hover);
		}
		.bottom [aria-current] {
			color: var(--fg);
			font-weight: var(--weight-strong);
		}
		.bottom [aria-current] :global(.ui-icon) {
			background: var(--accent-soft);
			color: var(--accent-soft-fg);
		}
	}
	@media print {
		.bottom {
			display: none;
		}
	}
</style>
