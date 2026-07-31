import { fail, redirect } from '@sveltejs/kit';

export const load = async ({ locals, url }) => {
	if (locals.user) {
		throw redirect(303, '/admin');
	}
	const token = url.searchParams.get('token') || '';
	return { token };
};

export const actions = {
	default: async ({ request, locals }) => {
		const formData = await request.formData();
		const token = formData.get('token')?.toString() || '';
		const password = formData.get('password')?.toString() || '';
		const passwordConfirm = formData.get('passwordConfirm')?.toString() || '';

		if (!token) {
			return fail(400, { error: 'This reset link is missing its token. Please request a new one.' });
		}
		if (!password || !passwordConfirm) {
			return fail(400, { token, error: 'Please fill out both password fields.' });
		}
		if (password !== passwordConfirm) {
			return fail(400, { token, error: 'Passwords do not match.' });
		}
		if (password.length < 8) {
			return fail(400, { token, error: 'Password must be at least 8 characters.' });
		}

		try {
			await locals.pb.collection('users').confirmPasswordReset(token, password, passwordConfirm);
		} catch (err) {
			console.error('[RESET PASSWORD] confirmPasswordReset error:', err);
			return fail(400, { token, error: 'This reset link is invalid or has expired. Please request a new one.' });
		}

		throw redirect(303, '/login?resetSuccess=true');
	}
};