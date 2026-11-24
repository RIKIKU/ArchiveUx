import { test } from 'node:test';
import assert from 'node:assert/strict';
import { LIVE_WITHIN, liveBadge, shortDuration } from '../src/live.js';

test('Live within 5 s of the live edge', () => {
	assert.equal(LIVE_WITHIN, 5);
	assert.deepEqual(liveBadge(), { state: 'live', text: 'Live' });
	assert.deepEqual(liveBadge({ behind: 4.9 }), { state: 'live', text: 'Live' });
	assert.deepEqual(liveBadge({ behind: Number.NaN }), { state: 'live', text: 'Live' });
	assert.deepEqual(liveBadge({ behind: 2 }), { state: 'live', text: 'Live' });
	assert.deepEqual(liveBadge({ behind: 5 }), { state: 'behind', text: 'Behind by 5 s' });
});

test('behind by N s, then minutes and hours, in whole seconds', () => {
	assert.equal(liveBadge({ behind: 12.7 }).text, 'Behind by 12 s');
	assert.equal(liveBadge({ behind: 60 }).text, 'Behind by 1 min');
	assert.equal(liveBadge({ behind: 95 }).text, 'Behind by 1 min 35 s');
	assert.equal(liveBadge({ behind: 3840 }).text, 'Behind by 1 h 4 min');
	assert.equal(liveBadge({ behind: 5, liveWithin: 10 }).state, 'live');
});

test('a delay an admin set: Delayed N min, never Live', () => {
	assert.deepEqual(liveBadge({ delay: 5 }), { state: 'delayed', text: 'Delayed 5 min' });
	assert.deepEqual(liveBadge({ delay: 5, behind: 0 }), { state: 'delayed', text: 'Delayed 5 min' });
	assert.equal(liveBadge({ delay: 90 }).text, 'Delayed 1 h 30 min');
	assert.equal(liveBadge({ delay: 0, behind: 0 }).state, 'live');
});

test('short durations', () => {
	assert.equal(shortDuration(0), '0 s');
	assert.equal(shortDuration(-3), '0 s');
	assert.equal(shortDuration(59.9), '59 s');
	assert.equal(shortDuration(120), '2 min');
	assert.equal(shortDuration(7200), '2 h');
});
