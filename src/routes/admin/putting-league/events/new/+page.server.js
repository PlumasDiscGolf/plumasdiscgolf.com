// src/routes/admin/putting-league/events/new/+page.server.js
import { fail, redirect } from '@sveltejs/kit';
import { formatInputDateToPocketBase } from '$lib/utils.js';

export const load = async ({ locals }) => {
	// No auth check needed here — the shared /admin +layout.server.js already
	// guards the entire route tree before this load runs.
	const locations = await locals.pb.collection('locations').getFullList({ sort: 'name' });
	return { locations };
};

export const actions = {
	createEvent: async ({ request, locals }) => {
		if (!locals.user) {
			return fail(401, { error: 'User not authenticated.' });
		}

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

		let createdEvent;
		try {
			createdEvent = await locals.pb.collection('putting_league_events').create({
				date: formatInputDateToPocketBase(date),
				locationId: locationId || null,
				entryFee: entryFeeNum,
				payoutPortion: payoutPortionNum,
				notes
			});
		} catch (err) {
			console.error('Error creating putting league event:', err.response || err.originalError || err);
			let errorMessage = 'Failed to create event.';
			if (err.data?.data) {
				errorMessage += ` Details: ${JSON.stringify(err.data.data)}`;
			}
			return fail(500, { ...currentValues, error: errorMessage });
		}

		// Pass the new event's id through so the admin list can expand it by
		// default — every other (pre-existing) event still defaults to
		// collapsed, but a freshly created one is presumably about to have
		// players added to it, so it shouldn't start hidden.
		throw redirect(303, `/admin/putting-league?created=event&eventId=${createdEvent.id}`);
	}
};