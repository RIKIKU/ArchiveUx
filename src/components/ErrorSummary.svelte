<script>
	// The error summary at the top of a form (docs/design-system.md, section
	// 5, rule 4; 0.6.0), after the GOV.UK pattern: a title counting the
	// fields ("2 fields need attention") and, under it, one link for each
	// problem, naming its field and saying what to do ("Talkgroups: Choose
	// at least one talkgroup."). A link moves the focus to its field. Each
	// problem is still shown under its own field too.
	//
	// After a save that finds problems, the app moves the focus here, so a
	// screen reader reads the title and the links, and a keyboard is one Tab
	// from the first:
	//
	//   <ErrorSummary bind:this={summary} problems={[{ id: 'name', label: 'Name', message: 'Give it a name.' }]} />
	//   ... await tick(); summary.focus();
	//
	// id is the field's control (its first control, for a group); label is
	// the field's name as its label or legend says it. With no problems,
	// nothing is drawn.
	import Icon from './Icon.svelte';
	import { focusField, problemText, summaryTitle } from './errorsummary.js';

	/**
	 * @type {{
	 *   problems?: { id: string, label: string, message: string }[],
	 *   title?: string,
	 *   level?: 2 | 3 | 4
	 * }}
	 */
	let { problems = [], title, level = 2 } = $props();

	const uid = $props.id();
	/** @type {HTMLDivElement | undefined} */
	let box = $state();

	/** The focus to the summary (after a save that found problems). */
	export function focus() {
		box?.focus();
		box?.scrollIntoView?.({ block: 'nearest' });
	}
</script>

{#if problems.length}
	<div class="error-summary" bind:this={box} tabindex="-1" role="group" aria-labelledby="{uid}-title">
		<svelte:element this={`h${level}`} class="error-summary-title" id="{uid}-title"
			><Icon name="error" />{title ?? summaryTitle(problems.length)}</svelte:element
		>
		<ul class="error-summary-list">
			{#each problems as p (p.id)}
				<li><a href="#{p.id}" onclick={(e) => focusField(e, p.id)}>{problemText(p)}</a></li>
			{/each}
		</ul>
	</div>
{/if}
