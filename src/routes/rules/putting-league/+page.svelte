<script>
	import * as config from '$lib/config';
</script>

<svelte:head>
	<title>Putting League Rules - {config.title}</title>
</svelte:head>

<!-- Hero Section -->
<div class="hero bg-base-200">
	<div class="hero-content py-12 text-center">
		<div class="max-w-md">
			<h1 class="text-5xl font-bold">Putting League Rules</h1>
		</div>
	</div>
</div>
<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
<div class="mt-16 w-full">
	<h2 class="mx-auto mb-6 text-center text-3xl font-bold">Comprehensive Rules</h2>
	<div class="prose lg:prose-xl mx-auto max-w-[75ch]">
		<p>These rules govern the Plumas Disc Golf Putting League, in addition to the general <a href="/rules/club">Plumas Disc Golf Club Rules</a>.</p>
		<ol>
			<li>
				<strong>Eligibility</strong>
				<ol>
					<li>Putting League is open to everyone, regardless of Plumas Disc Golf membership status.</li>
				</ol>
			</li>
			<li>
				<strong>Format</strong>
				<ol>
					<li>Each event consists of two (2) rounds.</li>
					<li>Each round consists of five (5) putting stations, at increasing distances from the basket: Station 1 (15 feet), Station 2 (20 feet), Station 3 (25 feet), Station 4 (30 feet), and Station 5 (35 feet).</li>
					<li>At each station, a player attempts three (3) putts.</li>
				</ol>
			</li>
			<li>
				<strong>Scoring</strong>
				<ol>
					<li>A player's score at a station is equal to the number of putts made at that station, multiplied by the station number. For example, making two (2) putts at Station 4 earns eight (8) points.</li>
					<li>A player's round score is the sum of their scores across all five (5) stations in that round.</li>
					<li>A player's total event score is the sum of their two (2) round scores, plus any bonus putt points earned per Section 4.</li>
				</ol>
			</li>
			<li>
				<strong>Bonus Putt</strong>
				<ol>
					<li>After both rounds are complete, each player attempts one (1) bonus putt, from a distance chosen by the group that day.</li>
					<li>A made bonus putt earns twenty-five (25) points.</li>
					<li>A player who makes the bonus putt may immediately attempt a "Double or Nothing" putt from the same distance:
						<ol>
							<li>If made, the player earns fifty (50) points for the bonus putt, instead of twenty-five (25).</li>
							<li>If missed, the player earns zero (0) points for the bonus putt.</li>
						</ol>
					</li>
					<li>A missed bonus putt earns zero (0) points, and carries no Double or Nothing option.</li>
				</ol>
			</li>
			<li>
				<strong>Fees &amp; Payouts</strong>
				<ol>
					<li>Current entry fees are listed on the <a href="/events/putting-league">Putting League</a> event page.</li>
					<li>A portion of each entry fee, shown alongside the entry fee, funds that event's payout pool; the remainder supports the club.</li>
					<li>Up to the top three (3) finishers, by total event score, are paid out from the pool, based on the number of paid entries in that event.</li>
					<li>Payout amounts are rounded down to the nearest whole dollar; any remaining balance stays with the club.</li>
				</ol>
			</li>
			<li>
				<strong>Ties</strong>
				<ol>
					<li>If two or more players are tied in total event score for a paid finishing position, the payouts for the position(s) they collectively occupy are combined and split evenly among them, rounded down to the nearest whole dollar per player.</li>
					<li>For example, if two players tie for 2nd place, the 2nd and 3rd place payouts are combined and split evenly between the two of them; if three players tie for 1st place, the 1st, 2nd, and 3rd place payouts are combined and split evenly among the three of them.</li>
				</ol>
			</li>
			<li>
				<strong>Agreement to the Rules</strong>
				<ol>
					<li>By participating in any Putting League event, all participants agree to abide by these rules, as well as the general Plumas Disc Golf Club Rules.</li>
				</ol>
			</li>
		</ol>
	</div>
</div>

<style>
	ol {
		list-style-type: none;
		counter-reset: item;
		margin: 0;
		padding: 0;
	}
	li {
		display: table;
		counter-increment: item;
		margin-bottom: 0.6em;
	}
	li:before {
		content: counters(item, '.') '. ';
		display: table-cell;
		padding-right: 0.6em;
	}
	li li {
		margin: 0;
	}
	li li:before {
		content: counters(item, '.') ' ';
	}
</style>