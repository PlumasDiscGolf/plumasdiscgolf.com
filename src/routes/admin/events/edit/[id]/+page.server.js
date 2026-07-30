// src/routes/admin/events/edit/[id]/+page.server.js
import { error, fail, redirect } from '@sveltejs/kit';
import { formatInputDateToPocketBase } from '$lib/utils.js';

export const load = async ({ locals, params }) => {
	// No auth check needed here — the shared +layout.server.js already guards
	// the entire /admin route tree before this load runs.
	try {
		const event = await locals.pb.collection('events').getOne(params.id);
		// NOTE: assuming the `locations` collection has a `name` field for display —
		// its own schema wasn't available when this was built. Adjust if wrong.
		const locations = await locals.pb.collection('locations').getFullList({ sort: 'name' });
		return {
			event: JSON.parse(JSON.stringify(event)),
			locations
		};
	} catch (err) {
		console.error('Error loading event for editing:', err);
		if (err.status === 404) throw error(404, 'Event not found');
		throw error(500, 'Failed to load event data.');
	}
};

export const actions = {
	updateEvent: async ({ request, locals, params }) => {
		if (!locals.user) return fail(401, { error: 'User not authenticated.' });
		if (!params.id) return fail(400, { error: 'Event ID is missing.' });

		const formData = await request.formData();
		const name = formData.get('name')?.toString();
		const description = formData.get('description')?.toString() || '';
		const startDateTimeStr = formData.get('startDateTime')?.toString();
		const endDateTimeStr = formData.get('endDateTime')?.toString();
		const checkInTimeStr = formData.get('checkInTime')?.toString();
		const location = formData.get('location')?.toString() || '';
		const eventType = formData.get('eventType')?.toString() || '';
		const eventImage = formData.get('eventImage');
		const bannerImage = formData.get('bannerImage');
		const deleteExistingEventImage = formData.get('deleteExistingEventImage') === 'true';
		const deleteExistingBannerImage = formData.get('deleteExistingBannerImage') === 'true';
		const registrationURL = formData.get('registrationURL')?.toString() || '';
		const pdgaURL = formData.get('pdgaURL')?.toString() || '';
		const discGolfSceneURL = formData.get('discGolfSceneURL')?.toString() || '';
		const eventInfoURL = formData.get('eventInfoURL')?.toString() || '';
		const resultsURL = formData.get('resultsURL')?.toString() || '';
		const registrationRequired = formData.get('registrationRequired') === 'on';
		const registrationDeadlineStr = formData.get('registrationDeadline')?.toString();
		const cost = formData.get('cost')?.toString() || '';
		const onlineRegistration = formData.get('onlineRegistration') === 'on';
		const onsiteRegistration = formData.get('onsiteRegistration') === 'on';
		const lateRegistration = formData.get('lateRegistration') === 'on';
		const lateFee = formData.get('lateFee')?.toString() || '';

		const fieldErrors = {};
		if (!name) fieldErrors.name = 'Name is required.';

		const currentValues = {
			name,
			description,
			startDateTime: startDateTimeStr,
			endDateTime: endDateTimeStr,
			checkInTime: checkInTimeStr,
			location,
			eventType,
			registrationURL,
			pdgaURL,
			discGolfSceneURL,
			eventInfoURL,
			resultsURL,
			registrationRequired,
			registrationDeadline: registrationDeadlineStr,
			cost,
			onlineRegistration,
			onsiteRegistration,
			lateRegistration,
			lateFee
		};

		if (Object.keys(fieldErrors).length > 0) {
			return fail(400, { ...currentValues, fieldErrors, error: 'Please correct the errors.' });
		}

		const dataToUpdate = new FormData();
		dataToUpdate.append('name', name);
		dataToUpdate.append('description', description);
		dataToUpdate.append('startDateTime', startDateTimeStr ? formatInputDateToPocketBase(startDateTimeStr) : '');
		dataToUpdate.append('endDateTime', endDateTimeStr ? formatInputDateToPocketBase(endDateTimeStr) : '');
		dataToUpdate.append('checkInTime', checkInTimeStr ? formatInputDateToPocketBase(checkInTimeStr) : '');
		// Clear existing selection before re-adding — relation (multi) fields
		// otherwise append to the existing array rather than replace it.
		dataToUpdate.append('location', location); // single value, or '' to clear
		dataToUpdate.append('eventType', eventType);
		dataToUpdate.append('registrationURL', registrationURL);
		dataToUpdate.append('pdgaURL', pdgaURL);
		dataToUpdate.append('discGolfSceneURL', discGolfSceneURL);
		dataToUpdate.append('eventInfoURL', eventInfoURL);
		dataToUpdate.append('resultsURL', resultsURL);
		dataToUpdate.append('registrationRequired', registrationRequired);
		dataToUpdate.append('registrationDeadline', registrationDeadlineStr ? formatInputDateToPocketBase(registrationDeadlineStr) : '');
		dataToUpdate.append('cost', cost);
		dataToUpdate.append('onlineRegistration', onlineRegistration);
		dataToUpdate.append('onsiteRegistration', onsiteRegistration);
		dataToUpdate.append('lateRegistration', lateRegistration);
		dataToUpdate.append('lateFee', lateFee);

		if (eventImage && eventImage.size > 0) {
			dataToUpdate.append('eventImage', eventImage);
		} else if (deleteExistingEventImage) {
			dataToUpdate.append('eventImage', ''); // Empty string deletes the file — null gets stringified to "null" by FormData and rejected
		}
		if (bannerImage && bannerImage.size > 0) {
			dataToUpdate.append('bannerImage', bannerImage);
		} else if (deleteExistingBannerImage) {
			dataToUpdate.append('bannerImage', ''); // Same fix as eventImage above
		}

		try {
			await locals.pb.collection('events').update(params.id, dataToUpdate);
		} catch (err) {
			console.error('Error updating event:', err.response || err.originalError || err);
			let errorMessage = 'Failed to update event.';
			if (err.data?.data) {
				errorMessage += ` Details: ${JSON.stringify(err.data.data)}`;
			}
			return fail(500, { ...currentValues, error: errorMessage });
		}

		throw redirect(303, '/admin/events?updated=event');
	}
};