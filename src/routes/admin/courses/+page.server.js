// src/routes/admin/courses/+page.server.js
import { fail, redirect } from '@sveltejs/kit';

export const load = async ({ locals }) => {
	// No auth check needed here — the shared +layout.server.js already guards
	// the entire /admin route tree before this load runs.
	const courses = await locals.pb.collection('courses').getFullList({ sort: 'name' });
	return { courses };
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
			await locals.pb.collection('courses').delete(itemId);
		} catch (err) {
			console.error('Error deleting course:', err);
			return fail(500, { error: 'Failed to delete course.' });
		}

		throw redirect(303, '/admin/courses?deleted=course');
	}
};