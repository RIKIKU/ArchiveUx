// archiveux/dates.js (0.4.0): the day an instant falls on, and a range
// picked in DateRange as the instants an API takes, on the deployment's
// clock. Melbourne's daylight saving in 2026: it ends 5 April (03:00 AEDT
// becomes 02:00 AEST) and starts 4 October (02:00 AEST becomes 03:00 AEDT).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { isoDate, rangeBounds, zonedInstant } from '../src/dates.js';

const MEL = 'Australia/Melbourne';
const at = (ms) => new Date(ms).toISOString();

test('isoDate: the day on the zone’s clock, not the browser’s', () => {
	assert.equal(isoDate('2026-11-03T12:59:00Z', MEL), '2026-11-03');
	assert.equal(isoDate('2026-11-03T13:00:00Z', MEL), '2026-11-04');
	assert.equal(isoDate('2026-11-03T13:00:00Z', 'UTC'), '2026-11-03');
	assert.equal(isoDate(Date.UTC(2026, 0, 1), 'UTC'), '2026-01-01');
});

test('zonedInstant: a day and time on the zone’s clock', () => {
	assert.equal(at(zonedInstant('2026-11-03', '14:00', MEL)), '2026-11-03T03:00:00.000Z'); // AEDT, +11
	assert.equal(at(zonedInstant('2026-07-03', '14:00', MEL)), '2026-07-03T04:00:00.000Z'); // AEST, +10
	assert.equal(at(zonedInstant('2026-07-03', '14:00', 'UTC')), '2026-07-03T14:00:00.000Z');
	assert.equal(at(zonedInstant('2026-07-03', '00:00', 'America/New_York')), '2026-07-03T04:00:00.000Z');
});

test('zonedInstant: a skipped time is an hour on; a time shown twice, the first', () => {
	// 02:30 on 4 October doesn't happen: 03:30 AEDT.
	assert.equal(at(zonedInstant('2026-10-04', '02:30', MEL)), '2026-10-03T16:30:00.000Z');
	// 02:30 on 5 April happens twice: the first, still AEDT.
	assert.equal(at(zonedInstant('2026-04-05', '02:30', MEL)), '2026-04-04T15:30:00.000Z');
	// Either side of the changes.
	assert.equal(at(zonedInstant('2026-10-04', '01:59', MEL)), '2026-10-03T15:59:00.000Z');
	assert.equal(at(zonedInstant('2026-10-04', '03:00', MEL)), '2026-10-03T16:00:00.000Z');
	assert.equal(at(zonedInstant('2026-04-05', '03:00', MEL)), '2026-04-04T17:00:00.000Z');
});

test('rangeBounds: whole days, from the first day’s start to the last day’s end', () => {
	assert.deepEqual(rangeBounds({ from: '2026-11-03', to: '2026-11-05' }, MEL), { start: '2026-11-02T13:00:00.000Z', end: '2026-11-05T13:00:00.000Z' });
	// One day: to empty, as DateRange gives it when the same day is picked twice.
	assert.deepEqual(rangeBounds({ from: '2026-11-03' }, MEL), { start: '2026-11-02T13:00:00.000Z', end: '2026-11-03T13:00:00.000Z' });
	// The day daylight saving starts is 23 hours long.
	const b = rangeBounds({ from: '2026-10-04', to: '2026-10-04' }, MEL);
	assert.deepEqual(b, { start: '2026-10-03T14:00:00.000Z', end: '2026-10-04T13:00:00.000Z' });
	assert.equal((Date.parse(b.end) - Date.parse(b.start)) / 3_600_000, 23);
	assert.equal(rangeBounds({}, MEL), undefined);
	assert.equal(rangeBounds({ from: '', fromTime: '14:00' }, MEL), undefined);
});

test('rangeBounds: times of day; To includes its whole minute', () => {
	assert.deepEqual(rangeBounds({ from: '2026-11-03', to: '2026-11-03', fromTime: '14:00', toTime: '16:30' }, MEL), {
		start: '2026-11-03T03:00:00.000Z',
		end: '2026-11-03T05:31:00.000Z'
	});
	// Overnight, the recent-calls case: 21:30 to 06:15 the next morning.
	assert.deepEqual(rangeBounds({ from: '2026-11-23', to: '2026-11-24', fromTime: '21:30', toTime: '06:15' }, MEL), {
		start: '2026-11-23T10:30:00.000Z',
		end: '2026-11-23T19:16:00.000Z'
	});
	// One end timed, the other the whole day.
	assert.deepEqual(rangeBounds({ from: '2026-11-03', to: '2026-11-04', toTime: '09:00' }, MEL), { start: '2026-11-02T13:00:00.000Z', end: '2026-11-03T22:01:00.000Z' });
	assert.deepEqual(rangeBounds({ from: '2026-11-03', fromTime: '23:59' }, 'UTC'), { start: '2026-11-03T23:59:00.000Z', end: '2026-11-04T00:00:00.000Z' });
});
