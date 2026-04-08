// src/routes/+layout.server.js
export const load = async ({ locals, url }) => {
	// console.log(`[LAYOUT SERVER LOAD] Path: ${url.pathname}, User ID from locals: ${locals.user?.id || null}`);
	if (locals.user) {
		return {
			user: locals.user
		};
	}
	return {
		user: null
	};
};
