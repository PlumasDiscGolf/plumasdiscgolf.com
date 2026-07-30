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
			if (typeof valA === 'boolean' && typeof valB === 'boolean') {
				return (valA === valB ? 0 : valA ? -1 : 1) * sortOrder;
			}
			const strA = String(valA).toLowerCase();
			const strB = String(valB).toLowerCase();
			return strA.localeCompare(strB) * sortOrder;
		});
	}

	let sortedBoardMembers = $derived(sortData(data.boardMembers));
</script>

{#if form?.error}
	<div class="alert alert-error mb-4 shadow-lg">
		<div><Icon src={XCircle} class="h-6 w-6"></Icon><span>{form.error}</span></div>
	</div>
{/if}

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
								use:enhance
								onsubmit={(e) => {
									if (!window.confirm(`Delete "${item.name}"?`)) { e.preventDefault(); e.stopImmediatePropagation(); }
								}}
							>
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