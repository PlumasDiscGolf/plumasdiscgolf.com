// src/routes/admin/locations/new/+page.server.js
import { fail, redirect } from '@sveltejs/kit';

export const load = async ({ locals }) => {
	// No auth check needed here — the shared +layout.server.js already guards
	// the entire /admin route tree before this load runs.
	const courses = await locals.pb.collection('courses').getFullList({ sort: 'name' });
	return { courses };
};

function parseNumberOrNull(value) {
	if (value === null || value === undefined || value.trim() === '') return null;
	const n = Number(value);
	return Number.isNaN(n) ? null : n;
}

export const actions = {
	createLocation: async ({ request, locals }) => {
		if (!locals.user) {
			return fail(401, { error: 'User not authenticated.' });
		}

		const formData = await request.formData();
		const name = formData.get('name')?.toString();
		const isCourse = formData.get('isCourse') === 'on';
		const course = formData.get('course')?.toString() || '';
		const address = formData.get('address')?.toString() || '';
		const city = formData.get('city')?.toString() || '';
		const state = formData.get('state')?.toString() || '';
		const zipCode = formData.get('zipCode')?.toString() || '';
		const latitudeStr = formData.get('latitude')?.toString();
		const longitudeStr = formData.get('longitude')?.toString();

		// Only `name` is enforced here — nothing in the actual PocketBase
		// schema is marked required except the system id.
		const fieldErrors = {};
		if (!name) fieldErrors.name = 'Name is required.';

		const currentValues = { name, isCourse, course, address, city, state, zipCode, latitude: latitudeStr, longitude: longitudeStr };

		if (Object.keys(fieldErrors).length > 0) {
			return fail(400, { ...currentValues, fieldErrors, error: 'Please correct the errors.' });
		}

		try {
			await locals.pb.collection('locations').create({
				name,
				isCourse,
				course: course || null,
				address,
				city,
				state,
				zipCode,
				latitude: parseNumberOrNull(latitudeStr),
				longitude: parseNumberOrNull(longitudeStr)
			});
		} catch (err) {
			console.error('Error creating location:', err.response || err.originalError || err);
			let errorMessage = 'Failed to create location.';
			if (err.data?.data) {
				errorMessage += ` Details: ${JSON.stringify(err.data.data)}`;
			}
			return fail(500, { ...currentValues, error: errorMessage });
		}

		throw redirect(303, '/admin/locations?created=location');
	}
};