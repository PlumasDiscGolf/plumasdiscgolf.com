<script>
	import * as config from '$lib/config';

	let { data } = $props();

	const currentYear = new Date().getFullYear();

	// Default to the most recent season on record, since that's the one
	// most likely to be "in progress" — falls back to nothing selected if
	// no seasons exist yet.
	let selectedSeasonId = $state(data.seriesSeasons?.[0]?.id ?? '');
	let selectedSeason = $derived((data.seriesSeasons || []).find((s) => s.id === selectedSeasonId));

	let handicapEventsForSeason = $derived(
		(data.seriesEvents || [])
			.filter((e) => e.seasonId === selectedSeasonId && e.type === 'Handicap')
			.sort((a, b) => a.eventNumber - b.eventNumber)
	);

	let championshipEventForSeason = $derived((data.seriesEvents || []).find((e) => e.seasonId === selectedSeasonId && e.type === 'Championship'));

	// How many of a player's best handicap-event results count toward their
	// total — driven by the season record so this can change year to year
	// (e.g. best 5 of 7 one season, best 4 of 6 the next) without a code change.
	let countingEvents = $derived(selectedSeason?.countingEvents ?? handicapEventsForSeason.length);

	function playerName(result) {
		const member = result.expand?.memberId;
		return member ? `${member.firstName} ${member.lastName}` : result.guestName || 'Unknown Player';
	}

	function playerKey(result) {
		return result.memberId ? `member:${result.memberId}` : `guest:${result.guestName}`;
	}

	// One row per player: name, their result at each handicap event this
	// season, which of those results counted toward the total (the season's
	// best-N-of-M rule, per `countingEvents` above), and the resulting total.
	let standingsRows = $derived.by(() => {
		const handicapEventIds = new Set(handicapEventsForSeason.map((e) => e.id));
		const rows = new Map();

		for (const result of data.seriesResults || []) {
			if (!handicapEventIds.has(result.eventId)) continue;
			const key = playerKey(result);
			if (!rows.has(key)) rows.set(key, { key, name: playerName(result), byEvent: {} });
			rows.get(key).byEvent[result.eventId] = { place: result.place, points: result.points };
		}

		for (const row of rows.values()) {
			const scored = Object.entries(row.byEvent)
				.filter(([, v]) => typeof v.points === 'number')
				.map(([eventId, v]) => ({ eventId, points: v.points }))
				.sort((a, b) => b.points - a.points);
			row.countedEventIds = new Set(scored.slice(0, countingEvents).map((e) => e.eventId));
			row.totalPoints = scored.slice(0, countingEvents).reduce((sum, e) => sum + e.points, 0);
		}

		// Rank by total points; ties broken by comparing each player's full
		// set of event point totals from best to worst (series rules 6.2).
		const sorted = [...rows.values()].sort((a, b) => {
			if (b.totalPoints !== a.totalPoints) return b.totalPoints - a.totalPoints;
			const aPts = Object.values(a.byEvent)
				.map((e) => e.points)
				.filter((p) => typeof p === 'number')
				.sort((x, y) => y - x);
			const bPts = Object.values(b.byEvent)
				.map((e) => e.points)
				.filter((p) => typeof p === 'number')
				.sort((x, y) => y - x);
			for (let i = 0; i < Math.max(aPts.length, bPts.length); i++) {
				const diff = (bPts[i] ?? 0) - (aPts[i] ?? 0);
				if (diff !== 0) return diff;
			}
			return a.name.localeCompare(b.name);
		});

		let place = 0;
		let lastTotal = null;
		return sorted.map((row, i) => {
			if (row.totalPoints !== lastTotal) place = i + 1;
			lastTotal = row.totalPoints;
			return { ...row, place };
		});
	});

	// Parses a leading rank number out of a place string like "1st", "T2nd",
	// "3rd" — tolerant of tie markers or other prefixes, since results are
	// entered as free text.
	function parsePlaceRank(place) {
		const match = String(place ?? '').match(/(\d+)/);
		return match ? parseInt(match[0], 10) : null;
	}

	const PODIUM_LABELS = { 1: 'Club Champion', 2: 'Runner-Up', 3: 'Third Place' };
	const PODIUM_MEDALS = { 1: '🥇', 2: '🥈', 3: '🥉' };
	// The championship round decides the Club Champion title — this title
	// stays stable even if the event format itself changes in the future.
	const PODIUM_STYLES = {
		1: 'bg-[#FFD700] text-black',
		2: 'bg-[#C0C0C0] text-black',
		3: 'bg-[#CD7F32] text-white'
	};

	let championPodium = $derived.by(() => {
		if (!championshipEventForSeason) return [];
		return (data.seriesResults || [])
			.filter((r) => r.eventId === championshipEventForSeason.id)
			.map((r) => ({ ...r, rank: parsePlaceRank(r.place), name: playerName(r) }))
			.filter((r) => r.rank !== null && r.rank <= 3)
			.sort((a, b) => a.rank - b.rank);
	});
</script>

<svelte:head>
	<title>Plumas Series - {config.title}</title>
</svelte:head>

<!-- Hero Section -->
<div class="hero bg-base-200">
	<div class="hero-content py-12 text-center">
		<div class="max-w-md">
			<h1 class="text-5xl font-bold">Plumas Series</h1>
		</div>
	</div>
</div>

<!-- Current Standings -->
<div class="mt-16 w-full px-4">
	<div class="mx-auto mb-6 flex max-w-5xl flex-wrap items-center justify-between gap-4">
		<h2 class="text-3xl font-bold">{selectedSeason?.year === currentYear ? 'Current Standings' : selectedSeason ? `${selectedSeason.year} Final Standings` : 'Standings'}</h2>
		{#if data.seriesSeasons?.length > 0}
			<div class="form-control">
				<label class="label py-0" for="standingsSeasonSelect"><span class="label-text">Season</span></label>
				<select id="standingsSeasonSelect" class="select select-bordered select-sm w-36" bind:value={selectedSeasonId}>
					{#each data.seriesSeasons as s}
						<option value={s.id}>{s.year}</option>
					{/each}
				</select>
			</div>
		{/if}
	</div>

	{#if championPodium.length > 0}
		<div class="mx-auto mb-6 grid max-w-5xl gap-3 md:grid-cols-3">
			{#each championPodium as entry (entry.id)}
				<div class="rounded-box p-4 shadow-md {PODIUM_STYLES[entry.rank]}">
					<div class="text-sm font-semibold uppercase tracking-wide opacity-80">{PODIUM_MEDALS[entry.rank]} {selectedSeason.year} {PODIUM_LABELS[entry.rank]}</div>
					<div class="text-lg font-bold">{entry.name}</div>
				</div>
			{/each}
		</div>
	{/if}

	<div class="mx-auto max-w-5xl overflow-x-auto">
		<table class="table table-zebra w-full">
			<thead>
				<tr>
					<th class="w-16">Place</th>
					<th>Name</th>
					<th class="text-center">Total Points</th>
					{#each handicapEventsForSeason as event, i}
						<th class="text-center">Event #{i + 1}</th>
					{/each}
				</tr>
			</thead>
			<tbody>
				{#if standingsRows.length > 0}
					{#each standingsRows as row (row.key)}
						<tr>
							<td class="font-bold">{row.place}</td>
							<td>{row.name}</td>
							<td class="text-center font-bold">{row.totalPoints}</td>
							{#each handicapEventsForSeason as event}
								{@const entry = row.byEvent[event.id]}
								<td class="text-center" class:font-bold={row.countedEventIds.has(event.id)}>
									{#if entry}
										{entry.points} <br /> ({entry.place})
									{:else}
										-
									{/if}
								</td>
							{/each}
						</tr>
					{/each}
				{:else}
					<tr><td colspan={3 + handicapEventsForSeason.length} class="p-4 text-center italic">No results for {selectedSeason?.year ?? 'this season'} yet.</td></tr>
				{/if}
			</tbody>
		</table>
	</div>
	{#if standingsRows.length > 0}
		<p class="mx-auto mt-3 max-w-5xl text-sm italic opacity-70">
			Bolded event scores are the ones counting toward Total Points (best {countingEvents} of {selectedSeason?.totalEvents ?? handicapEventsForSeason.length} handicap events).
		</p>
	{/if}
</div>


<div class="mt-12 grid w-full xl:space-x-12 xl:grid-cols-2 px-4">
	<div>
		<h2 class="mb-6 text-center text-3xl font-bold">What is the Plumas Series?</h2>
		<div class="prose mx-auto md:prose-xl mb-8 xl:mb-0">
			<p>The Plumas Series is a 7 event disc golf tournament series spanning the entire 2026 season. Seven of the events will be handicap-based, allowing players of all abilities to compete on a level playing field. Earn points throughout the series to qualify for the climactic final event: a thrilling Survivor Razz Round Championship! Full series rules can be found <a href="/rules/plumas-series">here</a>.</p>
			<p>
				<strong>Cost:</strong>
			</p>
			<ul>
				<li>$10 per event for Plumas Disc Golf Club Members</li>
				<li>$12 per event for Non-Members</li>
				<li>Survivor Razz Round is free and invite only. All players who have competed in at least one of the point series events are to be invited.</li>
			</ul>
			<p>
				<strong>Who Can Play?</strong> This series is open to all amateur disc golfers. Whether you're just starting out or have been playing for years, come join the fun!
			</p>
			<p>
				<strong>Registration Details:</strong> Pre-Registration is available online at <a href="https://discgolfscene.com" target="_blank">Disc Golf Scene</a>. On-site registration will take place day-of for all events, and entry fees will be collected in person during check-in.
			</p>
			<p><strong>Follow us on social media for updates:</strong></p>
			<ul>
				<li><a href="https://facebook.com/plumasdiscgolf">Plumas Disc Golf Facebook Page</a></li>
				<li><a href="https://instagram.com/plumasdiscgolf">Plumas Disc Golf Instagram Profile</a></li>
				<li><a href="https://x.com/plumasdiscgolf">Plumas Disc Golf Twitter/X Profile</a></li>
			</ul>
		</div>
	</div>
	<div>
		<h2 class="mb-6 mt-6 lg:mt-0 text-center text-3xl font-bold md:mt-0">2026 Event Schedule</h2>
		<div class="prose mx-auto mb-6 lg:prose-xl">
			<ul>
				<li><strong>All events start at 10:00 AM, with check-ins starting at 9:00 AM</strong></li>
				<li>
					<strong>Handicap Point Series Events:</strong>
					<ul>
						<li>April 18th</li>
						<li>May 16th</li>
						<li>June 20th</li>
						<li>July 18th</li>
						<li>August 15th</li>
						<li>September 19th</li>
					</ul>
				</li>
				<li><strong>Survivor Razz Round Championship:</strong> October 17th</li>
			</ul>
		</div>
		<h2 class="my-6 text-center text-3xl font-bold md:mt-0">Series Format</h2>
		<div class="prose mx-auto mb-6 lg:prose-xl">
			<ul>
				<li><strong>Handicap Point Series Events (6 Events):</strong> Compete against your peers using a handicap system that levels the playing field. This means everyone has a chance to win!</li>
				<li>
					<strong>Survivor Razz Round Championship (1 event):</strong> All players who participated in the Plumas Series events will compete in this exciting elimination-style final! Each player will play hole 1, and the player with the worst score is eliminated. This continues hole by hole until only one player remains to be crowned the Plumas Series Champion! In the event of two or more players tied for worst score on a hole, the tie will be broken with a putt-off.
				</li>
				<li>
					<strong>Survivor Razz Round Championship - Special Rules:</strong> The top three players in the Plumas Series point standings will receive byes in the Survivor Razz Round:
					<ul>
						<li>3rd Place: Bye through Hole 1</li>
						<li>2nd Place: Bye through Hole 2</li>
						<li>1st Place: Bye through Hole 3</li>
					</ul>
				</li>
			</ul>
		</div>
	</div>
</div>