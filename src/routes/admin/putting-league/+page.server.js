// src/routes/admin/putting-league/+page.server.js
import { fail, redirect } from '@sveltejs/kit';
import { calculatePayouts } from '$lib/puttingLeague.js';

export const load = async ({ locals, url }) => {
	if (!locals.user) {
		throw redirect(303, '/login');
	}

	const events = await locals.pb.collection('putting_league_events').getFullList({
		sort: '-date',
		expand: 'locationId'
	});

	const entries = await locals.pb.collection('putting_league_entries').getFullList({
		sort: 'created',
		expand: 'memberId'
	});

	const locations = await locals.pb.collection('locations').getFullList({ sort: 'name' });

	// Set only right after creating a new event (see events/new's redirect) —
	// tells the page to auto-expand that one event even though everything
	// else defaults to collapsed.
	const justCreatedEventId = url.searchParams.get('created') === 'event' ? url.searchParams.get('eventId') : null;

	return { events, entries, locations, justCreatedEventId };
};

export const actions = {
	delete: async ({ request, locals }) => {
		if (!locals.user) {
			return fail(401, { error: 'User not authenticated.' });
		}

		const formData = await request.formData();
		const collectionName = formData.get('collectionName')?.toString();
		const itemId = formData.get('itemId')?.toString();

		if (!collectionName || !itemId) {
			return fail(400, { error: 'Missing required parameters for deletion.' });
		}
		// Restrict this generic delete action to the collections this admin
		// page actually manages, so a crafted request can't be used to delete
		// arbitrary records elsewhere in the database.
		if (!['putting_league_events', 'putting_league_entries'].includes(collectionName)) {
			return fail(400, { error: 'Not a valid collection for this action.' });
		}

		try {
			await locals.pb.collection(collectionName).delete(itemId);
		} catch (err) {
			console.error(`Error deleting item from ${collectionName}:`, err);
			let message = 'Failed to delete item.';
			if (collectionName === 'putting_league_events') {
				message = 'Failed to delete event. If it still has entries recorded against it, delete those first.';
			}
			return fail(500, { error: message });
		}

		return { success: true };
	},

	calculatePayouts: async ({ request, locals }) => {
		if (!locals.user) {
			return fail(401, { error: 'User not authenticated.' });
		}

		const formData = await request.formData();
		const eventId = formData.get('eventId')?.toString();

		if (!eventId) {
			return fail(400, { error: 'Missing event ID.' });
		}

		try {
			const paidEntries = await locals.pb.collection('putting_league_entries').getFullList({
				filter: locals.pb.filter('eventId = {:eventId} && paid = true', { eventId })
			});

			const payoutSchedule = await locals.pb.collection('putting_league_payout_schedule').getFullList();

			const results = calculatePayouts(paidEntries, payoutSchedule);

			// Write every paid entry's payout back — including $0 for entries
			// that didn't place, so a re-run after correcting a score properly
			// clears out a stale nonzero payout rather than leaving it stuck.
			for (const [entryId, result] of results) {
				await locals.pb.collection('putting_league_entries').update(entryId, {
					payout: result.payout
				});
			}

			// A dedicated flag on the event — rather than checking whether any
			// entry's payout is non-null — since PocketBase Number fields store
			// unset values as 0, not null, and $0 is also a legitimate real
			// payout (someone who didn't place). Only this flag reliably tells
			// the admin list when to switch from creation order to score order.
			await locals.pb.collection('putting_league_events').update(eventId, {
				payoutsCalculated: true
			});
		} catch (err) {
			console.error('Error calculating putting league payouts:', err);
			return fail(500, { error: 'Failed to calculate payouts.' });
		}

		throw redirect(303, `/admin/putting-league?updated=payouts`);
	},

	// Handles the bonus putt Made/Missed toggle. (Double or nothing is handled
	// separately by setDoubleOrNothing below.)
	setBonusField: async ({ request, locals }) => {
		if (!locals.user) {
			return fail(401, { error: 'User not authenticated.' });
		}

		const formData = await request.formData();
		const entryId = formData.get('entryId')?.toString();
		const field = formData.get('field')?.toString();
		const value = formData.get('value')?.toString() === 'true';

		if (!entryId) {
			return fail(400, { error: 'Missing entry ID.' });
		}
		if (field !== 'bonusPuttMade') {
			return fail(400, { error: 'Invalid bonus field.' });
		}

		try {
			const update = { [field]: value };

			// Missing the bonus putt entirely also clears any double-or-nothing
			// state, so the stored data never ends up inconsistent (e.g. a
			// double-or-nothing result recorded after the bonus putt itself
			// gets marked missed).
			if (field === 'bonusPuttMade' && !value) {
				update.doubleOrNothingAttempted = false;
				update.doubleOrNothingMade = false;
			}

			await locals.pb.collection('putting_league_entries').update(entryId, update);
		} catch (err) {
			console.error('Error updating bonus field:', err);
			return fail(500, { error: 'Failed to record bonus putt result.' });
		}

		return { success: true };
	},

	// Double or nothing is a single decision with three outcomes, so it's
	// handled as one action rather than two separate booleans — avoids the
	// intermediate "did they attempt it?" step and lets one button press
	// record the full result.
	setDoubleOrNothing: async ({ request, locals }) => {
		if (!locals.user) {
			return fail(401, { error: 'User not authenticated.' });
		}

		const formData = await request.formData();
		const entryId = formData.get('entryId')?.toString();
		const result = formData.get('result')?.toString(); // 'none' | 'made' | 'missed'

		if (!entryId) {
			return fail(400, { error: 'Missing entry ID.' });
		}
		if (!['none', 'made', 'missed'].includes(result)) {
			return fail(400, { error: 'Invalid double or nothing result.' });
		}

		const update =
			result === 'none'
				? { doubleOrNothingAttempted: false, doubleOrNothingMade: false }
				: result === 'made'
					? { doubleOrNothingAttempted: true, doubleOrNothingMade: true }
					: { doubleOrNothingAttempted: true, doubleOrNothingMade: false };

		try {
			await locals.pb.collection('putting_league_entries').update(entryId, update);
		} catch (err) {
			console.error('Error updating double or nothing result:', err);
			return fail(500, { error: 'Failed to record double or nothing result.' });
		}

		return { success: true };
	}
};