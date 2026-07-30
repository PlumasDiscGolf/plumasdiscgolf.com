// src/routes/admin/memberships/+page.server.js
import { fail, redirect } from '@sveltejs/kit';

export const load = async ({ locals }) => {
	// No auth check needed here — the shared +layout.server.js already guards
	// the entire /admin route tree before this load runs.
	const memberships = await locals.pb.collection('memberships').getFullList({
		sort: '-season,-created',
		expand: 'memberId,membershipTypeId'
	});
	return { memberships };
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
			await locals.pb.collection('memberships').delete(itemId);
		} catch (err) {
			console.error('Error deleting membership:', err);
			return fail(500, { error: 'Failed to delete membership.' });
		}

		throw redirect(303, '/admin/memberships?deleted=membership');
	}
};