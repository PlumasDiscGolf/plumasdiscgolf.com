// src/routes/admin/putting-league/entries/new/+page.server.js
import { fail, redirect } from '@sveltejs/kit';

export const load = async ({ locals, url }) => {
	// No auth check needed here — the shared /admin +layout.server.js already
	// guards the entire route tree before this load runs.
	const events = await locals.pb.collection('putting_league_events').getFullList({ sort: '-date' });
	const members = await locals.pb.collection('members').getFullList({ sort: 'firstName,lastName' });

	return {
		events,
		members,
		defaultEventId: url.searchParams.get('eventId') || events[0]?.id || ''
	};
};

export const actions = {
	createEntry: async ({ request, locals }) => {
		if (!locals.user) {
			return fail(401, { error: 'User not authenticated.' });
		}

		const formData = await request.formData();
		const eventId = formData.get('eventId')?.toString();
		const playerType = formData.get('playerType')?.toString(); // 'member' | 'guest'
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
			// Scores all start at 0 / not-attempted — recorded later via the
			// per-entry "Score" page, station by station, as players finish.
			await locals.pb.collection('putting_league_entries').create({
				eventId,
				memberId: playerType === 'member' ? memberId : null,
				guestName: playerType === 'guest' ? guestName : '',
				paid,
				r1s1: 0, r1s2: 0, r1s3: 0, r1s4: 0, r1s5: 0,
				r2s1: 0, r2s2: 0, r2s3: 0, r2s4: 0, r2s5: 0,
				bonusPuttMade: false,
				doubleOrNothingAttempted: false,
				doubleOrNothingMade: false,
				payout: null
			});
		} catch (err) {
			console.error('Error creating putting league entry:', err.response || err.originalError || err);
			let errorMessage = 'Failed to create entry.';
			if (err.data?.data) {
				errorMessage += ` Details: ${JSON.stringify(err.data.data)}`;
			}
			return fail(500, { ...currentValues, error: errorMessage });
		}

		// Bounce back to the same event's "add entry" form (reset) rather than
		// the admin list, since registering a whole event's field usually means
		// adding several players back-to-back before anyone starts scoring.
		// The #player-form anchor scrolls straight to the form instead of the
		// top of the page, which matters most on mobile where scrolling past
		// the header/banner every time gets old fast.
		throw redirect(303, `/admin/putting-league/entries/new?eventId=${eventId}&created=entry#player-form`);
	}
};