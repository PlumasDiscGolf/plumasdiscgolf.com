// src/routes/admin/waivers/+page.server.js
import { fail, redirect } from '@sveltejs/kit';

export const load = async ({ locals }) => {
	// No auth check needed here — the shared +layout.server.js already guards
	// the entire /admin route tree before this load runs.
	const waivers = await locals.pb.collection('waiver_signatures').getFullList({
		sort: '-signedAt',
		// Nested expand: membershipId.memberId gets us the member's name
		// without a second round of lookups; waiverTemplateId gets the
		// template's name/season for display.
		expand: 'membershipId.memberId,waiverTemplateId'
	});
	return { waivers };
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
			await locals.pb.collection('waiver_signatures').delete(itemId);
		} catch (err) {
			console.error('Error deleting waiver signature:', err);
			return fail(500, { error: 'Failed to delete waiver signature.' });
		}

		throw redirect(303, '/admin/waivers?deleted=waiver signature');
	}
};