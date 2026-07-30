// src/routes/admin/bag-tags/forfeit/[id]/+page.server.js
import { error, fail, redirect } from '@sveltejs/kit';
import { formatInputDateToPocketBase } from '$lib/utils.js';

export const load = async ({ locals, params }) => {
	if (!locals.user) {
		throw redirect(303, '/login');
	}

	let bagTag;
	try {
		bagTag = await locals.pb.collection('bag_tags').getOne(params.id);
	} catch (err) {
		console.error('Error loading bag tag for forfeiture:', err);
		if (err.status === 404) {
			throw error(404, 'Bag tag record not found');
		}
		throw error(500, 'Failed to load bag tag data.');
	}

	// Find the current holder (if any) so we can confirm there's actually
	// something to forfeit, and show who it is on the confirmation page.
	let currentHolder = null;
	try {
		const latest = await locals.pb.collection('bag_tag_assignments').getList(1, 1, {
			filter: locals.pb.filter('bagTagId = {:id}', { id: params.id }),
			sort: '-assignedAt,-created',
			expand: 'memberId'
		});
		if (latest.items.length > 0 && latest.items[0].expand?.memberId) {
			const member = latest.items[0].expand.memberId;
			currentHolder = { name: `${member.firstName} ${member.lastName}`, assignmentId: latest.items[0].id };
		}
	} catch (err) {
		console.error('Error checking current holder before forfeiture:', err);
		throw error(500, 'Failed to check current holder.');
	}

	return {
		bagTag: JSON.parse(JSON.stringify(bagTag)),
		currentHolder
	};
};

export const actions = {
	forfeitTag: async ({ request, locals, params }) => {
		if (!locals.user) {
			return fail(401, { error: 'User not authenticated.' });
		}

		const formData = await request.formData();
		const assignedAt = formData.get('assignedAt')?.toString();
		const notes = formData.get('notes')?.toString() || '';

		const fieldErrors = {};
		if (!assignedAt) fieldErrors.assignedAt = 'Date is required.';

		if (Object.keys(fieldErrors).length > 0) {
			return fail(400, { assignedAt, notes, fieldErrors, error: 'Please correct the errors.' });
		}

		let bagTag;
		try {
			bagTag = await locals.pb.collection('bag_tags').getOne(params.id);
		} catch (err) {
			console.error('Error loading bag tag during forfeiture:', err);
			return fail(500, { assignedAt, notes, error: 'Failed to load the tag record.' });
		}

		// Server-side re-check: only allow forfeiting a tag that currently
		// has a holder — don't trust the UI alone to have hidden the button.
		try {
			const latest = await locals.pb.collection('bag_tag_assignments').getList(1, 1, {
				filter: locals.pb.filter('bagTagId = {:id}', { id: params.id }),
				sort: '-assignedAt,-created'
			});
			const hasCurrentHolder = latest.items.length > 0 && !!latest.items[0].memberId;
			if (!hasCurrentHolder) {
				return fail(409, { assignedAt, notes, error: 'This tag has no current holder — there is nothing to forfeit.' });
			}
		} catch (err) {
			console.error('Error verifying current holder before forfeiture:', err);
			return fail(500, { assignedAt, notes, error: 'Failed to verify current holder before saving.' });
		}

		try {
			await locals.pb.collection('bag_tag_assignments').create({
				bagTagId: params.id,
				memberId: null,
				season: bagTag.season,
				league: bagTag.league,
				assignedAt: formatInputDateToPocketBase(assignedAt),
				reason: 'Forfeited',
				notes
			});
		} catch (err) {
			console.error('Error recording forfeiture:', err.response || err.originalError || err);
			let errorMessage = 'Failed to record the forfeiture.';
			if (err.data?.data) {
				errorMessage += ` Details: ${JSON.stringify(err.data.data)}`;
			}
			return fail(500, { assignedAt, notes, error: errorMessage });
		}

		throw redirect(303, '/admin/bag-tags');
	}
};