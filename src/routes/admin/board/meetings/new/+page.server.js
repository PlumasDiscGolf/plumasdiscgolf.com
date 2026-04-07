// src/routes/admin/board/meetings/new/+page.server.js
import { fail, redirect } from '@sveltejs/kit';
import { formatInputDateToPocketBase } from '$lib/utils.js';

export const load = async ({ locals }) => {
	if (!locals.user) {
		throw redirect(303, '/login');
	}
	return {};
};

export const actions = {
	createBoardMeeting: async ({ request, locals }) => {
		if (!locals.user) {
			return fail(401, { error: 'User not authenticated.' });
		}

		const formData = await request.formData(); // This will handle multipart/form-data

		const meetingDateTimeStr = formData.get('meetingDateTime')?.toString();
		const agendaFile = formData.get('agendaFile'); // File object or null
		const minutesFile = formData.get('minutesFile'); // File object or null

		const fieldErrors = {};
		if (!meetingDateTimeStr) fieldErrors.meetingDateTime = 'Meeting Date & Time is required.';

		const formattedMeetingDateTime = formatInputDateToPocketBase(meetingDateTimeStr);
		if (!formattedMeetingDateTime && meetingDateTimeStr) {
			fieldErrors.meetingDateTime = 'Meeting Date & Time is invalid.';
		}

		// Keep track of submitted values for prefilling on error
		const currentValues = {
			meetingDateTime: meetingDateTimeStr
			// Don't return file objects back, just indicate they were there perhaps
		};

		if (Object.keys(fieldErrors).length > 0) {
			return fail(400, { ...currentValues, fieldErrors, error: 'Please correct the errors.' });
		}

		// We are already using formData, so we can append to it or create a new one if preferred
		// For this case, it's simpler to just pass the received formData if fields match collection
		// Or, build a new one to be explicit about what's sent:
		const dataToSave = new FormData();
		dataToSave.append('meetingDateTime', formattedMeetingDateTime);

		if (agendaFile && agendaFile.size > 0) {
			dataToSave.append('agendaFile', agendaFile); // Make sure 'agendaFile' is field name in PB
		}
		if (minutesFile && minutesFile.size > 0) {
			dataToSave.append('minutesFile', minutesFile); // Make sure 'minutesFile' is field name in PB
		}

		try {
			await locals.pb.collection('board_meetings').create(dataToSave);
		} catch (err) {
			console.error('Error creating board meeting:', err.response || err.originalError || err);
			let errorMessage = 'Failed to create board meeting.';
			if (err.data?.data) {
				errorMessage += ` Details: ${JSON.stringify(err.data.data)}`;
			} else if (err.message) {
				errorMessage += ` ${err.message}`;
			}
			return fail(500, { ...currentValues, error: errorMessage });
		}

		throw redirect(303, '/admin#boardMeetings');
	}
};
