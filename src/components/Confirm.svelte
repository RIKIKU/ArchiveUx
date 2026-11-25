<script>
	// Asking before a destructive action (docs/design-system.md, section 4,
	// "Confirming"; 0.5.0, ADR 0004). The app draws it when the action is
	// asked for ({#if asking}<Confirm … />{/if}) and takes it away when it is
	// done or cancelled.
	//
	// - The question is its heading, naming the thing ("Delete Channel 5?");
	//   the children say what will happen, in words, and whether it can be
	//   undone. The confirm button says the action ("Delete Channel 5", never
	//   "OK" or "Yes") and is a danger button (danger, the default) or a
	//   primary one; Cancel is a secondary button after it.
	// - Inline (the default): a panel where it's drawn, under the thing or the
	//   form it's about, --surface-2 with a --control-border edge. Its heading
	//   takes the focus, so the question is read first; Escape cancels.
	// - modal: a modal dialog (<dialog>, showModal) over a --scrim, at most
	//   --dialog-width; Cancel takes the focus, so Enter never confirms by
	//   accident; Escape cancels.
	// - Either way, when it goes, the focus goes back to what had it when it
	//   came (the button that asked), if that's still on the page.
	// - onconfirm may be async: both buttons wait while it runs (busy also
	//   holds them). If it throws, the panel stays and says error, or "That
	//   didn't work. Try again."
	import { onMount, tick } from 'svelte';

	/**
	 * @type {{
	 *   title: string,
	 *   confirmLabel: string,
	 *   cancelLabel?: string,
	 *   onconfirm: () => unknown,
	 *   oncancel: () => unknown,
	 *   danger?: boolean,
	 *   modal?: boolean,
	 *   busy?: boolean,
	 *   error?: string,
	 *   level?: 2 | 3 | 4,
	 *   children?: import('svelte').Snippet
	 * }}
	 */
	let { title, confirmLabel, cancelLabel = 'Cancel', onconfirm, oncancel, danger = true, modal = false, busy = false, error = '', level = 2, children } = $props();

	const uid = $props.id();
	/** @type {HTMLElement | undefined} */
	let box = $state();
	/** @type {HTMLElement} */
	let heading;
	/** @type {HTMLButtonElement} */
	let cancelButton;
	let running = $state(false);
	let failed = $state('');
	const waiting = $derived(busy || running);

	onMount(() => {
		const before = /** @type {HTMLElement | null} */ (document.activeElement);
		if (modal) {
			/** @type {HTMLDialogElement} */ (box).showModal();
			cancelButton.focus();
		} else {
			heading.focus();
		}
		return () => {
			// Back to the button that asked, unless the focus has moved on.
			const now = document.activeElement;
			if (before?.isConnected && (!now || now === document.body || box?.contains(now))) before.focus();
		};
	});

	async function confirm() {
		if (waiting) return;
		failed = '';
		running = true;
		try {
			await onconfirm();
		} catch {
			failed = "That didn't work. Try again.";
			await tick();
		} finally {
			running = false;
		}
	}
	function cancel() {
		if (!running) oncancel();
	}
	function keys(/** @type {KeyboardEvent} */ ev) {
		if (ev.key === 'Escape' && !modal) {
			ev.stopPropagation();
			cancel();
		}
	}
	const problem = $derived(error || failed);
</script>

{#snippet body()}
	<svelte:element this={`h${level}`} class="title" id="{uid}-title" tabindex="-1" bind:this={heading}>{title}</svelte:element>
	{#if children}<div class="what" id="{uid}-what">{@render children()}</div>{/if}
	{#if problem}<p class="field-error" role="alert">{problem}</p>{/if}
	<div class="buttons">
		<button type="button" class:danger disabled={waiting} onclick={confirm}>{confirmLabel}</button>
		<button type="button" class="secondary" disabled={running} bind:this={cancelButton} onclick={cancel}>{cancelLabel}</button>
	</div>
{/snippet}

{#if modal}
	<dialog
		class="confirm modal"
		bind:this={box}
		aria-labelledby="{uid}-title"
		aria-describedby={children ? `${uid}-what` : undefined}
		oncancel={(e) => {
			e.preventDefault();
			cancel();
		}}
	>
		{@render body()}
	</dialog>
{:else}
	<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
	<section class="confirm inline" bind:this={box} aria-labelledby="{uid}-title" onkeydown={keys}>
		{@render body()}
	</section>
{/if}

<style>
	.confirm {
		padding: var(--space-lg);
		background: var(--surface-2);
		color: var(--fg);
		border: var(--border-width) solid var(--control-border);
		border-radius: var(--radius);
		overflow-wrap: anywhere;
	}
	.inline {
		max-width: min(var(--measure), 100%);
		margin: var(--space-md) 0;
	}
	.modal {
		width: min(var(--dialog-width), var(--panel-max));
		max-width: 100%;
	}
	.modal::backdrop {
		background: var(--scrim);
	}
	.title {
		margin: 0 0 var(--space-sm);
		font-size: var(--text-lg);
	}
	.title:focus {
		outline: none;
	}
	.title:focus-visible {
		outline: var(--focus-width) solid var(--focus);
		outline-offset: var(--focus-offset);
	}
	.what :global(p) {
		margin: 0 0 var(--space-sm);
	}
	.field-error {
		margin: 0 0 var(--space-sm);
	}
	.buttons {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-sm);
		margin-top: var(--space-md);
	}
</style>
