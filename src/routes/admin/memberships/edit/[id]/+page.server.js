// src/routes/admin/memberships/edit/[id]/+page.server.js
import { error, fail, redirect } from '@sveltejs/kit';
import { formatInputDateToPocketBase } from '$lib/utils.js';

const STATUS_OPTIONS = ['active', 'expired', 'suspended', 'revoked'];

export const load = async ({ locals, params }) => {
	try {
		const membership = await locals.pb.collection('memberships').getOne(params.id);
		const members = await locals.pb.collection('members').getFullList({ sort: 'firstName,lastName' });
		const membershipTypes = await locals.pb.collection('membership_types').getFullList({ sort: 'name' });
		return {
			membership: JSON.parse(JSON.stringify(membership)),
			members,
			membershipTypes
		};
	} catch (err) {
		console.error('Error loading membership for editing:', err);
		if (err.status === 404) throw error(404, 'Membership not found');
		throw error(500, 'Failed to load membership data.');
	}
};

export const actions = {
	updateMembership: async ({ request, locals, params }) => {
		if (!locals.user) return fail(401, { error: 'User not authenticated.' });
		if (!params.id) return fail(400, { error: 'Membership ID is missing.' });

		const formData = await request.formData();
		const memberId = formData.get('memberId')?.toString();
		const membershipTypeId = formData.get('membershipTypeId')?.toString();
		const seasonStr = formData.get('season')?.toString();
		const pricePaidStr = formData.get('pricePaid')?.toString();
		const status = formData.get('status')?.toString();
		const startDate = formData.get('startDate')?.toString();

		const fieldErrors = {};
		if (!memberId) fieldErrors.memberId = 'Member is required.';
		if (!membershipTypeId) fieldErrors.membershipTypeId = 'Membership Type is required.';
		if (!seasonStr) fieldErrors.season = 'Season is required.';
		if (!pricePaidStr) fieldErrors.pricePaid = 'Price Paid is required.';
		if (!status || !STATUS_OPTIONS.includes(status)) fieldErrors.status = 'A valid status is required.';
		if (!startDate) fieldErrors.startDate = 'Start Date is required.';

		const season = Number(seasonStr);
		if (seasonStr && (!Number.isInteger(season) || season < 2000 || season > 2100)) {
			fieldErrors.season = 'Season must be a valid 4-digit year.';
		}

		const pricePaid = Number(pricePaidStr);
		if (pricePaidStr && Number.isNaN(pricePaid)) {
			fieldErrors.pricePaid = 'Price Paid must be a number.';
		}

		const currentValues = { memberId, membershipTypeId, season: seasonStr, pricePaid: pricePaidStr, status, startDate };

		if (Object.keys(fieldErrors).length > 0) {
			return fail(400, { ...currentValues, fieldErrors, error: 'Please correct the errors.' });
		}

		try {
			await locals.pb.collection('memberships').update(params.id, {
				memberId,
				membershipTypeId,
				season,
				pricePaid,
				status,
				startDate: formatInputDateToPocketBase(startDate)
			});
		} catch (err) {
			console.error('Error updating membership:', err.response || err.originalError || err);
			let errorMessage = 'Failed to update membership.';
			if (err.data?.data) {
				errorMessage += ` Details: ${JSON.stringify(err.data.data)}`;
			}
			return fail(500, { ...currentValues, error: errorMessage });
		}

		throw redirect(303, '/admin/memberships?updated=membership');
	}
};