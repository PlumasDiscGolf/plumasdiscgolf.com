// src/routes/admin/plumas-series/events/edit/[id]/+page.server.js
import { error, fail, redirect } from '@sveltejs/kit';
import { formatInputDateToPocketBase } from '$lib/utils.js';

export const load = async ({ locals, params }) => {
	// No auth check needed here — the shared /admin +layout.server.js already
	// guards the entire route tree before this load runs.
	try {
		const event = await locals.pb.collection('plumas_series_events').getOne(params.id);
		const seasons = await locals.pb.collection('plumas_series_seasons').getFullList({ sort: '-year' });
		const courses = await locals.pb.collection('courses').getFullList({ sort: 'name' });
		const resultCount = await locals.pb.collection('plumas_series_results').getList(1, 1, {
			filter: locals.pb.filter('eventId = {:eventId}', { eventId: params.id })
		});

		return {
			event: JSON.parse(JSON.stringify(event)),
			seasons,
			courses,
			hasResults: resultCount.totalItems > 0
		};
	} catch (err) {
		console.error('Error loading Plumas Series event for editing:', err);
		if (err.status === 404) throw error(404, 'Event not found');
		throw error(500, 'Failed to load event data.');
	}
};

export const actions = {
	updateEvent: async ({ request, locals, params }) => {
		if (!locals.user) return fail(401, { error: 'User not authenticated.' });
		if (!params.id) return fail(400, { error: 'Event ID is missing.' });

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
			await locals.pb.collection('plumas_series_events').update(params.id, {
				seasonId,
				eventNumber: eventNumberNum,
				type,
				eventDate: formatInputDateToPocketBase(eventDate),
				courseId: courseId || null
			});
		} catch (err) {
			console.error('Error updating Plumas Series event:', err.response || err.originalError || err);
			let errorMessage = 'Failed to update event.';
			if (err.data?.data) {
				errorMessage += ` Details: ${JSON.stringify(err.data.data)}`;
			}
			return fail(500, { ...currentValues, error: errorMessage });
		}

		throw redirect(303, `/admin/plumas-series?updated=event`);
	}
};