// DataTable's sorting (src/components/table.js, 0.5.0, ADR 0004): the order
// a table sorts its rows in, which a server sorting for it follows too.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { compare, nextSort, sortRows, sortWords, textOf, valueOf } from '../src/components/table.js';

const cols = [
	{ key: 'name', label: 'Name', sortable: true },
	{ key: 'calls', label: 'Calls', sortable: true, firstDir: 'descending' },
	{ key: 'heard', label: 'Last heard', value: (r) => (r.heard ? new Date(r.heard) : null), text: (r) => r.heard ?? 'Never' }
];
const rows = [
	{ name: 'TG 10', calls: 4, heard: '2026-11-20T10:00:00Z' },
	{ name: 'tg 9', calls: 12, heard: null },
	{ name: 'Alpha', calls: null, heard: '2026-11-24T10:00:00Z' },
	{ name: 'beta', calls: 4, heard: '' }
];
const names = (rs) => rs.map((r) => r.name);

test('text sorts numerically and without case', () => {
	assert.deepEqual(names(sortRows(rows, cols, { key: 'name', dir: 'ascending' })), ['Alpha', 'beta', 'tg 9', 'TG 10']);
	assert.deepEqual(names(sortRows(rows, cols, { key: 'name', dir: 'descending' })), ['TG 10', 'tg 9', 'beta', 'Alpha']);
});

test('numbers sort as numbers, ties keep their order, and empty values go last both ways', () => {
	assert.deepEqual(names(sortRows(rows, cols, { key: 'calls', dir: 'ascending' })), ['TG 10', 'beta', 'tg 9', 'Alpha']);
	assert.deepEqual(names(sortRows(rows, cols, { key: 'calls', dir: 'descending' })), ['tg 9', 'TG 10', 'beta', 'Alpha']);
});

test("a column's own value sorts (dates), and its own text shows", () => {
	assert.deepEqual(names(sortRows(rows, cols, { key: 'heard', dir: 'descending' })), ['Alpha', 'TG 10', 'tg 9', 'beta']);
	assert.equal(textOf(rows[1], cols[2]), 'Never');
	assert.equal(textOf(rows[2], cols[1]), '');
	assert.equal(textOf(rows[0], cols[1]), '4');
	assert.ok(valueOf(rows[0], cols[2]) instanceof Date);
});

test('no sort, or an unknown column: the rows as given', () => {
	assert.equal(sortRows(rows, cols, null), rows);
	assert.equal(sortRows(rows, cols, { key: 'nope', dir: 'ascending' }), rows);
	// Sorting never changes the array it was given.
	const copy = [...rows];
	sortRows(rows, cols, { key: 'name', dir: 'ascending' });
	assert.deepEqual(rows, copy);
});

test('pressing a header: its first direction, then the other way; another header starts again', () => {
	assert.deepEqual(nextSort(null, cols[0]), { key: 'name', dir: 'ascending' });
	assert.deepEqual(nextSort({ key: 'name', dir: 'ascending' }, cols[0]), { key: 'name', dir: 'descending' });
	assert.deepEqual(nextSort({ key: 'name', dir: 'descending' }, cols[0]), { key: 'name', dir: 'ascending' });
	assert.deepEqual(nextSort({ key: 'name', dir: 'ascending' }, cols[1]), { key: 'calls', dir: 'descending' });
});

test('the sort in words, and compare', () => {
	assert.equal(sortWords({ key: 'calls', dir: 'descending' }, cols), 'Sorted by Calls, descending');
	assert.equal(sortWords(null, cols), 'Not sorted');
	assert.ok(compare(2, 10) < 0);
	assert.ok(compare('2', '10') < 0);
	assert.ok(compare(false, true) < 0);
});
