// src/routes/admin/members/new/+page.server.js
import { fail, redirect } from '@sveltejs/kit';

export const load = async ({ locals }) => {
	// No auth check needed here — the shared +layout.server.js already guards
	// the entire /admin route tree before this load runs.
	// Loaded so the form can warn (client-side) about a likely duplicate name
	// before submitting — not a hard uniqueness constraint, just a heads-up,
	// since two real people can share a name.
	const members = await locals.pb.collection('members').getFullList({ sort: 'firstName,lastName' });
	return { members };
};

export const actions = {
	createMember: async ({ request, locals }) => {
		if (!locals.user) {
			return fail(401, { error: 'User not authenticated.' });
		}

		const formData = await request.formData();
		const firstName = formData.get('firstName')?.toString();
		const lastName = formData.get('lastName')?.toString();
		const nickname = formData.get('nickname')?.toString() || '';
		const email = formData.get('email')?.toString() || '';
		const phone = formData.get('phone')?.toString() || '';
		const consentEmail = formData.get('consentEmail') === 'on';
		const consentSms = formData.get('consentSms') === 'on';
		const notes = formData.get('notes')?.toString() || '';

		const fieldErrors = {};
		if (!firstName) fieldErrors.firstName = 'First Name is required.';
		if (!lastName) fieldErrors.lastName = 'Last Name is required.';

		const currentValues = { firstName, lastName, nickname, email, phone, consentEmail, consentSms, notes };

		if (Object.keys(fieldErrors).length > 0) {
			return fail(400, { ...currentValues, fieldErrors, error: 'Please correct the errors.' });
		}

		try {
			await locals.pb.collection('members').create({
				firstName,
				lastName,
				nickname,
				email,
				phone,
				consentEmail,
				consentSms,
				notes
			});
		} catch (err) {
			console.error('Error creating member:', err.response || err.originalError || err);
			let errorMessage = 'Failed to create member.';
			if (err.data?.data) {
				errorMessage += ` Details: ${JSON.stringify(err.data.data)}`;
			}
			return fail(500, { ...currentValues, error: errorMessage });
		}

		throw redirect(303, '/admin/members?created=member');
	}
};