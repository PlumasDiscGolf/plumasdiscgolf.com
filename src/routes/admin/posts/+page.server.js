// src/routes/admin/posts/+page.server.js
import { fail, redirect } from '@sveltejs/kit';

export const load = async ({ locals }) => {
	// No auth check needed here — the shared +layout.server.js already guards
	// the entire /admin route tree before this load runs.
	const posts = await locals.pb.collection('posts').getFullList({ sort: '-publishedDate' });
	return { posts };
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
			await locals.pb.collection('posts').delete(itemId);
		} catch (err) {
			console.error('Error deleting post:', err);
			return fail(500, { error: 'Failed to delete post.' });
		}

		throw redirect(303, '/admin/posts?deleted=post');
	}
};