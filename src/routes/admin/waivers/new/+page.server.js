// src/routes/admin/waivers/new/+page.server.js
import { fail, redirect } from '@sveltejs/kit';
import { formatInputDateToPocketBase } from '$lib/utils.js';

export const load = async ({ locals }) => {
	// No auth check needed here — the shared +layout.server.js already guards
	// the entire /admin route tree before this load runs.
	const memberships = await locals.pb.collection('memberships').getFullList({
		sort: '-season',
		expand: 'memberId,membershipTypeId'
	});
	const waiverTemplates = await locals.pb.collection('waiver_templates').getFullList({ sort: '-season' });
	return { memberships, waiverTemplates };
};

export const actions = {
	createWaiverSignature: async ({ request, locals }) => {
		if (!locals.user) {
			return fail(401, { error: 'User not authenticated.' });
		}

		const formData = await request.formData();
		const membershipId = formData.get('membershipId')?.toString();
		const waiverTemplateId = formData.get('waiverTemplateId')?.toString();
		const signedByName = formData.get('signedByName')?.toString();
		const signedAtStr = formData.get('signedAt')?.toString();
		const acknowledged = formData.get('acknowledged') === 'on';
		const guardianName = formData.get('guardianName')?.toString() || '';
		const scannedFile = formData.get('scannedFile');

		const fieldErrors = {};
		if (!membershipId) fieldErrors.membershipId = 'Membership is required.';
		if (!waiverTemplateId) fieldErrors.waiverTemplateId = 'Waiver Template is required.';
		if (!signedByName) fieldErrors.signedByName = 'Signed By (printed name from the form) is required.';
		if (!signedAtStr) fieldErrors.signedAt = 'Signed Date is required.';

		const currentValues = { membershipId, waiverTemplateId, signedByName, signedAt: signedAtStr, acknowledged, guardianName };

		if (Object.keys(fieldErrors).length > 0) {
			return fail(400, { ...currentValues, fieldErrors, error: 'Please correct the errors.' });
		}

		try {
			const dataToSave = new FormData(); // FormData needed since this collection now has a file field
			dataToSave.append('membershipId', membershipId);
			dataToSave.append('waiverTemplateId', waiverTemplateId);
			dataToSave.append('signedByName', signedByName);
			dataToSave.append('signedAt', formatInputDateToPocketBase(signedAtStr));
			dataToSave.append('acknowledged', acknowledged);
			dataToSave.append('guardianName', guardianName);
			if (scannedFile && scannedFile.size > 0) {
				dataToSave.append('scannedFile', scannedFile);
			}
			await locals.pb.collection('waiver_signatures').create(dataToSave);
		} catch (err) {
			console.error('Error creating waiver signature:', err.response || err.originalError || err);
			let errorMessage = 'Failed to log waiver signature.';
			if (err.data?.data) {
				errorMessage += ` Details: ${JSON.stringify(err.data.data)}`;
			}
			return fail(500, { ...currentValues, error: errorMessage });
		}

		throw redirect(303, '/admin/waivers?created=waiver signature');
	}
};