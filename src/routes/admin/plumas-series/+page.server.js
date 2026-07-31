// src/routes/admin/plumas-series/+page.server.js
import { fail, redirect } from '@sveltejs/kit';

export const load = async ({ locals }) => {
	if (!locals.user) {
		throw redirect(303, '/login');
	}

	const seasons = await locals.pb.collection('plumas_series_seasons').getFullList({ sort: '-year' });

	const seriesEvents = await locals.pb.collection('plumas_series_events').getFullList({
		sort: 'eventNumber',
		expand: 'seasonId,courseId'
	});

	const seriesResults = await locals.pb.collection('plumas_series_results').getFullList({
		sort: '-points',
		expand: 'memberId'
	});

	const members = await locals.pb.collection('members').getFullList({ sort: 'firstName,lastName' });

	return { seasons, seriesEvents, seriesResults, members };
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
		// Restrict this generic delete action to the collections this admin
		// page actually manages, so a crafted request can't be used to delete
		// arbitrary records elsewhere in the database.
		if (!['plumas_series_seasons', 'plumas_series_events', 'plumas_series_results'].includes(collectionName)) {
			return fail(400, { error: 'Not a valid collection for this action.' });
		}

		try {
			await locals.pb.collection(collectionName).delete(itemId);
		} catch (err) {
			console.error(`Error deleting item from ${collectionName}:`, err);
			// Deleting a season/event that still has events/results pointing at
			// it will fail if the relation isn't set to cascade — expected, and
			// this message explains why rather than presenting a mystery error.
			let message = 'Failed to delete item.';
			if (collectionName === 'plumas_series_seasons') message = 'Failed to delete season. If it still has events tied to it, delete those first.';
			if (collectionName === 'plumas_series_events') message = 'Failed to delete event. If it still has results recorded against it, delete those first.';
			if (collectionName === 'plumas_series_results') message = 'Failed to delete result.';
			return fail(500, { error: message });
		}

		return { success: true };
	}
};