<script>
	import { format, parseISO } from 'date-fns';
	import { Icon, PencilSquare, Trash, PlusCircle, CheckCircle, XCircle } from 'svelte-hero-icons';
	import { enhance } from '$app/forms';
	import { invalidateAll } from '$app/navigation';

	let { data, form } = $props();

	let selectedSeasonId = $state(data.seasons[0]?.id ?? '');
	let selectedSeason = $derived(data.seasons.find((s) => s.id === selectedSeasonId));

	let eventsForSeason = $derived((data.seriesEvents || []).filter((e) => e.seasonId === selectedSeasonId).sort((a, b) => a.eventNumber - b.eventNumber));

	function playerName(result) {
		const member = result.expand?.memberId;
		return member ? `${member.firstName} ${member.lastName}` : result.guestName || 'Unknown Player';
	}

	// Parses a leading rank number out of a place string like "1st", "T2nd" —
	// only used as a fallback for Championship results, which don't carry
	// points. Handicap results sort on points directly, sidestepping the
	// number-vs-string ordering problems of sorting on `place` text.
	function parsePlaceRank(place) {
		const match = String(place ?? '').match(/(\d+)/);
		return match ? parseInt(match[0], 10) : null;
	}

	function sortResults(results) {
		return results.slice().sort((a, b) => {
			const aPts = typeof a.points === 'number' ? a.points : null;
			const bPts = typeof b.points === 'number' ? b.points : null;
			if (aPts !== null && bPts !== null) return bPts - aPts; // higher points first
			if (aPts !== null) return -1;
			if (bPts !== null) return 1;
			const aRank = parsePlaceRank(a.place);
			const bRank = parsePlaceRank(b.place);
			if (aRank === null && bRank === null) return 0;
			if (aRank === null) return 1;
			if (bRank === null) return -1;
			return aRank - bRank;
		});
	}

	let resultsByEventId = $derived.by(() => {
		const map = new Map();
		for (const result of data.seriesResults || []) {
			if (!map.has(result.eventId)) map.set(result.eventId, []);
			map.get(result.eventId).push(result);
		}
		return map;
	});

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

{#if data.seasons.length === 0}
	<div class="alert alert-warning mb-4 shadow-md">
		<span>No seasons yet — create one before adding events.</span>
	</div>
{/if}

<div class="mb-4 flex flex-wrap items-end justify-between gap-2">
	<div class="flex flex-wrap items-end gap-3">
		<div class="form-control">
			<label class="label py-0" for="seriesSeasonSelect"><span class="label-text">Season</span></label>
			<select id="seriesSeasonSelect" class="select select-bordered select-sm w-36" bind:value={selectedSeasonId}>
				{#each data.seasons as s}
					<option value={s.id}>{s.year}</option>
				{/each}
			</select>
		</div>
		{#if selectedSeason}
			<div class="flex items-center gap-2">
				<span class="text-sm opacity-70">Best {selectedSeason.countingEvents} of {selectedSeason.totalEvents} events count</span>
				<a href="/admin/plumas-series/seasons/edit/{selectedSeason.id}" class="btn btn-square btn-ghost btn-xs" title="Edit Season"><Icon src={PencilSquare} class="h-3.5 w-3.5"></Icon></a>
			</div>
		{/if}
	</div>
	<div class="flex gap-2">
		<a href="/admin/plumas-series/seasons/new" class="btn btn-neutral btn-sm"><Icon src={PlusCircle} class="mr-1 h-5 w-5"></Icon>Add Season</a>
		<a href="/admin/plumas-series/events/new{selectedSeasonId ? `?seasonId=${selectedSeasonId}` : ''}" class="btn btn-secondary btn-sm"><Icon src={PlusCircle} class="mr-1 h-5 w-5"></Icon>Add Event</a>
	</div>
</div>

{#each eventsForSeason as event (event.id)}
	{@const results = sortResults(resultsByEventId.get(event.id) || [])}
	<div class="mb-8 rounded-lg border border-base-300">
		<div class="flex flex-wrap items-center justify-between gap-2 bg-base-200 p-4">
			<div>
				<span class="badge badge-primary mr-2">{event.type}</span>
				<strong>Event #{event.eventNumber}</strong>
				— {event.eventDate ? format(parseISO(event.eventDate), 'MMM do, yyyy') : 'No date set'}
				{#if event.expand?.courseId}<span class="opacity-70">· {event.expand.courseId.name}</span>{/if}
			</div>
			<div class="flex gap-2">
				<a href="/admin/plumas-series/results/new?eventId={event.id}" class="btn btn-primary btn-sm"><Icon src={PlusCircle} class="mr-1 h-4 w-4"></Icon>Add Result</a>
				<a href="/admin/plumas-series/events/edit/{event.id}" class="btn btn-square btn-info btn-sm"><Icon src={PencilSquare} class="h-4 w-4"></Icon></a>
				<form
					method="POST"
					action="?/delete"
					use:enhance={enhanceDelete}
					onsubmit={(e) => {
						if (!window.confirm(`Delete Event #${event.eventNumber} (${event.type}, ${selectedSeason?.year})? Delete its results first.`)) {
							e.preventDefault();
							e.stopImmediatePropagation();
						}
					}}
				>
					<input type="hidden" name="collectionName" value="plumas_series_events" />
					<input type="hidden" name="itemId" value={event.id} />
					<button type="submit" title="Delete Event" class="btn btn-square btn-error btn-sm"><Icon src={Trash} class="h-4 w-4"></Icon></button>
				</form>
			</div>
		</div>
		<div class="overflow-x-auto">
			<table class="table table-zebra w-full">
				<thead>
					<tr>
						<th>Place</th>
						<th>Player</th>
						<th class="text-center">Points</th>
						<th>Actions</th>
					</tr>
				</thead>
				<tbody>
					{#if results.length > 0}
						{#each results as result (result.id)}
							<tr>
								<td>{result.place}</td>
								<td>{playerName(result)}</td>
								<td class="text-center">{result.points ?? '-'}</td>
								<td class="flex gap-2">
									<a href="/admin/plumas-series/results/edit/{result.id}" class="btn btn-square btn-info btn-sm"><Icon src={PencilSquare} class="h-4 w-4"></Icon></a>
									<form
										method="POST"
										action="?/delete"
										use:enhance={enhanceDelete}
										onsubmit={(e) => {
											if (!window.confirm(`Delete this result for ${playerName(result)}?`)) {
												e.preventDefault();
												e.stopImmediatePropagation();
											}
										}}
									>
										<input type="hidden" name="collectionName" value="plumas_series_results" />
										<input type="hidden" name="itemId" value={result.id} />
										<button type="submit" title="Delete Result" class="btn btn-square btn-error btn-sm"><Icon src={Trash} class="h-4 w-4"></Icon></button>
									</form>
								</td>
							</tr>
						{/each}
					{:else}
						<tr><td colspan="4" class="p-4 text-center italic">No results entered yet.</td></tr>
					{/if}
				</tbody>
			</table>
		</div>
	</div>
{:else}
	<p class="p-4 text-center italic opacity-70">
		{#if selectedSeason}No events for {selectedSeason.year} yet. Add one to get started.{:else}Create a season above to get started.{/if}
	</p>
{/each}