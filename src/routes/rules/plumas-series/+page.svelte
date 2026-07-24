<script>
	import * as config from '$lib/config';
</script>

<svelte:head>
	<title>Plumas Series Rules - {config.title}</title>
</svelte:head>

<!-- Hero Section -->
<div class="hero bg-base-200">
	<div class="hero-content py-12 text-center">
		<div class="max-w-md">
			<h1 class="text-5xl font-bold">Plumas Series Rules</h1>
		</div>
	</div>
</div>
<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
<div class="mt-16 w-full">
	<h2 class="mx-auto mb-6 text-center text-3xl font-bold">Comprehensive Rules</h2>
	<div class="prose lg:prose-xl mx-auto max-w-[75ch]">
		<p>These rules govern the Plumas Series, in addition to the general <a href="/rules/club">Plumas Disc Golf Club Rules</a>.</p>
		<ol>
			<li>
				<strong>Eligibility</strong>
				<ol>
					<li>The Plumas Series is open to all amateur disc golfers, regardless of skill level or prior experience.</li>
					<li>Both Plumas Disc Golf members and non-members may participate, subject to the fees described in Section 8.</li>
				</ol>
			</li>
			<li>
				<strong>Registration &amp; Check-In</strong>
				<ol>
					<li>Registration is available online in advance via <a href="https://discgolfscene.com" target="_blank">Disc Golf Scene</a>, as well as in person, day-of, at each event.</li>
					<li>Field size for each event is capped at 45 players.</li>
					<li>Check-in begins one (1) hour before the event's scheduled start time.</li>
					<li>Entry fees are collected at check-in for players who did not pay during online registration, as described in Section 8.</li>
					<li>Check-in closes at the event's scheduled start time. Players who have not completed check-in by this time will not be eligible to participate in that event.</li>
				</ol>
			</li>
			<li>
				<strong>Series Format (Handicap Events)</strong>
				<ol>
					<li>The Plumas Series consists of six (6) handicap-based events, followed by a seventh and final Championship event (the Survivor Razz Round Championship), described separately in Section 7.</li>
					<li>Each handicap event is a single round of 18-hole singles stroke play.</li>
					<li>Handicap events are open to all eligible players described in Section 1, regardless of prior series participation.</li>
					<li>UDisc is used for scoring at each handicap event.</li>
					<li>A player's best four (4) results out of the six (6) handicap events count toward their series point standings, as described in Section 5.</li>
				</ol>
			</li>
			<li>
				<strong>Handicap System</strong>
				<ol>
					<li>Each player's handicap is used to adjust their raw score at each handicap event, to allow players of varying skill levels to compete fairly against one another.</li>
					<li>Player handicaps are calculated using the UDisc handicap system, based on scores submitted via UDisc.</li>
					<li>A player's raw (non-handicap-adjusted) score is used for their first handicap event in the series, since UDisc does not provide a handicap until a player has an established scoring history in the series.</li>
					<li>Following a player's first event, UDisc establishes a handicap based on that event's performance.</li>
					<li>Handicaps are recalculated after each subsequent handicap event to reflect a player's most recent performance.</li>
				</ol>
			</li>
			<li>
				<strong>Scoring &amp; Point Standings</strong>
				<ol>
					<li>At each handicap event, players are ranked by their handicap-adjusted score, from lowest to highest.</li>
					<li>A player earns one (1) point for each other player in that event whose handicap-adjusted score they beat, plus one (1) additional point for participating in the event.</li>
					<li>A player's best four (4) event point totals out of their six (6) handicap events count toward their overall series standings, as described in Section 3.5.</li>
					<li>A player's overall series standing is determined by the sum of their best four (4) event point totals.</li>
					<li>Players who participate in fewer than four (4) handicap events are still ranked in the series standings, based on the point totals from the events in which they participated.</li>
				</ol>
			</li>
			<li>
				<strong>Tiebreakers</strong>
				<ol>
					<li>If two or more players are tied on handicap-adjusted score at a single handicap event, they will be awarded the same point value for that event, as described in Section 5.2.</li>
					<li>If two or more players are tied in overall series point standings, ties will be broken by comparing each player's best single-event point total, then their second-best, and so on, until the tie is resolved.</li>
					<li>If a tie in overall series standings cannot be resolved using the method in 6.2, the tied players will be considered co-ranked for that position.</li>
				</ol>
			</li>
			<li>
				<strong>Survivor Razz Round Championship</strong>
				<ol>
					<li>The Survivor Razz Round Championship is the seventh and final event of the Plumas Series, and follows a different format than the six (6) handicap events.</li>
					<li>Any player who has participated in at least one (1) handicap event during that season's Plumas Series is invited to compete in the Championship.</li>
					<li>The Championship uses a "Survivor" elimination format: after each hole, the player(s) with the worst stroke play score on that hole are eliminated from continued play, subject to the tiebreaker procedure in 7.5. A maximum of one (1) player is eliminated per hole.</li>
					<li>
						<strong>Standings Byes:</strong> The top three (3) players in the season's overall series point standings receive a bye from elimination risk for the following holes:
						<ol>
							<li>3rd Place: Bye through Hole 1.</li>
							<li>2nd Place: Bye through Hole 2.</li>
							<li>1st Place: Bye through Hole 3.</li>
						</ol>
					</li>
					<li>
						<strong>Putting Tiebreaker:</strong> If two or more players are tied for the worst score on a hole, elimination among those tied players is determined by a head-to-head putting tiebreaker:
						<ol>
							<li>Tied players putt starting at a distance of twenty (20) feet from the basket.</li>
							<li>If all tied players make their putt, the distance increases by five (5) feet, and the tied players putt again from the new distance.</li>
							<li>If all tied players miss their putt, the tied players re-putt from the same distance.</li>
							<li>If at least one tied player makes their putt while at least one other tied player misses, the player(s) who made their putt are safe from elimination for that hole.</li>
							<li>If exactly one player missed their putt under 7.5.4, that player is eliminated.</li>
							<li>If more than one player missed their putt under 7.5.4, those players continue the tiebreaker process among themselves, per 7.5.1–7.5.3, until only one player remains to be eliminated.</li>
						</ol>
					</li>
					<li>Play continues, hole by hole, until a single player remains as the Champion.</li>
					<li>Scores at the Championship are not handicap-adjusted; all players compete on raw stroke play score for each hole.</li>
				</ol>
			</li>
			<li>
				<strong>Fees &amp; Payouts</strong>
				<ol>
					<li>Entry fees apply for each handicap event, with a discounted rate for Plumas Disc Golf members compared to non-members.</li>
					<li>Current entry fees are listed on the <a href="/events/plumas-series">Plumas Series</a> event page.</li>
					<li>The Survivor Razz Round Championship is free to enter for all invited players, per Section 7.2.</li>
				</ol>
			</li>
			<li>
				<strong>Cancellation of Events</strong>
				<ol>
					<li>If a handicap event is canceled before play begins, no points will be awarded for that event.</li>
					<li>If a handicap event is canceled during play, the event will be considered complete and fully counted if all players have completed at least nine (9) of the eighteen (18) holes, consistent with PDGA policy for canceled rounds.</li>
					<li>If fewer than nine (9) holes have been completed by all players at the time of cancellation, the event will be disregarded entirely, and no points will be awarded.</li>
				</ol>
			</li>
			<li>
				<strong>Agreement to the Rules</strong>
				<ol>
					<li>By registering for or participating in any Plumas Series event, all participants — regardless of Plumas Disc Golf membership status — agree to abide by these Plumas Series rules, as well as the general club rules applicable to all Plumas Disc Golf events.</li>
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