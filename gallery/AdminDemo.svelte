<script>
	// The admin pages' building blocks in the gallery (admin.html, 0.5.0, ADR
	// 0004), with made-up channels: state badges, banners, a data table that
	// sorts, with actions and More actions, the same table in a narrow card
	// (stacked), asking before deleting (inline and in a dialog), and More
	// actions alone. The look and theme start as the address says
	// (?look=console, ?theme=dark) and change on the page; ?ask=inline or
	// ?ask=modal opens the question for the first channel, ?menu=1 opens its
	// More actions.
	import StateBadge from '../src/components/StateBadge.svelte';
	import Banner from '../src/components/Banner.svelte';
	import DataTable from '../src/components/DataTable.svelte';
	import Confirm from '../src/components/Confirm.svelte';
	import MoreActions from '../src/components/MoreActions.svelte';
	import { applyLook, isLook } from '../src/look.js';

	const q = new URLSearchParams(location.search);
	let look = $state(isLook(q.get('look')) ? q.get('look') : 'harbour');
	let theme = $state(['light', 'dark'].includes(q.get('theme')) ? q.get('theme') : 'auto');
	$effect(() => applyLook(look));
	$effect(() => {
		if (theme === 'auto') delete document.documentElement.dataset.theme;
		else document.documentElement.dataset.theme = theme;
	});

	/** @typedef {{ id: number, name: string, state: 'ok' | 'warning' | 'error' | 'neutral', says: string, ago: number | null, calls: number | null }} Channel */
	/** @type {Channel[]} */
	const start = [
		{ id: 1, name: 'North Fire', state: 'ok', says: 'Listed', ago: 2, calls: 1240 },
		{ id: 2, name: 'Harbour Patrol', state: 'warning', says: 'Quiet', ago: 190, calls: 85 },
		{ id: 3, name: 'Rail Operations', state: 'error', says: 'Rejected', ago: 14, calls: 3 },
		{ id: 4, name: 'Events Control', state: 'neutral', says: 'Hidden', ago: null, calls: null },
		{ id: 5, name: 'South Ambulance', state: 'ok', says: 'Listed', ago: 41, calls: 412 }
	];
	let channels = $state(start);
	/** @type {import('../src/components/table.js').Sort | null} */
	let sort = $state({ key: 'name', dir: 'ascending' });
	/** @type {import('../src/components/table.js').Sort | null} */
	let narrowSort = $state(null);

	const ago = (/** @type {number | null} */ m) => (m === null ? 'Never' : m < 60 ? `${m} min ago` : `${Math.floor(m / 60)} h ${m % 60} min ago`);
	/** @type {import('../src/components/table.js').Column[]} */
	const columns = [
		{ key: 'name', label: 'Name', sortable: true, primary: true },
		{ key: 'state', label: 'State', custom: true, value: (/** @type {Channel} */ r) => r.says },
		{ key: 'ago', label: 'Last heard', sortable: true, firstDir: 'descending', value: (/** @type {Channel} */ r) => (r.ago === null ? null : -r.ago), text: (/** @type {Channel} */ r) => ago(r.ago) },
		{ key: 'calls', label: 'Calls in 30 days', sortable: true, firstDir: 'descending', align: 'end', text: (/** @type {Channel} */ r) => (r.calls === null ? '—' : r.calls.toLocaleString('en-AU')) }
	];

	/** The question being asked: which channel, and how. */
	/** @type {{ channel: Channel, modal: boolean } | null} */
	let asking = $state(null);
	let said = $state('');
	const ask = q.get('ask');
	if (ask === 'inline' || ask === 'modal') asking = { channel: start[0], modal: ask === 'modal' };
	let menuOpen = $state(q.get('menu') === '1');

	function remove(/** @type {Channel} */ ch) {
		// A pretend server: a moment's wait, so the buttons show they're waiting.
		return new Promise((done) =>
			setTimeout(() => {
				channels = channels.filter((c) => c.id !== ch.id);
				said = `Deleted ${ch.name} (a demo: nothing is sent).`;
				asking = null;
				done(undefined);
			}, 600)
		);
	}
	const reset = () => ((channels = start), (said = ''), (asking = null));
</script>

<header class="top">
	<h1>ArchiveUx gallery: admin pages</h1>
	<div class="controls">
		<label>Look <select bind:value={look}><option value="harbour">Harbour</option><option value="console">Console</option></select></label>
		<label
			>Theme <select bind:value={theme}><option value="auto">Auto (system)</option><option value="light">Light</option><option value="dark">Dark</option></select></label
		>
		<a href="./index.html">Tokens, pairings and samples</a>
	</div>
</header>

<main>
	<section class="card" aria-labelledby="badges-title" data-demo="badges">
		<h2 id="badges-title">State badges</h2>
		<p class="note">A thing's state in a word (<code>StateBadge</code>, <code>.state-badge</code>): OK, Warning, Error, and a neutral word of the app's.</p>
		<p class="row-of"><StateBadge /> <StateBadge state="warning" /> <StateBadge state="error" /> <StateBadge state="neutral" text="Retired" /></p>
		<p class="row-of"><StateBadge text="Connected" /> <StateBadge state="warning" text="Quiet" /> <StateBadge state="error" text="Deaf" /> <StateBadge state="neutral" text="Never connected" /></p>
		<div class="stage"><p class="row-of"><StateBadge /> <StateBadge state="warning" /> <StateBadge state="error" /> <StateBadge state="neutral" text="Off" /> <span class="note">on the page</span></p></div>
	</section>

	<section class="card" aria-labelledby="banners-title" data-demo="banners">
		<h2 id="banners-title">Banners</h2>
		<p class="note">Alerts that stay (<code>Banner</code>, <code>.banner</code>): the tone's fill and text, no edge.</p>
		<Banner><p>The recordings disk is 86 % full. <a href="#top">See the settings</a></p></Banner>
		<Banner tone="error" title="Couldn't reach the server"><p>The page will try again in a minute.</p></Banner>
		<Banner tone="info"><p>Channels are added from the server's shell.</p></Banner>
	</section>

	<section class="card wide" aria-labelledby="table-title" data-demo="table">
		<h2 id="table-title">Data table</h2>
		<p class="note">
			<code>DataTable</code>: headers that sort (Name, Last heard, Calls), a custom cell (the state), the row's actions with <code>MoreActions</code>, and Delete asking first. Narrower than 40rem it stacks.
			<button type="button" class="ghost" onclick={reset}>Put the channels back</button>
		</p>
		{#if said}<p class="ok" role="status">{said}</p>{/if}
		<DataTable {columns} rows={channels} caption="Channels" bind:sort key={(r) => r.id} empty="No channels yet.">
			{#snippet cell(/** @type {Channel} */ row)}<StateBadge state={row.state} text={row.says} />{/snippet}
			{#snippet actions(/** @type {Channel} */ row)}
				<a class="button secondary" href="#top" aria-label="Edit {row.name}">Edit</a>
				<MoreActions label="More actions: {row.name}" open={menuOpen && row.id === start[0].id}>
					<button type="button">Rename</button>
					<button type="button">{row.state === 'neutral' ? 'Show' : 'Hide'}</button>
					<hr />
					<button type="button" class="danger" onclick={() => (asking = { channel: row, modal: false })}>Delete…</button>
					<button type="button" class="danger" onclick={() => (asking = { channel: row, modal: true })}>Delete (in a dialog)…</button>
				</MoreActions>
			{/snippet}
		</DataTable>
		{#if asking}
			<Confirm
				title="Delete {asking.channel.name}?"
				confirmLabel="Delete {asking.channel.name}"
				modal={asking.modal}
				level={3}
				onconfirm={() => remove(/** @type {Channel} */ (asking?.channel))}
				oncancel={() => ((asking = null), (said = 'Nothing was deleted.'))}
			>
				<p>Its {asking.channel.calls ?? 'no'} calls in the last 30 days are deleted with it. This can't be undone.</p>
			</Confirm>
		{/if}
	</section>

	<section class="card narrow" aria-labelledby="narrow-title" data-demo="narrow">
		<h2 id="narrow-title">The same table, narrow</h2>
		<p class="note">In a card under 40rem wide (or on a phone): each row a card, each value under its label, Sort by as a select.</p>
		<DataTable {columns} rows={channels.slice(0, 3)} caption="Channels, narrow" bind:sort={narrowSort} key={(r) => r.id}>
			{#snippet cell(/** @type {Channel} */ row)}<StateBadge state={row.state} text={row.says} />{/snippet}
			{#snippet actions(/** @type {Channel} */ row)}
				<a class="button secondary" href="#top" aria-label="Edit {row.name}">Edit</a>
				<MoreActions label="More actions: {row.name}" align="start">
					<button type="button">Rename</button>
					<button type="button" class="danger">Delete…</button>
				</MoreActions>
			{/snippet}
		</DataTable>
	</section>

	<section class="card" aria-labelledby="more-title" data-demo="more">
		<h2 id="more-title">More actions</h2>
		<p class="note">A disclosure (<code>MoreActions</code>): icon only with a tooltip, or with words. Escape closes it and the focus goes back.</p>
		<div class="row-of">
			<MoreActions label="More actions: the example" align="start">
				<button type="button">Copy the link</button>
				<a href="#top">Open the history</a>
				<button type="button" class="danger">Retire…</button>
			</MoreActions>
			<MoreActions text="Actions" label="Actions" align="start">
				<button type="button">Export</button>
				<button type="button" disabled>Import (none waiting)</button>
			</MoreActions>
		</div>
	</section>
</main>

<style>
	.top {
		padding: var(--space-md) var(--page-pad);
		background: var(--surface);
		border-bottom: var(--border-width) solid var(--border);
	}
	.top h1 {
		margin: 0 0 var(--space-sm);
	}
	.controls {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-lg);
	}
	.controls label {
		display: flex;
		align-items: center;
		gap: var(--space-sm);
	}
	.controls select {
		width: auto;
	}
	main {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(min(100%, 24rem), 1fr));
		align-items: start;
		gap: var(--space-lg);
		padding: var(--space-lg) var(--page-pad) var(--space-3xl);
	}
	.card {
		min-width: 0;
		padding: var(--space-lg);
		background: var(--surface);
		border: var(--border-width) solid var(--border);
		border-radius: var(--radius);
	}
	.card.wide {
		grid-column: 1 / -1;
		/* Room for an open More actions under the last row. */
		padding-bottom: var(--space-3xl);
	}
	.card.narrow {
		padding-bottom: var(--space-3xl);
	}
	.card h2 {
		margin: 0 0 var(--space-xs);
		font-size: var(--text-lg);
	}
	.note {
		color: var(--muted);
		font-size: var(--text-sm);
		overflow-wrap: anywhere;
	}
	.row-of {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: var(--space-sm);
	}
	.stage {
		padding: var(--space-sm) var(--space-md);
		background: var(--bg);
		border-radius: var(--radius);
	}
	.stage p {
		margin: 0;
	}
</style>
