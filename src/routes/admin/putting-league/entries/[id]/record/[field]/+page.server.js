// src/routes/admin/putting-league/entries/[id]/record/[field]/+page.server.js
import { error, fail, redirect } from '@sveltejs/kit';
import { parseStationField, stationDistance } from '$lib/puttingLeague.js';

export const load = async ({ locals, params, url }) => {
	// No auth check needed here — the shared /admin +layout.server.js already
	// guards the entire route tree before this load runs.
	const parsed = parseStationField(params.field);
	if (!parsed) throw error(404, 'Not a valid station.');

	// Where "Back" and the post-save redirect should go. Defaults to the main
	// admin list, since the primary workflow is station-by-station across all
	// players (everyone takes their turn at a station together) rather than
	// player-by-player — but the per-player score hub still links here too
	// (for bonus putt entry), passing its own URL through so that path isn't
	// broken.
	const returnTo = url.searchParams.get('returnTo') || '/admin/putting-league';

	try {
		const entry = await locals.pb.collection('putting_league_entries').getOne(params.id, { expand: 'memberId' });

		return {
			entry: JSON.parse(JSON.stringify(entry)),
			field: params.field,
			round: parsed.round,
			station: parsed.station,
			distance: stationDistance(parsed.station),
			currentValue: entry[params.field] ?? 0,
			returnTo
		};
	} catch (err) {
		console.error('Error loading entry for score recording:', err);
		if (err.status === 404) throw error(404, 'Entry not found');
		throw error(500, 'Failed to load entry data.');
	}
};

export const actions = {
	recordMakes: async ({ request, locals, params }) => {
		if (!locals.user) return fail(401, { error: 'User not authenticated.' });

		const parsed = parseStationField(params.field);
		if (!parsed) return fail(400, { error: 'Not a valid station.' });

		const formData = await request.formData();
		const makes = Number(formData.get('makes'));
		const returnTo = formData.get('returnTo')?.toString() || '/admin/putting-league';

		if (![0, 1, 2, 3].includes(makes)) {
			return fail(400, { error: 'Makes must be 0-3.' });
		}

		try {
			await locals.pb.collection('putting_league_entries').update(params.id, {
				[params.field]: makes
			});
		} catch (err) {
			console.error('Error recording station makes:', err);
			return fail(500, { error: 'Failed to record score.' });
		}

		throw redirect(303, returnTo);
	}
};