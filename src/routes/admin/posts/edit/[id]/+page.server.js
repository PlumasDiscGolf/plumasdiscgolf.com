// src/routes/admin/posts/edit/[id]/+page.server.js
import { error, fail, redirect } from '@sveltejs/kit';
import { formatInputDateToPocketBase } from '$lib/utils.js';

export const load = async ({ locals, params }) => {
	// No auth check needed here — the shared +layout.server.js already guards
	// the entire /admin route tree before this load runs.
	try {
		const post = await locals.pb.collection('posts').getOne(params.id);
		return {
			post: JSON.parse(JSON.stringify(post))
		};
	} catch (err) {
		console.error('Error loading post for editing:', err);
		if (err.status === 404) throw error(404, 'Post not found');
		throw error(500, 'Failed to load post data.');
	}
};

export const actions = {
	updatePost: async ({ request, locals, params }) => {
		if (!locals.user) return fail(401, { error: 'User not authenticated.' });
		if (!params.id) return fail(400, { error: 'Post ID is missing.' });

		const formData = await request.formData();
		const title = formData.get('title')?.toString();
		const content = formData.get('content')?.toString() || '';
		const published = formData.get('published') === 'on';
		const publishedDateStr = formData.get('publishedDate')?.toString();
		const categories = formData.getAll('categories').map((c) => c.toString());

		const fieldErrors = {};
		if (!title) fieldErrors.title = 'Title is required.';

		const currentValues = { title, content, published, publishedDate: publishedDateStr, categories };

		if (Object.keys(fieldErrors).length > 0) {
			return fail(400, { ...currentValues, fieldErrors, error: 'Please correct the errors.' });
		}

		try {
			await locals.pb.collection('posts').update(params.id, {
				title,
				content,
				published,
				publishedDate: publishedDateStr ? formatInputDateToPocketBase(publishedDateStr) : '',
				categories
			});
		} catch (err) {
			console.error('Error updating post:', err.response || err.originalError || err);
			let errorMessage = 'Failed to update post.';
			if (err.data?.data) {
				errorMessage += ` Details: ${JSON.stringify(err.data.data)}`;
			}
			return fail(500, { ...currentValues, error: errorMessage });
		}

		throw redirect(303, '/admin/posts?updated=post');
	}
};