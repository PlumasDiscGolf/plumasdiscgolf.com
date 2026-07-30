// src/routes/admin/+layout.server.js
import { redirect } from '@sveltejs/kit';

export const load = async ({ locals }) => {
	// Protect the ENTIRE /admin route tree here, once — individual section
	// load functions no longer need their own redundant `if (!locals.user)` check.
	if (!locals.user) {
		throw redirect(303, '/login');
	}
	return { user: locals.user };
};