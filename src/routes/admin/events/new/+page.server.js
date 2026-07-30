// src/routes/admin/events/new/+page.server.js
import { fail, redirect } from '@sveltejs/kit';
import { formatInputDateToPocketBase } from '$lib/utils.js';

export const load = async ({ locals }) => {
	// No auth check needed here — the shared +layout.server.js already guards
	// the entire /admin route tree before this load runs.
	// NOTE: assuming the `locations` collection has a `name` field for display —
	// its own schema wasn't available when this was built. Adjust if wrong.
	const locations = await locals.pb.collection('locations').getFullList({ sort: 'name' });
	return { locations };
};

const EVENT_TYPE_OPTIONS = ['League', 'Tournament', 'Series', 'Outreach', 'Clinic'];

export const actions = {
	createEvent: async ({ request, locals }) => {
		if (!locals.user) {
			return fail(401, { error: 'User not authenticated.' });
		}

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

		// Only `name` is enforced here — nothing in the actual PocketBase
		// schema is marked required except the system id.
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

		const dataToSave = new FormData(); // FormData needed since this collection has file fields
		dataToSave.append('name', name);
		dataToSave.append('description', description);
		if (startDateTimeStr) dataToSave.append('startDateTime', formatInputDateToPocketBase(startDateTimeStr));
		if (endDateTimeStr) dataToSave.append('endDateTime', formatInputDateToPocketBase(endDateTimeStr));
		if (checkInTimeStr) dataToSave.append('checkInTime', formatInputDateToPocketBase(checkInTimeStr));
		if (location) dataToSave.append('location', location);
		if (eventType) dataToSave.append('eventType', eventType);
		if (eventImage && eventImage.size > 0) dataToSave.append('eventImage', eventImage);
		if (bannerImage && bannerImage.size > 0) dataToSave.append('bannerImage', bannerImage);
		dataToSave.append('registrationURL', registrationURL);
		dataToSave.append('pdgaURL', pdgaURL);
		dataToSave.append('discGolfSceneURL', discGolfSceneURL);
		dataToSave.append('eventInfoURL', eventInfoURL);
		dataToSave.append('resultsURL', resultsURL);
		dataToSave.append('registrationRequired', registrationRequired);
		if (registrationDeadlineStr) dataToSave.append('registrationDeadline', formatInputDateToPocketBase(registrationDeadlineStr));
		dataToSave.append('cost', cost);
		dataToSave.append('onlineRegistration', onlineRegistration);
		dataToSave.append('onsiteRegistration', onsiteRegistration);
		dataToSave.append('lateRegistration', lateRegistration);
		dataToSave.append('lateFee', lateFee);

		try {
			await locals.pb.collection('events').create(dataToSave);
		} catch (err) {
			console.error('Error creating event:', err.response || err.originalError || err);
			let errorMessage = 'Failed to create event.';
			if (err.data?.data) {
				errorMessage += ` Details: ${JSON.stringify(err.data.data)}`;
			}
			return fail(500, { ...currentValues, error: errorMessage });
		}

		throw redirect(303, '/admin/events?created=event');
	}
};