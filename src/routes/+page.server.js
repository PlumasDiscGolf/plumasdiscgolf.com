export async function load({ locals }) {
	const posts = await locals.pb.collection('posts').getList(1, 3, {
		sort: '-publishedDate',
		filter: 'published = true'
	});

	const courses = await locals.pb.collection('courses').getFullList({
		expand: 'tags'
	});

	const currentDate = new Date();
	const allEvents = await locals.pb.collection('events').getFullList({});
	const upcomingEvents = allEvents
		.filter((event) => new Date(event.endDateTime) >= currentDate)
		.sort((a, b) => new Date(a.startDateTime) - new Date(b.startDateTime))
		.slice(0, 3);

	return { posts, courses, upcomingEvents };
}