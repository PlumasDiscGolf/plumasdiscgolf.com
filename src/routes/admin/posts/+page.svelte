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

	let sortedPosts = $derived(sortData(data.posts));
</script>

{#if form?.error}
	<div class="alert alert-error mb-4 shadow-lg">
		<div><Icon src={XCircle} class="h-6 w-6"></Icon><span>{form.error}</span></div>
	</div>
{/if}

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
						<td>{#if item.publishedDate}{format(parseISO(item.publishedDate), 'MMM do, yyyy')}{/if}</td>
						<td>{item.published ? 'Yes' : 'No'}</td>
						<td>
							<div class="flex gap-2">
								<a href="/admin/posts/edit/{item.id}" title="Edit Post" class="btn btn-square btn-info btn-sm"><Icon src={PencilSquare} class="h-4 w-4"></Icon></a>
								<form
									method="POST"
									action="?/delete"
									use:enhance
									onsubmit={(e) => {
										if (!window.confirm(`Delete "${item.title}"?`)) { e.preventDefault(); e.stopImmediatePropagation(); }
									}}
								>
									<input type="hidden" name="itemId" value={item.id} />
									<button type="submit" title="Delete Post" class="btn btn-square btn-error btn-sm"><Icon src={Trash} class="h-4 w-4"></Icon></button>
								</form>
							</div>
						</td>
					</tr>
				{/each}
			{:else}<tr><td colspan="4" class="p-4 text-center">No posts found.</td></tr>{/if}
		</tbody>
	</table>
</div>