// src/lib/puttingLeague.js
//
// Shared scoring + payout logic for the Putting League feature.
// Kept in one place so the "new entry" form, "edit entry" form, and the
// event admin page's payout calculation all agree on how a score is derived.

export const NUM_STATIONS = 5;
export const NUM_ROUNDS = 2;
export const MAX_PUTTS_PER_STATION = 3;
export const BONUS_PUTT_POINTS = 25;
export const DOUBLE_OR_NOTHING_POINTS = 50;

// Station distances, in feet: station 1 = 15ft, +5ft per station.
export function stationDistance(stationNumber) {
	return 10 + stationNumber * 5;
}

// All 10 per-station makes fields, in display order (Round 1 stations 1-5,
// then Round 2 stations 1-5) — used to drive the score entry button grid.
export const STATION_FIELDS = [
	...[1, 2, 3, 4, 5].map((s) => ({ field: `r1s${s}`, round: 1, station: s })),
	...[1, 2, 3, 4, 5].map((s) => ({ field: `r2s${s}`, round: 2, station: s }))
];

// Parses a field key like "r1s3" into { round: 1, station: 3 }, or null if
// it's not a valid station field. Used to validate the [field] route param
// on the record-score page without trusting the URL blindly.
export function parseStationField(field) {
	const match = /^r([12])s([1-5])$/.exec(field || '');
	if (!match) return null;
	return { round: Number(match[1]), station: Number(match[2]) };
}

/**
 * Score for a single round: sum of (makes at station N) * N, across all 5 stations.
 * `makes` is an array of 5 integers (0-3), index 0 = station 1.
 */
export function calculateRoundScore(makes) {
	return makes.reduce((total, made, idx) => total + made * (idx + 1), 0);
}

/**
 * Bonus putt points for an entry.
 *   - Missed the bonus putt entirely -> 0
 *   - Made it, double-or-nothing not attempted -> 25
 *   - Made it, went for double-or-nothing and made that too -> 50
 *   - Made it, went for double-or-nothing and missed -> 0 (the banked 25 is forfeited)
 */
export function calculateBonusPoints(entry) {
	if (!entry.bonusPuttMade) return 0;
	if (!entry.doubleOrNothingAttempted) return BONUS_PUTT_POINTS;
	return entry.doubleOrNothingMade ? DOUBLE_OR_NOTHING_POINTS : 0;
}

/**
 * Full score breakdown for one entry. `entry` needs r1s1..r1s5, r2s1..r2s5,
 * bonusPuttMade, doubleOrNothingAttempted, doubleOrNothingMade.
 */
export function calculateEntryScore(entry) {
	const round1Makes = [entry.r1s1, entry.r1s2, entry.r1s3, entry.r1s4, entry.r1s5].map((v) => v || 0);
	const round2Makes = [entry.r2s1, entry.r2s2, entry.r2s3, entry.r2s4, entry.r2s5].map((v) => v || 0);

	const round1Score = calculateRoundScore(round1Makes);
	const round2Score = calculateRoundScore(round2Makes);
	const bonusPoints = calculateBonusPoints(entry);

	return {
		round1Score,
		round2Score,
		bonusPoints,
		totalScore: round1Score + round2Score + bonusPoints
	};
}

/**
 * Look up the payout row for a given number of PAID entries. The schedule
 * only goes to 30 players — per club policy, anything above that is capped
 * at the 30-player row rather than extrapolated.
 */
export function lookupPayoutRow(paidCount, payoutSchedule) {
	const cappedCount = Math.min(paidCount, 30);
	// Schedule starts at 3 players (minimum for any payout).
	if (cappedCount < 3) return null;
	return payoutSchedule.find((row) => row.playerCount === cappedCount) || null;
}

/**
 * Calculate payouts for all paid entries in an event.
 *
 * `entries` — array of paid entries, each needs the score fields above plus
 *   an `id` to key the result by.
 * `payoutSchedule` — full array of rows from putting_league_payout_schedule.
 *
 * Returns a Map of entryId -> { rank, totalScore, payout }.
 *
 * Ties are handled by combining the payout amounts for the places the tied
 * group occupies and splitting evenly — e.g. two players tied for 2nd
 * combine the 2nd + 3rd place payouts and split that total in half. A group
 * tied for 3rd only splits the 3rd place payout. This mirrors how Miah
 * described the club's actual practice, not a generic tiebreaker rule.
 */
export function calculatePayouts(entries, payoutSchedule) {
	const results = new Map();
	if (entries.length === 0) return results;

	const payoutRow = lookupPayoutRow(entries.length, payoutSchedule);
	// amounts[0] = 1st place payout, amounts[1] = 2nd, amounts[2] = 3rd.
	// A null/missing amount (e.g. no 3rd place under 5 players) counts as $0
	// when combined into a tied group's split, but never on its own.
	const amounts = payoutRow ? [payoutRow.first, payoutRow.second, payoutRow.third] : [0, 0, 0];

	// Score every entry, then sort best-to-worst.
	const scored = entries.map((entry) => ({
		entry,
		...calculateEntryScore(entry)
	}));
	scored.sort((a, b) => b.totalScore - a.totalScore);

	// Walk the sorted list in tie-groups, tracking which "place" (1-indexed)
	// each group starts at.
	let position = 0; // 0-indexed position of the next ungrouped entry
	while (position < scored.length) {
		const currentScore = scored[position].totalScore;
		const group = [];
		while (position < scored.length && scored[position].totalScore === currentScore) {
			group.push(scored[position]);
			position += 1;
		}

		const startPlace = position - group.length + 1; // 1-indexed
		const endPlace = position; // 1-indexed, inclusive

		let groupPayout = 0;
		if (startPlace <= 3) {
			// Sum whichever of places 1-3 this group occupies.
			for (let place = startPlace; place <= Math.min(endPlace, 3); place++) {
				groupPayout += amounts[place - 1] || 0;
			}
		}
		const perPlayerPayout = group.length > 0 ? groupPayout / group.length : 0;

		// Payouts are always whole dollars — a split that doesn't divide evenly
		// (e.g. two players tying for 1st combine $9 + $6 = $15, which splits
		// to $7.50) floors down, and the leftover stays with the club, same as
		// the schedule amounts themselves.
		const flooredPerPlayerPayout = Math.floor(perPlayerPayout);

		for (const scoredEntry of group) {
			results.set(scoredEntry.entry.id, {
				rank: startPlace,
				tied: group.length > 1,
				totalScore: scoredEntry.totalScore,
				round1Score: scoredEntry.round1Score,
				round2Score: scoredEntry.round2Score,
				bonusPoints: scoredEntry.bonusPoints,
				payout: flooredPerPlayerPayout
			});
		}
	}

	return results;
}