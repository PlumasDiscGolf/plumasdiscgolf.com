<!-- src/routes/events/putting-league/+page.svelte -->
<script>
	import * as config from '$lib/config';
	import { format, parseISO } from 'date-fns';
	import { calculateEntryScore } from '$lib/puttingLeague.js';

	let { data } = $props();

	// Default to the most recent event, since that's the one most likely to
	// be what someone's looking for right after it happens.
	let selectedEventId = $state(data.puttingLeagueEvents?.[0]?.id ?? '');
	let selectedEvent = $derived((data.puttingLeagueEvents || []).find((e) => e.id === selectedEventId));

	function playerName(entry) {
		const member = entry.expand?.memberId;
		return member ? `${member.firstName} ${member.lastName}` : entry.guestName || 'Unknown Player';
	}

	let entriesForSelectedEvent = $derived((data.puttingLeagueEntries || []).filter((e) => e.eventId === selectedEventId));

	// Standard competition ranking: tied scores share a place, and the next
	// distinct score skips ahead accordingly (two players tied for 2nd means
	// the next player is 4th, not 3rd) — same approach the admin page uses
	// for its payout winners strip, just applied to the whole field rather
	// than only the top 3.
	let leaderboardRows = $derived.by(() => {
		const scored = entriesForSelectedEvent.map((entry) => ({ entry, ...calculateEntryScore(entry) })).sort((a, b) => b.totalScore - a.totalScore);

		const rows = [];
		let i = 0;
		while (i < scored.length) {
			let j = i;
			while (j < scored.length && scored[j].totalScore === scored[i].totalScore) j++;
			const place = i + 1;
			const tied = j - i > 1;
			for (let k = i; k < j; k++) {
				rows.push({ ...scored[k], place, tied });
			}
			i = j;
		}
		return rows;
	});

	let totalPaid = $derived(entriesForSelectedEvent.filter((e) => e.paid).length * (selectedEvent?.entryFee ?? 0));
	let totalPaidOut = $derived(entriesForSelectedEvent.reduce((sum, e) => sum + (e.payout ?? 0), 0));
	let totalClubEarned = $derived(totalPaid - totalPaidOut);
</script>

<svelte:head>
	<title>Putting League - {config.title}</title>
</svelte:head>

<!-- Hero Section -->
<div class="hero bg-base-200">
	<div class="hero-content py-12 text-center">
		<div class="max-w-md">
			<h1 class="text-5xl font-bold">Putting League</h1>
		</div>
	</div>
</div>

<!-- Results -->
<div class="mt-16 w-full px-4">
	<div class="mx-auto mb-6 flex max-w-3xl flex-wrap items-center justify-between gap-4">
		<h2 class="text-3xl font-bold">Results</h2>
		{#if data.puttingLeagueEvents?.length > 0}
			<div class="form-control">
				<label class="label py-0" for="eventSelect"><span class="label-text">Event</span></label>
				<select id="eventSelect" class="select select-bordered select-sm w-56" bind:value={selectedEventId}>
					{#each data.puttingLeagueEvents as event}
						<option value={event.id}>
							{format(parseISO(event.date), 'MMM do, yyyy')}{event.expand?.locationId ? ` — ${event.expand.locationId.name}` : ''}
						</option>
					{/each}
				</select>
			</div>
		{/if}
	</div>

	{#if !selectedEvent}
		<p class="mx-auto max-w-3xl p-4 text-center italic opacity-70">No putting league events yet.</p>
	{:else if !selectedEvent.payoutsCalculated}
		<p class="mx-auto max-w-3xl p-4 text-center italic opacity-70">Results for this event haven't been finalized yet — check back soon.</p>
	{:else}
		<div class="mx-auto mb-6 grid max-w-3xl grid-cols-1 gap-3 sm:grid-cols-3">
			<div class="rounded-box bg-base-200 p-4 text-center">
				<div class="text-sm opacity-70">Total Paid</div>
				<div class="text-2xl font-bold">${totalPaid}</div>
			</div>
			<div class="rounded-box bg-base-200 p-4 text-center">
				<div class="text-sm opacity-70">Total Paid Out</div>
				<div class="text-2xl font-bold">${totalPaidOut}</div>
			</div>
			<div class="rounded-box bg-base-200 p-4 text-center">
				<div class="text-sm opacity-70">Club Earned</div>
				<div class="text-2xl font-bold">${totalClubEarned}</div>
			</div>
		</div>

		<div class="mx-auto max-w-3xl overflow-x-auto">
			<table class="table table-zebra w-full">
				<thead>
					<tr>
						<th class="w-16">Place</th>
						<th>Name</th>
						<th class="text-center">Score</th>
						<th class="text-center">Payout</th>
					</tr>
				</thead>
				<tbody>
					{#if leaderboardRows.length > 0}
						{#each leaderboardRows as { entry, totalScore, place, tied } (entry.id)}
							<tr>
								<td class="font-bold">{tied ? `T-${place}` : place}</td>
								<td>{playerName(entry)}</td>
								<td class="text-center">{totalScore}</td>
								<td class="text-center">{entry.payout ? `$${entry.payout}` : '—'}</td>
							</tr>
						{/each}
					{:else}
						<tr><td colspan="4" class="p-4 text-center italic">No players recorded for this event.</td></tr>
					{/if}
				</tbody>
			</table>
		</div>
	{/if}
</div>

<!-- About -->
<div class="mt-12 grid w-full px-4 xl:grid-cols-2 xl:space-x-12">
	<div>
		<h2 class="mb-6 text-center text-3xl font-bold">What is Putting League?</h2>
		<div class="prose mx-auto mb-8 md:prose-xl xl:mb-0">
			<p>
				Putting League is a laid-back, weekly test of your short game. Grab your putter and see how you stack up against the rest of the club — every skill level is welcome. Full rules can be found <a href="/rules/putting-league">here</a>.
			</p>
			<p><strong>Format:</strong></p>
			<ul>
				<li>Two rounds, each with five putting stations set at increasing distances from the basket (15, 20, 25, 30, and 35 feet).</li>
				<li>Three putts per station — the farther the station, the more each made putt is worth.</li>
				<li>A bonus putt caps off the event, with the option to go for even more points with Double or Nothing.</li>
			</ul>
			<p><strong>Who Can Play?</strong> Putting League is open to everyone, members and guests alike.</p>
			<p>
				<strong>Cost:</strong> Entry is $5 per event — $3 goes straight into that event's payout pool for the top finishers, and $2 supports the club.
			</p>
		</div>
	</div>
	<div>
		<h2 class="mb-6 mt-6 text-center text-3xl font-bold lg:mt-0">2026 Schedule</h2>
		<div class="prose mx-auto mb-6 lg:prose-xl">
			<ul>
				<li><strong>Every Thursday at 5:30 PM</strong></li>
				<li><strong>Season Start:</strong> April 9th, 2026</li>
				<li><strong>Season End:</strong> September 24th, 2026</li>
				<li><strong>Location:</strong> Rich Bar Taproom, Quincy, CA</li>
			</ul>
		</div>
		<h2 class="my-6 text-center text-3xl font-bold">How Scoring Works</h2>
		<div class="prose mx-auto mb-6 lg:prose-xl">
			<ul>
				<li>Your score at each station is the number of putts you make, multiplied by that station's number — sinking two putts at Station 4 earns eight points.</li>
				<li>Add up all five stations across both rounds, plus your bonus putt, for your final event score.</li>
				<li>Up to the top three finishers get paid out from the pool, based on how many players showed up that day.</li>
				<li>Ties are combined and split evenly between the tied players — see the <a href="/rules/putting-league">full rules</a> for exactly how that works.</li>
			</ul>
		</div>
	</div>
</div>