// src/routes/admin/bag-tags/history/+page.server.js
//
// Unlike every other bag tags page, this one filters and paginates SERVER-SIDE
// via URL query params rather than loading everything and filtering client-side.
// That's deliberate: this log only ever grows (every weekly event adds rows
// forever), unlike the bounded "current state" tables everywhere else in this
// feature, so it's the one place where loading the full dataset every time
// would eventually become a real problem.
import { redirect } from '@sveltejs/kit';

const PER_PAGE = 25;
const REASON_OPTIONS = ['League Round', 'Challenge Win', 'Season Opener', 'Manual Correction', 'Forfeited', 'Other'];

export const load = async ({ locals, url }) => {
	if (!locals.user) {
		throw redirect(303, '/login');
	}

	const season = url.searchParams.get('season') || '';
	const league = url.searchParams.get('league') || '';
	const memberId = url.searchParams.get('memberId') || '';
	const reason = url.searchParams.get('reason') || '';
	const bagTagId = url.searchParams.get('bagTagId') || '';
	const asOfDate = url.searchParams.get('asOfDate') || '';
	const page = Math.max(1, Number(url.searchParams.get('page')) || 1);

	const members = await locals.pb.collection('members').getFullList({ sort: 'lastName,firstName' });
	const bagTags = await locals.pb.collection('bag_tags').getFullList({ sort: '-season,league,tagNumber' });

	const currentYear = new Date().getFullYear();
	const seasonSet = new Set(bagTags.map((t) => t.season));
	seasonSet.add(currentYear);
	const availableSeasons = [...seasonSet].sort((a, b) => b - a);

	// If arriving via the per-row "History" button, show which tag this is scoped to.
	const focusedTag = bagTagId ? bagTags.find((t) => t.id === bagTagId) || null : null;

	const shared = { season, league, memberId, reason, bagTagId, asOfDate, members, availableSeasons, reasonOptions: REASON_OPTIONS, focusedTag };

	if (asOfDate) {
		// --- Snapshot mode: reconstruct standings as of a specific date ---
		let scopedTags;
		if (bagTagId) {
			scopedTags = bagTags.filter((t) => t.id === bagTagId);
		} else if (season && league) {
			scopedTags = bagTags.filter((t) => t.season === Number(season) && t.league === league);
		} else {
			// Need season+league (or a specific tag) for a meaningful snapshot
			return { mode: 'asOf', ...shared, snapshot: [], needsSeasonLeague: true };
		}

		let assignments = [];
		if (scopedTags.length > 0) {
			const filterParts = ['assignedAt <= {:asOfDate}'];
			const filterParams = { asOfDate };
			if (bagTagId) {
				filterParts.push('bagTagId = {:bagTagId}');
				filterParams.bagTagId = bagTagId;
			} else {
				filterParts.push('league = {:league}', 'season = {:season}');
				filterParams.league = league;
				filterParams.season = Number(season);
			}
			assignments = await locals.pb.collection('bag_tag_assignments').getFullList({
				filter: locals.pb.filter(filterParts.join(' && '), filterParams),
				sort: '-assignedAt,-created',
				expand: 'memberId'
			});
		}

		const latestByTagId = new Map();
		for (const a of assignments) {
			if (!latestByTagId.has(a.bagTagId)) latestByTagId.set(a.bagTagId, a);
		}

		const snapshot = scopedTags
			.map((tag) => {
				const latest = latestByTagId.get(tag.id);
				const holderMember = latest?.expand?.memberId;
				return {
					...tag,
					holderName: holderMember ? `${holderMember.firstName} ${holderMember.lastName}` : null,
					heldSince: holderMember ? latest?.assignedAt || null : null
				};
			})
			.sort((a, b) => a.tagNumber - b.tagNumber);

		return { mode: 'asOf', ...shared, snapshot: JSON.parse(JSON.stringify(snapshot)), needsSeasonLeague: false };
	}

	// --- Log mode: chronological, filtered, paginated ---
	const filterParts = [];
	const filterParams = {};
	if (bagTagId) {
		filterParts.push('bagTagId = {:bagTagId}');
		filterParams.bagTagId = bagTagId;
	}
	if (season) {
		filterParts.push('season = {:season}');
		filterParams.season = Number(season);
	}
	if (league) {
		filterParts.push('league = {:league}');
		filterParams.league = league;
	}
	if (memberId) {
		filterParts.push('memberId = {:memberId}');
		filterParams.memberId = memberId;
	}
	if (reason) {
		filterParts.push('reason = {:reason}');
		filterParams.reason = reason;
	}

	const filter = filterParts.length > 0 ? locals.pb.filter(filterParts.join(' && '), filterParams) : '';

	const result = await locals.pb.collection('bag_tag_assignments').getList(page, PER_PAGE, {
		filter,
		sort: '-assignedAt,-created',
		expand: 'memberId,bagTagId'
	});

	// For each null-member (forfeited/vacated) row on this page, find who held
	// the tag in the assignment immediately before it, so the log can say
	// "Vacated by <name>" instead of just "Vacated". This fetches each
	// affected tag's full history (small — one tag's lifetime, not the whole
	// collection) and looks at the entry right after the vacated row in that
	// tag's own newest-first timeline.
	const vacatedTagIds = [...new Set(result.items.filter((a) => !a.memberId).map((a) => a.bagTagId))];
	const vacatedByNameByAssignmentId = new Map();
	for (const tagId of vacatedTagIds) {
		const tagHistory = await locals.pb.collection('bag_tag_assignments').getFullList({
			filter: locals.pb.filter('bagTagId = {:tagId}', { tagId }),
			sort: '-assignedAt,-created',
			expand: 'memberId'
		});
		for (let i = 0; i < tagHistory.length; i++) {
			const row = tagHistory[i];
			if (!row.memberId && i + 1 < tagHistory.length) {
				const priorHolder = tagHistory[i + 1].expand?.memberId;
				if (priorHolder) {
					vacatedByNameByAssignmentId.set(row.id, `${priorHolder.firstName} ${priorHolder.lastName}`);
				}
			}
		}
	}

	const assignmentsWithVacatedBy = result.items.map((a) => ({
		...a,
		vacatedByName: vacatedByNameByAssignmentId.get(a.id) || null
	}));

	return {
		mode: 'log',
		...shared,
		page,
		totalPages: result.totalPages,
		totalItems: result.totalItems,
		assignments: JSON.parse(JSON.stringify(assignmentsWithVacatedBy))
	};
};