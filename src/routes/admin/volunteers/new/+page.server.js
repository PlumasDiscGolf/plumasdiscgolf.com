// src/routes/admin/volunteers/new/+page.server.js
import { fail, redirect } from '@sveltejs/kit';
import { formatInputDateToPocketBase } from '$lib/utils.js';

export const load = async () => {
	// No auth check needed here — the shared +layout.server.js already guards
	// the entire /admin route tree before this load runs.
	return {}; // No data to preload for a new volunteer form
};

export const actions = {
	createVolunteer: async ({ request, locals }) => {
		if (!locals.user) {
			return fail(401, { error: 'User not authenticated.' });
		}

		const formData = await request.formData();
		const name = formData.get('name')?.toString();
		const task = formData.get('task')?.toString() || ''; // Event/Task
		const volunteerDateStr = formData.get('volunteerDate')?.toString();

		// Server-side validation
		const fieldErrors = {};
		if (!name) fieldErrors.name = 'Volunteer Name is required.';
		if (!volunteerDateStr) fieldErrors.volunteerDate = 'Date is required.';

		const formattedVolunteerDate = formatInputDateToPocketBase(volunteerDateStr);
		if (!formattedVolunteerDate && volunteerDateStr) {
			fieldErrors.volunteerDate = 'The date is invalid.';
		}

		const currentValues = {
			name,
			task,
			volunteerDate: volunteerDateStr
		};

		if (Object.keys(fieldErrors).length > 0) {
			return fail(400, { ...currentValues, fieldErrors, error: 'Please correct the errors.' });
		}

		const dataToSave = {
			name,
			task,
			date: formattedVolunteerDate
		};

		try {
			// NOTE: Make sure your PocketBase collection is named 'volunteers'
			await locals.pb.collection('volunteers').create(dataToSave);
		} catch (err) {
			console.error('Error creating volunteer record:', err.response || err.originalError || err);
			let errorMessage = 'Failed to create volunteer record.';
			if (err.data?.data) {
				errorMessage += ` Details: ${JSON.stringify(err.data.data)}`;
			}
			return fail(500, { ...currentValues, error: errorMessage });
		}

		// Redirect to the new dedicated Volunteers page (was /admin#volunteers)
		throw redirect(303, '/admin/volunteers?created=volunteer');
	}
};