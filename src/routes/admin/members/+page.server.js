// src/routes/admin/members/+page.server.js
import { fail, redirect } from '@sveltejs/kit';

export const load = async ({ locals }) => {
	// No auth check needed here — the shared +layout.server.js already guards
	// the entire /admin route tree before this load runs.
	const members = await locals.pb.collection('members').getFullList({ sort: 'firstName,lastName' });
	return { members };
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
			await locals.pb.collection('members').delete(itemId);
		} catch (err) {
			console.error('Error deleting member:', err);
			let errorMessage = 'Failed to delete member.';
			// A member may be referenced by memberships/payments/waivers/bag_tag_assignments —
			// PocketBase will refuse the delete if relations point at it, rather than
			// silently orphaning those records.
			if (err.data?.data) {
				errorMessage += ' This member may still be referenced by a membership, payment, waiver, or bag tag assignment.';
			}
			return fail(500, { error: errorMessage });
		}

		throw redirect(303, '/admin/members?deleted=member');
	}
};