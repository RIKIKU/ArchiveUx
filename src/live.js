// The Live / Behind / Delayed badge's words (docs/design-system.md,
// section 4, "Live badge"; ADR 0002). The badge always says where playback
// is, in words, so its dot is never the only cue:
//
//   Live              playing within LIVE_WITHIN seconds of the live edge
//   Behind by 12 s    further behind (the listener can jump to live)
//   Delayed 5 min     a delay an admin set; never Live, however close
//
// Draw it as <span class="live-badge" data-state={state}>{text}</span>
// (base.css). No dependencies.

/** Within this many seconds of the live edge, playback is Live. */
export const LIVE_WITHIN = 2;

/**
 * "12 s", "1 min 5 s", "2 min", "1 h 4 min": a duration in whole seconds, the
 * largest two units.
 * @param {number} seconds
 */
export function shortDuration(seconds) {
	const s = Math.max(0, Math.floor(seconds));
	if (s < 60) return `${s} s`;
	if (s < 3600) {
		const m = Math.floor(s / 60);
		const r = s % 60;
		return r ? `${m} min ${r} s` : `${m} min`;
	}
	const h = Math.floor(s / 3600);
	const m = Math.floor((s % 3600) / 60);
	return m ? `${h} h ${m} min` : `${h} h`;
}

/**
 * The badge for what's playing.
 * @param {{ behind?: number, delay?: number, liveWithin?: number }} at
 *   behind: seconds behind the live edge; delay: the talkgroup's (or
 *   channel's) delay in minutes, set by an admin, 0 or none for none.
 * @returns {{ state: 'live' | 'behind' | 'delayed', text: string }}
 */
export function liveBadge({ behind = 0, delay = 0, liveWithin = LIVE_WITHIN } = {}) {
	if (delay > 0) return { state: 'delayed', text: `Delayed ${shortDuration(Math.round(delay) * 60)}` };
	if (!(behind >= liveWithin)) return { state: 'live', text: 'Live' };
	return { state: 'behind', text: `Behind by ${shortDuration(behind)}` };
}
