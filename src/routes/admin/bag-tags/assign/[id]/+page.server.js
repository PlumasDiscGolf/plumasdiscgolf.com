// src/routes/admin/bag-tags/assign/[id]/+page.server.js
import { error, fail, redirect } from '@sveltejs/kit';
import { formatInputDateToPocketBase } from '$lib/utils.js';

// Mirrors bag_tag_assignments.reason options, EXCLUDING "Forfeited" — that
// reason is reserved for the dedicated Forfeit action, which has no member
// (Assign always has one, so it wouldn't make sense to offer that option here).
const REASON_OPTIONS = ['League Round', 'Challenge Win', 'Season Opener', 'Manual Correction', 'Other'];

export const load = async ({ locals, params }) => {
	if (!locals.user) {
		throw redirect(303, '/login');
	}

	let bagTag;
	try {
		bagTag = await locals.pb.collection('bag_tags').getOne(params.id);
	} catch (err) {
		console.error('Error loading bag tag for assignment:', err);
		if (err.status === 404) {
			throw error(404, 'Bag tag record not found');
		}
		throw error(500, 'Failed to load bag tag data.');
	}

	// Current holder (if any), just for display context on the form —
	// Assign works regardless of whether the tag is currently held or available.
	let currentHolderName = null;
	try {
		const latest = await locals.pb.collection('bag_tag_assignments').getList(1, 1, {
			filter: locals.pb.filter('bagTagId = {:id}', { id: params.id }),
			sort: '-assignedAt,-created',
			expand: 'memberId'
		});
		if (latest.items.length > 0 && latest.items[0].expand?.memberId) {
			const member = latest.items[0].expand.memberId;
			currentHolderName = `${member.firstName} ${member.lastName}`;
		}
	} catch (err) {
		console.error('Error checking current holder before assignment:', err);
		// Not fatal — the form can still work without this context, just skip it.
	}

	const members = await locals.pb.collection('members').getFullList({ sort: 'firstName,lastName' });

	return {
		bagTag: JSON.parse(JSON.stringify(bagTag)),
		currentHolderName,
		members: JSON.parse(JSON.stringify(members))
	};
};

export const actions = {
	assignTag: async ({ request, locals, params }) => {
		if (!locals.user) {
			return fail(401, { error: 'User not authenticated.' });
		}

		const formData = await request.formData();
		const memberId = formData.get('memberId')?.toString();
		const reason = formData.get('reason')?.toString();
		const assignedAt = formData.get('assignedAt')?.toString();
		const notes = formData.get('notes')?.toString() || '';

		const fieldErrors = {};
		if (!memberId) fieldErrors.memberId = 'Member is required.';
		if (!reason) fieldErrors.reason = 'Reason is required.';
		else if (!REASON_OPTIONS.includes(reason)) fieldErrors.reason = 'Not a valid reason for this action.';
		if (!assignedAt) fieldErrors.assignedAt = 'Date is required.';

		if (Object.keys(fieldErrors).length > 0) {
			return fail(400, { memberId, reason, assignedAt, notes, fieldErrors, error: 'Please correct the errors.' });
		}

		let bagTag;
		try {
			bagTag = await locals.pb.collection('bag_tags').getOne(params.id);
		} catch (err) {
			console.error('Error loading bag tag during assignment:', err);
			return fail(500, { memberId, reason, assignedAt, notes, error: 'Failed to load the tag record.' });
		}

		try {
			await locals.pb.collection('bag_tag_assignments').create({
				bagTagId: params.id,
				memberId,
				season: bagTag.season,
				league: bagTag.league,
				assignedAt: formatInputDateToPocketBase(assignedAt),
				reason,
				notes
			});
		} catch (err) {
			console.error('Error recording assignment:', err.response || err.originalError || err);
			let errorMessage = 'Failed to record the assignment.';
			if (err.data?.data) {
				errorMessage += ` Details: ${JSON.stringify(err.data.data)}`;
			}
			return fail(500, { memberId, reason, assignedAt, notes, error: errorMessage });
		}

		throw redirect(303, '/admin/bag-tags');
	}
};