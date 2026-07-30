// src/routes/admin/courses/new/+page.server.js
import { fail, redirect } from '@sveltejs/kit';

export const load = async () => {
	// No auth check needed here — the shared +layout.server.js already guards
	// the entire /admin route tree before this load runs.
	return {};
};

// Parses a form field as a number, returning null for empty/invalid input
// rather than NaN (PocketBase number fields accept null for "no value").
function parseNumberOrNull(value) {
	if (value === null || value === undefined || value.trim() === '') return null;
	const n = Number(value);
	return Number.isNaN(n) ? null : n;
}

export const actions = {
	createCourse: async ({ request, locals }) => {
		if (!locals.user) {
			return fail(401, { error: 'User not authenticated.' });
		}

		const formData = await request.formData();
		const name = formData.get('name')?.toString();
		const description = formData.get('description')?.toString() || '';
		const location = formData.get('location')?.toString() || '';
		const numberOfHolesStr = formData.get('numberOfHoles')?.toString();
		const parStr = formData.get('par')?.toString();
		const lengthInFeetStr = formData.get('lengthInFeet')?.toString();
		const tags = formData.getAll('tags').map((t) => t.toString());
		const image = formData.get('image');

		// `name` plus `numberOfHoles`/`par` are enforced here — the latter two
		// aren't required at the PocketBase schema level, but leaving them
		// blank silently saves as 0 (PocketBase's default for an empty Number
		// field), which then fails the min=1 constraint the next time this
		// record is edited. Requiring real values here prevents that state
		// from ever being created in the first place.
		const fieldErrors = {};
		if (!name) fieldErrors.name = 'Name is required.';
		if (tags.length > 3) fieldErrors.tags = 'Select at most 3 tags.';
		const numberOfHolesNum = Number(numberOfHolesStr);
		if (!numberOfHolesStr || !Number.isInteger(numberOfHolesNum) || numberOfHolesNum < 1) {
			fieldErrors.numberOfHoles = 'Number of Holes must be a whole number of at least 1.';
		}
		const parNum = Number(parStr);
		if (!parStr || !Number.isInteger(parNum) || parNum < 1) {
			fieldErrors.par = 'Par must be a whole number of at least 1.';
		}

		const currentValues = {
			name,
			description,
			location,
			numberOfHoles: numberOfHolesStr,
			par: parStr,
			lengthInFeet: lengthInFeetStr,
			tags
		};

		if (Object.keys(fieldErrors).length > 0) {
			return fail(400, { ...currentValues, fieldErrors, error: 'Please correct the errors.' });
		}

		// NOTE: address/city/state/zipCode/latitude/longitude are no longer
		// handled here — that data now lives on `locations` instead, since a
		// course's actual address information moved there (see the Locations
		// admin section). The fields still exist on the `courses` collection
		// itself for now (not yet removed from the schema), just unused here.
		const dataToSave = new FormData(); // FormData needed since this collection has a file field
		dataToSave.append('name', name);
		dataToSave.append('description', description);
		dataToSave.append('location', location);
		const numberOfHoles = parseNumberOrNull(numberOfHolesStr);
		if (numberOfHoles !== null) dataToSave.append('numberOfHoles', numberOfHoles);
		const par = parseNumberOrNull(parStr);
		if (par !== null) dataToSave.append('par', par);
		const lengthInFeet = parseNumberOrNull(lengthInFeetStr);
		if (lengthInFeet !== null) dataToSave.append('lengthInFeet', lengthInFeet);
		for (const tag of tags) dataToSave.append('tags', tag);
		if (image && image.size > 0) dataToSave.append('image', image);

		try {
			await locals.pb.collection('courses').create(dataToSave);
		} catch (err) {
			console.error('Error creating course:', err.response || err.originalError || err);
			let errorMessage = 'Failed to create course.';
			if (err.data?.data) {
				errorMessage += ` Details: ${JSON.stringify(err.data.data)}`;
			}
			return fail(500, { ...currentValues, error: errorMessage });
		}

		throw redirect(303, '/admin/courses?created=course');
	}
};