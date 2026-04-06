export async function load({ locals }) {
	const currentDate = new Date();

	const events = await locals.pb.collection('events').getFullList({});

	const upcomingEvents = events.filter((event) => new Date(event.endDateTime) >= currentDate).sort((a, b) => new Date(a.endDateTime) - new Date(b.endDateTime));

	const pastEvents = events.filter((event) => new Date(event.endDateTime) < currentDate).sort((a, b) => new Date(b.endDateTime) - new Date(a.endDateTime));

	return { upcomingEvents, pastEvents };
}
