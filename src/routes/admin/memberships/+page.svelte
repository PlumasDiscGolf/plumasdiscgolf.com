<script>
	import { format, parseISO } from 'date-fns';
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

	// Merge in resolved display fields so the existing generic sort can sort
	// on "memberName"/"membershipTypeName" like any other field.
	let membershipsWithDisplay = $derived(
		(data.memberships || []).map((m) => ({
			...m,
			memberName: m.expand?.memberId ? `${m.expand.memberId.firstName} ${m.expand.memberId.lastName}` : '(unknown member)',
			membershipTypeName: m.expand?.membershipTypeId?.name || '(unknown type)'
		}))
	);

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

	let sortedMemberships = $derived(sortData(membershipsWithDisplay));

	const statusBadgeClass = {
		active: 'badge-primary',
		expired: 'badge-neutral',
		suspended: 'badge-warning',
		revoked: 'badge-error'
	};
</script>

{#if form?.error}
	<div class="alert alert-error mb-4 shadow-lg">
		<div><Icon src={XCircle} class="h-6 w-6"></Icon><span>{form.error}</span></div>
	</div>
{/if}

<div class="mb-4 flex justify-end">
	<a href="/admin/memberships/new" class="btn btn-secondary btn-sm"><Icon src={PlusCircle} class="mr-1 h-5 w-5"></Icon>Add Membership</a>
</div>
<div class="mt-4 overflow-x-auto">
	<table class="table table-zebra w-full">
		<thead>
			<tr>
				<th onclick={() => setSortKey('memberName')} class="cursor-pointer">Member <Icon src={sortKey === 'memberName' ? (sortOrder === 1 ? ChevronUp : ChevronDown) : ChevronUpDown} class="inline-block h-4 w-4" /></th>
				<th onclick={() => setSortKey('membershipTypeName')} class="cursor-pointer">Type <Icon src={sortKey === 'membershipTypeName' ? (sortOrder === 1 ? ChevronUp : ChevronDown) : ChevronUpDown} class="inline-block h-4 w-4" /></th>
				<th onclick={() => setSortKey('season')} class="cursor-pointer">Season <Icon src={sortKey === 'season' ? (sortOrder === 1 ? ChevronUp : ChevronDown) : ChevronUpDown} class="inline-block h-4 w-4" /></th>
				<th onclick={() => setSortKey('status')} class="cursor-pointer">Status <Icon src={sortKey === 'status' ? (sortOrder === 1 ? ChevronUp : ChevronDown) : ChevronUpDown} class="inline-block h-4 w-4" /></th>
				<th onclick={() => setSortKey('pricePaid')} class="cursor-pointer">Price Paid <Icon src={sortKey === 'pricePaid' ? (sortOrder === 1 ? ChevronUp : ChevronDown) : ChevronUpDown} class="inline-block h-4 w-4" /></th>
				<th onclick={() => setSortKey('startDate')} class="cursor-pointer">Start Date <Icon src={sortKey === 'startDate' ? (sortOrder === 1 ? ChevronUp : ChevronDown) : ChevronUpDown} class="inline-block h-4 w-4" /></th>
				<th>Actions</th>
			</tr>
		</thead>
		<tbody>
			{#if sortedMemberships && sortedMemberships.length > 0}
				{#each sortedMemberships as item (item.id)}
					<tr>
						<td>{item.memberName}</td>
						<td>{item.membershipTypeName}</td>
						<td>{item.season}</td>
						<td><div class="badge {statusBadgeClass[item.status] || 'badge-neutral'} badge-sm capitalize">{item.status}</div></td>
						<td>{#if item.pricePaid != null}${Number(item.pricePaid).toFixed(2)}{/if}</td>
						<td>{#if item.startDate}{format(parseISO(item.startDate), 'MMM do, yyyy')}{/if}</td>
						<td class="flex gap-2">
							<a href="/admin/memberships/edit/{item.id}" title="Edit Membership" class="btn btn-square btn-info btn-sm"><Icon src={PencilSquare} class="h-4 w-4"></Icon></a>
							<form
								method="POST"
								action="?/delete"
								use:enhance
								onsubmit={(e) => {
									if (!window.confirm(`Delete this membership for "${item.memberName}" (${item.season})?`)) { e.preventDefault(); e.stopImmediatePropagation(); }
								}}
							>
								<input type="hidden" name="itemId" value={item.id} />
								<button type="submit" title="Delete Membership" class="btn btn-square btn-error btn-sm"><Icon src={Trash} class="h-4 w-4"></Icon></button>
							</form>
						</td>
					</tr>
				{/each}
			{:else}<tr><td colspan="7" class="p-4 text-center italic">No memberships yet.</td></tr>{/if}
		</tbody>
	</table>
</div>