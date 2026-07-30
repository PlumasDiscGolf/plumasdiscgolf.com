// src/routes/admin/board/meetings/+page.server.js
import { fail, redirect } from '@sveltejs/kit';

export const load = async ({ locals }) => {
	// No auth check needed here — the shared +layout.server.js already guards
	// the entire /admin route tree before this load runs.
	const boardMeetings = await locals.pb.collection('board_meetings').getFullList({ sort: '-meetingDateTime' });
	return { boardMeetings };
};

export const actions = {
	delete: async ({ request, locals }) => {
		if (!locals.user) {
			return fail(401, { error: 'User not authenticated.' });
		}

		const formData = await request.formData();
		const itemId = formData.get('itemId')?.toString();

		if (!itemId) {
			return fail(400, { error: 'Missing item ID for deletion.' });
		}

		try {
			await locals.pb.collection('board_meetings').delete(itemId);
		} catch (err) {
			console.error('Error deleting board meeting:', err);
			return fail(500, { error: 'Failed to delete board meeting.' });
		}

		throw redirect(303, '/admin/board/meetings?deleted=meeting');
	}
};