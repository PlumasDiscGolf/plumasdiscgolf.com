// src/routes/admin/plumas-series/seasons/new/+page.server.js
import { fail, redirect } from '@sveltejs/kit';

export const load = async () => {
	// No auth check needed here — the shared /admin +layout.server.js already
	// guards the entire route tree before this load runs.
	const currentYear = new Date().getFullYear();
	return { defaultYear: currentYear };
};

export const actions = {
	createSeason: async ({ request, locals }) => {
		if (!locals.user) {
			return fail(401, { error: 'User not authenticated.' });
		}

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
			// Guard against creating a duplicate season for a year that already exists —
			// PocketBase won't reject this on its own unless a unique index is set.
			const existing = await locals.pb
				.collection('plumas_series_seasons')
				.getList(1, 1, { filter: locals.pb.filter('year = {:year}', { year: yearNum }) });
			if (existing.totalItems > 0) {
				return fail(400, { ...currentValues, fieldErrors: { year: 'A season for this year already exists.' }, error: 'Please correct the errors.' });
			}

			await locals.pb.collection('plumas_series_seasons').create({
				year: yearNum,
				totalEvents: totalEventsNum,
				countingEvents: countingEventsNum,
				notes
			});
		} catch (err) {
			console.error('Error creating Plumas Series season:', err.response || err.originalError || err);
			let errorMessage = 'Failed to create season.';
			if (err.data?.data) {
				errorMessage += ` Details: ${JSON.stringify(err.data.data)}`;
			}
			return fail(500, { ...currentValues, error: errorMessage });
		}

		throw redirect(303, `/admin/plumas-series?created=season`);
	}
};