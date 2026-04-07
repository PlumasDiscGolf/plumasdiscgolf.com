<script>
	import { format, parseISO, isSameDay } from 'date-fns';
	import { Icon, PencilSquare, Trash, PlusCircle, ArrowRightStartOnRectangle, CalendarDays, Map, Newspaper, UserGroup, Heart, CurrencyDollar, Users, CircleStack, ArrowDownTray, Ticket, ChevronUpDown, ChevronUp, ChevronDown, CheckCircle } from 'svelte-hero-icons';
	import PocketBase from 'pocketbase';
	import { page } from '$app/stores';
	import { replaceState, invalidateAll } from '$app/navigation';
	import { enhance } from '$app/forms';
	import { preventDefault } from '$lib/utils.js';

	let { data, form } = $props();

	// --- START: SORTING LOGIC ---
	let sortKey = $state('');
	let sortOrder = $state(1); // 1 for ascending, -1 for descending

	function setSortKey(key) {
		if (sortKey === key) {
			sortOrder *= -1; // Reverse order if same key is clicked
		} else {
			sortKey = key;
			sortOrder = 1; // Default to ascending on new key
		}
	}

	// Generic sort function for different data types
	function sortData(array) {
		if (!sortKey || !array) return array;

		return [...array].sort((a, b) => {
			const valA = a[sortKey];
			const valB = b[sortKey];

			if (valA == null) return 1;
			if (valB == null) return -1;

			if (typeof valA === 'number' && typeof valB === 'number') {
				return (valA - valB) * sortOrder;
			}
			if (typeof valA === 'boolean' && typeof valB === 'boolean') {
				return (valA === valB ? 0 : valA ? -1 : 1) * sortOrder;
			}

			const strA = String(valA).toLowerCase();
			const strB = String(valB).toLowerCase();
			return strA.localeCompare(strB) * sortOrder;
		});
	}

	// Create derived state for each sorted list
	let sortedEvents = $derived(sortData(data.events));
	let sortedCourses = $derived(sortData(data.courses));
	let sortedPosts = $derived(sortData(data.posts));
	let sortedBoardMembers = $derived(sortData(data.boardMembers));
	let sortedBoardMeetings = $derived(sortData(data.boardMeetings));
	let sortedVolunteers = $derived(sortData(data.volunteers));
	let sortedDonations = $derived(sortData(data.donations));
	let sortedMemberships = $derived(sortData(data.memberships));
	// --- END: SORTING LOGIC ---

	const pb_client = new PocketBase('https://pdg.pockethost.io/');
	const adminSections = [
		{ id: 'events', label: 'Events', icon: Ticket, addNewUrl: '/admin/events/new', editUrlBase: '/admin/events/edit' },
		{ id: 'courses', label: 'Courses', icon: Map, addNewUrl: '/admin/courses/new', editUrlBase: '/admin/courses/edit' },
		{ id: 'posts', label: 'Posts', icon: Newspaper, addNewUrl: '/admin/posts/new', editUrlBase: '/admin/posts/edit' },
		{ id: 'boardMembers', label: 'Board Members', icon: UserGroup, addNewUrl: '/admin/board/members/new', editUrlBase: '/admin/board/members/edit' },
		{ id: 'boardMeetings', label: 'Board Meetings', icon: CalendarDays, addNewUrl: '/admin/board/meetings/new', editUrlBase: '/admin/board/meetings/edit' },
		{ id: 'memberships', label: 'Memberships', icon: Users, addNewUrl: '/admin/memberships/new', editUrlBase: '/admin/memberships/edit' },
		{ id: 'volunteers', label: 'Volunteers', icon: Heart, addNewUrl: '/admin/volunteers/new', editUrlBase: '/admin/volunteers/edit' },
		{ id: 'donations', label: 'Donations', icon: CurrencyDollar, addNewUrl: '/admin/donations/new', editUrlBase: '/admin/donations/edit' }
	];

	let activeSectionId = $state('events');

	$effect(() => {
    if (typeof window !== 'undefined') {
        const hash = window.location.hash.substring(1);
        console.log('$effect running, hash:', hash, 'activeSectionId:', activeSectionId);
        const isValidSection = adminSections.some((s) => s.id === hash);
        if (hash && isValidSection) {
            activeSectionId = hash;
        }
    }
	});

	function setActiveSection(sectionId) {
		activeSectionId = sectionId;
		if (typeof window !== 'undefined') {
			const newUrl = new URL(window.location.href);
			newUrl.hash = sectionId;
			replaceState(newUrl, {});
		}
	}

	let successAlertMessage = $state('');
	let errorAlertMessage = $state('');

	function enhanceDelete() {
    return async ({ update }) => {
        const currentSection = activeSectionId;
        await update();
        await invalidateAll();
        activeSectionId = currentSection;
        if (typeof window !== 'undefined') {
            const newUrl = new URL(window.location.href);
            newUrl.hash = currentSection;
            replaceState(newUrl, {});
        }
    };
	}

	function clearAlerts() {
		successAlertMessage = '';
		errorAlertMessage = '';
	}

	$effect(() => {
		if (form?.success) {
			successAlertMessage = 'Item deleted successfully.';
			setTimeout(() => clearAlerts(), 3000);
		}
		if (form?.error) {
			errorAlertMessage = form.error;
			setTimeout(() => clearAlerts(), 3000);
		}
	});

	$effect(() => {
		const currentUrl = $page.url;
		const createdType = currentUrl.searchParams.get('created');
		const updatedType = currentUrl.searchParams.get('updated');

		let messageSet = false;
		let localSuccessMessage = '';

		if (createdType) {
			localSuccessMessage = `${createdType.charAt(0).toUpperCase() + createdType.slice(1)} created successfully!`;
			messageSet = true;
		}
		if (updatedType) {
			localSuccessMessage = `${updatedType.charAt(0).toUpperCase() + updatedType.slice(1)} updated successfully!`;
			messageSet = true;
		}

		if (messageSet) {
			successAlertMessage = localSuccessMessage;
			const cleanUrl = new URL(currentUrl.href);
			cleanUrl.search = '';
			replaceState(cleanUrl, {});
			setTimeout(() => clearAlerts(), 3000);
		}
	});
</script>

<div class="container mx-auto px-4 pt-4">
	{#if successAlertMessage}
		<div class="alert alert-success mb-4 shadow-lg">
			<div><Icon src={CheckCircle} class="h-6 w-6"></Icon><span>{successAlertMessage}</span></div>
			<div class="flex-none"><button class="btn btn-ghost btn-sm" onclick={clearAlerts}>✕</button></div>
		</div>
	{/if}
	{#if errorAlertMessage}
		<div class="alert alert-error mb-4 shadow-lg">
			<div><Icon src={XCircle} class="h-6 w-6"></Icon><span>{errorAlertMessage}</span></div>
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
					<h2 class="text-xl font-bold">
						{adminSections.find((s) => s.id === activeSectionId)?.label || 'Dashboard'}
					</h2>
					<div class="hidden lg:flex">
						<a href="/logout" class="btn btn-error btn-sm flex items-center gap-2">
							<Icon src={ArrowRightStartOnRectangle} class="h-5 w-5"></Icon>Logout
						</a>
					</div>
				</div>

				<div class="p-4 {activeSectionId === 'events' ? '' : 'hidden'}">
					<div class="mb-4 flex justify-end">
						<a href="/admin/events/new" class="btn btn-secondary btn-sm flex items-center gap-2"><Icon src={PlusCircle} class="h-6 w-6"></Icon>Add New Event</a>
					</div>
					<div class="overflow-x-auto">
						<table class="table table-zebra w-full">
							<thead>
								<tr>
									<th onclick={() => setSortKey('name')} class="cursor-pointer">Name <Icon src={sortKey === 'name' ? (sortOrder === 1 ? ChevronUp : ChevronDown) : ChevronUpDown} class="inline-block h-4 w-4" /></th>
									<th onclick={() => setSortKey('startDateTime')} class="cursor-pointer">Date <Icon src={sortKey === 'startDateTime' ? (sortOrder === 1 ? ChevronUp : ChevronDown) : ChevronUpDown} class="inline-block h-4 w-4" /></th>
									<th onclick={() => setSortKey('eventType')} class="cursor-pointer">Type <Icon src={sortKey === 'eventType' ? (sortOrder === 1 ? ChevronUp : ChevronDown) : ChevronUpDown} class="inline-block h-4 w-4" /></th>
									<th>Actions</th>
								</tr>
							</thead>
							<tbody>
								{#if sortedEvents && sortedEvents.length > 0}
									{#each sortedEvents as item (item.id)}
										<tr>
											<td>{item.name}</td>
											<td>
												{#if item.startDateTime}
													{#if item.endDateTime && !isSameDay(parseISO(item.startDateTime), parseISO(item.endDateTime))}
														{format(parseISO(item.startDateTime), 'MMM do, yyyy')} - {format(parseISO(item.endDateTime), 'MMM do, yyyy')}
													{:else}
														{format(parseISO(item.startDateTime), 'MMM do, yyyy')}
													{/if}
												{/if}
											</td>
											<td>{item.eventType}</td>
											<td class="flex gap-2">
												<a href="/admin/events/edit/{item.id}" title="Edit Event" class="btn btn-square btn-info btn-sm"><Icon src={PencilSquare} class="h-4 w-4"></Icon></a>
												<form
													method="POST"
													action="?/delete"
													use:enhance={enhanceDelete}
													onsubmit={(e) => {
														if (!window.confirm(`Delete "${item.name}"?`)) e.preventDefault();
													}}
												>
													<input type="hidden" name="collectionName" value="events" />
													<input type="hidden" name="itemId" value={item.id} />
													<button type="submit" title="Delete Event" class="btn btn-square btn-error btn-sm"><Icon src={Trash} class="h-4 w-4"></Icon></button>
												</form>
											</td>
										</tr>
									{/each}
								{:else}<tr><td colspan="4" class="p-4 text-center">No events found.</td></tr>{/if}
							</tbody>
						</table>
					</div>
				</div>

				<div class="p-4 {activeSectionId === 'courses' ? '' : 'hidden'}">
					<div class="mb-4 flex justify-end">
						<a href="/admin/courses/new" class="btn btn-secondary btn-sm flex items-center gap-2"><Icon src={PlusCircle} class="h-6 w-6"></Icon>Add New Course</a>
					</div>
					<div class="overflow-x-auto">
						<table class="table table-zebra w-full">
							<thead>
								<tr>
									<th onclick={() => setSortKey('name')} class="cursor-pointer">Name <Icon src={sortKey === 'name' ? (sortOrder === 1 ? ChevronUp : ChevronDown) : ChevronUpDown} class="inline-block h-4 w-4" /></th>
									<th onclick={() => setSortKey('numberOfHoles')} class="cursor-pointer">Holes <Icon src={sortKey === 'numberOfHoles' ? (sortOrder === 1 ? ChevronUp : ChevronDown) : ChevronUpDown} class="inline-block h-4 w-4" /></th>
									<th onclick={() => setSortKey('par')} class="cursor-pointer">Par <Icon src={sortKey === 'par' ? (sortOrder === 1 ? ChevronUp : ChevronDown) : ChevronUpDown} class="inline-block h-4 w-4" /></th>
									<th onclick={() => setSortKey('location')} class="cursor-pointer">Location <Icon src={sortKey === 'location' ? (sortOrder === 1 ? ChevronUp : ChevronDown) : ChevronUpDown} class="inline-block h-4 w-4" /></th>
									<th>Actions</th>
								</tr>
							</thead>
							<tbody>
								{#if sortedCourses && sortedCourses.length > 0}
									{#each sortedCourses as item (item.id)}
										<tr>
											<td>{item.name}</td><td>{item.numberOfHoles}</td><td>{item.par}</td><td>{item.location}</td>
											<td class="flex gap-2">
												<a href="/admin/courses/edit/{item.id}" title="Edit Course" class="btn btn-square btn-info btn-sm"><Icon src={PencilSquare} class="h-4 w-4"></Icon></a>
												<form
													method="POST"
													action="?/delete"
													use:enhance={enhanceDelete}
													onsubmit={(e) => {
														if (!window.confirm(`Delete "${item.name}"?`)) e.preventDefault();
													}}
												>
													<input type="hidden" name="collectionName" value="courses" />
													<input type="hidden" name="itemId" value={item.id} />
													<button type="submit" title="Delete Course" class="btn btn-square btn-error btn-sm"><Icon src={Trash} class="h-4 w-4"></Icon></button>
												</form>
											</td>
										</tr>
									{/each}
								{:else}<tr><td colspan="5" class="p-4 text-center">No courses found.</td></tr>{/if}
							</tbody>
						</table>
					</div>
				</div>
				<div class="p-4 {activeSectionId === 'posts' ? '' : 'hidden'}">
					<div class="mb-4 flex justify-end">
						<a href="/admin/posts/new" class="btn btn-secondary btn-sm flex items-center gap-2"><Icon src={PlusCircle} class="h-6 w-6"></Icon>Add New Post</a>
					</div>
					<div class="overflow-x-auto">
						<table class="table table-zebra w-full">
							<thead>
								<tr>
									<th onclick={() => setSortKey('title')} class="cursor-pointer">Title <Icon src={sortKey === 'title' ? (sortOrder === 1 ? ChevronUp : ChevronDown) : ChevronUpDown} class="inline-block h-4 w-4" /></th>
									<th onclick={() => setSortKey('publishedDate')} class="cursor-pointer">Date <Icon src={sortKey === 'publishedDate' ? (sortOrder === 1 ? ChevronUp : ChevronDown) : ChevronUpDown} class="inline-block h-4 w-4" /></th>
									<th onclick={() => setSortKey('published')} class="cursor-pointer">Published <Icon src={sortKey === 'published' ? (sortOrder === 1 ? ChevronUp : ChevronDown) : ChevronUpDown} class="inline-block h-4 w-4" /></th>
									<th>Actions</th>
								</tr>
							</thead>
							<tbody>
								{#if sortedPosts && sortedPosts.length > 0}
									{#each sortedPosts as item (item.id)}
										<tr>
											<td>{item.title}</td>
											<td
												>{#if item.publishedDate}{format(parseISO(item.publishedDate), 'MMM do, yyyy')}{/if}</td
											>
											<td>{item.published ? 'Yes' : 'No'}</td>
											<td class="flex gap-2">
												<a href="/admin/posts/edit/{item.id}" title="Edit Post" class="btn btn-square btn-info btn-sm"><Icon src={PencilSquare} class="h-4 w-4"></Icon></a>
												<form
													method="POST"
													action="?/delete"
													use:enhance={enhanceDelete}
													onsubmit={(e) => {
														if (!window.confirm(`Delete "${item.title}"?`)) e.preventDefault();
													}}
												>
													<input type="hidden" name="collectionName" value="posts" />
													<input type="hidden" name="itemId" value={item.id} />
													<button type="submit" title="Delete Post" class="btn btn-square btn-error btn-sm"><Icon src={Trash} class="h-4 w-4"></Icon></button>
												</form>
											</td>
										</tr>
									{/each}
								{:else}<tr><td colspan="4" class="p-4 text-center">No posts found.</td></tr>{/if}
							</tbody>
						</table>
					</div>
				</div>
				<div class="p-4 {activeSectionId === 'boardMembers' ? '' : 'hidden'}">
					<div class="mb-4 flex justify-end">
						<a href="/admin/board/members/new" class="btn btn-secondary btn-sm flex items-center gap-2"><Icon src={PlusCircle} class="h-4 w-4"></Icon> Add Member</a>
					</div>
					<div class="overflow-x-auto">
						<table class="table table-zebra table-sm w-full">
							<thead>
								<tr>
									<th onclick={() => setSortKey('name')} class="cursor-pointer">Name <Icon src={sortKey === 'name' ? (sortOrder === 1 ? ChevronUp : ChevronDown) : ChevronUpDown} class="inline-block h-4 w-4" /></th>
									<th>Role</th>
									<th onclick={() => setSortKey('active')} class="cursor-pointer">Status <Icon src={sortKey === 'active' ? (sortOrder === 1 ? ChevronUp : ChevronDown) : ChevronUpDown} class="inline-block h-4 w-4" /></th>
									<th>Actions</th>
								</tr>
							</thead>
							<tbody>
								{#if sortedBoardMembers && sortedBoardMembers.length > 0}
									{#each sortedBoardMembers as item (item.id)}
										<tr>
											<td>{item.name}</td><td>{item.role}</td>
											<td><div class="badge {item.active ? 'badge-primary' : 'badge-neutral'} badge-sm">{item.active ? 'Active' : 'Inactive'}</div></td>
											<td class="flex gap-1">
												<a href="/admin/board/members/edit/{item.id}" title="Edit Member" class="btn btn-square btn-info btn-xs"><Icon src={PencilSquare} class="h-3 w-3"></Icon></a>
												<form
													method="POST"
													action="?/delete"
													use:enhance={enhanceDelete}
													onsubmit={(e) => {
														if (!window.confirm(`Delete "${item.name}"?`)) e.preventDefault();
													}}
												>
													<input type="hidden" name="collectionName" value="board_members" />
													<input type="hidden" name="itemId" value={item.id} />
													<button type="submit" title="Delete Member" class="btn btn-square btn-error btn-xs"><Icon src={Trash} class="h-3 w-3"></Icon></button>
												</form>
											</td>
										</tr>
									{/each}
								{:else}<tr><td colspan="4" class="p-4 text-center">No board members.</td></tr>{/if}
							</tbody>
						</table>
					</div>
				</div>
				<div class="p-4 {activeSectionId === 'boardMeetings' ? '' : 'hidden'}">
					<div class="mb-4 flex justify-end">
						<a href="/admin/board/meetings/new" class="btn btn-secondary btn-sm flex items-center gap-2"><Icon src={PlusCircle} class="h-4 w-4"></Icon> Add Meeting</a>
					</div>
					<div class="overflow-x-auto">
						<table class="table table-zebra table-sm w-full">
							<thead>
								<tr>
									<th>Date</th>
									<th>Docs</th>
									<th>Actions</th>
								</tr>
							</thead>
							<tbody>
								{#if sortedBoardMeetings && sortedBoardMeetings.length > 0}
									{#each sortedBoardMeetings as item (item.id)}
										<tr>
											<td
												>{#if item.meetingDateTime}{format(parseISO(item.meetingDateTime), 'MMM do, yyyy h:mm a')}{/if}</td
											>
											<td>
												{#if item.agendaFile}<a href={pb_client.files.getURL(item, item.agendaFile)} target="_blank" rel="noopener noreferrer" class="link-hover link link-info inline-flex items-center text-xs"><Icon src={ArrowDownTray} class="mr-1 h-4 w-4" />Agenda</a>{/if}
												{#if item.minutesFile}<a href={pb_client.files.getURL(item, item.minutesFile)} target="_blank" rel="noopener noreferrer" class="link-hover link link-info ml-2 inline-flex items-center text-xs"><Icon src={ArrowDownTray} class="mr-1 h-4 w-4" />Minutes</a>{/if}
											</td>
											<td class="flex gap-1">
												<a href="/admin/board/meetings/edit/{item.id}" title="Edit Meeting" class="btn btn-square btn-info btn-xs"><Icon src={PencilSquare} class="h-3 w-3"></Icon></a>
												<form
													method="POST"
													action="?/delete"
													use:enhance={enhanceDelete}
													onsubmit={(e) => {
														if (!window.confirm(`Delete meeting from ${item.meetingDateTime ? format(parseISO(item.meetingDateTime), 'MMM do, yyyy') : 'this date'}?`)) e.preventDefault();
													}}
												>
													<input type="hidden" name="collectionName" value="board_meetings" />
													<input type="hidden" name="itemId" value={item.id} />
													<button type="submit" title="Delete Meeting" class="btn btn-square btn-error btn-xs"><Icon src={Trash} class="h-3 w-3"></Icon></button>
												</form>
											</td>
										</tr>
									{/each}
								{:else}<tr><td colspan="3" class="p-4 text-center">No board meetings.</td></tr>{/if}
							</tbody>
						</table>
					</div>
				</div>
				<div class="p-4 {activeSectionId === 'memberships' ? '' : 'hidden'}">
					<div class="mb-4 flex justify-end">
						<a href="/admin/memberships/new" class="btn btn-secondary btn-sm"><Icon src={PlusCircle} class="mr-1 h-5 w-5"></Icon>Add Membership</a>
					</div>
					<div class="mt-4 overflow-x-auto">
						<table class="table table-zebra w-full">
							<thead>
								<tr>
									<th onclick={() => setSortKey('name')} class="cursor-pointer">Name <Icon src={sortKey === 'name' ? (sortOrder === 1 ? ChevronUp : ChevronDown) : ChevronUpDown} class="inline-block h-4 w-4" /></th>
									<th onclick={() => setSortKey('active')} class="cursor-pointer">Status <Icon src={sortKey === 'active' ? (sortOrder === 1 ? ChevronUp : ChevronDown) : ChevronUpDown} class="inline-block h-4 w-4" /></th>
									<th onclick={() => setSortKey('expires')} class="cursor-pointer">Expires <Icon src={sortKey === 'expires' ? (sortOrder === 1 ? ChevronUp : ChevronDown) : ChevronUpDown} class="inline-block h-4 w-4" /></th>
									<th>Actions</th>
								</tr>
							</thead>
							<tbody>
								{#if sortedMemberships && sortedMemberships.length > 0}
									{#each sortedMemberships as item (item.id)}
										<tr>
											<td>{item.name}</td>
											<td><div class="badge {item.active ? 'badge-primary' : 'badge-neutral'} badge-sm">{item.active ? 'Active' : 'Inactive'}</div></td>
											<td
												>{#if item.expires && typeof item.expires === 'string' && item.expires.length > 0}{format(parseISO(item.expires), 'MMM do, yyyy')}{/if}</td
											>
											<td class="flex gap-2">
												<a href="/admin/memberships/edit/{item.id}" title="Edit Membership" class="btn btn-square btn-info btn-sm"><Icon src={PencilSquare} class="h-4 w-4"></Icon></a>
												<form
													method="POST"
													action="?/delete"
													use:enhance={enhanceDelete}
													onsubmit={(e) => {
														if (!window.confirm(`Delete membership for "${item.name}"?`)) e.preventDefault();
													}}
												>
													<input type="hidden" name="collectionName" value="memberships" />
													<input type="hidden" name="itemId" value={item.id} />
													<button type="submit" title="Delete Membership" class="btn btn-square btn-error btn-sm"><Icon src={Trash} class="h-4 w-4"></Icon></button>
												</form>
											</td>
										</tr>
									{/each}
								{:else}<tr><td colspan="4" class="p-4 text-center italic">No memberships yet.</td></tr>{/if}
							</tbody>
						</table>
					</div>
				</div>
				<div class="p-4 {activeSectionId === 'volunteers' ? '' : 'hidden'}">
					<div class="mb-4 flex justify-end">
						<a href="/admin/volunteers/new" class="btn btn-secondary btn-sm"><Icon src={PlusCircle} class="mr-1 h-5 w-5"></Icon>Add Volunteer Record</a>
					</div>
					<div class="mt-4 overflow-x-auto">
						<table class="table table-zebra w-full">
							<thead>
								<tr>
									<th onclick={() => setSortKey('name')} class="cursor-pointer">Name <Icon src={sortKey === 'name' ? (sortOrder === 1 ? ChevronUp : ChevronDown) : ChevronUpDown} class="inline-block h-4 w-4" /></th>
									<th onclick={() => setSortKey('task')} class="cursor-pointer">Event/Task <Icon src={sortKey === 'task' ? (sortOrder === 1 ? ChevronUp : ChevronDown) : ChevronUpDown} class="inline-block h-4 w-4" /></th>
									<th onclick={() => setSortKey('date')} class="cursor-pointer">Date <Icon src={sortKey === 'date' ? (sortOrder === 1 ? ChevronUp : ChevronDown) : ChevronUpDown} class="inline-block h-4 w-4" /></th>
									<th>Actions</th>
								</tr>
							</thead>
							<tbody>
								{#if sortedVolunteers && sortedVolunteers.length > 0}
									{#each sortedVolunteers as item (item.id)}
										<tr>
											<td>{item.name}</td>
											<td>{item.task}</td>
											<td
												>{#if item.date}{format(parseISO(item.date), 'MMM do, yyyy')}{/if}</td
											>
											<td class="flex gap-2">
												<a href="/admin/volunteers/edit/{item.id}" title="Edit Volunteer" class="btn btn-square btn-info btn-sm"><Icon src={PencilSquare} class="h-4 w-4"></Icon></a>
												<form
													method="POST"
													action="?/delete"
													use:enhance={enhanceDelete}
													onsubmit={(e) => {
														if (!window.confirm(`Delete record for "${item.name}"?`)) e.preventDefault();
													}}
												>
													<input type="hidden" name="collectionName" value="volunteers" />
													<input type="hidden" name="itemId" value={item.id} />
													<button type="submit" title="Delete Volunteer" class="btn btn-square btn-error btn-sm"><Icon src={Trash} class="h-4 w-4"></Icon></button>
												</form>
											</td>
										</tr>
									{/each}
								{:else}<tr><td colspan="4" class="p-4 text-center italic">No volunteer records yet.</td></tr>{/if}
							</tbody>
						</table>
					</div>
				</div>
				<div class="p-4 {activeSectionId === 'donations' ? '' : 'hidden'}">
					<div class="mb-4 flex justify-end">
						<a href="/admin/donations/new" class="btn btn-secondary btn-sm"><Icon src={PlusCircle} class="mr-1 h-5 w-5"></Icon>Log Donation</a>
					</div>
					<div class="mt-4 overflow-x-auto">
						<table class="table table-zebra w-full">
							<thead>
								<tr>
									<th onclick={() => setSortKey('donorName')} class="cursor-pointer">Donor <Icon src={sortKey === 'donorName' ? (sortOrder === 1 ? ChevronUp : ChevronDown) : ChevronUpDown} class="inline-block h-4 w-4" /></th>
									<th onclick={() => setSortKey('amount')} class="cursor-pointer">Amount <Icon src={sortKey === 'amount' ? (sortOrder === 1 ? ChevronUp : ChevronDown) : ChevronUpDown} class="inline-block h-4 w-4" /></th>
									<th onclick={() => setSortKey('donationDate')} class="cursor-pointer">Date <Icon src={sortKey === 'donationDate' ? (sortOrder === 1 ? ChevronUp : ChevronDown) : ChevronUpDown} class="inline-block h-4 w-4" /></th>
									<th onclick={() => setSortKey('donationType')} class="cursor-pointer">Type <Icon src={sortKey === 'donationType' ? (sortOrder === 1 ? ChevronUp : ChevronDown) : ChevronUpDown} class="inline-block h-4 w-4" /></th>
									<th>Actions</th>
								</tr>
							</thead>
							<tbody>
								{#if sortedDonations && sortedDonations.length > 0}
									{#each sortedDonations as item (item.id)}
										<tr>
											<td>{item.donorName}</td>
											<td
												>{#if item.amount != null}${parseFloat(String(item.amount).replace(/[^0-9.-]+/g, '')).toFixed(2)}{/if}</td
											>
											<td
												>{#if item.donationDate}{format(parseISO(item.donationDate), 'MMM do, yyyy')}{/if}</td
											>
											<td>{item.donationType}</td>
											<td class="flex gap-2">
												<a href="/admin/donations/edit/{item.id}" title="Edit Donation" class="btn btn-square btn-info btn-sm"><Icon src={PencilSquare} class="h-4 w-4"></Icon></a>
												<form
													method="POST"
													action="?/delete"
													use:enhance={enhanceDelete}
													onsubmit={(e) => {
														if (!window.confirm(`Delete donation from "${item.donorName}"?`)) e.preventDefault();
													}}
												>
													<input type="hidden" name="collectionName" value="donations" />
													<input type="hidden" name="itemId" value={item.id} />
													<button type="submit" title="Delete Donation" class="btn btn-square btn-error btn-sm"><Icon src={Trash} class="h-4 w-4"></Icon></button>
												</form>
											</td>
										</tr>
									{/each}
								{:else}<tr><td colspan="5" class="p-4 text-center italic">No donations yet.</td></tr>{/if}
							</tbody>
						</table>
					</div>
				</div>
			</div>
		</div>
	</div>
	<div class="drawer-side">
		<label for="admin-drawer" aria-label="close sidebar" class="drawer-overlay"></label>
		<ul class="menu min-h-full w-60 bg-base-200 p-4 text-base-content md:w-64">
			<li class="menu-title text-sm"><span>Admin Menu</span></li>
			{#each adminSections as section (section.id)}
				<li>
					<a href="#{section.id}" class:active={activeSectionId === section.id} onclick={preventDefault(() => setActiveSection(section.id))}>
						<Icon src={section.icon || CircleStack} solid class="h-5 w-5" />
						{section.label}
					</a>
				</li>
			{/each}
		</ul>
	</div>
</div>
