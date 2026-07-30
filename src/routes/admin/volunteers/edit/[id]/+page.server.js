// src/routes/admin/volunteers/edit/[id]/+page.server.js
import { error, fail, redirect } from '@sveltejs/kit';
import { formatInputDateToPocketBase } from '$lib/utils.js';

export const load = async ({ locals, params }) => {
	if (!locals.user) {
		throw redirect(303, '/login');
	}
	try {
		// NOTE: Make sure your PocketBase collection is named 'volunteers'
		const volunteer = await locals.pb.collection('volunteers').getOne(params.id);
		return {
			volunteer: JSON.parse(JSON.stringify(volunteer))
		};
	} catch (err) {
		console.error('Error loading volunteer for editing:', err);
		if (err.status === 404) {
			throw error(404, 'Volunteer record not found');
		}
		throw error(500, 'Failed to load volunteer data.');
	}
};

export const actions = {
	updateVolunteer: async ({ request, locals, params }) => {
		if (!locals.user) {
			return fail(401, { error: 'User not authenticated.' });
		}
		if (!params.id) {
			return fail(400, { error: 'Volunteer ID is missing.' });
		}

		const formData = await request.formData();
		const name = formData.get('name')?.toString();
		const task = formData.get('task')?.toString() || '';
		const volunteerDateStr = formData.get('volunteerDate')?.toString();

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

		const dataToUpdate = {
			name,
			task,
			date: formattedVolunteerDate
		};

		try {
			await locals.pb.collection('volunteers').update(params.id, dataToUpdate);
		} catch (err) {
			console.error('Error updating volunteer record:', err.response || err.originalError || err);
			let errorMessage = 'Failed to update volunteer record.';
			if (err.data?.data) {
				errorMessage += ` Details: ${JSON.stringify(err.data.data)}`;
			}
			return fail(500, { ...currentValues, error: errorMessage });
		}
		throw redirect(303, '/admin/volunteers');
	}
};
