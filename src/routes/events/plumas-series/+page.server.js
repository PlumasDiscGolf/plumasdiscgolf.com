// src/routes/events/plumas-series/+page.server.js
export const load = async ({ locals }) => {
	try {
		const seriesSeasons = await locals.pb.collection('plumas_series_seasons').getFullList({ sort: '-year' });

		// All seasons loaded at once, filtered client-side via the season
		// dropdown — same load shape as /events/bag-tags.
		const seriesEvents = await locals.pb.collection('plumas_series_events').getFullList({ sort: 'eventNumber' });

		const seriesResults = await locals.pb.collection('plumas_series_results').getFullList({
			sort: 'created',
			expand: 'memberId'
		});

		return {
			seriesSeasons: JSON.parse(JSON.stringify(seriesSeasons)),
			seriesEvents: JSON.parse(JSON.stringify(seriesEvents)),
			seriesResults: JSON.parse(JSON.stringify(seriesResults))
		};
	} catch (err) {
		console.error('Error loading Plumas Series standings:', err);
		// Fail soft: the rules/info content on the page should still render even if this fails
		return { seriesSeasons: [], seriesEvents: [], seriesResults: [] };
	}
};