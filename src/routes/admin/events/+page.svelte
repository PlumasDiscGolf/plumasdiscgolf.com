<script>
	import { format, parseISO, isSameDay } from 'date-fns';
	import { Icon, PencilSquare, Trash, PlusCircle, ChevronUpDown, ChevronUp, ChevronDown, XCircle } from 'svelte-hero-icons';
	import { enhance } from '$app/forms';

	let { data, form } = $props();

	let sortKey = $state('');
	let sortOrder = $state(1);

	function setSortKey(key) {
		if (sortKey === key) {
			sortOrder *= -1;
		} else {
			sortKey = key;
			sortOrder = 1;
		}
	}

	function sortData(array) {
		if (!sortKey || !array) return array;
		return [...array].sort((a, b) => {
			const valA = a[sortKey];
			const valB = b[sortKey];
			if (valA == null) return 1;
			if (valB == null) return -1;
			const strA = String(valA).toLowerCase();
			const strB = String(valB).toLowerCase();
			return strA.localeCompare(strB) * sortOrder;
		});
	}

	let sortedEvents = $derived(
		sortData(
			(data.events || []).map((e) => ({
				...e,
				locationDisplay: (e.expand?.location || []).map((l) => l.name).join(', ')
			}))
		)
	);
</script>

{#if form?.error}
	<div class="alert alert-error mb-4 shadow-lg">
		<div><Icon src={XCircle} class="h-6 w-6"></Icon><span>{form.error}</span></div>
	</div>
{/if}

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
				<th onclick={() => setSortKey('locationDisplay')} class="cursor-pointer">Location <Icon src={sortKey === 'locationDisplay' ? (sortOrder === 1 ? ChevronUp : ChevronDown) : ChevronUpDown} class="inline-block h-4 w-4" /></th>
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
						<td>{item.locationDisplay}</td>
						<td>
							<div class="flex gap-2">
								<a href="/admin/events/edit/{item.id}" title="Edit Event" class="btn btn-square btn-info btn-sm"><Icon src={PencilSquare} class="h-4 w-4"></Icon></a>
								<form
									method="POST"
									action="?/delete"
									use:enhance
									onsubmit={(e) => {
										if (!window.confirm(`Delete "${item.name}"?`)) { e.preventDefault(); e.stopImmediatePropagation(); }
									}}
								>
									<input type="hidden" name="itemId" value={item.id} />
									<button type="submit" title="Delete Event" class="btn btn-square btn-error btn-sm"><Icon src={Trash} class="h-4 w-4"></Icon></button>
								</form>
							</div>
						</td>
					</tr>
				{/each}
			{:else}<tr><td colspan="5" class="p-4 text-center">No events found.</td></tr>{/if}
		</tbody>
	</table>
</div>