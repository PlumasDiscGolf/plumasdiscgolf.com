<script>
	import { format, parseISO } from 'date-fns';
	import { Icon, PencilSquare, Trash, PlusCircle, ChevronUpDown, ChevronUp, ChevronDown, CheckCircle, XCircle } from 'svelte-hero-icons';
	import { enhance } from '$app/forms';
	import { env } from '$env/dynamic/public';

	let { data, form } = $props();

	let sortKey = $state('signedAt');
	let sortOrder = $state(-1);

	function setSortKey(key) {
		if (sortKey === key) {
			sortOrder *= -1;
		} else {
			sortKey = key;
			sortOrder = 1;
		}
	}

	// Merge in resolved display fields so the existing generic sort can sort
	// on "memberName"/"templateLabel" like any other field.
	let waiversWithDisplay = $derived(
		(data.waivers || []).map((w) => {
			const member = w.expand?.membershipId?.expand?.memberId;
			const template = w.expand?.waiverTemplateId;
			return {
				...w,
				memberName: member ? `${member.firstName} ${member.lastName}` : '(unknown member)',
				season: w.expand?.membershipId?.season ?? '',
				templateLabel: template ? `${template.name} (${template.season})` : '(unknown template)'
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

	let sortedWaivers = $derived(sortData(waiversWithDisplay));
</script>

{#if form?.error}
	<div class="alert alert-error mb-4 shadow-lg">
		<div><Icon src={XCircle} class="h-6 w-6"></Icon><span>{form.error}</span></div>
	</div>
{/if}

<div class="mb-4 flex justify-end">
	<a href="/admin/waivers/new" class="btn btn-secondary btn-sm"><Icon src={PlusCircle} class="mr-1 h-5 w-5"></Icon>Log Waiver Signature</a>
</div>
<div class="mt-4 overflow-x-auto">
	<table class="table table-zebra w-full">
		<thead>
			<tr>
				<th onclick={() => setSortKey('memberName')} class="cursor-pointer">Member <Icon src={sortKey === 'memberName' ? (sortOrder === 1 ? ChevronUp : ChevronDown) : ChevronUpDown} class="inline-block h-4 w-4" /></th>
				<th onclick={() => setSortKey('season')} class="cursor-pointer">Season <Icon src={sortKey === 'season' ? (sortOrder === 1 ? ChevronUp : ChevronDown) : ChevronUpDown} class="inline-block h-4 w-4" /></th>
				<th onclick={() => setSortKey('templateLabel')} class="cursor-pointer">Template <Icon src={sortKey === 'templateLabel' ? (sortOrder === 1 ? ChevronUp : ChevronDown) : ChevronUpDown} class="inline-block h-4 w-4" /></th>
				<th onclick={() => setSortKey('signedByName')} class="cursor-pointer">Signed By <Icon src={sortKey === 'signedByName' ? (sortOrder === 1 ? ChevronUp : ChevronDown) : ChevronUpDown} class="inline-block h-4 w-4" /></th>
				<th onclick={() => setSortKey('signedAt')} class="cursor-pointer">Signed <Icon src={sortKey === 'signedAt' ? (sortOrder === 1 ? ChevronUp : ChevronDown) : ChevronUpDown} class="inline-block h-4 w-4" /></th>
				<th>Guardian</th>
				<th>Ack'd</th>
				<th>PDF</th>
				<th>Actions</th>
			</tr>
		</thead>
		<tbody>
			{#if sortedWaivers && sortedWaivers.length > 0}
				{#each sortedWaivers as item (item.id)}
					<tr>
						<td>{item.memberName}</td>
						<td>{item.season}</td>
						<td>{item.templateLabel}</td>
						<td>{item.signedByName}</td>
						<td>{#if item.signedAt}{format(parseISO(item.signedAt), 'MMM do, yyyy')}{/if}</td>
						<td>{item.guardianName || ''}</td>
						<td>{#if item.acknowledged}<Icon src={CheckCircle} class="h-5 w-5 text-success" />{/if}</td>
						<td>
							{#if item.scannedFile}
								<a
									href="{env.PUBLIC_POCKETBASE_FILES_URL}/api/files/{item.collectionId}/{item.id}/{item.scannedFile}"
									target="_blank"
									rel="noopener noreferrer"
									class="link-hover link link-info text-xs"
								>
									View
								</a>
							{/if}
						</td>
						<td>
							<div class="flex gap-2">
								<a href="/admin/waivers/edit/{item.id}" title="Edit Waiver Signature" class="btn btn-square btn-info btn-sm"><Icon src={PencilSquare} class="h-4 w-4"></Icon></a>
								<form
									method="POST"
									action="?/delete"
									use:enhance
									onsubmit={(e) => {
										if (!window.confirm(`Delete this waiver signature for "${item.memberName}"?`)) { e.preventDefault(); e.stopImmediatePropagation(); }
									}}
								>
									<input type="hidden" name="itemId" value={item.id} />
									<button type="submit" title="Delete Waiver Signature" class="btn btn-square btn-error btn-sm"><Icon src={Trash} class="h-4 w-4"></Icon></button>
								</form>
							</div>
						</td>
					</tr>
				{/each}
			{:else}<tr><td colspan="9" class="p-4 text-center italic">No waiver signatures logged yet.</td></tr>{/if}
		</tbody>
	</table>
</div>