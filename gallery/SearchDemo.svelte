<script>
	// The search controls in the gallery (search.html, 0.4.0). DateRange as
	// an app draws it, whole days (as PagerArchive's search and reports use
	// it) and with times of day (RadioArchive's recent calls), each in a GET
	// form whose fields are shown under it; and Suggest, the combobox. The
	// look and theme start as the address says (?look=console, ?theme=dark)
	// and change on the page.
	import DateRange from '../src/components/DateRange.svelte';
	import Suggest from '../src/components/Suggest.svelte';
	import { applyLook, isLook } from '../src/look.js';
	import { isoDate, rangeBounds } from '../src/dates.js';

	const q = new URLSearchParams(location.search);
	let look = $state(isLook(q.get('look')) ? q.get('look') : 'harbour');
	let theme = $state(['light', 'dark'].includes(q.get('theme')) ? q.get('theme') : 'auto');
	$effect(() => applyLook(look));
	$effect(() => {
		if (theme === 'auto') delete document.documentElement.dataset.theme;
		else document.documentElement.dataset.theme = theme;
	});

	const timeZone = 'Australia/Melbourne';
	const today = isoDate(new Date(), timeZone);
	const back = (/** @type {number} */ n) => new Date(Date.UTC(+today.slice(0, 4), +today.slice(5, 7) - 1, +today.slice(8, 10) - n)).toISOString().slice(0, 10);
	const firstPage = `${+today.slice(0, 4) - 3}-01-01`;

	let days = $state({ from: back(6), to: back(2) });
	let timed = $state({ from: back(1), to: today, fromTime: '21:30', toTime: '06:15' });
	const bounds = $derived(rangeBounds(timed, timeZone));

	// Suggest with made-up channels: values only, no keys (as an app without
	// a query language suggests), grouped under a heading, then the text.
	const channels = ['North Fire', 'North Ambulance', 'South Fire', 'Harbour Patrol', 'Rail Operations', 'Events Control'];
	let channel = $state('');
	let picked = $state('');
	/** @returns {import('../src/components/types.js').Suggestions} */
	const suggest = (text, caret) => {
		const start = text.lastIndexOf(' ', caret - 1) + 1;
		const word = text.slice(start, caret).toLowerCase();
		const options = channels
			.filter((c) => c.toLowerCase().split(' ').some((w) => w.startsWith(word)))
			.map((c) => ({ kind: /** @type {const} */ ('value'), id: c, value: c, insert: c, section: 'Channels' }));
		return { target: { start, end: caret }, options: [...options, ...(text.trim() ? [{ kind: /** @type {const} */ ('text'), id: 'text', text }] : [])], what: 'suggestion' };
	};
</script>

<header class="top">
	<h1>ArchiveUx gallery: dates and suggestions</h1>
	<div class="controls">
		<label>Look <select bind:value={look}><option value="harbour">Harbour</option><option value="console">Console</option></select></label>
		<label
			>Theme <select bind:value={theme}><option value="auto">Auto (system)</option><option value="light">Light</option><option value="dark">Dark</option></select></label
		>
		<a href="./index.html">Tokens, pairings and samples</a>
	</div>
</header>

<main>
	<section class="card" aria-labelledby="days-title">
		<h2 id="days-title">Whole days</h2>
		<p class="note">Without <code>times</code>: PagerArchive's calendar, unchanged.</p>
		<form onsubmit={(e) => e.preventDefault()}>
			<div class="bar" data-demo="days">
				<DateRange {...days} {timeZone} {firstPage} lastPage={today} onchange={(from, to) => (days = { from, to })} />
			</div>
		</form>
		<p class="out">Sent: from={days.from} to={days.to}</p>
	</section>

	<section class="card" aria-labelledby="times-title">
		<h2 id="times-title">Days and times</h2>
		<p class="note">With <code>times</code>: a From time and a To time under the days, in {timeZone}.</p>
		<form onsubmit={(e) => e.preventDefault()}>
			<div class="bar" data-demo="times">
				<DateRange {...timed} times {timeZone} {firstPage} lastPage={today} onchange={(from, to, fromTime = '', toTime = '') => (timed = { from, to, fromTime, toTime })} />
			</div>
		</form>
		<p class="out">Sent: from={timed.from} to={timed.to} from_time={timed.fromTime} to_time={timed.toTime}</p>
		<p class="out">rangeBounds: {bounds ? `${bounds.start} to ${bounds.end} (end excluded)` : 'none'}</p>
	</section>

	<section class="card" aria-labelledby="suggest-title">
		<h2 id="suggest-title">Suggestions</h2>
		<p class="note">Suggest, the ARIA combobox: values under a heading, then the text as typed. Arrow keys, Enter, Escape.</p>
		<Suggest bind:text={channel} {suggest} label="Channel" showLabel icon="search" placeholder="Type a channel" listLabel="Channels" onpick={(o) => (picked = o.kind === 'text' ? `text: ${o.text}` : o.value)} />
		<p class="out">Picked: {picked || 'nothing yet'}</p>
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
		/* Room for the calendar under its button. */
		min-height: 47rem;
		padding: var(--space-lg);
		background: var(--surface);
		border: var(--border-width) solid var(--border);
		border-radius: var(--radius);
	}
	.card h2 {
		margin: 0 0 var(--space-xs);
		font-size: var(--text-lg);
	}
	.note,
	.out {
		color: var(--muted);
		font-size: var(--text-sm);
		overflow-wrap: anywhere;
	}
	.out {
		font-family: var(--font-mono, monospace);
	}
	.bar {
		display: flex;
		align-items: center;
		gap: var(--space-sm);
	}
</style>
