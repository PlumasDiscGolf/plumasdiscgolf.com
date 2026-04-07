// src/routes/admin/board/members/new/+page.server.js
import { fail, redirect } from '@sveltejs/kit';

export const load = async ({ locals }) => {
	if (!locals.user) {
		throw redirect(303, '/login');
	}
	return {}; // No data to preload
};

export const actions = {
	createBoardMember: async ({ request, locals }) => {
		if (!locals.user) {
			return fail(401, { error: 'User not authenticated.' });
		}

		const formData = await request.formData();

		const name = formData.get('name')?.toString();
		const role = formData.get('role')?.toString();
		const bio = formData.get('bio')?.toString() || '';
		const active = formData.get('active') === 'on'; // Checkbox value is 'on' or null
		const image = formData.get('image');

		// Server-side validation
		const fieldErrors = {};
		if (!name) fieldErrors.name = 'Name is required.';
		if (!role) fieldErrors.role = 'Role is required.';

		const currentValues = {
			memberName: name,
			memberRole: role,
			memberBio: bio,
			memberActive: active
		};

		if (Object.keys(fieldErrors).length > 0) {
			return fail(400, { ...currentValues, fieldErrors, error: 'Please correct the errors.' });
		}

		const dataToSave = new FormData(); // Use FormData if you might add file uploads (avatar)
		dataToSave.append('name', name);
		if (currentValues.memberRole !== 'None') {
			dataToSave.append('role', role);
		}
		dataToSave.append('bio', bio);
		dataToSave.append('active', active);

		if (image && image.size > 0) {
			dataToSave.append('image', image);
		}

		try {
			await locals.pb.collection('board_members').create(dataToSave);
		} catch (err) {
			console.error('Error creating board member:', err.response || err.originalError || err);
			let errorMessage = 'Failed to create board member.';
			if (err.data?.data) {
				errorMessage += ` Details: ${JSON.stringify(err.data.data)}`;
			} else if (err.message) {
				errorMessage += ` ${err.message}`;
			}
			return fail(500, { ...currentValues, error: errorMessage });
		}

		throw redirect(303, '/admin#boardMembers');
	}
};
