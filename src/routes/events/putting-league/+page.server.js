// src/routes/events/putting-league/+page.server.js
export const load = async ({ locals }) => {
	try {
		// All events loaded at once, filtered client-side via the event
		// dropdown — same load shape as /events/bag-tags and /events/plumas-series.
		const puttingLeagueEvents = await locals.pb.collection('putting_league_events').getFullList({
			sort: '-date',
			expand: 'locationId'
		});

		const puttingLeagueEntries = await locals.pb.collection('putting_league_entries').getFullList({
			sort: 'created',
			expand: 'memberId'
		});

		return {
			puttingLeagueEvents: JSON.parse(JSON.stringify(puttingLeagueEvents)),
			puttingLeagueEntries: JSON.parse(JSON.stringify(puttingLeagueEntries))
		};
	} catch (err) {
		console.error('Error loading Putting League results:', err);
		// Fail soft: the page should still render (with an empty state) even if this fails
		return { puttingLeagueEvents: [], puttingLeagueEntries: [] };
	}
};