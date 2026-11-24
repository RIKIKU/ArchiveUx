// Dates for DateRange (0.4.0), moved from PagerArchive's format.ts: days are
// YYYY-MM-DD and times of day HH:MM (24-hour), both on the clock of the
// deployment's time zone (an IANA name, "Australia/Melbourne"), never the
// browser's. The server stores instants in UTC; rangeBounds turns a range
// picked in DateRange into those instants.

const cache = new Map();

/** @returns {Intl.DateTimeFormat} */
function fmt(/** @type {string} */ timeZone, /** @type {Intl.DateTimeFormatOptions} */ opts) {
	const key = timeZone + JSON.stringify(opts);
	let f = cache.get(key);
	if (!f) {
		f = new Intl.DateTimeFormat('en-AU', { timeZone, ...opts });
		cache.set(key, f);
	}
	return f;
}

/** The parts of an instant on timeZone's clock, as numbers. */
function clock(/** @type {number} */ ms, /** @type {string} */ timeZone) {
	/** @type {Record<string, number>} */
	const p = {};
	const parts = fmt(timeZone, { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23' }).formatToParts(new Date(ms));
	for (const { type, value } of parts) if (type !== 'literal') p[type] = Number(value);
	return p;
}

/**
 * 2026-10-09: the day an instant falls on in timeZone, as DateRange and the
 * apps' APIs take it.
 * @param {string | number | Date} iso an instant (an ISO string, milliseconds or a Date)
 * @param {string} timeZone
 */
export function isoDate(iso, timeZone) {
	/** @type {Record<string, string>} */
	const parts = {};
	for (const p of fmt(timeZone, { year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(new Date(iso))) parts[p.type] = p.value;
	return `${parts.year}-${parts.month}-${parts.day}`;
}

/**
 * The instant at which timeZone's clock shows a day and time. A time the
 * clock skips (the hour daylight saving starts) comes out an hour later; one
 * it shows twice (the hour it ends), the first.
 * @param {string} day YYYY-MM-DD
 * @param {string} time HH:MM
 * @param {string} timeZone
 * @returns {number} milliseconds since 1970 (UTC)
 */
export function zonedInstant(day, time, timeZone) {
	const [y, m, d] = day.split('-').map(Number);
	const [h, mi] = time.split(':').map(Number);
	const wall = Date.UTC(y, m - 1, d, h, mi);
	// The zone's offset at an instant: its clock there, read as UTC, less the instant.
	const offset = (/** @type {number} */ t) => {
		const c = clock(t, timeZone);
		return Date.UTC(c.year, c.month - 1, c.day, c.hour, c.minute, c.second) - Math.floor(t / 1000) * 1000;
	};
	// A zone changes its offset at most once in two days, so the offsets a
	// day before and a day after give every instant that can show the time.
	const before = wall - offset(wall - 86_400_000);
	const after = wall - offset(wall + 86_400_000);
	const shows = (/** @type {number} */ t) => {
		const c = clock(t, timeZone);
		return Date.UTC(c.year, c.month - 1, c.day, c.hour, c.minute) === wall;
	};
	const [a, b] = before <= after ? [before, after] : [after, before];
	if (shows(a)) return a;
	if (shows(b)) return b;
	// Skipped: the old offset's instant, which the clock shows as an hour on.
	return before;
}

const nextDay = (/** @type {string} */ day) => {
	const [y, m, d] = day.split('-').map(Number);
	return new Date(Date.UTC(y, m - 1, d + 1)).toISOString().slice(0, 10);
};

/**
 * The instants a range covers, for an app's API: from the first day at its
 * time (or the day's start) up to, not including, the end of the last day's
 * minute (or the day's end). So "to 16:30" includes what started in the
 * minute 16:30, as "to 5 Nov" includes 5 Nov. Empty when no day is picked.
 * @param {{ from?: string, to?: string, fromTime?: string, toTime?: string }} range what DateRange gives
 * @param {string} timeZone
 * @returns {{ start: string, end: string } | undefined} ISO instants in UTC; end is exclusive
 */
export function rangeBounds({ from = '', to = '', fromTime = '', toTime = '' }, timeZone) {
	if (!from) return undefined;
	const last = to || from;
	const start = zonedInstant(from, fromTime || '00:00', timeZone);
	const end = toTime ? zonedInstant(last, toTime, timeZone) + 60_000 : zonedInstant(nextDay(last), '00:00', timeZone);
	return { start: new Date(start).toISOString(), end: new Date(end).toISOString() };
}
