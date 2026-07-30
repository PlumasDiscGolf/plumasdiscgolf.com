// src/routes/admin/posts/new/+page.server.js
import { fail, redirect } from '@sveltejs/kit';
import { formatInputDateToPocketBase } from '$lib/utils.js';

export const load = async () => {
	// No auth check needed here — the shared +layout.server.js already guards
	// the entire /admin route tree before this load runs.
	return {};
};

export const actions = {
	createPost: async ({ request, locals }) => {
		if (!locals.user) {
			return fail(401, { error: 'User not authenticated.' });
		}

		const formData = await request.formData();
		const title = formData.get('title')?.toString();
		const content = formData.get('content')?.toString() || '';
		const published = formData.get('published') === 'on';
		const publishedDateStr = formData.get('publishedDate')?.toString();
		const categories = formData.getAll('categories').map((c) => c.toString());

		// Only `title` is enforced here — nothing in the actual PocketBase
		// schema is marked required except the system id, but a titleless
		// post isn't useful in practice.
		const fieldErrors = {};
		if (!title) fieldErrors.title = 'Title is required.';

		const currentValues = { title, content, published, publishedDate: publishedDateStr, categories };

		if (Object.keys(fieldErrors).length > 0) {
			return fail(400, { ...currentValues, fieldErrors, error: 'Please correct the errors.' });
		}

		try {
			await locals.pb.collection('posts').create({
				title,
				content,
				published,
				publishedDate: publishedDateStr ? formatInputDateToPocketBase(publishedDateStr) : '',
				categories
			});
		} catch (err) {
			console.error('Error creating post:', err.response || err.originalError || err);
			let errorMessage = 'Failed to create post.';
			if (err.data?.data) {
				errorMessage += ` Details: ${JSON.stringify(err.data.data)}`;
			}
			return fail(500, { ...currentValues, error: errorMessage });
		}

		throw redirect(303, '/admin/posts?created=post');
	}
};