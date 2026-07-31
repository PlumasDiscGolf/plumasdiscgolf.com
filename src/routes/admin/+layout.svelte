<script>
	import { Icon, ArrowRightStartOnRectangle, CircleStack, Tag, Trophy, Home, Heart, CalendarDays, UserGroup, Users, UserCircle, Map as MapIcon, Ticket, Newspaper, CheckCircle, PencilSquare, MapPin } from 'svelte-hero-icons';
	import { page } from '$app/stores';
	import { replaceState } from '$app/navigation';
	import * as config from '$lib/config.js';

	let { data, children } = $props();

	// Sections that don't belong to any group — plain top-level links.
	const ungroupedSections = [
		{ href: '/admin/courses', label: 'Courses', icon: MapIcon },
		{ href: '/admin/events', label: 'Events', icon: Ticket },
		{ href: '/admin/locations', label: 'Locations', icon: MapPin },
		{ href: '/admin/posts', label: 'Posts', icon: Newspaper },
		{ href: '/admin/volunteers', label: 'Volunteers', icon: Heart }
	];

	// Related pairs of sections, shown under a shared group heading with
	// shorter individual labels (since the group name already gives context).
	const groupedSections = [
		{
			groupLabel: 'Leagues & Series',
			items: [
				{ href: '/admin/bag-tags', label: 'Bag Tags', icon: Tag },
				{ href: '/admin/plumas-series', label: 'Plumas Series', icon: Trophy }
			]
		},
		{
			groupLabel: 'Memberships',
			items: [
				{ href: '/admin/members', label: 'Members', icon: UserCircle },
				{ href: '/admin/memberships', label: 'Memberships', icon: Users },
				{ href: '/admin/waivers', label: 'Waivers', icon: PencilSquare }
			]
		},
		{
			groupLabel: 'Board',
			items: [
				{ href: '/admin/board/members', label: 'Directors', icon: UserGroup },
				{ href: '/admin/board/meetings', label: 'Meetings', icon: CalendarDays }
			]
		}
	];

	// Flat list (carrying group context) used only for the page-header title
	// lookup — the sidebar itself renders from the two structures above.
	const allSections = [
		...ungroupedSections,
		...groupedSections.flatMap((g) => g.items.map((item) => ({ ...item, groupLabel: g.groupLabel })))
	];

	// Plain startsWith() causes false-positive matches when one route's path
	// is a literal text prefix of another — e.g. "/admin/members" is a
	// prefix of "/admin/memberships" ("members" + "hips" = "memberships"),
	// so both would incorrectly show as active. This requires an exact match
	// or a "/" boundary right after the prefix, so a route only matches its
	// own path and genuine sub-routes (e.g. /admin/members/edit/123), never
	// an unrelated route that merely happens to start with the same letters.
	// Bag Tags stays highlighted across ALL its sub-routes (new/edit/assign/
	// forfeit/weekly-event/history) by design — a single link, not split
	// across multiple sidebar entries.
	function isActivePath(href) {
		const pathname = $page.url.pathname;
		return pathname === href || pathname.startsWith(href + '/');
	}

	function currentPageTitle() {
		const match = allSections.find((s) => isActivePath(s.href));
		if (!match) return 'Dashboard';
		return match.label;
	}

	let successAlertMessage = $state('');

	function clearAlerts() {
		successAlertMessage = '';
	}

	// Plain (non-reactive) variable — deliberately NOT $state, so reading/
	// writing it never creates a reactive dependency of its own. This guards
	// against a reentrant loop: if replaceState() re-triggers this effect for
	// any reason before $page.url visibly reflects the cleared search, the
	// guard below stops it from ever calling replaceState a second time for
	// the same query string, making a loop structurally impossible regardless
	// of the exact underlying cause.
	let processedSearch = null;

	// Unified success-banner handling for every admin page. Create/update
	// already redirected with ?created=/?updated=; delete now does the same
	// with ?deleted=, so this one effect covers all three for every section
	// without each page needing its own copy of this logic. Errors (from a
	// failed delete's fail() response) stay local to whichever page's own
	// action produced them — SvelteKit's `form` prop only exists on the page
	// that owns the action, not here in the parent layout.
	$effect(() => {
		const currentUrl = $page.url;
		const search = currentUrl.search;

		if (!search || search === processedSearch) return;
		processedSearch = search;

		const createdType = currentUrl.searchParams.get('created');
		const updatedType = currentUrl.searchParams.get('updated');
		const deletedType = currentUrl.searchParams.get('deleted');

		let localMessage = '';
		if (createdType) localMessage = `${createdType.charAt(0).toUpperCase() + createdType.slice(1)} created successfully!`;
		else if (updatedType) localMessage = `${updatedType.charAt(0).toUpperCase() + updatedType.slice(1)} updated successfully!`;
		else if (deletedType) localMessage = `${deletedType.charAt(0).toUpperCase() + deletedType.slice(1)} deleted successfully!`;

		if (localMessage) {
			successAlertMessage = localMessage;
			const cleanUrl = new URL(currentUrl.href);
			cleanUrl.search = '';
			replaceState(cleanUrl, {});
			setTimeout(() => clearAlerts(), 3000);
		}
	});
</script>

<svelte:head>
	<title>{config.title} - Admin Panel</title>
</svelte:head>

<div class="container mx-auto px-4 pt-4">
	{#if successAlertMessage}
		<div class="alert alert-success mb-4 shadow-lg">
			<div><Icon src={CheckCircle} class="h-6 w-6"></Icon><span>{successAlertMessage}</span></div>
			<div class="flex-none"><button class="btn btn-ghost btn-sm" onclick={clearAlerts}>✕</button></div>
		</div>
	{/if}
</div>

<div class="hero mb-4 bg-base-200 py-10">
	<div class="hero-content text-center">
		<div class="max-w-md">
			<h1 class="text-4xl font-bold">Admin Panel</h1>
		</div>
	</div>
</div>

<div class="drawer lg:drawer-open">
	<input id="admin-drawer" type="checkbox" class="drawer-toggle" />
	<div class="drawer-content flex flex-col p-4">
		<div class="mb-4 flex w-full items-center justify-between">
			<label for="admin-drawer" class="btn btn-primary drawer-button lg:hidden">
				<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="inline-block h-6 w-6 stroke-current"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
				Menu
			</label>
			<div class="lg:hidden">
				<a href="/logout" class="btn btn-error btn-sm flex items-center gap-2">
					<Icon src={ArrowRightStartOnRectangle} class="h-5 w-5"></Icon>Logout
				</a>
			</div>
		</div>

		<div class="card w-full bg-base-100 shadow-xl">
			<div class="card-body p-0">
				<div class="flex items-center justify-between rounded-t-lg bg-neutral p-4 text-neutral-content">
					<h2 class="text-xl font-bold">{currentPageTitle()}</h2>
					<div class="hidden lg:flex">
						<a href="/logout" class="btn btn-error btn-sm flex items-center gap-2">
							<Icon src={ArrowRightStartOnRectangle} class="h-5 w-5"></Icon>Logout
						</a>
					</div>
				</div>

				<div class="p-4">
					{@render children()}
				</div>
			</div>
		</div>
	</div>
	<div class="drawer-side">
		<label for="admin-drawer" aria-label="close sidebar" class="drawer-overlay"></label>
		<ul class="menu min-h-full w-60 bg-base-200 p-4 text-base-content md:w-64">
			<li class="menu-title text-sm"><span>Admin Menu</span></li>
			<li>
				<a href="/admin" class:active={$page.url.pathname === '/admin'}>
					<Icon src={Home} solid class="h-5 w-5" />
					Dashboard
				</a>
			</li>
			{#each ungroupedSections as section (section.href)}
				<li>
					<a href={section.href} class:active={isActivePath(section.href)}>
						<Icon src={section.icon || CircleStack} solid class="h-5 w-5" />
						{section.label}
					</a>
				</li>
			{/each}
			{#each groupedSections as group (group.groupLabel)}
				<li class="menu-title text-sm mt-2"><span>{group.groupLabel}</span></li>
				{#each group.items as section (section.href)}
					<li>
						<a href={section.href} class:active={isActivePath(section.href)}>
							<Icon src={section.icon || CircleStack} solid class="h-5 w-5" />
							{section.label}
						</a>
					</li>
				{/each}
			{/each}
		</ul>
	</div>
</div>