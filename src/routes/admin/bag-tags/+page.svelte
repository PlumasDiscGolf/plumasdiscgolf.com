<script>
	import { format, parseISO } from 'date-fns';
	import { Icon, PencilSquare, Trash, PlusCircle, ArrowUturnLeft, UserGroup, Clock, ChevronUpDown, ChevronUp, ChevronDown, CheckCircle, XCircle, Tag } from 'svelte-hero-icons';
	import { enhance } from '$app/forms';
	import { invalidateAll } from '$app/navigation';

	let { data, form } = $props();

	// --- Sorting logic (same pattern as the main admin dashboard) ---
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

	// --- Season + league filters, current holder computed from assignment history ---
	const currentYear = new Date().getFullYear();
	let selectedSeason = $state(currentYear);
	let selectedBagTagLeague = $state('Open');
	let availableBagTagSeasons = $derived.by(() => {
		const seasons = new Set((data.bagTags || []).map((t) => t.season));
		seasons.add(currentYear);
		return [...seasons].sort((a, b) => b - a);
	});

	// bagTagAssignments arrives pre-sorted newest-first from the load function,
	// so the first assignment we see per bagTagId is automatically the current one.
	let latestAssignmentByTagId = $derived.by(() => {
		const map = new Map();
		for (const a of data.bagTagAssignments || []) {
			if (!map.has(a.bagTagId)) map.set(a.bagTagId, a);
		}
		return map;
	});

	let bagTagsWithHolder = $derived.by(() => {
		return (data.bagTags || []).map((tag) => {
			const assignment = latestAssignmentByTagId.get(tag.id);
			const holderMember = assignment?.expand?.memberId;
			return {
				...tag,
				currentAssignmentId: assignment?.id || null,
				hasCurrentHolder: !!holderMember,
				holderName: holderMember ? `${holderMember.firstName} ${holderMember.lastName}` : '',
				heldSince: holderMember ? assignment?.assignedAt || null : null
			};
		});
	});

	let filteredBagTags = $derived(bagTagsWithHolder.filter((t) => t.season === selectedSeason && t.league === selectedBagTagLeague));
	let sortedBagTags = $derived(sortData(filteredBagTags));

	// --- Alerts ---
	let successAlertMessage = $state('');
	let errorAlertMessage = $state('');

	function clearAlerts() {
		successAlertMessage = '';
		errorAlertMessage = '';
	}

	function enhanceDelete() {
		return async ({ update }) => {
			await update();
			await invalidateAll();
		};
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
</script>

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

<div class="mb-4 flex flex-wrap items-end justify-between gap-2">
	<div class="flex flex-wrap gap-3">
		<div class="form-control">
			<label class="label py-0" for="bagTagSeasonSelect"><span class="label-text">Season</span></label>
			<select id="bagTagSeasonSelect" class="select select-bordered select-sm w-36" bind:value={selectedSeason}>
				{#each availableBagTagSeasons as s}
					<option value={s}>{s}</option>
				{/each}
			</select>
		</div>
		<div class="form-control">
			<label class="label py-0" for="bagTagLeagueSelect"><span class="label-text">League</span></label>
			<select id="bagTagLeagueSelect" class="select select-bordered select-sm w-40" bind:value={selectedBagTagLeague}>
				<option value="Open">Open</option>
				<option value="Ladies">Ladies</option>
			</select>
		</div>
	</div>
	<div class="flex gap-2">
		<a href="/admin/bag-tags/history" class="btn btn-neutral btn-sm"><Icon src={Clock} class="mr-1 h-5 w-5"></Icon>History</a>
		<a href="/admin/bag-tags/weekly-event" class="btn btn-primary btn-sm"><Icon src={Tag} class="mr-1 h-5 w-5"></Icon>Weekly Event</a>
		<a href="/admin/bag-tags/new" class="btn btn-secondary btn-sm"><Icon src={PlusCircle} class="mr-1 h-5 w-5"></Icon>Add New Tags</a>
	</div>
</div>
<div class="mt-4 overflow-x-auto">
	<table class="table table-zebra w-full">
		<thead>
			<tr>
				<th onclick={() => setSortKey('tagNumber')} class="cursor-pointer">Tag # <Icon src={sortKey === 'tagNumber' ? (sortOrder === 1 ? ChevronUp : ChevronDown) : ChevronUpDown} class="inline-block h-4 w-4" /></th>
				<th onclick={() => setSortKey('holderName')} class="cursor-pointer">Holder <Icon src={sortKey === 'holderName' ? (sortOrder === 1 ? ChevronUp : ChevronDown) : ChevronUpDown} class="inline-block h-4 w-4" /></th>
				<th onclick={() => setSortKey('heldSince')} class="cursor-pointer">Held Since <Icon src={sortKey === 'heldSince' ? (sortOrder === 1 ? ChevronUp : ChevronDown) : ChevronUpDown} class="inline-block h-4 w-4" /></th>
				<th>Actions</th>
			</tr>
		</thead>
		<tbody>
			{#if sortedBagTags && sortedBagTags.length > 0}
				{#each sortedBagTags as item (item.id)}
					<tr>
						<td>#{item.tagNumber}</td>
						<td>{#if item.hasCurrentHolder}{item.holderName}{:else}<span class="italic opacity-60">Available</span>{/if}</td>
						<td>{#if item.heldSince}{format(parseISO(item.heldSince), 'MMM do, yyyy')}{/if}</td>
						<td class="flex flex-wrap gap-2">
							<a href="/admin/bag-tags/edit/{item.id}" title="Edit Tag Record (number/league/season)" class="btn btn-square btn-info btn-sm"><Icon src={PencilSquare} class="h-4 w-4"></Icon></a>
							<a href="/admin/bag-tags/assign/{item.id}" title="Assign Tag" class="btn btn-square btn-primary btn-sm"><Icon src={UserGroup} class="h-4 w-4"></Icon></a>
							<a href="/admin/bag-tags/history?bagTagId={item.id}" title="View History" class="btn btn-square btn-neutral btn-sm"><Icon src={Clock} class="h-4 w-4"></Icon></a>
							{#if item.hasCurrentHolder}
								<a href="/admin/bag-tags/forfeit/{item.id}" title="Forfeit Tag" class="btn btn-square btn-error btn-sm"><Icon src={XCircle} class="h-4 w-4"></Icon></a>
							{/if}
							{#if item.currentAssignmentId}
								<form
									method="POST"
									action="?/undoAssignment"
									use:enhance={enhanceDelete}
									onsubmit={(e) => {
										if (!window.confirm(`Undo the most recent assignment for tag #${item.tagNumber}? This removes the record of ${item.holderName} holding it.`)) { e.preventDefault(); e.stopImmediatePropagation(); }
									}}
								>
									<input type="hidden" name="assignmentId" value={item.currentAssignmentId} />
									<button type="submit" title="Undo Last Assignment" class="btn btn-square btn-warning btn-sm"><Icon src={ArrowUturnLeft} class="h-4 w-4"></Icon></button>
								</form>
							{/if}
							<form
								method="POST"
								action="?/delete"
								use:enhance={enhanceDelete}
								onsubmit={(e) => {
									if (!window.confirm(`Delete tag #${item.tagNumber} (${item.league} ${item.season}) entirely? This also removes its full assignment history.`)) { e.preventDefault(); e.stopImmediatePropagation(); }
								}}
							>
								<input type="hidden" name="collectionName" value="bag_tags" />
								<input type="hidden" name="itemId" value={item.id} />
								<button type="submit" title="Delete Tag Record" class="btn btn-square btn-error btn-sm"><Icon src={Trash} class="h-4 w-4"></Icon></button>
							</form>
						</td>
					</tr>
				{/each}
			{:else}<tr><td colspan="4" class="p-4 text-center italic">No bag tag records for {selectedBagTagLeague} League, {selectedSeason}.</td></tr>{/if}
		</tbody>
	</table>
</div>