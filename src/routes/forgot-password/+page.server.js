import { fail, redirect } from '@sveltejs/kit';

export const load = async ({ locals }) => {
	if (locals.user) {
		throw redirect(303, '/admin');
	}
	return {};
};

export const actions = {
	default: async ({ request, locals }) => {
		const formData = await request.formData();
		const email = formData.get('email')?.toString() || '';

		if (!email) {
			return fail(400, { email, error: 'Email is required.' });
		}

		try {
			await locals.pb.collection('users').requestPasswordReset(email);
		} catch (err) {
			// PocketBase's requestPasswordReset resolves successfully even when the
			// email doesn't match a user, specifically to avoid leaking which
			// emails are registered. A thrown error here is almost always a
			// server/network problem — log it, but still show the same generic
			// success message so we never confirm/deny an email's existence.
			console.error('[FORGOT PASSWORD] requestPasswordReset error:', err);
		}

		return { success: true, email };
	}
};