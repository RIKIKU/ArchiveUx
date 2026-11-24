<script>
	// The Live / Behind / Delayed badge (docs/design-system.md, section 4,
	// "Live badge"; 0.3.0, ADR 0002): where playback is, always in words.
	// .live-badge in base.css draws it; liveBadge() in live.js picks the words.
	import { liveBadge } from '../live.js';

	/** @type {{ behind?: number, delay?: number, liveWithin?: number }} */
	let { behind = 0, delay = 0, liveWithin } = $props();
	const badge = $derived(liveBadge({ behind, delay, ...(liveWithin === undefined ? {} : { liveWithin }) }));
</script>

<span class="live-badge" data-state={badge.state}>{badge.text}</span>
