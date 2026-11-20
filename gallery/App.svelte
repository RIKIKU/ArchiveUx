<script>
	// The owner's review tool (docs/design-system.md, "Gallery"): every token
	// as the browser draws it, in the look and theme chosen above, with the
	// contrast of every pairing the rules allow, measured live from the page's
	// own computed colours (the same pairs and floors as the CI check).
	import raw from '../src/tokens.css?raw';
	import spec from '../contrast/pairs.json';
	import known from '../contrast/findings.json';
	import { looks, over, parseColour, ratio, resolve, tokensOf } from '../scripts/tokens.mjs';

	const t = looks(raw);
	const names = [...new Set([...t.shared.keys(), ...t.harbour.keys()])];
	// Which tokens are colours: those that resolve to one in Harbour light.
	const isColour = new Set(names.filter((n) => parseColour(resolve(tokensOf(t, 'harbour'), n, 'light')) !== null));
	const colours = names.filter((n) => isColour.has(n));
	const others = names.filter((n) => !isColour.has(n));

	let look = $state('harbour');
	let theme = $state('auto');
	let drawn = $state(0); // bumped after every repaint that can change a colour

	$effect(() => {
		const root = document.documentElement;
		root.dataset.look = look;
		if (theme === 'auto') delete root.dataset.theme;
		else root.dataset.theme = theme;
		requestAnimationFrame(() => drawn++);
	});
	$effect(() => {
		const mq = matchMedia('(prefers-color-scheme: dark)');
		const again = () => drawn++;
		mq.addEventListener('change', again);
		return () => mq.removeEventListener('change', again);
	});

	/** Each token as the browser resolves it now: { name: { value, colour } }. */
	const now = $derived.by(() => {
		void drawn;
		const probe = document.createElement('span');
		document.body.append(probe);
		const root = getComputedStyle(document.documentElement);
		const out = {};
		for (const n of names) {
			const value = root.getPropertyValue(`--${n}`).trim();
			probe.style.color = '';
			probe.style.color = `var(--${n})`;
			out[n] = { value, colour: isColour.has(n) ? parseColour(getComputedStyle(probe).color) : null };
		}
		probe.remove();
		return out;
	});
	const scheme = $derived.by(() => {
		void drawn;
		return theme === 'auto' ? (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light') : theme;
	});

	const page = $derived(now.bg.colour);
	const r = (fg, bg) => {
		const back = over(bg, page);
		return ratio(over(fg, back), back);
	};

	/** Every pairing, measured as drawn. */
	const measured = $derived.by(() => {
		const out = [];
		for (const p of spec.pairs) {
			if (p.when && now[p.when.token]?.value === p.when.isNot) continue;
			const fg = now[p.fg].colour;
			if (p.skipIfTransparent && fg[3] === 0) continue;
			const ons = [...new Set(p.on.flatMap((n) => (now[n].colour[3] === 0 ? spec.transparentOn : [n])))];
			for (const on of ons) {
				const value = r(fg, now[on].colour);
				const min = spec.floors[p.kind];
				const finding = known.findings.some((f) => f.look === look && f.theme === scheme && f.pair === p.id && f.fg === p.fg && f.on === on);
				out.push({ ...p, on, value, min, pass: value >= min, finding });
			}
		}
		return out;
	});
	const failing = $derived(measured.filter((m) => !m.pass));

	// The form demo (docs/design-system.md, section 5): the word "required" in
	// the label, a conditional field, a group's hint, and the app's own check
	// on save (novalidate), each problem under its field and focus to the first.
	let form = $state({ name: '', note: '', headerName: '', headerValue: '', secret: '', capcode: false, alias: false });
	let problems = $state({});
	let summary = $state('');
	const headerNeeded = $derived(form.headerName.trim() !== '');
	const describe = (...ids) => ids.filter(Boolean).join(' ') || undefined;
	function save(e) {
		e.preventDefault();
		const p = {};
		if (!form.name.trim()) p.name = 'Give it a name.';
		if (!form.secret) p.secret = 'Enter the secret: none is saved yet.';
		if (headerNeeded && !form.headerValue.trim()) p.headerValue = 'Give the header a value, or clear its name.';
		if (!form.capcode && !form.alias) p.pages = 'Choose at least one capcode or alias.';
		problems = p;
		const n = Object.keys(p).length;
		summary = n ? `${n} ${n === 1 ? 'field needs' : 'fields need'} attention` : 'Saved (a demo: nothing is sent).';
		const first = ['name', 'secret', 'headerValue', 'pages'].find((k) => p[k]);
		if (first) requestAnimationFrame(() => document.getElementById(first === 'pages' ? 'g-capcode' : `g-${first}`)?.focus());
	}

	// The notice demo: the release notice's timing (docs/design-system.md).
	const HOLD = 8000;
	let shown = $state(true);
	let held = $state(false);
	let runs = $state(0);
	function again() {
		shown = false;
		requestAnimationFrame(() => {
			runs++;
			shown = true;
		});
	}
</script>

<svelte:window onkeydown={(e) => e.key === 'Escape' && (shown = false)} />

<header class="top">
	<h1>ArchiveUx gallery</h1>
	<div class="controls">
		<label>Look <select bind:value={look}><option value="harbour">Harbour</option><option value="console">Console</option></select></label>
		<label
			>Theme <select bind:value={theme}><option value="auto">Auto (system)</option><option value="light">Light</option><option value="dark">Dark</option></select></label
		>
	</div>
	<p class="status">
		{look === 'console' ? 'Console' : 'Harbour'}, {scheme}: {measured.length} pairings measured, {measured.length - failing.length} pass,
		{failing.length} below the floor{failing.length ? ` (${failing.filter((f) => f.finding).length} known findings)` : ''}.
	</p>
</header>

<main>
	<section>
		<h2>Samples</h2>
		<div class="samples">
			<div class="card">
				<h3>Text</h3>
				<p>Body text in --fg. <span class="muted">Secondary text in --muted.</span></p>
				<p><a href="#top">A link in --accent</a> and <span class="error-text">an error in --danger-text</span>.</p>
				<p class="mono">Monospace, --font-mono: 12:41:07</p>
				<p class="highlighted">Text on --highlight, as a new row lights up.</p>
			</div>
			<div class="card">
				<h3>Buttons and controls</h3>
				<div class="row-of">
					<button type="button">Primary</button>
					<button type="button" class="secondary">Secondary</button>
					<button type="button" class="ghost">Ghost</button>
					<button type="button" class="danger">Danger</button>
					<button type="button" disabled>Disabled</button>
				</div>
				<div class="row-of">
					<input aria-label="A text field" placeholder="A text field" />
					<label class="check"><input type="checkbox" checked /> Ticked</label>
				</div>
				<p class="muted small">Focus rings (shown here without focus, as the browser draws them):</p>
				<div class="row-of">
					<button type="button" class="ring">Primary</button>
					<button type="button" class="secondary ring">Secondary</button>
					<a class="ring" href="#top">A link</a>
				</div>
				<div class="row-of">
					<span class="has-tip"
						><button type="button" class="secondary">Hover me</button><span class="tooltip" aria-hidden="true">A tooltip: --bg on --fg</span></span
					>
				</div>
			</div>
			<div class="card">
				<h3>States</h3>
				<p class="ok">Saved: --fg on --accent-soft (.ok).</p>
				<p class="warn">A caveat or flag: --warn-fg on --warn-bg.</p>
				<p class="error">An error line (.error).</p>
				<p class="status">A status line (.status).</p>
				<p><span class="live"></span> Live (--ok-fg dot)</p>
			</div>
			<div class="card">
				<h3>Alerts</h3>
				<p class="muted small">An alert that stays (an admin's backup or upgrade alert): --warn-fg on --warn-bg, with no edge (the owner, 0.1.1). It is noticed by its place and its wording; its text is at least 4.5:1.</p>
				<div class="alert-stage">
					<p class="alert">The last backup is 3 days old. <a href="#top">See the backups</a></p>
				</div>
				<div class="alert-stage on-card">
					<p class="alert">The same alert on a card (--surface).</p>
				</div>
			</div>
			<div class="card">
				<h3>Heat grid</h3>
				<p class="muted small">"When it's busy": five shades, none to most; each count in its step's text token, --heat-0-fg..--heat-4-fg.</p>
				<table class="heat">
					<thead><tr><th scope="col">Step</th>{#each [0, 1, 2, 3, 4] as s}<th scope="col">{s}</th>{/each}</tr></thead>
					<tbody>
						<tr>
							<th scope="row">Jobs</th>
							{#each [0, 1, 2, 3, 4] as s}
								<td style:background="var(--heat-{s})" style:color="var(--heat-{s}-fg)" class:most={s === 4}>{[0, 2, 5, 9, 14][s]}</td>
							{/each}
						</tr>
						<tr>
							<th scope="row">Ratio</th>
							{#each [0, 1, 2, 3, 4] as s}
								<td class="num small">{r(now[`heat-${s}-fg`].colour, now[`heat-${s}`].colour).toFixed(2)}</td>
							{/each}
						</tr>
					</tbody>
				</table>
			</div>
			<div class="card">
				<h3>Rows and labels</h3>
				{#each ['emergency', 'nonemergency', 'admin', 'plain'] as p}
					<div class="row {p}">
						<span class="time">13:41:07</span>
						{#if p !== 'plain'}<span class="badge {p}"><span class="dot"></span>{p === 'nonemergency' ? 'Non-emergency' : p[0].toUpperCase() + p.slice(1)}</span>{/if}
						<a href="#top">Station 1</a>
						<span class="muted">An example row</span>
					</div>
				{/each}
				<div class="row plain fresh-demo"><span class="time">13:42:00</span> A new row, on --highlight</div>
			</div>
			<div class="card">
				<h3>Forms</h3>
				<p class="muted small">
					An outlined Required tag in the label (part of its name: "Name required"); unmarked is optional. A conditional field says when, after its tag. A group's rule is a hint under it. Save with gaps: each problem under its field, focus to the first, the top
					line only counts.
				</p>
				<form class="demo-form" novalidate onsubmit={save}>
					{#if summary}<p class={Object.keys(problems).length ? 'error' : 'ok'} aria-live="polite">{summary}</p>{/if}
					<div class="field">
						<label for="g-name">Name <span class="required">required</span></label>
						<input id="g-name" required bind:value={form.name} aria-invalid={problems.name ? 'true' : undefined} aria-describedby={describe(problems.name && 'g-name-error')} />
						{#if problems.name}<p class="field-error" id="g-name-error">{problems.name}</p>{/if}
					</div>
					<div class="field">
						<label for="g-note">Note</label>
						<input id="g-note" bind:value={form.note} aria-describedby="g-note-hint" />
						<p class="field-hint" id="g-note-hint">Optional, so unmarked: no "(optional)".</p>
					</div>
					<div class="field">
						<label for="g-secret">Secret <span class="required">required</span> <span class="required-when">none saved yet</span></label>
						<input
							id="g-secret"
							type="password"
							autocomplete="off"
							required
							bind:value={form.secret}
							aria-invalid={problems.secret ? 'true' : undefined}
							aria-describedby={describe(problems.secret && 'g-secret-error')}
						/>
						{#if problems.secret}<p class="field-error" id="g-secret-error">{problems.secret}</p>{/if}
					</div>
					<div class="field">
						<label for="g-secret-saved">Secret, when one is saved</label>
						<input id="g-secret-saved" type="password" autocomplete="off" placeholder="••••••••" aria-describedby="g-secret-saved-hint" />
						<p class="field-hint" id="g-secret-saved-hint">One is saved. Leave this empty to keep it.</p>
					</div>
					<div class="field">
						<label for="g-headerName">Header name</label>
						<input id="g-headerName" bind:value={form.headerName} aria-describedby="g-headerName-hint" />
						<p class="field-hint" id="g-headerName-hint">Type one, and the value below becomes required.</p>
					</div>
					<div class="field">
						<label for="g-headerValue">Header value {#if headerNeeded}<span class="required">required</span> <span class="required-when">with a header name</span>{/if}</label>
						<input
							id="g-headerValue"
							required={headerNeeded}
							bind:value={form.headerValue}
							aria-invalid={problems.headerValue ? 'true' : undefined}
							aria-describedby={describe(problems.headerValue && 'g-headerValue-error')}
						/>
						{#if problems.headerValue}<p class="field-error" id="g-headerValue-error">{problems.headerValue}</p>{/if}
					</div>
					<fieldset class="field-group" aria-describedby={describe('g-pages-hint', problems.pages && 'g-pages-error')}>
						<legend>Pages</legend>
						<p class="field-hint" id="g-pages-hint">Choose at least one capcode or alias.</p>
						<label class="check"><input id="g-capcode" type="checkbox" bind:checked={form.capcode} /> Capcode 1234567</label>
						<label class="check"><input type="checkbox" bind:checked={form.alias} /> Alias Station 1</label>
						{#if problems.pages}<p class="field-error" id="g-pages-error">{problems.pages}</p>{/if}
					</fieldset>
					<button type="submit">Save</button>
				</form>
				<p class="muted small">A field in error, as after a save:</p>
				<div class="field">
					<label for="g-port">Port <span class="required">required</span></label>
					<input id="g-port" value="80a" aria-invalid="true" aria-describedby="g-port-error" />
					<p class="field-error" id="g-port-error">A port is a number from 1 to 65535.</p>
				</div>
			</div>
			<div class="card">
				<h3>Notice</h3>
				<p class="muted small">8 s, waits while touched, hovered or focused; a countdown line; a tap or Esc closes it; no X.</p>
				<button type="button" class="secondary" onclick={again}>Show the notice again</button>
				<div class="notice-stage">
					{#if shown}
						{#key runs}
							<!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
							<div
								class="notice"
								aria-live="polite"
								onclick={() => (shown = false)}
								onpointerenter={() => (held = true)}
								onpointerdown={() => (held = true)}
								onpointerleave={() => (held = false)}
								onfocusin={() => (held = true)}
								onfocusout={() => (held = false)}
							>
								New release! <a href="#top" onclick={(e) => e.preventDefault()}>Check out the release log</a>
								<span
									class="countdown"
									style:animation-duration="{HOLD}ms"
									style:animation-play-state={held ? 'paused' : 'running'}
									onanimationend={() => (shown = false)}
								></span>
							</div>
						{/key}
					{/if}
				</div>
			</div>
		</div>
	</section>

	<section>
		<h2>Pairings ({look === 'console' ? 'Console' : 'Harbour'}, {scheme})</h2>
		<p class="muted">Every pairing in contrast/pairs.json, worst first. Text needs 4.5:1, edges and controls 3:1, a must-notice element's edge 4.5:1 against the page.</p>
		<div class="table-wrap">
			<table>
				<thead><tr><th>Sample</th><th>Pairing</th><th>Foreground</th><th>On</th><th>Ratio</th><th>Needs</th><th>Result</th></tr></thead>
				<tbody>
					{#each [...measured].sort((a, b) => a.value / a.min - b.value / b.min) as m (m.id + m.on)}
						<tr class:fail={!m.pass}>
							<td>
								<span class="chip" style:background="var(--{m.on})" style:color="var(--{m.fg})" style:border-color={m.kind === 'text' ? 'transparent' : `var(--${m.fg})`}
									>{m.kind === 'text' ? 'Aa' : ''}</span
								>
							</td>
							<td>{m.what}</td>
							<td><code>--{m.fg}</code></td>
							<td><code>--{m.on}</code></td>
							<td class="num">{m.value.toFixed(2)}</td>
							<td class="num">{m.min}</td>
							<td>{m.pass ? 'pass' : m.finding ? 'FINDING' : 'FAIL'}</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	</section>

	<section>
		<h2>Colour tokens</h2>
		<div class="swatches">
			{#each colours as n (n)}
				{@const c = now[n].colour}
				<div class="swatch">
					<span class="fill" style:background="var(--{n})"></span>
					<code>--{n}</code>
					<span class="small muted">{now[n].value.length > 40 ? now[n].value.slice(0, 40) + '…' : now[n].value}</span>
					<span class="small">vs --bg {r(c, page).toFixed(2)}, vs --fg {r(c, now.fg.colour).toFixed(2)}{c[3] < 1 ? ' (see-through)' : ''}</span>
				</div>
			{/each}
		</div>
	</section>

	<section>
		<h2>Other tokens</h2>
		<div class="table-wrap">
			<table>
				<thead><tr><th>Token</th><th>Value in this look</th></tr></thead>
				<tbody>
					{#each others as n (n)}
						<tr><td><code>--{n}</code></td><td><code>{now[n].value}</code></td></tr>
					{/each}
				</tbody>
			</table>
		</div>
	</section>
</main>

<style>
	.top {
		position: sticky;
		top: 0;
		z-index: var(--layer-header);
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
		padding: 0 var(--page-pad) var(--space-3xl);
	}
	.samples {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(min(100%, 22rem), 1fr));
		gap: var(--space-lg);
	}
	.card {
		padding: var(--space-lg);
		background: var(--surface);
		border: var(--border-width) solid var(--border);
		border-radius: var(--radius);
		min-width: 0;
	}
	.card h3 {
		margin-top: 0;
	}
	.row-of {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-sm);
		align-items: center;
		margin-bottom: var(--space-sm);
	}
	.row-of input:not([type='checkbox']) {
		width: var(--field-min);
	}
	.check {
		display: inline-flex;
		align-items: center;
		gap: var(--space-xs);
	}
	.field-group .check {
		display: flex;
		min-height: var(--target);
	}
	.muted {
		color: var(--muted);
	}
	.small {
		font-size: var(--text-xs);
	}
	.mono {
		font-family: var(--font-mono);
	}
	.error-text {
		color: var(--danger-text);
	}
	.highlighted {
		background: var(--highlight);
		padding: var(--space-2xs) var(--space-sm);
	}
	.ring {
		outline: var(--focus-width) solid var(--focus);
		outline-offset: var(--focus-offset);
	}
	.warn,
	.alert {
		padding: var(--space-sm) var(--space-md);
		border-radius: var(--radius);
		background: var(--warn-bg);
		color: var(--warn-fg);
	}
	.alert {
		margin: 0;
	}
	.alert a {
		color: inherit;
	}
	.alert-stage {
		margin-top: var(--space-sm);
		padding: var(--space-md);
		background: var(--bg);
		border-radius: var(--radius);
	}
	.alert-stage.on-card {
		background: var(--surface);
		border: var(--border-width) solid var(--border);
	}
	.heat {
		width: auto;
	}
	.heat td,
	.heat th {
		min-width: var(--heat-cell);
		padding: var(--space-3xs) var(--space-xs);
		text-align: center;
	}
	.heat tbody th {
		text-align: left;
		color: var(--muted);
	}
	.heat td.most {
		font-weight: var(--weight-strong);
	}
	.live {
		display: inline-block;
		width: var(--pulse-size);
		height: var(--pulse-size);
		border-radius: var(--radius-round);
		background: var(--ok-fg);
	}
	.row {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: var(--space-2xs) var(--space-md);
		padding: var(--row-pad-y) var(--row-pad-x);
		border-bottom: var(--border-width) solid var(--border);
		border-left: var(--edge-width) solid transparent;
	}
	.row.emergency {
		background: var(--emergency-row);
		border-left-color: var(--emergency-edge);
	}
	.row.nonemergency {
		background: var(--nonemergency-row);
		border-left-color: var(--nonemergency-edge);
	}
	.row.admin {
		background: var(--admin-row);
		border-left-color: var(--admin-edge);
	}
	.row.plain {
		background: var(--plain-row);
	}
	.row:hover {
		background: var(--hover);
	}
	.fresh-demo {
		background: var(--highlight);
	}
	.time {
		color: var(--muted);
		font-family: var(--font-meta);
		font-size: var(--text-sm);
	}
	.badge {
		display: inline-flex;
		align-items: center;
		gap: var(--space-2xs);
		padding: var(--badge-pad-y) var(--badge-pad-x);
		border: var(--border-width) solid transparent;
		border-radius: var(--radius-badge);
		font-size: var(--text-xs);
		font-weight: var(--weight-strong);
		text-transform: var(--badge-case);
		letter-spacing: var(--badge-tracking);
	}
	.badge .dot {
		display: var(--badge-dot);
		width: var(--badge-dot-size);
		height: var(--badge-dot-size);
		border-radius: var(--radius-round);
	}
	.badge.emergency {
		background: var(--emergency-badge-bg);
		color: var(--emergency-badge-fg);
		border-color: var(--emergency-badge-border);
	}
	.badge.emergency .dot {
		background: var(--emergency-dot);
	}
	.badge.nonemergency {
		background: var(--nonemergency-badge-bg);
		color: var(--nonemergency-badge-fg);
		border-color: var(--nonemergency-badge-border);
	}
	.badge.nonemergency .dot {
		background: var(--nonemergency-dot);
	}
	.badge.admin {
		background: var(--admin-badge-bg);
		color: var(--admin-badge-fg);
		border-color: var(--admin-badge-border);
	}
	.badge.admin .dot {
		background: var(--admin-dot);
	}
	.notice-stage {
		position: relative;
		min-height: 5rem;
		margin-top: var(--space-md);
		padding: var(--space-md);
		background: var(--bg);
		border-radius: var(--radius);
	}
	.notice {
		position: relative;
		max-width: min(var(--notice-width), 100%);
		padding: var(--space-sm) var(--space-md);
		border: var(--border-width-strong) solid var(--notice-edge);
		border-radius: var(--radius);
		background: var(--highlight);
		color: var(--fg);
		box-shadow: var(--notice-shadow);
		font-size: var(--text-sm);
		line-height: var(--leading-tight);
	}
	.notice a {
		font-weight: var(--weight-strong);
	}
	.countdown {
		position: absolute;
		left: var(--space-sm);
		right: var(--space-sm);
		bottom: var(--space-3xs);
		height: var(--notice-countdown-height);
		border-radius: var(--radius-small);
		background: var(--notice-edge);
		transform-origin: left;
		animation-name: countdown;
		animation-timing-function: linear;
		animation-fill-mode: forwards;
	}
	@keyframes countdown {
		from {
			transform: scaleX(1);
		}
		to {
			transform: scaleX(0);
		}
	}
	.table-wrap {
		overflow-x: auto;
	}
	table {
		width: 100%;
		font-size: var(--text-sm);
	}
	th,
	td {
		padding: var(--space-2xs) var(--space-sm);
		text-align: left;
		border-bottom: var(--border-width) solid var(--border);
		vertical-align: middle;
	}
	td.num {
		text-align: right;
		font-variant-numeric: tabular-nums;
	}
	tr.fail td {
		background: var(--warn-bg);
		color: var(--warn-fg);
	}
	.chip {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 2.5rem;
		height: 1.75rem;
		border: var(--border-width-strong) solid transparent;
		border-radius: var(--radius-small);
		font-weight: var(--weight-strong);
	}
	.swatches {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(min(100%, 14rem), 1fr));
		gap: var(--space-md);
	}
	.swatch {
		display: flex;
		flex-direction: column;
		gap: var(--space-3xs);
		min-width: 0;
		overflow-wrap: anywhere;
	}
	.swatch .fill {
		height: 3rem;
		border: var(--border-width) solid var(--control-border);
		border-radius: var(--radius-small);
	}
</style>
