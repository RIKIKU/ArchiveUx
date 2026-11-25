// DataTable's columns and sorting (0.5.0, ADR 0004), apart from the
// component so an app (or a server in another language) can follow the same
// order, and the tests can hold its cases.
//
// A column's value is column.value(row) if it has one, else row[column.key].
// Sorting is stable, numbers compare as numbers, and text compares by the
// collator's numeric, case-blind order ("TG 9" before "TG 10"). Empty values
// (null, undefined, '') always go last, whichever way the column is sorted,
// so "never heard" stays at the foot of a table sorted by Last heard.

/** @typedef {'ascending' | 'descending'} SortDir */
/** @typedef {{ key: string, dir: SortDir }} Sort */
/**
 * @typedef {object} Column
 * @property {string} key The row's field, and the column's id.
 * @property {string} label The header's words; also each value's label when the table is stacked.
 * @property {boolean} [sortable] Its header is a button that sorts by it.
 * @property {SortDir} [firstDir] Its first sort ('ascending' unless said): 'descending' for "newest first".
 * @property {'start' | 'end'} [align] 'end' for numbers, which also get tabular figures.
 * @property {boolean} [primary] The row's name: its header cell (th scope="row"), and the card's title when stacked.
 * @property {boolean} [custom] Drawn by the table's cell snippet rather than as text.
 * @property {(row: any) => unknown} [value] What it sorts by (and shows, without text), if not row[key].
 * @property {(row: any) => string} [text] What it shows, if not the value as a string.
 */

/** A column's value for a row. */
export function valueOf(/** @type {any} */ row, /** @type {Column} */ column) {
	return column.value ? column.value(row) : row?.[column.key];
}

/** A column's words for a row: its text, else its value as a string ('' when empty). */
export function textOf(/** @type {any} */ row, /** @type {Column} */ column) {
	if (column.text) return column.text(row);
	const v = valueOf(row, column);
	return v === null || v === undefined ? '' : String(v);
}

const empty = (/** @type {unknown} */ v) => v === null || v === undefined || v === '';
const collator = new Intl.Collator(undefined, { numeric: true, sensitivity: 'base' });

/** Two values' order, both not empty: numbers, dates and booleans by number, the rest as text. */
export function compare(/** @type {unknown} */ a, /** @type {unknown} */ b) {
	const num = (/** @type {unknown} */ v) => (typeof v === 'number' ? v : v instanceof Date ? v.getTime() : typeof v === 'boolean' ? Number(v) : null);
	const [x, y] = [num(a), num(b)];
	if (x !== null && y !== null) return x - y;
	return collator.compare(String(a), String(b));
}

/**
 * The rows in a sort's order (a new array; the rows as given when there's no sort or no such column).
 * @template T
 * @param {T[]} rows
 * @param {Column[]} columns
 * @param {Sort | null | undefined} sort
 * @returns {T[]}
 */
export function sortRows(rows, columns, sort) {
	const column = sort && columns.find((c) => c.key === sort.key);
	if (!sort || !column) return rows;
	const sign = sort.dir === 'descending' ? -1 : 1;
	return rows
		.map((row, i) => ({ row, i, v: valueOf(row, column) }))
		.sort((p, q) => {
			const [ep, eq] = [empty(p.v), empty(q.v)];
			if (ep || eq) return ep === eq ? p.i - q.i : ep ? 1 : -1;
			return sign * compare(p.v, q.v) || p.i - q.i;
		})
		.map((x) => x.row);
}

/** The sort after a column's header is pressed: its first direction if it wasn't the sorted one, else the other way. */
export function nextSort(/** @type {Sort | null | undefined} */ sort, /** @type {Column} */ column) {
	if (!sort || sort.key !== column.key) return { key: column.key, dir: column.firstDir ?? 'ascending' };
	return { key: column.key, dir: sort.dir === 'ascending' ? 'descending' : 'ascending' };
}

/** The sort in words, as the table announces it: "Sorted by Name, ascending". */
export function sortWords(/** @type {Sort | null | undefined} */ sort, /** @type {Column[]} */ columns) {
	const column = sort && columns.find((c) => c.key === sort.key);
	return sort && column ? `Sorted by ${column.label}, ${sort.dir}` : 'Not sorted';
}
