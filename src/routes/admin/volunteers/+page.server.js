// src/routes/admin/volunteers/+page.server.js
import { fail, redirect } from '@sveltejs/kit';

export const load = async ({ locals }) => {
	// No auth check needed here — the shared +layout.server.js already guards
	// the entire /admin route tree before this load runs.
	const volunteers = await locals.pb.collection('volunteers').getFullList({ sort: '-date' });
	return { volunteers };
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
			await locals.pb.collection('volunteers').delete(itemId);
		} catch (err) {
			console.error('Error deleting volunteer record:', err);
			return fail(500, { error: 'Failed to delete volunteer record.' });
		}

		// New convention: redirect with a query param the shared layout's
		// banner picks up, rather than the old {success:true}/invalidateAll()
		// pattern (which existed to preserve the active hash tab — no longer
		// needed now that this is its own real page).
		throw redirect(303, '/admin/volunteers?deleted=volunteer');
	}
};