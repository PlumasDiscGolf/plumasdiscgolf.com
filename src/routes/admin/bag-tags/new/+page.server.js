// src/routes/admin/bag-tags/new/+page.server.js
// Unifies the old "Start New Season" + "Add Bag Tag Record" flows: always
// creates the next N tag numbers after whatever the current max is for the
// chosen league/season. If none exist yet, that's just a fresh season
// (starts at 1) — there's no meaningful difference between "starting a
// season" and "topping up mid-season" from the data's point of view.
import { fail, redirect } from '@sveltejs/kit';

const MAX_TAGS_PER_BATCH = 50; // matches the PocketBase create-rule rate limit (50 requests)

export const load = async ({ locals }) => {
	if (!locals.user) {
		throw redirect(303, '/login');
	}
	return {};
};

export const actions = {
	addTags: async ({ request, locals }) => {
		if (!locals.user) {
			return fail(401, { error: 'User not authenticated.' });
		}

		const formData = await request.formData();
		const league = formData.get('league')?.toString();
		const seasonStr = formData.get('season')?.toString();
		const tagCountStr = formData.get('tagCount')?.toString();

		const fieldErrors = {};
		if (!league) fieldErrors.league = 'League is required.';
		if (!seasonStr) fieldErrors.season = 'Season is required.';
		if (!tagCountStr) fieldErrors.tagCount = 'Number of Tags is required.';

		const season = Number(seasonStr);
		if (seasonStr && (!Number.isInteger(season) || season < 2000 || season > 2100)) {
			fieldErrors.season = 'Season must be a valid 4-digit year.';
		}

		const tagCount = Number(tagCountStr);
		if (tagCountStr && (!Number.isInteger(tagCount) || tagCount <= 0)) {
			fieldErrors.tagCount = 'Number of Tags must be a positive whole number.';
		} else if (tagCountStr && tagCount > MAX_TAGS_PER_BATCH) {
			fieldErrors.tagCount = `Number of Tags can't exceed ${MAX_TAGS_PER_BATCH}.`;
		}

		const currentValues = { league, season: seasonStr, tagCount: tagCountStr };

		if (Object.keys(fieldErrors).length > 0) {
			return fail(400, { ...currentValues, fieldErrors, error: 'Please correct the errors.' });
		}

		// Find the current highest tag number for this league/season (0 if none exist yet)
		let startingNumber;
		try {
			const existing = await locals.pb.collection('bag_tags').getList(1, 1, {
				filter: locals.pb.filter('league = {:league} && season = {:season}', { league, season }),
				sort: '-tagNumber'
			});
			startingNumber = existing.totalItems > 0 ? existing.items[0].tagNumber : 0;
		} catch (err) {
			console.error('Error checking existing tags before adding new ones:', err);
			return fail(500, { ...currentValues, error: 'Failed to check existing tags. Nothing was created.' });
		}

		// Create tagCount new records via PocketBase's batch API — one HTTP
		// request instead of tagCount individual sequential ones, fully atomic
		// (all-or-nothing). MAX_TAGS_PER_BATCH (50) matches the configured
		// batch-size limit, so every valid submission fits in exactly one call.
		try {
			const batch = locals.pb.createBatch();
			for (let i = 1; i <= tagCount; i++) {
				batch.collection('bag_tags').create({
					tagNumber: startingNumber + i,
					league,
					season
				});
			}
			await batch.send();
		} catch (err) {
			console.error('Error creating new tags — status:', err?.status, 'message:', err?.message, 'data:', JSON.stringify(err?.data), 'raw:', err);
			let errorMessage = 'Failed to create the new tags. Since this uses a single batch request, nothing should have been created — check the Bag Tags list to confirm before retrying.';
			if (err?.status === 401 || err?.status === 403) {
				errorMessage = 'Your session may have expired. Please log out and back in, then check the Bag Tags list before retrying.';
			} else if (err?.status === 429) {
				errorMessage = 'Still hitting a rate limiter. Check Settings → Rate limiters in PocketBase for a create-rule limit below 50.';
			} else if (err.data?.data) {
				errorMessage += ` Details: ${JSON.stringify(err.data.data)}`;
			} else if (err?.message) {
				errorMessage += ` (${err.message})`;
			}
			return fail(500, { ...currentValues, error: errorMessage });
		}

		throw redirect(303, '/admin/bag-tags');
	}
};