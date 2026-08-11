// src/routes/admin/bag-tags/edit/[id]/+page.server.js
import { error, fail, redirect } from '@sveltejs/kit';

export const load = async ({ locals, params }) => {
	if (!locals.user) {
		throw redirect(303, '/login');
	}
	try {
		const bagTag = await locals.pb.collection('bag_tags').getOne(params.id);

		// bag_tag_assignments duplicates season/league for query performance, so once
		// assignments exist, league/season on the tag itself must not change out from
		// under them. We just need to know whether ANY exist, not the full list.
		const assignmentCount = await locals.pb.collection('bag_tag_assignments').getList(1, 1, {
			filter: locals.pb.filter('bagTagId = {:id}', { id: params.id })
		});

		return {
			bagTag: JSON.parse(JSON.stringify(bagTag)),
			hasAssignments: assignmentCount.totalItems > 0
		};
	} catch (err) {
		console.error('Error loading bag tag for editing:', err);
		if (err.status === 404) {
			throw error(404, 'Bag tag record not found');
		}
		throw error(500, 'Failed to load bag tag data.');
	}
};

export const actions = {
	updateBagTag: async ({ request, locals, params }) => {
		if (!locals.user) {
			return fail(401, { error: 'User not authenticated.' });
		}
		if (!params.id) {
			return fail(400, { error: 'Bag tag ID is missing.' });
		}

		const formData = await request.formData();
		const tagNumberStr = formData.get('tagNumber')?.toString();
		let league = formData.get('league')?.toString();
		let seasonStr = formData.get('season')?.toString();

		const fieldErrors = {};
		if (!tagNumberStr) fieldErrors.tagNumber = 'Tag Number is required.';
		if (!league) fieldErrors.league = 'League is required.';
		if (!seasonStr) fieldErrors.season = 'Season is required.';

		const tagNumber = Number(tagNumberStr);
		if (tagNumberStr && (Number.isNaN(tagNumber) || tagNumber <= 0)) {
			fieldErrors.tagNumber = 'Tag Number must be a positive number.';
		}

		let season = Number(seasonStr);
		if (seasonStr && (!Number.isInteger(season) || season < 2000 || season > 2100)) {
			fieldErrors.season = 'Season must be a valid 4-digit year.';
		}

		if (Object.keys(fieldErrors).length > 0) {
			return fail(400, { tagNumber: tagNumberStr, league, season: seasonStr, fieldErrors, error: 'Please correct the errors.' });
		}

		// Safety check: if this tag already has assignment history, league/season are
		// locked server-side regardless of what the form submitted, since those values
		// are duplicated onto every bag_tag_assignments row for that tag.
		let existingBagTag;
		try {
			existingBagTag = await locals.pb.collection('bag_tags').getOne(params.id);
			const assignmentCheck = await locals.pb.collection('bag_tag_assignments').getList(1, 1, {
				filter: locals.pb.filter('bagTagId = {:id}', { id: params.id })
			});
			if (assignmentCheck.totalItems > 0) {
				league = existingBagTag.league;
				season = existingBagTag.season;
				seasonStr = String(existingBagTag.season);
			}
		} catch (err) {
			console.error('Error checking assignment history before update:', err);
			return fail(500, { tagNumber: tagNumberStr, league, season: seasonStr, error: 'Failed to verify assignment history before saving.' });
		}

		const dataToUpdate = {
			tagNumber,
			league,
			season
		};

		try {
			// NOTE: bag_tags has a unique index on tagNumber + season + league
			await locals.pb.collection('bag_tags').update(params.id, dataToUpdate);
		} catch (err) {
			console.error('Error updating bag tag record:', err.response || err.originalError || err);
			let errorMessage = `A tag #${tagNumberStr} may already exist for ${league} League ${seasonStr}, or the record could not be updated.`;
			if (err.data?.data) {
				errorMessage += ` Details: ${JSON.stringify(err.data.data)}`;
			}
			return fail(500, { tagNumber: tagNumberStr, league, season: seasonStr, error: errorMessage });
		}
		throw redirect(303, '/admin/bag-tags');
	},

	delete: async ({ locals, params }) => {
		if (!locals.user) {
			return fail(401, { error: 'User not authenticated.' });
		}
		if (!params.id) {
			return fail(400, { error: 'Bag tag ID is missing.' });
		}

		try {
			await locals.pb.collection('bag_tags').delete(params.id);
		} catch (err) {
			console.error('Error deleting bag tag record:', err);
			return fail(500, { error: 'Failed to delete bag tag record.' });
		}

		// Deleting from the edit page always means leaving it — there's no
		// "stay on the page" case the way the old row-level delete needed to
		// preserve, so a plain redirect (picked up by the shared layout's
		// unified banner) fits naturally here.
		throw redirect(303, '/admin/bag-tags?deleted=bag tag');
	}
};