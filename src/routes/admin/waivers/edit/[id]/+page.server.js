// src/routes/admin/waivers/edit/[id]/+page.server.js
import { error, fail, redirect } from '@sveltejs/kit';
import { formatInputDateToPocketBase } from '$lib/utils.js';

export const load = async ({ locals, params }) => {
	// No auth check needed here — the shared +layout.server.js already guards
	// the entire /admin route tree before this load runs.
	try {
		const waiver = await locals.pb.collection('waiver_signatures').getOne(params.id);
		const memberships = await locals.pb.collection('memberships').getFullList({
			sort: '-season',
			expand: 'memberId,membershipTypeId'
		});
		const waiverTemplates = await locals.pb.collection('waiver_templates').getFullList({ sort: '-season' });
		return {
			waiver: JSON.parse(JSON.stringify(waiver)),
			memberships,
			waiverTemplates
		};
	} catch (err) {
		console.error('Error loading waiver signature for editing:', err);
		if (err.status === 404) throw error(404, 'Waiver signature not found');
		throw error(500, 'Failed to load waiver signature data.');
	}
};

export const actions = {
	updateWaiverSignature: async ({ request, locals, params }) => {
		if (!locals.user) return fail(401, { error: 'User not authenticated.' });
		if (!params.id) return fail(400, { error: 'Waiver signature ID is missing.' });

		const formData = await request.formData();
		const membershipId = formData.get('membershipId')?.toString();
		const waiverTemplateId = formData.get('waiverTemplateId')?.toString();
		const signedByName = formData.get('signedByName')?.toString();
		const signedAtStr = formData.get('signedAt')?.toString();
		const acknowledged = formData.get('acknowledged') === 'on';
		const guardianName = formData.get('guardianName')?.toString() || '';
		const scannedFile = formData.get('scannedFile');
		const deleteExistingFile = formData.get('deleteExistingFile') === 'true';

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
			const dataToUpdate = new FormData();
			dataToUpdate.append('membershipId', membershipId);
			dataToUpdate.append('waiverTemplateId', waiverTemplateId);
			dataToUpdate.append('signedByName', signedByName);
			dataToUpdate.append('signedAt', formatInputDateToPocketBase(signedAtStr));
			dataToUpdate.append('acknowledged', acknowledged);
			dataToUpdate.append('guardianName', guardianName);
			if (scannedFile && scannedFile.size > 0) {
				dataToUpdate.append('scannedFile', scannedFile);
			} else if (deleteExistingFile) {
				// Empty string, NOT null — FormData.append(key, null) silently
				// stringifies to "null" and PocketBase rejects it as an invalid
				// file. Learned this the hard way on Courses/Events/Board
				// Members/Board Meetings earlier.
				dataToUpdate.append('scannedFile', '');
			}
			await locals.pb.collection('waiver_signatures').update(params.id, dataToUpdate);
		} catch (err) {
			console.error('Error updating waiver signature:', err.response || err.originalError || err);
			let errorMessage = 'Failed to update waiver signature.';
			if (err.data?.data) {
				errorMessage += ` Details: ${JSON.stringify(err.data.data)}`;
			}
			return fail(500, { ...currentValues, error: errorMessage });
		}

		throw redirect(303, '/admin/waivers?updated=waiver signature');
	}
};