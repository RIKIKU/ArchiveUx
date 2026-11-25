<script>
	// A data table (docs/design-system.md, section 4, "Data tables"; 0.5.0,
	// ADR 0004): an admin page's list of things, one row each, with headers
	// that sort, a column of actions, and a phone layout.
	//
	// - Columns (table.js's Column): a label, the row's field (key), and
	//   optionally sortable, its first direction, end-aligned (numbers), the
	//   row's name (primary: a row header), drawn by the cell snippet (custom),
	//   or its own value or text.
	// - Sorting: a sortable header is a button; the sorted column says so with
	//   aria-sort and an arrow, and the change is announced politely ("Sorted
	//   by Calls, descending"). The table sorts its rows itself (table.js's
	//   sortRows), unless sortRows is false because the app's server sorts
	//   them; onsort is told either way. sort is bindable.
	// - Actions: the actions snippet fills a last column, its header named for
	//   screen readers only ("Actions"); put buttons there, and MoreActions
	//   for the rest.
	// - Narrow (the table's own width under 40rem, so a phone's 375 px and a
	//   narrow card alike; stack="auto"): each row is a card, the row's name
	//   its title, each value under its label, the actions at its foot, and
	//   the headers become a "Sort by" select. stack="never" keeps the table
	//   and scrolls it sideways instead. The rows keep their table roles, so
	//   assistive technology reads a table whichever way it's drawn.
	import Icon from './Icon.svelte';
	import { nextSort, sortRows as sorted, sortWords, textOf } from './table.js';

	/**
	 * @type {{
	 *   columns: import('./table.js').Column[],
	 *   rows: any[],
	 *   caption: string,
	 *   showCaption?: boolean,
	 *   key?: (row: any) => string | number,
	 *   sort?: import('./table.js').Sort | null,
	 *   sortRows?: boolean,
	 *   onsort?: (sort: import('./table.js').Sort) => unknown,
	 *   cell?: import('svelte').Snippet<[any, import('./table.js').Column]>,
	 *   actions?: import('svelte').Snippet<[any]>,
	 *   actionsLabel?: string,
	 *   empty?: string,
	 *   stack?: 'auto' | 'never',
	 *   rowProps?: (row: any) => Record<string, string | undefined>
	 * }}
	 */
	let {
		columns,
		rows,
		caption,
		showCaption = false,
		key = (row) => row.id,
		sort = $bindable(null),
		sortRows = true,
		onsort,
		cell,
		actions,
		actionsLabel = 'Actions',
		empty = 'Nothing here yet.',
		stack = 'auto',
		rowProps
	} = $props();

	const uid = $props.id();
	const shown = $derived(sortRows ? sorted(rows, columns, sort) : rows);
	const sortable = $derived(columns.filter((c) => c.sortable));
	let announced = $state('');

	function press(/** @type {import('./table.js').Column} */ column) {
		choose(nextSort(sort, column));
	}
	function choose(/** @type {import('./table.js').Sort} */ next) {
		sort = next;
		announced = sortWords(next, columns);
		onsort?.(next);
	}
	const ariaSort = (/** @type {import('./table.js').Column} */ c) => (sort?.key === c.key ? sort.dir : undefined);
	const arrow = (/** @type {import('./table.js').Column} */ c) => (sort?.key !== c.key ? 'sort-none' : sort.dir === 'ascending' ? 'sort-up' : 'sort-down');
</script>

<div class="data-table {stack}">
	{#if sortable.length && rows.length > 1}
		<label class="sorter" for="{uid}-sort">
			<span>Sort by</span>
			<select
				id="{uid}-sort"
				value={sort ? `${sort.key}:${sort.dir}` : ''}
				onchange={(e) => {
					const [k, d] = e.currentTarget.value.split(':');
					if (k) choose({ key: k, dir: /** @type {import('./table.js').SortDir} */ (d) });
				}}
			>
				{#if !sort}<option value="">As listed</option>{/if}
				{#each sortable as c (c.key)}
					<option value="{c.key}:ascending">{c.label}, ascending</option>
					<option value="{c.key}:descending">{c.label}, descending</option>
				{/each}
			</select>
		</label>
	{/if}
	{#if rows.length === 0}
		<p class="empty">{empty}</p>
	{:else}
		<div class="scroll">
			<!-- The roles are said again so a browser keeps them when the narrow layout redraws the cells as blocks. -->
			<!-- svelte-ignore a11y_no_redundant_roles -->
			<table role="table">
				<caption class:visually-hidden={!showCaption}>{caption}</caption>
				<thead>
					<tr>
						{#each columns as c (c.key)}
							<th scope="col" class:end={c.align === 'end'} aria-sort={ariaSort(c)}>
								{#if c.sortable}
									<button type="button" class="sort" onclick={() => press(c)}><span>{c.label}</span><Icon name={arrow(c)} /></button>
								{:else}{c.label}{/if}
							</th>
						{/each}
						{#if actions}<th scope="col" class="actions"><span class="visually-hidden">{actionsLabel}</span></th>{/if}
					</tr>
				</thead>
				<!-- svelte-ignore a11y_no_redundant_roles -->
				<tbody role="rowgroup">
					{#each shown as row (key(row))}
						<!-- svelte-ignore a11y_no_redundant_roles -->
						<tr role="row" {...rowProps?.(row) ?? {}}>
							{#each columns as c (c.key)}
								{#if c.primary}
									<th scope="row" role="rowheader" class="primary" class:end={c.align === 'end'}>
										{#if c.custom && cell}{@render cell(row, c)}{:else}{textOf(row, c)}{/if}
									</th>
								{:else}
									<!-- svelte-ignore a11y_no_redundant_roles -->
									<td role="cell" class:end={c.align === 'end'}>
										<span class="label">{c.label}</span>
										<span class="value">{#if c.custom && cell}{@render cell(row, c)}{:else}{textOf(row, c)}{/if}</span>
									</td>
								{/if}
							{/each}
							{#if actions}
								<!-- svelte-ignore a11y_no_redundant_roles -->
								<td role="cell" class="actions"><div class="row-actions">{@render actions(row)}</div></td>
							{/if}
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	{/if}
	<p class="visually-hidden" aria-live="polite">{announced}</p>
</div>

<style>
	.data-table {
		container: data-table / inline-size;
		min-width: 0;
	}
	.sorter {
		display: none;
	}
	.empty {
		margin: 0;
		padding: var(--space-md) 0;
		color: var(--muted);
	}
	.never .scroll {
		overflow-x: auto;
	}
	table {
		width: 100%;
		font-size: var(--text-sm);
		font-variant-numeric: tabular-nums;
	}
	caption {
		margin: 0 0 var(--space-sm);
		font-weight: var(--weight-strong);
		text-align: start;
	}
	th,
	td {
		padding: var(--space-xs) var(--space-md);
		border-bottom: var(--border-width) solid var(--border);
		text-align: start;
		vertical-align: middle;
		overflow-wrap: anywhere;
	}
	thead th {
		color: var(--fg);
		font-weight: var(--weight-strong);
		white-space: nowrap;
		border-bottom-width: var(--border-width-strong);
	}
	th.primary {
		font-weight: var(--weight-strong);
	}
	.end {
		text-align: end;
	}
	tbody tr:hover {
		background: var(--hover);
	}
	td .label {
		display: none;
	}
	/* A sortable header: the header's words as a button, with its arrow. */
	.sort {
		display: inline-flex;
		align-items: center;
		gap: var(--space-2xs);
		min-height: var(--target);
		min-width: 0;
		margin: 0 calc(-1 * var(--space-xs));
		padding: 0 var(--space-xs);
		border: 0;
		border-radius: var(--radius-small);
		background: transparent;
		color: inherit;
		font-weight: inherit;
	}
	.sort:hover {
		background: var(--hover);
	}
	.sort:active {
		background: var(--accent-soft);
		color: var(--accent-soft-fg);
	}
	th:not([aria-sort]) .sort :global(.ui-icon) {
		color: var(--muted);
	}
	.end .sort {
		flex-direction: row-reverse;
	}
	th.actions,
	td.actions {
		width: 0;
		text-align: end;
	}
	.row-actions {
		display: flex;
		flex-wrap: nowrap;
		align-items: center;
		justify-content: flex-end;
		gap: var(--space-xs);
		white-space: nowrap;
	}

	/* Narrow: each row a card, each value under its label. */
	@container data-table (width < 40rem) {
		.auto .sorter {
			display: flex;
			align-items: center;
			gap: var(--space-sm);
			margin: 0 0 var(--space-sm);
			font-size: var(--text-sm);
		}
		.auto .sorter select {
			width: auto;
			min-width: 0;
			flex: 1 1 auto;
			max-width: var(--field-wide);
		}
		.auto table,
		.auto tbody,
		.auto tr,
		.auto th,
		.auto td {
			display: block;
		}
		.auto thead {
			display: none;
		}
		.auto tr {
			padding: var(--space-sm) 0;
			border-bottom: var(--border-width) solid var(--border);
		}
		.auto tbody tr:hover {
			background: transparent;
		}
		.auto th,
		.auto td {
			padding: var(--space-3xs) 0;
			border: 0;
			text-align: start;
		}
		.auto th.primary {
			font-size: var(--text-base);
		}
		.auto td:not(.actions) {
			display: grid;
			grid-template-columns: minmax(0, var(--label-min)) minmax(0, 1fr);
			gap: var(--space-sm);
		}
		.auto td .label {
			display: block;
			color: var(--muted);
		}
		.auto td.actions {
			width: auto;
			padding-top: var(--space-xs);
		}
		.auto .row-actions {
			flex-wrap: wrap;
			justify-content: flex-start;
			white-space: normal;
		}
	}
</style>
