<!-- src/routes/admin/putting-league/entries/edit/[id]/+page.svelte -->
<script>
	import { enhance } from '$app/forms';
	import { Icon, CheckCircle, XCircle, ArrowUturnLeft } from 'svelte-hero-icons';

	let { data, form } = $props();

	let eventId = $state(data.entry?.eventId ?? '');
	let playerType = $state(data.entry?.memberId ? 'member' : 'guest');
	let memberId = $state(data.entry?.memberId ?? '');
	let guestName = $state(data.entry?.guestName ?? '');
	let paid = $state(data.entry?.paid ?? false);

	$effect(() => {
		if (form) {
			eventId = form.eventId ?? eventId;
			playerType = form.playerType ?? playerType;
			memberId = form.memberId ?? memberId;
			guestName = form.guestName ?? guestName;
			paid = form.paid ?? paid;
		}
	});

	let isSaving = $state(false);
</script>

<div class="container mx-auto max-w-2xl px-4 py-8">
	<div class="mb-6 flex items-center justify-between">
		<h1 class="text-3xl font-bold text-base-content">Edit Putting League Player</h1>
		<a href="/admin/putting-league" class="btn btn-ghost btn-sm"><Icon src={ArrowUturnLeft} class="h-5 w-5" />Back to Admin</a>
	</div>

	{#if form?.error}
		<div class="alert alert-error mb-4 shadow-md">
			<div><Icon src={XCircle} class="mr-2 h-6 w-6 shrink-0"></Icon><span>{form.error}</span></div>
		</div>
	{/if}
	{#if form?.fieldErrors}
		<div class="alert alert-warning mb-4 shadow-md">
			<ul class="list-disc pl-5">
				{#each Object.entries(form.fieldErrors) as [field, errorMsg]}
					<li><strong>{field}:</strong> {errorMsg}</li>
				{/each}
			</ul>
		</div>
	{/if}

	<form
		method="POST"
		action="?/updateEntry"
		use:enhance={() => {
			isSaving = true;
			return async ({ update }) => {
				await update({ reset: false });
				isSaving = false;
			};
		}}
		class="card bg-base-200 shadow-xl"
	>
		<div class="card-body space-y-4">
			<div class="form-control">
				<label class="label" for="eventSelect"><span class="label-text">Event*</span></label>
				<select name="eventId" id="eventSelect" class="select select-bordered w-full" bind:value={eventId} required>
					<option value="" disabled>— Select an event —</option>
					{#each data.events as event}
						<option value={event.id}>{new Date(event.date).toLocaleDateString()}</option>
					{/each}
				</select>
			</div>

			<div class="form-control">
				<span class="label-text mb-1 block">Player*</span>
				<div class="flex gap-4">
					<label class="label cursor-pointer gap-2">
						<input type="radio" name="playerType" value="member" class="radio" bind:group={playerType} />
						<span class="label-text">Club Member</span>
					</label>
					<label class="label cursor-pointer gap-2">
						<input type="radio" name="playerType" value="guest" class="radio" bind:group={playerType} />
						<span class="label-text">Guest / Non-Member</span>
					</label>
				</div>
			</div>

			{#if playerType === 'member'}
				<div class="form-control">
					<label class="label" for="memberSelect"><span class="label-text">Member*</span></label>
					<select name="memberId" id="memberSelect" class="select select-bordered w-full" bind:value={memberId} required>
						<option value="" disabled>— Select a member —</option>
						{#each data.members as member}
							<option value={member.id}>{member.firstName} {member.lastName}</option>
						{/each}
					</select>
				</div>
			{:else}
				<div class="form-control">
					<label class="label" for="guestNameInput"><span class="label-text">Guest Name*</span></label>
					<input name="guestName" type="text" id="guestNameInput" class="input input-bordered w-full" bind:value={guestName} required />
				</div>
			{/if}

			<div class="form-control">
				<label class="label cursor-pointer justify-start gap-3">
					<input type="checkbox" name="paid" class="checkbox" bind:checked={paid} />
					<span class="label-text">Entry fee paid</span>
				</label>
			</div>

			<div class="card-actions mt-6 justify-end">
				<a href="/admin/putting-league" class="btn btn-ghost" disabled={isSaving}>Cancel</a>
				<button type="submit" class="btn btn-primary flex items-center gap-1.5" disabled={isSaving}>
					{#if isSaving}<span class="loading loading-spinner loading-xs"></span>{/if}
					<Icon src={CheckCircle} class="h-5 w-5" />
					Update Player
				</button>
			</div>
		</div>
	</form>
</div>