// src/routes/admin/putting-league/entries/[id]/record/[field]/+page.server.js
import { error, fail, redirect } from '@sveltejs/kit';
import { parseStationField, stationDistance } from '$lib/puttingLeague.js';

export const load = async ({ locals, params }) => {
	// No auth check needed here — the shared /admin +layout.server.js already
	// guards the entire route tree before this load runs.
	const parsed = parseStationField(params.field);
	if (!parsed) throw error(404, 'Not a valid station.');

	try {
		const entry = await locals.pb.collection('putting_league_entries').getOne(params.id, { expand: 'memberId' });

		return {
			entry: JSON.parse(JSON.stringify(entry)),
			field: params.field,
			round: parsed.round,
			station: parsed.station,
			distance: stationDistance(parsed.station),
			currentValue: entry[params.field] ?? 0
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

		// Straight back to the score hub so the next station is one tap away.
		throw redirect(303, `/admin/putting-league/entries/${params.id}/score`);
	}
};