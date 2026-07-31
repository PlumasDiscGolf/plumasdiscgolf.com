// src/routes/admin/plumas-series/results/new/+page.server.js
import { fail, redirect } from '@sveltejs/kit';

export const load = async ({ locals, url }) => {
	// No auth check needed here — the shared /admin +layout.server.js already
	// guards the entire route tree before this load runs.
	const events = await locals.pb.collection('plumas_series_events').getFullList({ sort: 'eventNumber', expand: 'seasonId' });
	const members = await locals.pb.collection('members').getFullList({ sort: 'lastName,firstName' });

	return {
		events,
		members,
		defaultEventId: url.searchParams.get('eventId') || ''
	};
};

export const actions = {
	createResult: async ({ request, locals }) => {
		if (!locals.user) {
			return fail(401, { error: 'User not authenticated.' });
		}

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
			await locals.pb.collection('plumas_series_results').create({
				eventId,
				memberId: playerType === 'member' ? memberId : null,
				guestName: playerType === 'guest' ? guestName : '',
				place,
				points
			});
		} catch (err) {
			console.error('Error creating Plumas Series result:', err.response || err.originalError || err);
			let errorMessage = 'Failed to create result.';
			if (err.data?.data) {
				errorMessage += ` Details: ${JSON.stringify(err.data.data)}`;
			}
			return fail(500, { ...currentValues, error: errorMessage });
		}

		// Bounce back to the same event's "add result" form (reset) rather than
		// the admin list, since entering a whole event's field usually means
		// adding several results back-to-back.
		throw redirect(303, `/admin/plumas-series/results/new?eventId=${eventId}&created=result`);
	}
};