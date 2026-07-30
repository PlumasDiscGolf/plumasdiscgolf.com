// src/routes/admin/events/+page.server.js
import { fail, redirect } from '@sveltejs/kit';

export const load = async ({ locals }) => {
	// No auth check needed here — the shared +layout.server.js already guards
	// the entire /admin route tree before this load runs.
	const events = await locals.pb.collection('events').getFullList({ sort: '-endDateTime', expand: 'location' });
	return { events };
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
			await locals.pb.collection('events').delete(itemId);
		} catch (err) {
			console.error('Error deleting event:', err);
			return fail(500, { error: 'Failed to delete event.' });
		}

		throw redirect(303, '/admin/events?deleted=event');
	}
};