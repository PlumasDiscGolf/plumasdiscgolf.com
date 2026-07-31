// src/routes/admin/bag-tags/+page.server.js
import { fail, redirect } from '@sveltejs/kit';

export const load = async ({ locals }) => {
	if (!locals.user) {
		throw redirect(303, '/login');
	}

	// Only fetches what this page actually needs — unlike the main admin
	// dashboard's load function, this doesn't pull events/courses/posts/etc.
	const bagTags = await locals.pb.collection('bag_tags').getFullList({ sort: '-season,league,tagNumber' });

	// Full assignment history, newest first, with the related member expanded.
	// Loaded in full (not season-filtered) since each bag_tags row already
	// belongs to a single season+league, so its assignments never span across
	// seasons — no cross-season correctness concern with loading everything.
	const bagTagAssignments = await locals.pb.collection('bag_tag_assignments').getFullList({
		sort: '-assignedAt,-created',
		expand: 'memberId'
	});

	// All members, for the assign-tag picker dropdown
	const members = await locals.pb.collection('members').getFullList({ sort: 'firstName,lastName' });

	return { bagTags, bagTagAssignments, members };
};

export const actions = {
	delete: async ({ request, locals }) => {
		if (!locals.user) {
			return fail(401, { error: 'User not authenticated.' });
		}

		const formData = await request.formData();
		const collectionName = formData.get('collectionName')?.toString();
		const itemId = formData.get('itemId')?.toString();

		if (!collectionName || !itemId) {
			return fail(400, { error: 'Missing required parameters for deletion.' });
		}

		try {
			await locals.pb.collection(collectionName).delete(itemId);
		} catch (err) {
			console.error(`Error deleting item from ${collectionName}:`, err);
			return fail(500, { error: `Failed to delete item.` });
		}

		return { success: true };
	},

	undoAssignment: async ({ request, locals }) => {
		if (!locals.user) {
			return fail(401, { error: 'User not authenticated.' });
		}

		const formData = await request.formData();
		const assignmentId = formData.get('assignmentId')?.toString();

		if (!assignmentId) {
			return fail(400, { error: 'Missing assignment ID.' });
		}

		let assignment;
		try {
			assignment = await locals.pb.collection('bag_tag_assignments').getOne(assignmentId);
		} catch (err) {
			console.error('Error loading assignment for undo:', err);
			return fail(404, { error: 'That assignment record could not be found — it may have already been removed.' });
		}

		// Enforce the append-only rule server-side: only the single most-recent
		// assignment for this tag can be undone. If something newer has already
		// been recorded on top of it (another assignment or a forfeiture), this
		// row is settled history and must not be deleted.
		try {
			const latest = await locals.pb.collection('bag_tag_assignments').getList(1, 1, {
				filter: locals.pb.filter('bagTagId = {:id}', { id: assignment.bagTagId }),
				sort: '-assignedAt,-created'
			});
			if (latest.items.length === 0 || latest.items[0].id !== assignmentId) {
				return fail(409, { error: 'This assignment has already been superseded by a newer one and can no longer be undone.' });
			}
		} catch (err) {
			console.error('Error verifying most-recent assignment before undo:', err);
			return fail(500, { error: 'Failed to verify this was the most recent assignment before undoing.' });
		}

		try {
			await locals.pb.collection('bag_tag_assignments').delete(assignmentId);
		} catch (err) {
			console.error('Error undoing assignment:', err);
			return fail(500, { error: 'Failed to undo the assignment.' });
		}

		return { success: true };
	}

	// `?/undoAssignment` is now implemented above — no longer an open item.
};