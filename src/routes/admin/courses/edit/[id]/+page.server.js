// src/routes/admin/courses/edit/[id]/+page.server.js
import { error, fail, redirect } from '@sveltejs/kit';

function parseNumberOrNull(value) {
	if (value === null || value === undefined || value.trim() === '') return null;
	const n = Number(value);
	return Number.isNaN(n) ? null : n;
}

export const load = async ({ locals, params }) => {
	// No auth check needed here — the shared +layout.server.js already guards
	// the entire /admin route tree before this load runs.
	try {
		const course = await locals.pb.collection('courses').getOne(params.id);
		return {
			course: JSON.parse(JSON.stringify(course))
		};
	} catch (err) {
		console.error('Error loading course for editing:', err);
		if (err.status === 404) throw error(404, 'Course not found');
		throw error(500, 'Failed to load course data.');
	}
};

export const actions = {
	updateCourse: async ({ request, locals, params }) => {
		if (!locals.user) return fail(401, { error: 'User not authenticated.' });
		if (!params.id) return fail(400, { error: 'Course ID is missing.' });

		const formData = await request.formData();
		const name = formData.get('name')?.toString();
		const description = formData.get('description')?.toString() || '';
		const location = formData.get('location')?.toString() || '';
		const numberOfHolesStr = formData.get('numberOfHoles')?.toString();
		const parStr = formData.get('par')?.toString();
		const lengthInFeetStr = formData.get('lengthInFeet')?.toString();
		const tags = formData.getAll('tags').map((t) => t.toString());
		const image = formData.get('image');
		const deleteExistingImage = formData.get('deleteExistingImage') === 'true';

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
		// handled here — that data now lives on `locations` instead. The
		// fields still exist on the `courses` collection itself for now (not
		// yet removed from the schema), just unused/untouched here, so
		// whatever was last saved on a course stays exactly as it was.
		const dataToUpdate = new FormData();
		dataToUpdate.append('name', name);
		dataToUpdate.append('description', description);
		dataToUpdate.append('location', location);
		const numberOfHoles = parseNumberOrNull(numberOfHolesStr);
		dataToUpdate.append('numberOfHoles', numberOfHoles !== null ? numberOfHoles : '');
		const par = parseNumberOrNull(parStr);
		dataToUpdate.append('par', par !== null ? par : '');
		const lengthInFeet = parseNumberOrNull(lengthInFeetStr);
		dataToUpdate.append('lengthInFeet', lengthInFeet !== null ? lengthInFeet : '');
		// Clear any existing tags before re-adding the current selection —
		// otherwise PocketBase would append to the existing array rather
		// than replace it.
		dataToUpdate.append('tags', '');
		for (const tag of tags) dataToUpdate.append('tags', tag);

		if (image && image.size > 0) {
			dataToUpdate.append('image', image);
		} else if (deleteExistingImage) {
			dataToUpdate.append('image', ''); // Empty string deletes the file — null gets stringified to "null" by FormData and rejected
		}

		try {
			await locals.pb.collection('courses').update(params.id, dataToUpdate);
		} catch (err) {
			console.error('Error updating course:', err.response || err.originalError || err);
			let errorMessage = 'Failed to update course.';
			if (err.data?.data) {
				errorMessage += ` Details: ${JSON.stringify(err.data.data)}`;
			}
			return fail(500, { ...currentValues, error: errorMessage });
		}

		throw redirect(303, '/admin/courses?updated=course');
	}
};