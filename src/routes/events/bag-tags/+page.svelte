<script>
	import { format, parseISO } from 'date-fns';
	import * as config from '$lib/config';

	let { data } = $props();

	const currentYear = new Date().getFullYear();
	let selectedSeason = $state(currentYear);

	let availableSeasons = $derived.by(() => {
		const seasons = new Set((data.bagTags || []).map((t) => t.season));
		seasons.add(currentYear); // always offer the current season, even before one exists
		return [...seasons].sort((a, b) => b - a);
	});

	// bagTagAssignments arrives pre-sorted newest-first from the load function,
	// so the first assignment seen per bagTagId is automatically the current one.
	let latestAssignmentByTagId = $derived.by(() => {
		const map = new Map();
		for (const a of data.bagTagAssignments || []) {
			if (!map.has(a.bagTagId)) map.set(a.bagTagId, a);
		}
		return map;
	});

	// Resolve each tag's current holder, then keep only tags that are
	// actually held right now — vacant tags (never assigned, or forfeited)
	// are omitted entirely from public standings rather than shown as
	// "Available" (confirmed decision).
	let heldTagsForSeason = $derived.by(() => {
		return (data.bagTags || [])
			.filter((t) => t.season === selectedSeason)
			.map((tag) => {
				const assignment = latestAssignmentByTagId.get(tag.id);
				const holderMember = assignment?.expand?.memberId;
				return holderMember
					? {
							...tag,
							holderName: `${holderMember.firstName} ${holderMember.lastName}`,
							heldSince: assignment.assignedAt
						}
					: null;
			})
			.filter((t) => t !== null);
	});

	let openStandings = $derived(heldTagsForSeason.filter((t) => t.league === 'Open').sort((a, b) => a.tagNumber - b.tagNumber));
	let ladiesStandings = $derived(heldTagsForSeason.filter((t) => t.league === 'Ladies').sort((a, b) => a.tagNumber - b.tagNumber));
</script>

<svelte:head>
	<title>Bag Tags League - {config.title}</title>
</svelte:head>

<!-- Hero Section -->
<div class="hero bg-base-200">
	<div class="hero-content py-12 text-center">
		<div class="max-w-md">
			<h1 class="text-5xl font-bold">Bag Tags Leagues</h1>
		</div>
	</div>
</div>

<!-- Current Standings -->
<div class="mt-16 w-full px-4">
	<div class="mx-auto mb-6 flex max-w-5xl flex-wrap items-center justify-between gap-4">
		<h2 class="text-3xl font-bold">{selectedSeason === currentYear ? 'Current Standings' : `${selectedSeason} Final Standings`}</h2>
		<div class="form-control">
			<label class="label py-0" for="standingsSeasonSelect"><span class="label-text">Season</span></label>
			<select id="standingsSeasonSelect" class="select select-bordered select-sm w-36" bind:value={selectedSeason}>
				{#each availableSeasons as s}
					<option value={s}>{s}</option>
				{/each}
			</select>
		</div>
	</div>
	<div class="mx-auto grid max-w-5xl gap-10 lg:grid-cols-2">
		<div>
			<h3 class="mb-4 text-center text-2xl font-semibold">Open League</h3>
			<div class="overflow-x-auto">
				<table class="table table-zebra w-full">
					<thead>
						<tr>
							<th class="w-24">Tag #</th>
							<th>Holder</th>
							<th>Held Since</th>
						</tr>
					</thead>
					<tbody>
						{#if openStandings.length > 0}
							{#each openStandings as tag (tag.id)}
								<tr>
									<td class="font-bold">#{tag.tagNumber}</td>
									<td>{tag.holderName}</td>
									<td>{format(parseISO(tag.heldSince), 'MMM do, yyyy')}</td>
								</tr>
							{/each}
						{:else}
							<tr><td colspan="3" class="p-4 text-center italic">No standings for {selectedSeason} yet.</td></tr>
						{/if}
					</tbody>
				</table>
			</div>
		</div>
		<div>
			<h3 class="mb-4 text-center text-2xl font-semibold">Ladies League</h3>
			<div class="overflow-x-auto">
				<table class="table table-zebra w-full">
					<thead>
						<tr>
							<th class="w-24">Tag #</th>
							<th>Holder</th>
							<th>Held Since</th>
						</tr>
					</thead>
					<tbody>
						{#if ladiesStandings.length > 0}
							{#each ladiesStandings as tag (tag.id)}
								<tr>
									<td class="font-bold">#{tag.tagNumber}</td>
									<td>{tag.holderName}</td>
									<td>{format(parseISO(tag.heldSince), 'MMM do, yyyy')}</td>
								</tr>
							{/each}
						{:else}
							<tr><td colspan="3" class="p-4 text-center italic">No standings for {selectedSeason} yet.</td></tr>
						{/if}
					</tbody>
				</table>
			</div>
		</div>
	</div>
</div>

<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
<div class="mt-16 w-full">
	<h2 class="mx-auto mb-6 text-center text-3xl font-bold">What is a Bag Tags League?</h2>
	<div class="mt-8 grid w-full xl:space-x-12 xl:grid-cols-2 px-4">
		<div class="w-full">
			<div class="prose lg:prose-xl mx-auto">
				<p>Bag Tag leagues are a fun and competitive way to play disc golf! Here's the basic idea:</p>
				<p>
					<strong>Bag Tags:</strong> Each player in the league receives a numbered tag. Think of it like your ranking within the league. The lower the number on your tag, the higher your ranking.
				</p>
				<p>
					<strong>Weekly Challenge:</strong> Each week, you'll play a round (or rounds) of disc golf, and your score determines your new tag number for the following week. The better you score, the lower your tag number becomes.
				</p>
				<p>
					<strong>Challenge Matches:</strong> Outside of the regular weekly rounds, you can challenge other players for their tags. If you win the challenge match, you get their tag (and they get yours). This allows you to move up the rankings even faster.
				</p>
				<p>
					<strong>Competition and Camaraderie:</strong> Bag tag leagues are a great way to compete against other players, improve your game, and enjoy the camaraderie of the disc golf community.
				</p>
				<p>For the Plumas Disc Golf Bag Tag Leagues Comprehensive Rules, click <a href="/rules/bag-tags">here</a></p>
			</div>
		</div>
		<div class="w-full">
			<h2 class="mb-6 mt-6 lg:mt-0 text-center text-3xl font-bold">2026 League Schedule</h2>
			<div class="prose lg:prose-xl mx-auto">
				<p><strong>Season Start:</strong> Plumas Disc Golf Membership Drive, April 4th, 2026.</p>
				<p>
					<strong>Regular Season:</strong> Following the Membership Drive, leagues will follow the regular schedule.
				</p>
				<ul>
					<li><strong>Ladies League:</strong> Tuesdays at 5:30 PM</li>
					<li><strong>Open League:</strong> Wednesdays at 5:30 PM</li>
				</ul>

				<p>
					<strong>Season End:</strong>
				</p>
				<ul>
					<li><strong>Ladies League:</strong> September 29th, 2026</li>
					<li><strong>Open League:</strong> September 16th, 2026</li>
				</ul>
				<p>
					<strong>Location:</strong> Pioneer Disc Golf Course.
				</p>
				<p>
					<strong>Course Closures (No League Play):</strong>
				</p>
				<ul>
					<li>July 23rd - July 26th (Plumas-Sierra County Fair - Dates Subject to Change)</li>
					<li>Any other dates the course is closed to the public.</li>
				</ul>
			</div>
		</div>
	</div>
</div>