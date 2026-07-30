<script>
	import { format, parseISO } from 'date-fns';
	import { Icon, PencilSquare, Trash, PlusCircle, ArrowDownTray, XCircle } from 'svelte-hero-icons';
	import { enhance } from '$app/forms';
	import PocketBase from 'pocketbase';

	let { data, form } = $props();

	import { env } from '$env/dynamic/public';
	const pb_client = new PocketBase(env.PUBLIC_POCKETBASE_FILES_URL);
</script>

{#if form?.error}
	<div class="alert alert-error mb-4 shadow-lg">
		<div><Icon src={XCircle} class="h-6 w-6"></Icon><span>{form.error}</span></div>
	</div>
{/if}

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
			{#if data.boardMeetings && data.boardMeetings.length > 0}
				{#each data.boardMeetings as item (item.id)}
					<tr>
						<td>{#if item.meetingDateTime}{format(parseISO(item.meetingDateTime), 'MMM do, yyyy h:mm a')}{/if}</td>
						<td>
							{#if item.agendaFile}<a href={pb_client.files.getURL(item, item.agendaFile)} target="_blank" rel="noopener noreferrer" class="link-hover link link-info inline-flex items-center text-xs"><Icon src={ArrowDownTray} class="mr-1 h-4 w-4" />Agenda</a>{/if}
							{#if item.minutesFile}<a href={pb_client.files.getURL(item, item.minutesFile)} target="_blank" rel="noopener noreferrer" class="link-hover link link-info ml-2 inline-flex items-center text-xs"><Icon src={ArrowDownTray} class="mr-1 h-4 w-4" />Minutes</a>{/if}
						</td>
						<td class="flex gap-1">
							<a href="/admin/board/meetings/edit/{item.id}" title="Edit Meeting" class="btn btn-square btn-info btn-xs"><Icon src={PencilSquare} class="h-3 w-3"></Icon></a>
							<form
								method="POST"
								action="?/delete"
								use:enhance
								onsubmit={(e) => {
									if (!window.confirm(`Delete meeting from ${item.meetingDateTime ? format(parseISO(item.meetingDateTime), 'MMM do, yyyy') : 'this date'}?`)) { e.preventDefault(); e.stopImmediatePropagation(); }
								}}
							>
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