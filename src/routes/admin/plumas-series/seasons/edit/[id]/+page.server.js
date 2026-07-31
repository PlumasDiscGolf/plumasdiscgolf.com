// src/routes/admin/plumas-series/seasons/edit/[id]/+page.server.js
import { error, fail, redirect } from '@sveltejs/kit';

export const load = async ({ locals, params }) => {
	// No auth check needed here — the shared /admin +layout.server.js already
	// guards the entire route tree before this load runs.
	try {
		const season = await locals.pb.collection('plumas_series_seasons').getOne(params.id);
		const eventCount = await locals.pb.collection('plumas_series_events').getList(1, 1, {
			filter: locals.pb.filter('seasonId = {:seasonId}', { seasonId: params.id })
		});

		return {
			season: JSON.parse(JSON.stringify(season)),
			hasEvents: eventCount.totalItems > 0
		};
	} catch (err) {
		console.error('Error loading Plumas Series season for editing:', err);
		if (err.status === 404) throw error(404, 'Season not found');
		throw error(500, 'Failed to load season data.');
	}
};

export const actions = {
	updateSeason: async ({ request, locals, params }) => {
		if (!locals.user) return fail(401, { error: 'User not authenticated.' });
		if (!params.id) return fail(400, { error: 'Season ID is missing.' });

		const formData = await request.formData();
		const year = formData.get('year')?.toString();
		const totalEvents = formData.get('totalEvents')?.toString();
		const countingEvents = formData.get('countingEvents')?.toString();
		const notes = formData.get('notes')?.toString() || '';

		const currentValues = { year, totalEvents, countingEvents, notes };

		const fieldErrors = {};
		const yearNum = Number(year);
		if (!year || !Number.isInteger(yearNum) || yearNum < 2000 || yearNum > 2100) {
			fieldErrors.year = 'Year must be a valid 4-digit year.';
		}
		const totalEventsNum = Number(totalEvents);
		if (!totalEvents || !Number.isInteger(totalEventsNum) || totalEventsNum < 1) {
			fieldErrors.totalEvents = 'Total Events must be a positive whole number.';
		}
		const countingEventsNum = Number(countingEvents);
		if (!countingEvents || !Number.isInteger(countingEventsNum) || countingEventsNum < 1) {
			fieldErrors.countingEvents = 'Counting Events must be a positive whole number.';
		}
		if (!fieldErrors.totalEvents && !fieldErrors.countingEvents && countingEventsNum > totalEventsNum) {
			fieldErrors.countingEvents = 'Counting Events can\'t be more than Total Events.';
		}

		if (Object.keys(fieldErrors).length > 0) {
			return fail(400, { ...currentValues, fieldErrors, error: 'Please correct the errors.' });
		}

		try {
			const existing = await locals.pb
				.collection('plumas_series_seasons')
				.getList(1, 1, { filter: locals.pb.filter('year = {:year} && id != {:id}', { year: yearNum, id: params.id }) });
			if (existing.totalItems > 0) {
				return fail(400, { ...currentValues, fieldErrors: { year: 'A season for this year already exists.' }, error: 'Please correct the errors.' });
			}

			await locals.pb.collection('plumas_series_seasons').update(params.id, {
				year: yearNum,
				totalEvents: totalEventsNum,
				countingEvents: countingEventsNum,
				notes
			});
		} catch (err) {
			console.error('Error updating Plumas Series season:', err.response || err.originalError || err);
			let errorMessage = 'Failed to update season.';
			if (err.data?.data) {
				errorMessage += ` Details: ${JSON.stringify(err.data.data)}`;
			}
			return fail(500, { ...currentValues, error: errorMessage });
		}

		throw redirect(303, `/admin/plumas-series?updated=season`);
	}
};