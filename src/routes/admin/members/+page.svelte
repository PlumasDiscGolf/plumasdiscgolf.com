<script>
	import { Icon, PencilSquare, Trash, PlusCircle, ChevronUpDown, ChevronUp, ChevronDown, XCircle } from 'svelte-hero-icons';
	import { enhance } from '$app/forms';

	let { data, form } = $props();

	let sortKey = $state('firstName');
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

	let sortedMembers = $derived(sortData(data.members));
</script>

{#if form?.error}
	<div class="alert alert-error mb-4 shadow-lg">
		<div><Icon src={XCircle} class="h-6 w-6"></Icon><span>{form.error}</span></div>
	</div>
{/if}

<div class="mb-4 flex justify-end">
	<a href="/admin/members/new" class="btn btn-secondary btn-sm"><Icon src={PlusCircle} class="mr-1 h-5 w-5"></Icon>Add Member</a>
</div>
<div class="mt-4 overflow-x-auto">
	<table class="table table-zebra w-full">
		<thead>
			<tr>
				<th onclick={() => setSortKey('firstName')} class="cursor-pointer">Name <Icon src={sortKey === 'firstName' ? (sortOrder === 1 ? ChevronUp : ChevronDown) : ChevronUpDown} class="inline-block h-4 w-4" /></th>
				<th onclick={() => setSortKey('email')} class="cursor-pointer">Email <Icon src={sortKey === 'email' ? (sortOrder === 1 ? ChevronUp : ChevronDown) : ChevronUpDown} class="inline-block h-4 w-4" /></th>
				<th onclick={() => setSortKey('phone')} class="cursor-pointer">Phone <Icon src={sortKey === 'phone' ? (sortOrder === 1 ? ChevronUp : ChevronDown) : ChevronUpDown} class="inline-block h-4 w-4" /></th>
				<th>Consent</th>
				<th>Actions</th>
			</tr>
		</thead>
		<tbody>
			{#if sortedMembers && sortedMembers.length > 0}
				{#each sortedMembers as item (item.id)}
					<tr>
						<td>{item.firstName} {item.lastName}{item.nickname ? ` (${item.nickname})` : ''}</td>
						<td>{item.email || ''}</td>
						<td>{item.phone || ''}</td>
						<td>
							<div class="flex gap-1">
								<div class="badge badge-sm {item.consentEmail ? 'badge-primary' : 'badge-neutral'}" title="Email consent">Email</div>
								<div class="badge badge-sm {item.consentSms ? 'badge-primary' : 'badge-neutral'}" title="SMS consent">SMS</div>
							</div>
						</td>
						<td>
							<div class="flex gap-2">
								<a href="/admin/members/edit/{item.id}" title="Edit Member" class="btn btn-square btn-info btn-sm"><Icon src={PencilSquare} class="h-4 w-4"></Icon></a>
								<form
									method="POST"
									action="?/delete"
									use:enhance
									onsubmit={(e) => {
										if (!window.confirm(`Delete member "${item.firstName} ${item.lastName}"? This cannot be undone.`)) { e.preventDefault(); e.stopImmediatePropagation(); }
									}}
								>
									<input type="hidden" name="itemId" value={item.id} />
									<button type="submit" title="Delete Member" class="btn btn-square btn-error btn-sm"><Icon src={Trash} class="h-4 w-4"></Icon></button>
								</form>
							</div>
						</td>
					</tr>
				{/each}
			{:else}<tr><td colspan="5" class="p-4 text-center italic">No members yet.</td></tr>{/if}
		</tbody>
	</table>
</div>