// src/routes/courses/+page.server.js

export async function load({ locals }) {
	const courses = await locals.pb.collection('courses').getFullList({
		expand: 'tags'
	});

	// courses.location is a plain text field with NO relation to `locations` —
	// the relation actually goes the other way (locations.course points AT a
	// course, optionally). So there's nothing to `expand` here; instead we
	// fetch every location that represents a course and match it back to its
	// course by id, to pull city/state for display on this page.
	const courseLocations = await locals.pb.collection('locations').getFullList({
		filter: 'isCourse = true'
	});
	const locationByCourseId = new Map(courseLocations.filter((l) => l.course).map((l) => [l.course, l]));

	const coursesWithCityState = courses.map((course) => {
		const location = locationByCourseId.get(course.id);
		return {
			...course,
			cityState: location ? [location.city, location.state].filter(Boolean).join(', ') : ''
		};
	});

	return { courses: coursesWithCityState };
}