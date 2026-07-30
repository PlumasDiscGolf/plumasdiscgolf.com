// src/routes/events/[id]/+page.server.js

export async function load({ locals, params }) {
	const event = await locals.pb.collection('events').getOne(params.id, {
		expand: 'location',
	});
	return { event };
}
