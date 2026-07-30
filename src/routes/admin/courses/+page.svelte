<script>
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
			if (typeof valA === 'number' && typeof valB === 'number') {
				return (valA - valB) * sortOrder;
			}
			const strA = String(valA).toLowerCase();
			const strB = String(valB).toLowerCase();
			return strA.localeCompare(strB) * sortOrder;
		});
	}

	let sortedCourses = $derived(sortData(data.courses));
</script>

{#if form?.error}
	<div class="alert alert-error mb-4 shadow-lg">
		<div><Icon src={XCircle} class="h-6 w-6"></Icon><span>{form.error}</span></div>
	</div>
{/if}

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
						<td>
							<div class="flex gap-2">
								<a href="/admin/courses/edit/{item.id}" title="Edit Course" class="btn btn-square btn-info btn-sm"><Icon src={PencilSquare} class="h-4 w-4"></Icon></a>
								<form
									method="POST"
									action="?/delete"
									use:enhance
									onsubmit={(e) => {
										if (!window.confirm(`Delete "${item.name}"?`)) { e.preventDefault(); e.stopImmediatePropagation(); }
									}}
								>
									<input type="hidden" name="itemId" value={item.id} />
									<button type="submit" title="Delete Course" class="btn btn-square btn-error btn-sm"><Icon src={Trash} class="h-4 w-4"></Icon></button>
								</form>
							</div>
						</td>
					</tr>
				{/each}
			{:else}<tr><td colspan="5" class="p-4 text-center">No courses found.</td></tr>{/if}
		</tbody>
	</table>
</div>