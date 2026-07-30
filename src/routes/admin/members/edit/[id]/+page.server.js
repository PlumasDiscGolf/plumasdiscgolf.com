// src/routes/admin/members/edit/[id]/+page.server.js
import { error, fail, redirect } from '@sveltejs/kit';

export const load = async ({ locals, params }) => {
	// No auth check needed here — the shared +layout.server.js already guards
	// the entire /admin route tree before this load runs.
	try {
		const member = await locals.pb.collection('members').getOne(params.id);
		return {
			member: JSON.parse(JSON.stringify(member))
		};
	} catch (err) {
		console.error('Error loading member for editing:', err);
		if (err.status === 404) throw error(404, 'Member not found');
		throw error(500, 'Failed to load member data.');
	}
};

export const actions = {
	updateMember: async ({ request, locals, params }) => {
		if (!locals.user) return fail(401, { error: 'User not authenticated.' });
		if (!params.id) return fail(400, { error: 'Member ID is missing.' });

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
			await locals.pb.collection('members').update(params.id, {
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
			console.error('Error updating member:', err.response || err.originalError || err);
			let errorMessage = 'Failed to update member.';
			if (err.data?.data) {
				errorMessage += ` Details: ${JSON.stringify(err.data.data)}`;
			}
			return fail(500, { ...currentValues, error: errorMessage });
		}

		throw redirect(303, '/admin/members?updated=member');
	}
};