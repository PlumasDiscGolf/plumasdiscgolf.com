// src/routes/admin/locations/+page.server.js
import { fail, redirect } from '@sveltejs/kit';

export const load = async ({ locals }) => {
	// No auth check needed here — the shared +layout.server.js already guards
	// the entire /admin route tree before this load runs.
	const locations = await locals.pb.collection('locations').getFullList({
		sort: 'name',
		expand: 'course'
	});
	return { locations };
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
			await locals.pb.collection('locations').delete(itemId);
		} catch (err) {
			console.error('Error deleting location:', err);
			let errorMessage = 'Failed to delete location.';
			// A location may be referenced by an event's `location` relation —
			// PocketBase will refuse the delete if events still point at it,
			// rather than silently orphaning those references.
			if (err.data?.data) {
				errorMessage += ' This location may still be referenced by an event.';
			}
			return fail(500, { error: errorMessage });
		}

		throw redirect(303, '/admin/locations?deleted=location');
	}
};