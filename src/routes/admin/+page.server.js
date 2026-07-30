// src/routes/admin/+page.server.js
//
// This is the FINAL, simple landing dashboard — the interim holding-pen
// version (which carried whatever sections hadn't been extracted yet) is
// fully retired now that every section has its own dedicated route.
export const load = async () => {
	// No auth check needed here — the shared +layout.server.js already guards
	// the entire /admin route tree before this load runs.
	return {};
};