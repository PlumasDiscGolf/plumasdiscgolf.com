// src/routes/admin/putting-league/events/edit/[id]/+page.server.js
import { error, fail, redirect } from '@sveltejs/kit';
import { formatInputDateToPocketBase, formatPocketBaseDateToDateInput } from '$lib/utils.js';

export const load = async ({ locals, params }) => {
	// No auth check needed here — the shared /admin +layout.server.js already
	// guards the entire route tree before this load runs.
	try {
		const event = await locals.pb.collection('putting_league_events').getOne(params.id);
		const locations = await locals.pb.collection('locations').getFullList({ sort: 'name' });
		const entryCount = await locals.pb.collection('putting_league_entries').getList(1, 1, {
			filter: locals.pb.filter('eventId = {:eventId}', { eventId: params.id })
		});

		return {
			event: JSON.parse(JSON.stringify(event)),
			locations,
			hasEntries: entryCount.totalItems > 0
		};
	} catch (err) {
		console.error('Error loading putting league event for editing:', err);
		if (err.status === 404) throw error(404, 'Event not found');
		throw error(500, 'Failed to load event data.');
	}
};

export const actions = {
	updateEvent: async ({ request, locals, params }) => {
		if (!locals.user) return fail(401, { error: 'User not authenticated.' });
		if (!params.id) return fail(400, { error: 'Event ID is missing.' });

		const formData = await request.formData();
		const date = formData.get('date')?.toString();
		const locationId = formData.get('locationId')?.toString() || '';
		const entryFee = formData.get('entryFee')?.toString();
		const payoutPortion = formData.get('payoutPortion')?.toString();
		const notes = formData.get('notes')?.toString() || '';

		const currentValues = { date, locationId, entryFee, payoutPortion, notes };

		const fieldErrors = {};
		if (!date) fieldErrors.date = 'Date is required.';

		const entryFeeNum = Number(entryFee);
		if (!entryFee || Number.isNaN(entryFeeNum) || entryFeeNum <= 0) {
			fieldErrors.entryFee = 'Entry Fee must be a positive number.';
		}

		const payoutPortionNum = Number(payoutPortion);
		if (!payoutPortion || Number.isNaN(payoutPortionNum) || payoutPortionNum <= 0) {
			fieldErrors.payoutPortion = 'Payout Portion must be a positive number.';
		}
		if (!fieldErrors.entryFee && !fieldErrors.payoutPortion && payoutPortionNum > entryFeeNum) {
			fieldErrors.payoutPortion = "Payout Portion can't be more than the Entry Fee.";
		}

		if (Object.keys(fieldErrors).length > 0) {
			return fail(400, { ...currentValues, fieldErrors, error: 'Please correct the errors.' });
		}

		try {
			await locals.pb.collection('putting_league_events').update(params.id, {
				date: formatInputDateToPocketBase(date),
				locationId: locationId || null,
				entryFee: entryFeeNum,
				payoutPortion: payoutPortionNum,
				notes
			});
		} catch (err) {
			console.error('Error updating putting league event:', err.response || err.originalError || err);
			let errorMessage = 'Failed to update event.';
			if (err.data?.data) {
				errorMessage += ` Details: ${JSON.stringify(err.data.data)}`;
			}
			return fail(500, { ...currentValues, error: errorMessage });
		}

		throw redirect(303, `/admin/putting-league?updated=event`);
	}
};