<script>
	// A state badge (docs/design-system.md, section 4, "State badges"; 0.5.0,
	// ADR 0004): a thing's state in a word. .state-badge in base.css draws
	// it. state is ok, warning, error or neutral; the words are the app's
	// (text, or children), else OK, Warning or Error. A neutral state has no
	// word of its own ("Off", "Retired", "Not heard yet"), so give it one.
	/**
	 * @type {{
	 *   state?: 'ok' | 'warning' | 'error' | 'neutral',
	 *   text?: string,
	 *   children?: import('svelte').Snippet
	 * }}
	 */
	let { state = 'ok', text, children } = $props();
	const words = { ok: 'OK', warning: 'Warning', error: 'Error', neutral: '' };
</script>

<span class="state-badge" data-state={state}>{#if children}{@render children()}{:else}{text ?? words[state]}{/if}</span>
