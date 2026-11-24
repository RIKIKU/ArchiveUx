<script>
	// The side menu on desktops (docs/design-system.md, section 4, "Side
	// menu"), moved from PagerArchive's Menu.svelte with its app modules cut
	// loose: the tree, the counts and the version are props, and what the
	// person opened, closed or shrank is the app's to keep.
	//
	// The brand at the top; entries before the groups (top); groups under
	// headings that open and close, each heading a link to its group's start
	// page; counts as pills and dots, each also said in words (says); a foot
	// for the app's own alerts; Shrink menu; the version at the very foot,
	// where the release notice lands (data-release-target). Shrunk, only the
	// icons show, each with a tooltip and an accessible name, and hovering
	// over a group or focusing it opens a flyout of its pages.
	import Icon from './Icon.svelte';

	/** @typedef {import('./types.js').Entry} Entry */
	/** @typedef {import('./types.js').Group} Group */

	/**
	 * @type {{
	 *   brand: { name: string, mark?: string, href: string },
	 *   current?: string,
	 *   top?: Entry[],
	 *   groups?: Group[],
	 *   open?: Record<string, boolean>,
	 *   ontoggle?: (id: string, open: boolean) => void,
	 *   shrunk?: boolean,
	 *   onshrink?: () => void,
	 *   version?: string,
	 *   versionHref?: string,
	 *   foot?: import('svelte').Snippet<[{ shrunk: boolean }]>
	 * }}
	 */
	let { brand, current = '', top = [], groups = [], open = {}, ontoggle, shrunk = false, onshrink, version = '', versionHref, foot } = $props();

	const holds = (/** @type {Group} */ g) => current === g.href || g.entries.some((e) => e.href === current);
	const isOpen = (/** @type {Group} */ g) => shrunk || holds(g) || (open[g.id] ?? !g.closed);
	const said = (/** @type {Entry | Group} */ x) => (x.says ? x.says : x.count ? `, ${x.count}` : '');
	const named = (/** @type {Entry | Group} */ x) => (x.says || x.count || x.dot ? `${x.label}${said(x)}` : undefined);
</script>

{#snippet marks(/** @type {Entry | Group} */ x)}
	{#if x.dot}<span class="dot" aria-hidden="true"></span>{/if}{#if x.count}<span class="count" class:quiet={x.quiet} aria-hidden="true">{x.count}</span>{/if}
{/snippet}

<div class="menu" class:shrunk>
	<a class="brand" href={brand.href} aria-label={shrunk ? brand.name : undefined}
		><span class="mark" aria-hidden="true">{brand.mark ?? brand.name.slice(0, 2)}</span><span class="name">{brand.name}</span></a
	>
	<ul class="tree">
		{#each top as e (e.href)}
			<li class="group">
				<a class="item top" href={e.href} aria-current={current === e.href ? 'page' : undefined} aria-label={shrunk ? `${e.label}${said(e)}` : named(e)}
					><Icon name={e.icon} svg={e.svg} /><span class="label">{e.label}</span>{@render marks(e)}</a
				>
				{#if shrunk}<span class="tip" aria-hidden="true">{e.text ?? e.label}</span>{/if}
			</li>
		{/each}
		{#each groups as g (g.id)}
			{@const opened = isOpen(g)}
			<li class="group">
				<div class="heading">
					<a class="item head" href={g.href} aria-current={current === g.href ? 'page' : undefined} aria-label={shrunk ? `${g.label}${said(g)}` : named(g)}
						><Icon name={g.icon} svg={g.svg} /><span class="label">{g.label}</span>{@render marks(g)}</a
					>
					{#if !shrunk}
						<button
							class="toggle"
							type="button"
							aria-expanded={opened}
							aria-controls="menu-{g.id}"
							aria-label="{g.label}: {opened ? 'hide' : 'show'} its pages"
							onclick={() => ontoggle?.(g.id, opened)}><Icon name={opened ? 'open' : 'closed'} /></button
						>
					{/if}
				</div>
				<ul id="menu-{g.id}" class="entries" hidden={!opened}>
					{#if shrunk && g.text}<li class="flyhead" aria-hidden="true">{g.text}</li>{/if}
					{#if shrunk && g.dot && g.fresh}<li class="fresh" aria-hidden="true">{g.fresh}</li>{/if}
					{#each g.entries as e (e.href)}
						<li>
							<a class="item" href={e.href} aria-current={current === e.href ? 'page' : undefined} aria-label={named(e)}
								><Icon name={e.icon} svg={e.svg} /><span class="label">{e.label}</span>{@render marks(e)}</a
							>
						</li>
					{/each}
				</ul>
			</li>
		{/each}
	</ul>
	<div class="foot">
		{@render foot?.({ shrunk })}
		<div class="tipped">
			<button class="item shrink" type="button" aria-label={shrunk ? 'Widen the menu' : undefined} aria-pressed={shrunk} onclick={() => onshrink?.()}
				><Icon name={shrunk ? 'widen' : 'shrink'} /><span class="label">Shrink menu</span></button
			>
			{#if shrunk}<span class="tip" aria-hidden="true">Show the pages' names again</span>{/if}
		</div>
		{#if version}
			<p class="version">
				{#if versionHref}<a data-release-target href={versionHref} target="_blank" rel="noopener noreferrer" aria-label={`Release notes for v${version}`}>v{version}</a
					>{:else}<span data-release-target>v{version}</span>{/if}
			</p>
		{/if}
	</div>
</div>

<style>
	.menu {
		display: flex;
		flex-direction: column;
		gap: var(--space-2xs);
		min-height: 100%;
		padding: var(--space-md) var(--space-sm);
	}
	.brand {
		display: flex;
		align-items: center;
		gap: var(--space-sm);
		padding: var(--space-2xs) var(--space-sm) var(--space-md);
		color: var(--fg);
		font-size: var(--text-lg);
		font-weight: var(--weight-strong);
		text-decoration: none;
	}
	.mark {
		display: inline-grid;
		place-items: center;
		flex: none;
		width: var(--avatar-size);
		height: var(--avatar-size);
		border-radius: var(--radius-button);
		background: var(--accent);
		color: var(--accent-fg);
		font-size: var(--text-xs);
		font-weight: var(--weight-strong);
	}
	.tree,
	.entries {
		list-style: none;
		margin: 0;
		padding: 0;
	}
	.tree {
		display: flex;
		flex-direction: column;
		gap: var(--space-3xs);
		flex: 1;
	}
	.heading {
		display: flex;
		align-items: center;
	}
	.item {
		display: flex;
		align-items: center;
		gap: var(--space-sm);
		width: 100%;
		min-height: var(--target);
		padding: 0 var(--space-sm);
		border: 0;
		border-radius: var(--radius-button);
		background: transparent;
		color: var(--fg);
		font-family: inherit;
		font-size: var(--text-md);
		font-weight: var(--weight-normal);
		line-height: var(--leading-tight);
		text-align: left;
		text-decoration: none;
		cursor: pointer;
	}
	.item:hover {
		background: var(--hover);
	}
	.item:active,
	.item[aria-current='page'] {
		background: var(--accent-soft);
		color: var(--accent-soft-fg);
	}
	.item[aria-current='page'],
	.head {
		font-weight: var(--weight-strong);
	}
	.entries .item {
		padding-left: var(--space-2xl);
	}
	.label {
		flex: 1;
		min-width: 0;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
	.toggle {
		flex: none;
		min-width: var(--target);
		padding: 0;
		border-color: transparent;
		background: transparent;
		color: var(--muted);
	}
	.toggle:hover {
		background: var(--hover);
		border-color: transparent;
	}
	.toggle:active {
		background: var(--accent-soft);
		border-color: transparent;
		color: var(--accent-soft-fg);
	}
	.count {
		margin-left: auto;
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
	.dot {
		flex: none;
		margin-left: auto;
		width: var(--badge-dot-size);
		height: var(--badge-dot-size);
		border-radius: var(--radius-pill);
		background: var(--accent);
	}
	.dot + .count {
		margin-left: 0;
	}
	.foot {
		position: relative;
		display: flex;
		flex-direction: column;
		gap: var(--space-2xs);
		margin-top: var(--space-lg);
	}
	.shrink {
		color: var(--muted);
	}
	.version {
		margin: 0;
		padding: var(--space-2xs) var(--space-sm) 0;
		color: var(--muted);
		font-size: var(--text-xxs);
		line-height: var(--leading-tight);
		overflow-wrap: anywhere;
	}
	.version a {
		color: inherit;
	}
	.shrunk .version {
		width: 100%;
		padding: var(--space-2xs) 0 0;
		text-align: center;
	}

	/* Shrunk: the icons only; hovering over a group or focusing it opens its
	   flyout. */
	.shrunk {
		align-items: center;
		padding: var(--space-md) var(--space-2xs);
	}
	.shrunk .brand .name,
	.shrunk .label {
		display: none;
	}
	.shrunk .brand {
		padding: var(--space-2xs) 0 var(--space-md);
	}
	.shrunk .tree,
	.shrunk .foot {
		width: 100%;
		align-items: center;
	}
	.shrunk .group,
	.shrunk .tipped,
	.shrunk .foot > :global(.tipped) {
		position: relative;
		display: flex;
		justify-content: center;
	}
	.shrunk .top,
	.shrunk .head,
	.shrunk .shrink {
		position: relative;
		justify-content: center;
		width: var(--target-coarse);
		height: var(--target-coarse);
		padding: 0;
	}
	.shrunk .top .count,
	.shrunk .head .count {
		position: absolute;
		top: 0;
		right: 0;
		padding: 0 var(--space-3xs);
	}
	.shrunk .top .dot,
	.shrunk .head .dot {
		position: absolute;
		top: var(--space-2xs);
		right: var(--space-2xs);
	}
	.shrunk .entries,
	.tip {
		display: none;
		position: absolute;
		left: 100%;
		top: 0;
		z-index: var(--layer-overlay);
	}
	.shrunk .entries {
		min-width: var(--flyout-width);
		padding: var(--space-xs);
		background: var(--surface-2);
		border: var(--border-width) solid var(--control-border);
		border-radius: var(--radius);
	}
	.shrunk .entries .item {
		padding-left: var(--space-sm);
	}
	.shrunk .entries .label {
		display: block;
	}
	.shrunk .group:hover > .entries,
	.shrunk .group:focus-within > .entries,
	.shrunk .group:hover > .tip,
	.shrunk .group:focus-within > .tip,
	.shrunk .tipped:hover > .tip,
	.shrunk .tipped:focus-within > .tip {
		display: block;
	}
	.flyhead {
		padding: var(--space-xs) var(--space-sm);
		color: var(--muted);
		font-size: var(--text-xs);
		font-weight: var(--weight-strong);
		letter-spacing: var(--badge-tracking);
		text-transform: var(--badge-case);
	}
	.fresh {
		padding: 0 var(--space-sm) var(--space-xs);
		color: var(--fg);
		font-size: var(--text-xs);
		font-weight: var(--weight-strong);
	}
	.tip {
		top: 50%;
		transform: translateY(-50%);
		padding: var(--space-2xs) var(--space-sm);
		border-radius: var(--radius-small);
		background: var(--fg);
		color: var(--bg);
		font-size: var(--text-xs);
		white-space: nowrap;
		pointer-events: none;
	}
</style>
