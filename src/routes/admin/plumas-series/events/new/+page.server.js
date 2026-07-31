// src/routes/admin/plumas-series/events/new/+page.server.js
import { fail, redirect } from '@sveltejs/kit';
import { formatInputDateToPocketBase } from '$lib/utils.js';

export const load = async ({ locals, url }) => {
	// No auth check needed here — the shared /admin +layout.server.js already
	// guards the entire route tree before this load runs.
	const seasons = await locals.pb.collection('plumas_series_seasons').getFullList({ sort: '-year' });
	const courses = await locals.pb.collection('courses').getFullList({ sort: 'name' });

	return {
		seasons,
		courses,
		defaultSeasonId: url.searchParams.get('seasonId') || seasons[0]?.id || ''
	};
};

export const actions = {
	createEvent: async ({ request, locals }) => {
		if (!locals.user) {
			return fail(401, { error: 'User not authenticated.' });
		}

		const formData = await request.formData();
		const seasonId = formData.get('seasonId')?.toString();
		const eventNumber = formData.get('eventNumber')?.toString();
		const type = formData.get('type')?.toString();
		const eventDate = formData.get('eventDate')?.toString();
		const courseId = formData.get('courseId')?.toString() || '';

		const currentValues = { seasonId, eventNumber, type, eventDate, courseId };

		const fieldErrors = {};
		if (!seasonId) fieldErrors.seasonId = 'Season is required.';
		const eventNumberNum = Number(eventNumber);
		if (!eventNumber || !Number.isInteger(eventNumberNum) || eventNumberNum < 1) {
			fieldErrors.eventNumber = 'Event Number must be a positive whole number.';
		}
		if (!type || !['Handicap', 'Championship'].includes(type)) {
			fieldErrors.type = 'Type is required.';
		}
		if (!eventDate) {
			fieldErrors.eventDate = 'Event Date is required.';
		}

		if (Object.keys(fieldErrors).length > 0) {
			return fail(400, { ...currentValues, fieldErrors, error: 'Please correct the errors.' });
		}

		try {
			await locals.pb.collection('plumas_series_events').create({
				seasonId,
				eventNumber: eventNumberNum,
				type,
				eventDate: formatInputDateToPocketBase(eventDate),
				courseId: courseId || null
			});
		} catch (err) {
			console.error('Error creating Plumas Series event:', err.response || err.originalError || err);
			let errorMessage = 'Failed to create event.';
			if (err.data?.data) {
				errorMessage += ` Details: ${JSON.stringify(err.data.data)}`;
			}
			return fail(500, { ...currentValues, error: errorMessage });
		}

		throw redirect(303, `/admin/plumas-series?created=event`);
	}
};