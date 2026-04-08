// src/hooks.server.js
import PocketBase from 'pocketbase';

export async function handle({ event, resolve }) {
	// console.log(`[HOOKS] Request START: ${event.url.pathname}`);
	event.locals.pb = new PocketBase('https://pdg.pockethost.io/');

	const cookie = event.request.headers.get('cookie') || '';
	// console.log('[HOOKS] Raw cookie from request:', cookie); // Can be very verbose

	event.locals.pb.authStore.loadFromCookie(cookie);
	// if (event.locals.pb.authStore.token) {
	// 	console.log('[HOOKS] Token loaded from cookie. isValid (initial):', event.locals.pb.authStore.isValid);
	// } else {
	// 	console.log('[HOOKS] No token found in cookie.');
	// }
	// console.log('[HOOKS] Model after loadFromCookie:', event.locals.pb.authStore.model?.id || null);

	try {
		if (event.locals.pb.authStore.isValid) {
			// console.log('[HOOKS] Auth store is valid, attempting authRefresh for user:', event.locals.pb.authStore.model?.id);
			await event.locals.pb.collection('users').authRefresh();
			// console.log('[HOOKS] authRefresh successful. New isValid:', event.locals.pb.authStore.isValid, 'New Model:', event.locals.pb.authStore.model?.id || null);
		} else if (event.locals.pb.authStore.token) {
			// Token exists but is not valid (e.g., expired), so clear it
			// console.log('[HOOKS] Token exists but authStore is not valid. Clearing store.');
			event.locals.pb.authStore.clear();
		} else {
			// No token and not valid, do nothing
			// console.log('[HOOKS] Auth store is not valid and no token, skipping authRefresh.');
		}
	} catch (err) {
		// console.error('[HOOKS] authRefresh failed:', err.message);
		event.locals.pb.authStore.clear();
		// console.log('[HOOKS] Auth store cleared due to authRefresh error.');
	}

	if (event.locals.pb.authStore.isValid && event.locals.pb.authStore.model) {
		// Use structuredClone to pass a plain object to avoid potential issues with SvelteKit serializing PocketBase's reactive model
		event.locals.user = structuredClone(event.locals.pb.authStore.model);
		// console.log('[HOOKS] Setting locals.user for user ID:', event.locals.user.id);
	} else {
		event.locals.user = null;
		// console.log('[HOOKS] Setting locals.user to null.');
	}

	const response = await resolve(event);

	const newCookie = event.locals.pb.authStore.exportToCookie({
		secure: event.url.protocol === 'https:',
		httpOnly: true,
		sameSite: 'lax',
		path: '/'
	});
	// console.log('[HOOKS] Setting cookie in response header:', newCookie.substring(0, 150) + "..."); // Log part of the cookie
	response.headers.append('set-cookie', newCookie);
	// console.log(`[HOOKS] Request END: ${event.url.pathname}`);

	return response;
}
