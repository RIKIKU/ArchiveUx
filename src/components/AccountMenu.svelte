<script>
	// The account menu (docs/design-system.md, section 4, "Account menu"),
	// moved from PagerArchive's AccountMenu.svelte with its API calls as
	// callbacks. Signed in: who, the app's links (Profile…), the colour theme,
	// the look and Sign out. Signed out (account null, 0.3.0): Sign in, and
	// the theme and the look are still choosable, because an app may have
	// people who never sign in (a listener). Nothing in it needs an account.
	//
	// The theme and the look apply at once (bind them, and put them on the
	// root: data-theme, data-look). The look is saved by onlook, the app's:
	// on the account when signed in, else as the app saves its other
	// settings, and in the shared look cookie in a combined deployment
	// (look.js). If onlook throws, the old look comes back and the menu says
	// so.
	import Icon from './Icon.svelte';

	/**
	 * @type {{
	 *   account?: import('./types.js').Account,
	 *   theme?: 'system' | 'light' | 'dark',
	 *   look?: 'harbour' | 'console',
	 *   onlook?: (look: 'harbour' | 'console') => unknown,
	 *   signIn?: string | (() => unknown),
	 *   onsignout?: () => unknown,
	 *   links?: { href: string, label: string, icon?: string, svg?: string }[],
	 *   extra?: import('svelte').Snippet<[{ close: () => void }]>
	 * }}
	 */
	let { account = null, theme = $bindable('system'), look = $bindable('harbour'), onlook, signIn = '/signin', onsignout, links = [], extra } = $props();

	/** @type {HTMLDivElement} */
	let box;
	/** @type {HTMLButtonElement} */
	let toggle;
	let open = $state(false);
	const uid = $props.id();
	const name = $derived(account?.name || account?.email || '');
	const initials = $derived(
		name
			.split(/[\s@.]+/)
			.filter(Boolean)
			.slice(0, 2)
			.map((w) => w[0].toUpperCase())
			.join('') || '?'
	);
	const close = () => (open = false);

	let lookError = $state('');
	async function choose(/** @type {'harbour' | 'console'} */ next) {
		const before = look;
		look = next;
		lookError = '';
		try {
			await onlook?.(next);
		} catch {
			look = before;
			lookError = "Couldn't save the look. Try again.";
		}
	}

	// Closes when focus or a click goes elsewhere, or on Escape.
	function outside(/** @type {Event} */ ev) {
		if (open && !box.contains(/** @type {Node} */ (ev.target))) open = false;
	}
	function escape(/** @type {KeyboardEvent} */ ev) {
		if (ev.key === 'Escape' && open) {
			open = false;
			toggle.focus();
		}
	}
</script>

<svelte:window onclick={outside} onfocusin={outside} onkeydown={escape} />

<div class="account" bind:this={box}>
	<button
		bind:this={toggle}
		class="ghost"
		type="button"
		aria-expanded={open}
		aria-controls="{uid}-panel"
		aria-label={account ? `Account menu${name ? `, ${name}` : ''}` : 'Account menu, signed out'}
		onclick={() => (open = !open)}
		>{#if account}<span class="avatar" aria-hidden="true">{initials}</span>{:else}<span class="avatar out" aria-hidden="true"><Icon name="account" /></span>{/if}</button
	>
	<div class="panel" id="{uid}-panel" hidden={!open}>
		{#if account}
			<p class="who"><span class="name">{account.name ?? account.email}</span>{#if account.name && account.email}<span class="email">{account.email}</span>{/if}</p>
			{#each links as l (l.href)}
				<a class="row" href={l.href} onclick={close}><Icon name={l.icon} svg={l.svg} />{l.label}</a>
			{/each}
		{:else}
			<p class="who"><span class="email">Not signed in</span></p>
			{#if typeof signIn === 'string'}
				<a class="row" href={signIn} onclick={close}><Icon name="signin" />Sign in</a>
			{:else}
				<button class="row" type="button" onclick={() => (close(), signIn())}><Icon name="signin" />Sign in</button>
			{/if}
		{/if}
		<label class="theme">
			<span class="row-label"><Icon name={theme === 'dark' ? 'dark' : theme === 'light' ? 'light' : 'auto'} />Colour theme</span>
			<select bind:value={theme}>
				<option value="system">Auto</option>
				<option value="light">Light</option>
				<option value="dark">Dark</option>
			</select>
		</label>
		<label class="theme">
			<span class="row-label"><Icon name="look" />Look</span>
			<select value={look} onchange={(e) => choose(/** @type {'harbour' | 'console'} */ (e.currentTarget.value))}>
				<option value="harbour">Harbour</option>
				<option value="console">Console</option>
			</select>
		</label>
		{#if lookError}<p class="error look-error" role="alert">{lookError}</p>{/if}
		{@render extra?.({ close })}
		{#if account}
			<button class="row" type="button" onclick={() => (close(), onsignout?.())}><Icon name="signout" />Sign out</button>
		{/if}
	</div>
</div>

<style>
	.account {
		position: relative;
	}
	.account > button {
		padding: 0;
	}
	.panel[hidden] {
		display: none;
	}
	.avatar {
		display: inline-grid;
		place-items: center;
		width: var(--avatar-size);
		height: var(--avatar-size);
		border-radius: var(--radius-round);
		background: var(--accent-soft);
		color: var(--accent-soft-fg);
		font-size: var(--text-xs);
		font-weight: var(--weight-strong);
	}
	/* Signed out: an outline of a person, not initials. */
	.avatar.out {
		font-size: var(--text-lg);
	}
	.panel {
		position: absolute;
		right: 0;
		top: 100%;
		z-index: var(--layer-overlay);
		display: flex;
		flex-direction: column;
		gap: var(--space-2xs);
		min-width: var(--field-wide);
		margin-top: var(--space-2xs);
		padding: var(--space-sm);
		background: var(--surface-2);
		border: var(--border-width) solid var(--control-border);
		border-radius: var(--radius);
	}
	.who {
		display: flex;
		flex-direction: column;
		margin: 0;
		padding: var(--space-2xs) var(--space-md) var(--space-sm);
		border-bottom: var(--border-width) solid var(--border);
		overflow-wrap: anywhere;
	}
	.name {
		font-weight: var(--weight-strong);
	}
	.email {
		color: var(--muted);
		font-size: var(--text-sm);
	}
	.row {
		display: flex;
		align-items: center;
		justify-content: flex-start;
		gap: var(--space-sm);
		width: 100%;
		min-height: var(--target);
		padding: 0 var(--space-md);
		border: 0;
		border-radius: var(--radius-small);
		background: transparent;
		color: var(--fg);
		font-weight: var(--weight-normal);
		text-decoration: none;
	}
	.row:hover {
		background: var(--hover);
	}
	.row:active {
		background: var(--accent-soft);
		color: var(--accent-soft-fg);
	}
	.theme {
		display: flex;
		flex-direction: column;
		gap: var(--space-2xs);
		padding: var(--space-xs) var(--space-md);
	}
	.look-error {
		margin: 0;
		padding: var(--space-2xs) var(--space-md);
		font-size: var(--text-sm);
	}
	.row-label {
		display: flex;
		align-items: center;
		gap: var(--space-sm);
		font-size: var(--text-sm);
	}
</style>
