<!-- src/routes/admin/putting-league/+page.svelte -->
<script>
	import { format, parseISO } from 'date-fns';
	import { Icon, PencilSquare, Trash, PlusCircle, CheckCircle, XCircle, CurrencyDollar, ChevronDown, ChevronRight } from 'svelte-hero-icons';
	import { enhance } from '$app/forms';
	import { invalidateAll } from '$app/navigation';
	import { browser } from '$app/environment';
	import { onMount } from 'svelte';
	import { calculateEntryScore } from '$lib/puttingLeague.js';

	let { data, form } = $props();

	function playerName(entry) {
		const member = entry.expand?.memberId;
		return member ? `${member.firstName} ${member.lastName}` : entry.guestName || 'Unknown Player';
	}

	// Builds a returnTo value that lands back on this exact player's card
	// (via a #entry-{id} anchor) instead of the top of the page — the # must
	// be percent-encoded here since it's being embedded inside another URL's
	// query string, not used as this page's own fragment.
	function returnToForEntry(entryId) {
		return encodeURIComponent(`/admin/putting-league#entry-${entryId}`);
	}

	let entriesByEventId = $derived.by(() => {
		const map = new Map();
		for (const entry of data.entries || []) {
			if (!map.has(entry.eventId)) map.set(entry.eventId, []);
			map.get(entry.eventId).push(entry);
		}
		return map;
	});

	// Scores every entry without changing order — entries already arrive from
	// the load function sorted by creation time, so this keeps players in the
	// order they were added, always, regardless of whether payouts have been
	// calculated. Nothing re-sorts the main card list.
	function scoredEntriesInCreationOrder(eventEntries) {
		return eventEntries.map((entry) => ({ entry, ...calculateEntryScore(entry) }));
	}

	function ordinal(n) {
		if (n === 1) return '1st';
		if (n === 2) return '2nd';
		if (n === 3) return '3rd';
		return `${n}th`;
	}

	// The entries that actually earned a payout, best score first, with place
	// labels — including ties (two players sharing 2nd both get labeled
	// "2nd", and whoever's next is labeled "3rd", matching standard
	// competition ranking and how calculatePayouts() computed the payouts).
	// Only meaningful once event.payoutsCalculated is true.
	function payoutWinners(eventEntries) {
		const sorted = scoredEntriesInCreationOrder(eventEntries)
			.filter(({ entry }) => (entry.payout ?? 0) > 0)
			.sort((a, b) => b.totalScore - a.totalScore);

		const labeled = [];
		let i = 0;
		while (i < sorted.length) {
			let j = i;
			while (j < sorted.length && sorted[j].totalScore === sorted[i].totalScore) j++;
			const tied = j - i > 1;
			for (let k = i; k < j; k++) {
				labeled.push({ ...sorted[k], place: i + 1, tied });
			}
			i = j;
		}
		return labeled;
	}

	const EXPANDED_STORAGE_KEY = 'puttingLeagueExpandedEvents';

	// Tracking which events are explicitly expanded (rather than which are
	// collapsed) means anything new — an event you haven't touched yet on
	// this device — defaults to collapsed, while anything you've deliberately
	// opened stays open across reloads.
	let expandedEventIds = $state(new Set());

	onMount(() => {
		if (!browser) return;
		let loaded = new Set();
		try {
			const stored = localStorage.getItem(EXPANDED_STORAGE_KEY);
			if (stored) loaded = new Set(JSON.parse(stored));
		} catch (err) {
			console.error('Failed to read expanded events from localStorage:', err);
		}

		// An event just created via the "Add Event" form arrives flagged in
		// the load data (see +page.server.js) — expand it by default rather
		// than leaving it collapsed like every pre-existing event, since it's
		// presumably about to have players added to it.
		if (data.justCreatedEventId && !loaded.has(data.justCreatedEventId)) {
			loaded.add(data.justCreatedEventId);
			try {
				localStorage.setItem(EXPANDED_STORAGE_KEY, JSON.stringify([...loaded]));
			} catch (err) {
				console.error('Failed to save expanded events to localStorage:', err);
			}
		}

		expandedEventIds = loaded;
	});

	function isCollapsed(eventId) {
		return !expandedEventIds.has(eventId);
	}

	function toggleEventCollapsed(eventId) {
		const updated = new Set(expandedEventIds);
		if (updated.has(eventId)) {
			updated.delete(eventId);
		} else {
			updated.add(eventId);
		}
		expandedEventIds = updated;
		if (browser) {
			try {
				localStorage.setItem(EXPANDED_STORAGE_KEY, JSON.stringify([...updated]));
			} catch (err) {
				console.error('Failed to save expanded events to localStorage:', err);
			}
		}
	}

	let successAlertMessage = $state('');
	let errorAlertMessage = $state('');

	function clearAlerts() {
		successAlertMessage = '';
		errorAlertMessage = '';
	}

	function enhanceDelete() {
		return async ({ update }) => {
			await update();
			await invalidateAll();
		};
	}

	function enhanceCalculate() {
		return async ({ update }) => {
			await update();
			await invalidateAll();
		};
	}

	function enhanceBonusUpdate() {
		return async ({ update }) => {
			await update();
			await invalidateAll();
		};
	}

	$effect(() => {
		if (form?.success) {
			successAlertMessage = 'Item deleted successfully.';
			setTimeout(() => clearAlerts(), 3000);
		}
		if (form?.error) {
			errorAlertMessage = form.error;
			setTimeout(() => clearAlerts(), 3000);
		}
	});
</script>

{#if successAlertMessage}
	<div class="alert alert-success mb-4 shadow-lg">
		<div><Icon src={CheckCircle} class="h-6 w-6"></Icon><span>{successAlertMessage}</span></div>
		<div class="flex-none"><button class="btn btn-ghost btn-sm" onclick={clearAlerts}>✕</button></div>
	</div>
{/if}
{#if errorAlertMessage}
	<div class="alert alert-error mb-4 shadow-lg">
		<div><Icon src={XCircle} class="h-6 w-6"></Icon><span>{errorAlertMessage}</span></div>
		<div class="flex-none"><button class="btn btn-ghost btn-sm" onclick={clearAlerts}>✕</button></div>
	</div>
{/if}

<div class="mb-4 flex flex-wrap items-center justify-end gap-2">
	<a href="/admin/putting-league/events/new" class="btn btn-neutral btn-sm">
		<Icon src={PlusCircle} class="mr-1 h-5 w-5"></Icon>Add Event
	</a>
</div>

{#if data.events.length === 0}
	<p class="p-4 text-center italic opacity-70">No putting league events yet. Add one to get started.</p>
{/if}

{#each data.events as event (event.id)}
	{@const eventEntries = entriesByEventId.get(event.id) || []}
	{@const ranked = scoredEntriesInCreationOrder(eventEntries)}
	{@const paidCount = eventEntries.filter((e) => e.paid).length}
	{@const winners = payoutWinners(eventEntries)}
	<div class="mb-8 rounded-lg border border-base-300">
		<div class="flex flex-wrap items-center justify-between gap-2 bg-base-200 p-4">
			<div class="flex items-center gap-2">
				<button
					type="button"
					onclick={() => toggleEventCollapsed(event.id)}
					class="btn btn-square btn-ghost btn-sm"
					title={isCollapsed(event.id) ? 'Expand event' : 'Collapse event'}
				>
					<Icon src={isCollapsed(event.id) ? ChevronRight : ChevronDown} class="h-5 w-5"></Icon>
				</button>
				<div>
					<strong>{format(parseISO(event.date), 'MMM do, yyyy')}</strong>
					{#if event.expand?.locationId}<span class="opacity-70">· {event.expand.locationId.name}</span>{/if}
					<span class="ml-2 opacity-70">· Entry ${event.entryFee} (${event.payoutPortion} to pool)</span>
					<span class="ml-2 badge badge-ghost">{paidCount} paid</span>
				</div>
			</div>
			<div class="flex gap-2">
				<a href="/admin/putting-league/entries/new?eventId={event.id}" class="btn btn-primary btn-sm">
					<Icon src={PlusCircle} class="mr-1 h-4 w-4"></Icon>Add Player
				</a>
				<form method="POST" action="?/calculatePayouts" use:enhance={enhanceCalculate}>
					<input type="hidden" name="eventId" value={event.id} />
					<button type="submit" class="btn btn-accent btn-sm" disabled={paidCount === 0}>
						<Icon src={CurrencyDollar} class="mr-1 h-4 w-4"></Icon>Calculate Payouts
					</button>
				</form>
				<a href="/admin/putting-league/events/edit/{event.id}" class="btn btn-square btn-info btn-sm">
					<Icon src={PencilSquare} class="h-4 w-4"></Icon>
				</a>
				<form
					method="POST"
					action="?/delete"
					use:enhance={enhanceDelete}
					onsubmit={(e) => {
						if (!window.confirm(`Delete this event (${format(parseISO(event.date), 'MMM do, yyyy')})? Delete its entries first.`)) {
							e.preventDefault();
							e.stopImmediatePropagation();
						}
					}}
				>
					<input type="hidden" name="collectionName" value="putting_league_events" />
					<input type="hidden" name="itemId" value={event.id} />
					<button type="submit" title="Delete Event" class="btn btn-square btn-error btn-sm"><Icon src={Trash} class="h-4 w-4"></Icon></button>
				</form>
			</div>
		</div>

		{#if winners.length > 0}
			<div class="flex flex-wrap gap-2 border-t border-base-300 bg-base-100 p-3">
				{#each winners as { entry, totalScore, place, tied } (entry.id)}
					<div class="min-w-[140px] flex-1 rounded-lg border border-success/40 bg-success/10 p-3 text-center">
						<div class="text-xs font-semibold uppercase opacity-70">{tied ? `T-${ordinal(place)}` : ordinal(place)}</div>
						<div class="font-semibold">{playerName(entry)}</div>
						<div class="text-sm opacity-70">Score: {totalScore}</div>
						<div class="text-lg font-bold text-success">${entry.payout}</div>
					</div>
				{/each}
			</div>
		{/if}

		<!-- Stacked cards with large, thumb-sized station buttons -->
		{#if !isCollapsed(event.id)}
			<div class="space-y-3 p-3">
				{#if ranked.length > 0}
					{#each ranked as { entry, bonusPoints, totalScore } (entry.id)}
						<div id="entry-{entry.id}" class="scroll-mt-4 rounded-lg border border-base-300 bg-base-100 p-3">
							<div class="mb-2 flex items-center justify-between">
								<div class="flex items-center gap-2 font-semibold">
									{playerName(entry)}
									{#if entry.paid}<Icon src={CheckCircle} class="h-4 w-4 text-success"></Icon>{/if}
								</div>
								<div class="flex gap-1">
									<a href="/admin/putting-league/entries/edit/{entry.id}" class="btn btn-square btn-info btn-sm"><Icon src={PencilSquare} class="h-4 w-4"></Icon></a>
									<form
										method="POST"
										action="?/delete"
										use:enhance={enhanceDelete}
										onsubmit={(e) => {
											if (!window.confirm(`Remove ${playerName(entry)} from this event?`)) {
												e.preventDefault();
												e.stopImmediatePropagation();
											}
										}}
									>
										<input type="hidden" name="collectionName" value="putting_league_entries" />
										<input type="hidden" name="itemId" value={entry.id} />
										<button type="submit" title="Remove Player" class="btn btn-square btn-error btn-sm"><Icon src={Trash} class="h-4 w-4"></Icon></button>
									</form>
								</div>
							</div>

							<div class="mb-1 text-xs font-semibold uppercase opacity-60">Round 1</div>
							<div class="mb-3 grid grid-cols-5 gap-1.5">
								{#each [1, 2, 3, 4, 5] as n}
									{@const value = entry[`r1s${n}`]}
									<a
										href="/admin/putting-league/entries/{entry.id}/record/r1s{n}?returnTo={returnToForEntry(entry.id)}"
										class="btn h-16 flex-col p-0 {value > 0 ? 'btn-primary' : 'btn-outline'}"
									>
										<span class="text-[10px] opacity-80">S{n}</span>
										<span class="text-lg font-bold leading-none">{value}</span>
									</a>
								{/each}
							</div>

							<div class="mb-1 text-xs font-semibold uppercase opacity-60">Round 2</div>
							<div class="mb-3 grid grid-cols-5 gap-1.5">
								{#each [1, 2, 3, 4, 5] as n}
									{@const value = entry[`r2s${n}`]}
									<a
										href="/admin/putting-league/entries/{entry.id}/record/r2s{n}?returnTo={returnToForEntry(entry.id)}"
										class="btn h-16 flex-col p-0 {value > 0 ? 'btn-primary' : 'btn-outline'}"
									>
										<span class="text-[10px] opacity-80">S{n}</span>
										<span class="text-lg font-bold leading-none">{value}</span>
									</a>
								{/each}
							</div>

							<div class="mb-1 text-xs font-semibold uppercase opacity-60">Bonus Putt (25 pts)</div>
							<div class="mb-3 flex gap-1.5">
								<form method="POST" action="?/setBonusField" use:enhance={enhanceBonusUpdate} class="flex-1">
									<input type="hidden" name="entryId" value={entry.id} />
									<input type="hidden" name="field" value="bonusPuttMade" />
									<input type="hidden" name="value" value="false" />
									<button type="submit" class="btn btn-sm h-12 w-full {!entry.bonusPuttMade ? 'btn-error' : 'btn-outline'}">Missed</button>
								</form>
								<form method="POST" action="?/setBonusField" use:enhance={enhanceBonusUpdate} class="flex-1">
									<input type="hidden" name="entryId" value={entry.id} />
									<input type="hidden" name="field" value="bonusPuttMade" />
									<input type="hidden" name="value" value="true" />
									<button type="submit" class="btn btn-sm h-12 w-full {entry.bonusPuttMade ? 'btn-success' : 'btn-outline'}">Made</button>
								</form>
							</div>

							{#if entry.bonusPuttMade}
								<div class="mb-1 text-xs font-semibold uppercase opacity-60">Double or Nothing</div>
								<div class="mb-3 flex gap-1.5">
									<form method="POST" action="?/setDoubleOrNothing" use:enhance={enhanceBonusUpdate} class="flex-1">
										<input type="hidden" name="entryId" value={entry.id} />
										<input type="hidden" name="result" value="none" />
										<button type="submit" class="btn btn-sm h-12 w-full {!entry.doubleOrNothingAttempted ? 'btn-neutral' : 'btn-outline'}">Keep 25</button>
									</form>
									<form method="POST" action="?/setDoubleOrNothing" use:enhance={enhanceBonusUpdate} class="flex-1">
										<input type="hidden" name="entryId" value={entry.id} />
										<input type="hidden" name="result" value="made" />
										<button type="submit" class="btn btn-sm h-12 w-full {entry.doubleOrNothingAttempted && entry.doubleOrNothingMade ? 'btn-success' : 'btn-outline'}">Double Made</button>
									</form>
									<form method="POST" action="?/setDoubleOrNothing" use:enhance={enhanceBonusUpdate} class="flex-1">
										<input type="hidden" name="entryId" value={entry.id} />
										<input type="hidden" name="result" value="missed" />
										<button type="submit" class="btn btn-sm h-12 w-full {entry.doubleOrNothingAttempted && !entry.doubleOrNothingMade ? 'btn-error' : 'btn-outline'}">Double Missed</button>
									</form>
								</div>
							{/if}

							<div class="flex justify-between text-sm">
								<span>Bonus: <strong>{bonusPoints}</strong></span>
								<span>Total: <strong>{totalScore}</strong></span>
								<span>Payout: <strong>{entry.payout != null ? `$${entry.payout}` : '—'}</strong></span>
							</div>
						</div>
					{/each}
				{:else}
					<p class="p-4 text-center italic">No players added yet.</p>
				{/if}
			</div>
		{/if}
	</div>
{/each}