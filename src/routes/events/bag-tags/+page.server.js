// src/routes/events/bag-tags/+page.server.js
export const load = async ({ locals }) => {
	try {
		// Same load shape as the admin bag tags page: all seasons/leagues loaded
		// at once, filtered client-side via the season dropdown. Each bag_tags
		// row already belongs to a single season+league, so its assignments
		// never span across seasons — safe to load in full.
		const bagTags = await locals.pb.collection('bag_tags').getFullList({ sort: '-season,league,tagNumber' });

		const bagTagAssignments = await locals.pb.collection('bag_tag_assignments').getFullList({
			sort: '-assignedAt,-created',
			expand: 'memberId'
		});

		return {
			bagTags: JSON.parse(JSON.stringify(bagTags)),
			bagTagAssignments: JSON.parse(JSON.stringify(bagTagAssignments))
		};
	} catch (err) {
		console.error('Error loading bag tag standings:', err);
		// Fail soft: the rules/info content on the page should still render even if this fails
		return { bagTags: [], bagTagAssignments: [] };
	}
};