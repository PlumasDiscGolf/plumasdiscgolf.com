// src/routes/courses/[id]/+page.server.js

export async function load({ locals, params }) {
	const course = await locals.pb.collection('courses').getOne(params.id);

	// courses.address/city/state/zipCode are no longer the source of truth —
	// that data now lives on `locations` instead. The relation goes
	// location -> course (locations.course), not the other way, so we look
	// up the matching location record here rather than expanding a relation
	// directly on the course.
	let location = null;
	try {
		location = await locals.pb.collection('locations').getFirstListItem(
			locals.pb.filter('course = {:courseId} && isCourse = true', { courseId: params.id })
		);
	} catch (err) {
		// getFirstListItem throws a 404-style error when nothing matches —
		// that's an expected, valid state (no linked location yet), not a
		// real failure worth logging.
	}

	return {
		course: {
			...course,
			// Overriding with the same field names the template already
			// expects, so the .svelte file needs no changes at all.
			address: location?.address || '',
			city: location?.city || '',
			state: location?.state || '',
			zipCode: location?.zipCode || '',
			latitude: location?.latitude || null,
			longitude: location?.longitude || null
		}
	};
}