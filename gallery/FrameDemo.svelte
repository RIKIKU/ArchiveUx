<script>
	// The frame in the gallery (frame.html): the whole page is the frame, as
	// an app draws it, with made-up content. Everything optional starts as
	// the address says (?dock=0, ?switcher=0, ?signedin=1, ?shrunk=1,
	// ?notice=1, ?look=console, ?theme=dark), and the switches on the page
	// change it. The look and theme are chosen in the account menu, signed in
	// or not.
	import Frame from '../src/components/Frame.svelte';
	import Menu from '../src/components/Menu.svelte';
	import BottomBar from '../src/components/BottomBar.svelte';
	import AccountMenu from '../src/components/AccountMenu.svelte';
	import Icon from '../src/components/Icon.svelte';
	import LiveBadge from '../src/components/LiveBadge.svelte';
	import { applyLook, applyTheme, isLook } from '../src/look.js';
	import { LIVE_WITHIN } from '../src/live.js';

	const q = new URLSearchParams(location.search);
	const flag = (k, d) => (q.has(k) ? q.get(k) !== '0' : d);

	let dock = $state(flag('dock', true));
	let switcher = $state(flag('switcher', true));
	let signedIn = $state(flag('signedin', false));
	let shrunk = $state(flag('shrunk', false));
	let notice = $state(flag('notice', false));
	let look = $state(isLook(q.get('look')) ? q.get('look') : 'harbour');
	let theme = $state(['light', 'dark'].includes(q.get('theme')) ? q.get('theme') : 'system');
	let playing = $state(true);
	let behind = $state(Number(q.get('behind') ?? 0));
	let open = $state({});

	$effect(() => applyLook(look));
	$effect(() => applyTheme(theme));

	const current = '/listen';
	const top = [
		{ href: '/listen', label: 'Listen', icon: 'play', text: 'Live calls from your channels' },
		{ href: '/recent', label: 'Recent', icon: 'clock', text: 'Calls from the last days' },
		{ href: '/saved', label: 'Saved', icon: 'bookmark', text: 'Calls you put aside', count: 3, quiet: true, says: ', 3 calls' }
	];
	const groups = [
		{
			id: 'admin',
			label: 'Administration',
			icon: 'shield',
			text: 'Channels, people and settings',
			href: '/admin',
			closed: false,
			desktopOnly: true,
			count: 2,
			says: ', 2 need review',
			entries: [
				{ href: '/admin/channels', label: 'Channels', icon: 'list', desktopOnly: true, count: 2, says: ', 2 need review' },
				{ href: '/admin/people', label: 'People', icon: 'users', desktopOnly: true },
				{ href: '/admin/settings', label: 'Settings', icon: 'tools', desktopOnly: true }
			]
		},
		{
			id: 'help',
			label: 'Help',
			icon: 'help',
			text: 'How it works',
			href: '/help',
			entries: [{ href: '/help/start', label: 'Getting started', icon: 'help' }]
		}
	];
	const leds = ['red', 'orange', 'yellow', 'green', 'cyan', 'blue', 'purple', 'pink'];
	const go = (e) => e.preventDefault();
</script>

<!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions (the demo stops links leaving the page) -->
<div onclick={(e) => e.target.closest?.('a[href^="/"]') && go(e)}>
	<Frame {shrunk} otherApp={switcher ? { name: 'PagerArchive', href: '#other-app' } : null} onswitch={go} dock={dock ? dockBar : undefined} dockLabel="Now playing">
		{#snippet menu()}
			<Menu
				brand={{ name: 'RadioArchive', mark: 'RA', href: '/' }}
				{current}
				{top}
				{groups}
				{open}
				ontoggle={(id, was) => (open = { ...open, [id]: !was })}
				{shrunk}
				onshrink={() => (shrunk = !shrunk)}
				version="0.3.0"
				versionHref="#release"
			/>
		{/snippet}
		{#snippet start()}<span class="crumb">Listen</span>{/snippet}
		{#snippet account()}
			<AccountMenu
				account={signedIn ? { name: 'Sam Example', email: 'sam@example.org' } : null}
				bind:theme
				bind:look
				signIn={() => (signedIn = true)}
				onsignout={() => (signedIn = false)}
				links={[{ href: '/account', label: 'Profile', icon: 'profile' }]}
			/>
		{/snippet}
		{#snippet bottomBar()}
			<BottomBar entries={top} {groups} {current} version="0.3.0" versionHref="#release" />
		{/snippet}
		{#snippet notices()}
			{#if notice}
				<!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
				<div class="notice notice-place" aria-live="polite" onclick={() => (notice = false)}>New release! <a href="#release" onclick={go}>Check out the release log</a></div>
			{/if}
		{/snippet}

		<h1>Listen</h1>
		<p class="muted">The frame with made-up content. Choose the look and the theme in the account menu (top right), signed in or not.</p>
		<fieldset class="switches">
			<legend>Frame parts</legend>
			<label><input type="checkbox" bind:checked={dock} /> Dock</label>
			<label><input type="checkbox" bind:checked={switcher} /> App switcher</label>
			<label><input type="checkbox" bind:checked={signedIn} /> Signed in</label>
			<label><input type="checkbox" bind:checked={shrunk} /> Shrunk menu</label>
			<label><input type="checkbox" bind:checked={notice} /> Notice</label>
			<label>Behind (s) <input class="narrow" type="number" min="0" bind:value={behind} /></label>
		</fieldset>

		<h2>Channels and their LEDs</h2>
		<ul class="channels">
			{#each leds as c, i (c)}
				<li class:on-card={i % 2 === 1}>
					<span class="led" data-led={c} aria-hidden="true"></span>
					<span class="channel">Channel {i + 1}</span>
					<span class="muted">LED {c}</span>
				</li>
			{/each}
		</ul>

		<h2>Live badge</h2>
		<p class="badges">
			<LiveBadge behind={0} />
			<LiveBadge behind={12} />
			<LiveBadge behind={95} />
			<LiveBadge delay={5} />
		</p>
		{#each Array(8) as _, i}
			<p class="filler">Call {i + 1}: a made-up line of the page, so it scrolls under the dock.</p>
		{/each}
	</Frame>
</div>

{#snippet dockBar()}
	<div class="now">
		<span class="led" data-led="cyan" aria-hidden="true"></span>
		<div class="what">
			<span class="tg">Channel 5 <span class="muted">· North</span></span>
			<span class="unit"><LiveBadge {behind} delay={0} /> <span class="muted">Unit 12 · 0:14 · 2 queued</span></span>
		</div>
	</div>
	<div class="controls">
		<button type="button" class="secondary icon-button" aria-label={playing ? 'Pause' : 'Play'} onclick={() => (playing = !playing)}><Icon name={playing ? 'pause' : 'play'} /></button>
		<button type="button" class="secondary icon-button" aria-label="Skip"><Icon name="skip" /></button>
		{#if behind >= LIVE_WITHIN}<button type="button" class="secondary" onclick={() => (behind = 0)}>Jump to live</button>{/if}
	</div>
{/snippet}

<style>
	.crumb {
		font-weight: var(--weight-strong);
	}
	.muted {
		color: var(--muted);
	}
	.switches {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-sm) var(--space-lg);
		margin: 0 0 var(--space-lg);
		padding: var(--space-md);
		border: var(--border-width) solid var(--control-border);
		border-radius: var(--radius);
	}
	.switches label {
		display: inline-flex;
		align-items: center;
		gap: var(--space-xs);
	}
	.narrow {
		width: var(--field-narrow);
	}
	.channels {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(min(100%, 14rem), 1fr));
		gap: var(--space-sm);
		margin: 0;
		padding: 0;
		list-style: none;
	}
	.channels li {
		display: flex;
		align-items: center;
		gap: var(--space-sm);
		padding: var(--space-sm) var(--space-md);
		border-radius: var(--radius);
	}
	.channels li.on-card {
		background: var(--surface);
	}
	.channel {
		font-weight: var(--weight-strong);
	}
	.badges {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-lg);
		align-items: center;
	}
	.now {
		display: flex;
		align-items: center;
		gap: var(--space-sm);
		flex: 1 1 auto;
		min-width: 0;
	}
	.what {
		display: flex;
		flex-direction: column;
		min-width: 0;
	}
	.tg {
		font-weight: var(--weight-strong);
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
	.unit {
		display: flex;
		align-items: center;
		gap: var(--space-sm);
		min-width: 0;
		font-size: var(--text-sm);
		white-space: nowrap;
	}
	.unit .muted {
		overflow: hidden;
		text-overflow: ellipsis;
	}
	.controls {
		display: flex;
		gap: var(--space-xs);
		flex: none;
	}
	.notice {
		padding: var(--space-sm) var(--space-md);
		border: var(--border-width-strong) solid var(--notice-edge);
		border-radius: var(--radius);
		background: var(--highlight);
		color: var(--fg);
		box-shadow: var(--notice-shadow);
		font-size: var(--text-sm);
		line-height: var(--leading-tight);
	}
	.notice a {
		font-weight: var(--weight-strong);
	}
</style>
