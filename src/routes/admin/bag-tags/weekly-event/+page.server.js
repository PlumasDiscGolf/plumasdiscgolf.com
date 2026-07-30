// src/routes/admin/bag-tags/weekly-event/+page.server.js
import { fail, redirect } from '@sveltejs/kit';
import { formatInputDateToPocketBase } from '$lib/utils.js';

export const load = async ({ locals }) => {
	if (!locals.user) {
		throw redirect(303, '/login');
	}

	const members = await locals.pb.collection('members').getFullList({ sort: 'lastName,firstName' });

	// Same "load everything, filter client-side" pattern as the other bag tags
	// pages — used here for the live display/summary only. The action below
	// independently re-fetches fresh state at submission time; this data is
	// never trusted as authoritative for the actual pool-building logic.
	const bagTags = await locals.pb.collection('bag_tags').getFullList({ sort: '-season,league,tagNumber' });
	const bagTagAssignments = await locals.pb.collection('bag_tag_assignments').getFullList({
		sort: '-assignedAt,-created',
		expand: 'memberId'
	});

	return {
		members: JSON.parse(JSON.stringify(members)),
		bagTags: JSON.parse(JSON.stringify(bagTags)),
		bagTagAssignments: JSON.parse(JSON.stringify(bagTagAssignments))
	};
};

export const actions = {
	redistribute: async ({ request, locals }) => {
		if (!locals.user) {
			return fail(401, { error: 'User not authenticated.' });
		}

		const formData = await request.formData();
		const league = formData.get('league')?.toString();
		const seasonStr = formData.get('season')?.toString();
		const eventDate = formData.get('eventDate')?.toString();

		const fieldErrors = {};
		if (!league) fieldErrors.league = 'League is required.';
		if (!seasonStr) fieldErrors.season = 'Season is required.';
		if (!eventDate) fieldErrors.eventDate = 'Event date is required.';

		const season = Number(seasonStr);
		if (seasonStr && (!Number.isInteger(season) || season < 2000 || season > 2100)) {
			fieldErrors.season = 'Season must be a valid 4-digit year.';
		}

		const currentValues = { league, season: seasonStr, eventDate };

		if (Object.keys(fieldErrors).length > 0) {
			return fail(400, { ...currentValues, fieldErrors, error: 'Please correct the errors.' });
		}

		// Reconstruct the attendee list from the submitted form: every member
		// with attended_{id} = 'on' is an attendee, with their placement.
		let allMembers;
		try {
			allMembers = await locals.pb.collection('members').getFullList();
		} catch (err) {
			console.error('Error loading members during weekly redistribution:', err);
			return fail(500, { ...currentValues, error: 'Failed to load members.' });
		}

		const attendees = [];
		for (const member of allMembers) {
			if (formData.get(`attended_${member.id}`) === 'on') {
				const placementStr = formData.get(`placement_${member.id}`)?.toString();
				const placement = Number(placementStr);
				if (!placementStr || !Number.isInteger(placement) || placement <= 0) {
					return fail(400, {
						...currentValues,
						error: `Please enter a valid placement for ${member.firstName} ${member.lastName}.`
					});
				}
				attendees.push({ memberId: member.id, placement });
			}
		}

		if (attendees.length === 0) {
			return fail(400, { ...currentValues, error: 'Select at least one attendee.' });
		}

		// Fetch fresh, live state for this league/season — never trust the
		// client's view of "current tags," since it could be stale by the
		// time this actually submits.
		let bagTagsForLeagueSeason, assignmentsForLeagueSeason;
		try {
			bagTagsForLeagueSeason = await locals.pb.collection('bag_tags').getFullList({
				filter: locals.pb.filter('league = {:league} && season = {:season}', { league, season })
			});
			assignmentsForLeagueSeason = await locals.pb.collection('bag_tag_assignments').getFullList({
				filter: locals.pb.filter('league = {:league} && season = {:season}', { league, season }),
				sort: '-assignedAt,-created'
			});
		} catch (err) {
			console.error('Error loading current tag state for weekly redistribution:', err);
			return fail(500, { ...currentValues, error: 'Failed to load current tag state.' });
		}

		// Latest assignment per tag (first seen per bagTagId, since pre-sorted newest-first)
		const latestAssignmentByTagId = new Map();
		for (const a of assignmentsForLeagueSeason) {
			if (!latestAssignmentByTagId.has(a.bagTagId)) latestAssignmentByTagId.set(a.bagTagId, a);
		}

		// Current tag held by each member (if any), and the set of genuinely
		// available (no current holder) tags, both scoped to this league/season.
		const currentTagByMemberId = new Map();
		const availableTags = [];
		for (const tag of bagTagsForLeagueSeason) {
			const latest = latestAssignmentByTagId.get(tag.id);
			if (latest && latest.memberId) {
				currentTagByMemberId.set(latest.memberId, { bagTagId: tag.id, tagNumber: tag.tagNumber });
			} else {
				availableTags.push({ bagTagId: tag.id, tagNumber: tag.tagNumber });
			}
		}
		availableTags.sort((a, b) => a.tagNumber - b.tagNumber);

		// Build the pool: each attendee's own current tag, plus the lowest
		// available tags for any no-current-tag attendees.
		const noTagAttendees = attendees.filter((a) => !currentTagByMemberId.has(a.memberId));
		if (noTagAttendees.length > availableTags.length) {
			return fail(409, {
				...currentValues,
				error: `Not enough available tags: ${noTagAttendees.length} attendee(s) need one from the pool, but only ${availableTags.length} are available. Use "Add New Tags" first.`
			});
		}

		const pool = [];
		for (const attendee of attendees) {
			const currentTag = currentTagByMemberId.get(attendee.memberId);
			if (currentTag) pool.push(currentTag);
		}
		pool.push(...availableTags.slice(0, noTagAttendees.length));
		pool.sort((a, b) => a.tagNumber - b.tagNumber);

		// Sort attendees by placement, tie-broken by their OWN current tag
		// number ascending — a no-current-tag attendee sorts as if their tag
		// number were infinite (always last within a tied group, since they
		// have no standing to claim over someone who already held a tag).
		const sortedAttendees = [...attendees].sort((a, b) => {
			if (a.placement !== b.placement) return a.placement - b.placement;
			const tagA = currentTagByMemberId.get(a.memberId)?.tagNumber ?? Infinity;
			const tagB = currentTagByMemberId.get(b.memberId)?.tagNumber ?? Infinity;
			return tagA - tagB;
		});

		// Pair position-for-position — 1st place gets the lowest tag in the pool.
		// Written as one atomic batch: every attendee's new assignment succeeds
		// together, or none do.
		try {
			const formattedEventDate = formatInputDateToPocketBase(eventDate);
			const batch = locals.pb.createBatch();
			for (let i = 0; i < sortedAttendees.length; i++) {
				batch.collection('bag_tag_assignments').create({
					bagTagId: pool[i].bagTagId,
					memberId: sortedAttendees[i].memberId,
					season,
					league,
					assignedAt: formattedEventDate,
					reason: 'League Round'
				});
			}
			await batch.send();
		} catch (err) {
			console.error('Error writing weekly redistribution:', err.response || err.originalError || err);
			let errorMessage = 'Failed to save the redistribution. Since this uses a single batch request, nothing should have been created — check the Bag Tags list to confirm before retrying.';
			if (err.data?.data) {
				errorMessage += ` Details: ${JSON.stringify(err.data.data)}`;
			}
			return fail(500, { ...currentValues, error: errorMessage });
		}

		throw redirect(303, '/admin/bag-tags');
	}
};