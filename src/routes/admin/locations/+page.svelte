<script>
	import { Icon, PencilSquare, Trash, PlusCircle, ChevronUpDown, ChevronUp, ChevronDown, XCircle } from 'svelte-hero-icons';
	import { enhance } from '$app/forms';

	let { data, form } = $props();

	let sortKey = $state('name');
	let sortOrder = $state(1);

	function setSortKey(key) {
		if (sortKey === key) {
			sortOrder *= -1;
		} else {
			sortKey = key;
			sortOrder = 1;
		}
	}

	// Merge in the linked course's name and a combined, readable address
	// string so the existing generic sort can sort on "linkedCourseName"
	// like any other field.
	let locationsWithDisplay = $derived(
		(data.locations || []).map((l) => {
			const addressParts = [l.address, l.city, [l.state, l.zipCode].filter(Boolean).join(' ')].filter(Boolean);
			return {
				...l,
				linkedCourseName: l.expand?.course?.name || '',
				addressDisplay: addressParts.join(', ')
			};
		})
	);

	function sortData(array) {
		if (!sortKey || !array) return array;
		return [...array].sort((a, b) => {
			const valA = a[sortKey];
			const valB = b[sortKey];
			if (valA == null) return 1;
			if (valB == null) return -1;
			if (typeof valA === 'boolean' && typeof valB === 'boolean') {
				return (valA === valB ? 0 : valA ? -1 : 1) * sortOrder;
			}
			const strA = String(valA).toLowerCase();
			const strB = String(valB).toLowerCase();
			return strA.localeCompare(strB) * sortOrder;
		});
	}

	let sortedLocations = $derived(sortData(locationsWithDisplay));
</script>

{#if form?.error}
	<div class="alert alert-error mb-4 shadow-lg">
		<div><Icon src={XCircle} class="h-6 w-6"></Icon><span>{form.error}</span></div>
	</div>
{/if}

<div class="mb-4 flex justify-end">
	<a href="/admin/locations/new" class="btn btn-secondary btn-sm"><Icon src={PlusCircle} class="mr-1 h-5 w-5"></Icon>Add Location</a>
</div>
<div class="mt-4 overflow-x-auto">
	<table class="table table-zebra w-full">
		<thead>
			<tr>
				<th onclick={() => setSortKey('name')} class="cursor-pointer">Name <Icon src={sortKey === 'name' ? (sortOrder === 1 ? ChevronUp : ChevronDown) : ChevronUpDown} class="inline-block h-4 w-4" /></th>
				<th onclick={() => setSortKey('isCourse')} class="cursor-pointer">Is Course <Icon src={sortKey === 'isCourse' ? (sortOrder === 1 ? ChevronUp : ChevronDown) : ChevronUpDown} class="inline-block h-4 w-4" /></th>
				<th onclick={() => setSortKey('linkedCourseName')} class="cursor-pointer">Linked Course <Icon src={sortKey === 'linkedCourseName' ? (sortOrder === 1 ? ChevronUp : ChevronDown) : ChevronUpDown} class="inline-block h-4 w-4" /></th>
				<th>Address</th>
				<th>Lat/Long</th>
				<th>Actions</th>
			</tr>
		</thead>
		<tbody>
			{#if sortedLocations && sortedLocations.length > 0}
				{#each sortedLocations as item (item.id)}
					<tr>
						<td>{item.name}</td>
						<td><div class="badge badge-sm {item.isCourse ? 'badge-primary' : 'badge-neutral'}">{item.isCourse ? 'Yes' : 'No'}</div></td>
						<td>{item.linkedCourseName}</td>
						<td>{item.addressDisplay}</td>
						<td>
							{#if item.latitude === 0 || item.longitude === 0 }
								<span class="italic opacity-60">None</span>
							{:else}
								{item.latitude}, {item.longitude}
							{/if}
						</td>
						<td>
							<div class="flex gap-2">
								<a href="/admin/locations/edit/{item.id}" title="Edit Location" class="btn btn-square btn-info btn-sm"><Icon src={PencilSquare} class="h-4 w-4"></Icon></a>
								<form
									method="POST"
									action="?/delete"
									use:enhance
									onsubmit={(e) => {
										if (!window.confirm(`Delete "${item.name}"?`)) { e.preventDefault(); e.stopImmediatePropagation(); }
									}}
								>
									<input type="hidden" name="itemId" value={item.id} />
									<button type="submit" title="Delete Location" class="btn btn-square btn-error btn-sm"><Icon src={Trash} class="h-4 w-4"></Icon></button>
								</form>
							</div>
						</td>
					</tr>
				{/each}
			{:else}<tr><td colspan="6" class="p-4 text-center italic">No locations yet.</td></tr>{/if}
		</tbody>
	</table>
</div>