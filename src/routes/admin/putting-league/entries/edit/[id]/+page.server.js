// src/routes/admin/putting-league/entries/edit/[id]/+page.server.js
import { error, fail, redirect } from '@sveltejs/kit';

export const load = async ({ locals, params }) => {
	// No auth check needed here — the shared /admin +layout.server.js already
	// guards the entire route tree before this load runs.
	try {
		const entry = await locals.pb.collection('putting_league_entries').getOne(params.id);
		const events = await locals.pb.collection('putting_league_events').getFullList({ sort: '-date' });
		const members = await locals.pb.collection('members').getFullList({ sort: 'firstName,lastName' });

		return {
			entry: JSON.parse(JSON.stringify(entry)),
			events,
			members
		};
	} catch (err) {
		console.error('Error loading putting league entry for editing:', err);
		if (err.status === 404) throw error(404, 'Entry not found');
		throw error(500, 'Failed to load entry data.');
	}
};

export const actions = {
	updateEntry: async ({ request, locals, params }) => {
		if (!locals.user) return fail(401, { error: 'User not authenticated.' });
		if (!params.id) return fail(400, { error: 'Entry ID is missing.' });

		const formData = await request.formData();
		const eventId = formData.get('eventId')?.toString();
		const playerType = formData.get('playerType')?.toString();
		const memberId = formData.get('memberId')?.toString() || '';
		const guestName = formData.get('guestName')?.toString().trim() || '';
		const paid = formData.get('paid') === 'on';

		const currentValues = { eventId, playerType, memberId, guestName, paid };
		const fieldErrors = {};

		if (!eventId) fieldErrors.eventId = 'Event is required.';
		if (playerType === 'member' && !memberId) fieldErrors.memberId = 'Select a member.';
		if (playerType === 'guest' && !guestName) fieldErrors.guestName = 'Guest name is required.';

		if (Object.keys(fieldErrors).length > 0) {
			return fail(400, { ...currentValues, fieldErrors, error: 'Please correct the errors.' });
		}

		try {
			// Scores are NOT touched here — they're edited separately via the
			// per-entry "Score" page, so this action only ever updates identity
			// and payment status.
			await locals.pb.collection('putting_league_entries').update(params.id, {
				eventId,
				memberId: playerType === 'member' ? memberId : null,
				guestName: playerType === 'guest' ? guestName : '',
				paid
			});
		} catch (err) {
			console.error('Error updating putting league entry:', err.response || err.originalError || err);
			let errorMessage = 'Failed to update entry.';
			if (err.data?.data) {
				errorMessage += ` Details: ${JSON.stringify(err.data.data)}`;
			}
			return fail(500, { ...currentValues, error: errorMessage });
		}

		throw redirect(303, `/admin/putting-league?updated=entry`);
	}
};