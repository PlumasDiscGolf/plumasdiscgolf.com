// src/routes/admin/plumas-series/results/edit/[id]/+page.server.js
import { error, fail, redirect } from '@sveltejs/kit';

export const load = async ({ locals, params }) => {
	// No auth check needed here — the shared /admin +layout.server.js already
	// guards the entire route tree before this load runs.
	try {
		const result = await locals.pb.collection('plumas_series_results').getOne(params.id);
		const events = await locals.pb.collection('plumas_series_events').getFullList({ sort: 'eventNumber', expand: 'seasonId' });
		const members = await locals.pb.collection('members').getFullList({ sort: 'firstName,lastName' });

		return {
			result: JSON.parse(JSON.stringify(result)),
			events,
			members
		};
	} catch (err) {
		console.error('Error loading Plumas Series result for editing:', err);
		if (err.status === 404) throw error(404, 'Result not found');
		throw error(500, 'Failed to load result data.');
	}
};

export const actions = {
	updateResult: async ({ request, locals, params }) => {
		if (!locals.user) return fail(401, { error: 'User not authenticated.' });
		if (!params.id) return fail(400, { error: 'Result ID is missing.' });

		const formData = await request.formData();
		const eventId = formData.get('eventId')?.toString();
		const playerType = formData.get('playerType')?.toString(); // 'member' | 'guest'
		const memberId = formData.get('memberId')?.toString() || '';
		const guestName = formData.get('guestName')?.toString().trim() || '';
		const place = formData.get('place')?.toString().trim();
		const pointsStr = formData.get('points')?.toString().trim() || '';

		const currentValues = { eventId, playerType, memberId, guestName, place, points: pointsStr };

		const fieldErrors = {};
		if (!eventId) fieldErrors.eventId = 'Event is required.';
		if (playerType === 'member' && !memberId) fieldErrors.memberId = 'Select a member.';
		if (playerType === 'guest' && !guestName) fieldErrors.guestName = 'Guest name is required.';
		if (!place) fieldErrors.place = 'Place is required, e.g. "1st" or "T2nd".';

		let points = null;
		if (pointsStr) {
			points = Number(pointsStr);
			if (Number.isNaN(points)) fieldErrors.points = 'Points must be a number.';
		}

		if (Object.keys(fieldErrors).length > 0) {
			return fail(400, { ...currentValues, fieldErrors, error: 'Please correct the errors.' });
		}

		try {
			await locals.pb.collection('plumas_series_results').update(params.id, {
				eventId,
				memberId: playerType === 'member' ? memberId : null,
				guestName: playerType === 'guest' ? guestName : '',
				place,
				points
			});
		} catch (err) {
			console.error('Error updating Plumas Series result:', err.response || err.originalError || err);
			let errorMessage = 'Failed to update result.';
			if (err.data?.data) {
				errorMessage += ` Details: ${JSON.stringify(err.data.data)}`;
			}
			return fail(500, { ...currentValues, error: errorMessage });
		}

		throw redirect(303, `/admin/plumas-series?updated=result`);
	}
};