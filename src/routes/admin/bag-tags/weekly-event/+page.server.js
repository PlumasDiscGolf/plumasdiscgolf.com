// src/routes/admin/bag-tags/weekly-event/+page.server.js
import { fail, redirect } from '@sveltejs/kit';
import { formatInputDateToPocketBase } from '$lib/utils.js';

export const load = async ({ locals }) => {
	if (!locals.user) {
		throw redirect(303, '/login');
	}

	const members = await locals.pb.collection('members').getFullList({ sort: 'firstName,lastName' });

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

		// A newcomer (no current tag of their own) has nothing to contribute
		// to the pool, so there must be at least enough vacant tags to give
		// each of them one — independent of the "pull in ALL vacant tags"
		// change below, which is about which tags get PRIORITIZED, not
		// whether there are enough to go around at all.
		const noTagAttendees = attendees.filter((a) => !currentTagByMemberId.has(a.memberId));
		if (noTagAttendees.length > availableTags.length) {
			return fail(409, {
				...currentValues,
				error: `Not enough available tags: ${noTagAttendees.length} attendee(s) need one from the pool, but only ${availableTags.length} are available. Use "Add New Tags" first.`
			});
		}

		// Build the pool: every attendee's own current tag, PLUS every currently
		// vacant tag for this league/season — not just enough to cover
		// newcomers. A vacant tag (e.g. one just forfeited) should be able to
		// compete for this week's rankings even when nobody new needs a tag
		// at all, which is exactly the case that was missed before: with zero
		// newcomers, no vacant tag ever entered the pool, no matter how good.
		const pool = [];
		for (const attendee of attendees) {
			const currentTag = currentTagByMemberId.get(attendee.memberId);
			if (currentTag) pool.push(currentTag);
		}
		pool.push(...availableTags);
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

		// Only the best (lowest) tags actually get distributed this round —
		// one per attendee. The pool can be larger than the attendee count
		// once every vacant tag is included, so anything beyond what's
		// needed (excess vacant tags, or an attendee's own tag that didn't
		// make the cut because a better vacant tag took its place) is simply
		// not assigned here; it stays or becomes vacant going forward.
		const poolForDistribution = pool.slice(0, sortedAttendees.length);

		// Pair position-for-position — 1st place gets the lowest tag in the pool.
		// Written as one atomic batch: every attendee's new assignment (and any
		// resulting vacate record) succeeds together, or none do.
		//
		// IMPORTANT ordering note: it's entirely possible for the same tag to
		// be both vacated by one attendee and claimed by another WITHIN this
		// same run (someone bumped up to exactly the tag someone else just
		// lost). Since "who currently holds a tag" is resolved by whichever
		// assignment record was created most recently, every vacate record
		// must be written BEFORE every new-claim record in this batch — not
		// interleaved per-attendee — otherwise a reused tag could end up
		// looking vacant again if its vacate happened to land after its new
		// claim in write order.
		try {
			const formattedEventDate = formatInputDateToPocketBase(eventDate);
			const batch = locals.pb.createBatch();

			for (let i = 0; i < sortedAttendees.length; i++) {
				const newTag = poolForDistribution[i];
				const previousTag = currentTagByMemberId.get(sortedAttendees[i].memberId);

				// If this attendee's new tag differs from the one they came in
				// with, their OLD tag needs its own vacate record first —
				// otherwise its most-recent assignment row (from whenever they
				// originally got it) still shows THEM as the current holder,
				// even though they've moved on to a better tag this round.
				if (previousTag && previousTag.bagTagId !== newTag.bagTagId) {
					batch.collection('bag_tag_assignments').create({
						bagTagId: previousTag.bagTagId,
						memberId: null,
						season,
						league,
						assignedAt: formattedEventDate,
						reason: 'Upgraded'
					});
				}
			}

			for (let i = 0; i < sortedAttendees.length; i++) {
				batch.collection('bag_tag_assignments').create({
					bagTagId: poolForDistribution[i].bagTagId,
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