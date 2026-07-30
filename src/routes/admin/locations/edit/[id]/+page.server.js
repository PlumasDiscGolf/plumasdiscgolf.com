// src/routes/admin/locations/edit/[id]/+page.server.js
import { error, fail, redirect } from '@sveltejs/kit';

export const load = async ({ locals, params }) => {
	// No auth check needed here — the shared +layout.server.js already guards
	// the entire /admin route tree before this load runs.
	try {
		const location = await locals.pb.collection('locations').getOne(params.id);
		const courses = await locals.pb.collection('courses').getFullList({ sort: 'name' });
		return {
			location: JSON.parse(JSON.stringify(location)),
			courses
		};
	} catch (err) {
		console.error('Error loading location for editing:', err);
		if (err.status === 404) throw error(404, 'Location not found');
		throw error(500, 'Failed to load location data.');
	}
};

function parseNumberOrNull(value) {
	if (value === null || value === undefined || value.trim() === '') return null;
	const n = Number(value);
	return Number.isNaN(n) ? null : n;
}

export const actions = {
	updateLocation: async ({ request, locals, params }) => {
		if (!locals.user) return fail(401, { error: 'User not authenticated.' });
		if (!params.id) return fail(400, { error: 'Location ID is missing.' });

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

		const fieldErrors = {};
		if (!name) fieldErrors.name = 'Name is required.';

		const currentValues = { name, isCourse, course, address, city, state, zipCode, latitude: latitudeStr, longitude: longitudeStr };

		if (Object.keys(fieldErrors).length > 0) {
			return fail(400, { ...currentValues, fieldErrors, error: 'Please correct the errors.' });
		}

		try {
			await locals.pb.collection('locations').update(params.id, {
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
			console.error('Error updating location:', err.response || err.originalError || err);
			let errorMessage = 'Failed to update location.';
			if (err.data?.data) {
				errorMessage += ` Details: ${JSON.stringify(err.data.data)}`;
			}
			return fail(500, { ...currentValues, error: errorMessage });
		}

		throw redirect(303, '/admin/locations?updated=location');
	}
};