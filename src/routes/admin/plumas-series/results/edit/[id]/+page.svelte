<script>
	import { enhance } from '$app/forms';
	import { Icon, CheckCircle, XCircle, ArrowUturnLeft } from 'svelte-hero-icons';

	let { data, form } = $props(); // data.result, data.events, data.members from load; form from action

	let eventId = $state(data.result?.eventId ?? '');
	let playerType = $state(data.result?.memberId ? 'member' : 'guest');
	let memberId = $state(data.result?.memberId ?? '');
	let guestName = $state(data.result?.guestName ?? '');
	let place = $state(data.result?.place ?? '');
	let points = $state(data.result?.points ?? '');

	$effect(() => {
		if (form) {
			eventId = form.eventId ?? eventId;
			playerType = form.playerType ?? playerType;
			memberId = form.memberId ?? memberId;
			guestName = form.guestName ?? guestName;
			place = form.place ?? place;
			points = form.points ?? points;
		}
	});

	let selectedEvent = $derived(data.events.find((e) => e.id === eventId));
	let isSaving = $state(false);

	// API can't sort on an expanded relation's own field, so order client-side:
	// newest season first, then event number within a season.
	let sortedEvents = $derived(
		[...data.events].sort((a, b) => {
			const yearA = a.expand?.seasonId?.year ?? 0;
			const yearB = b.expand?.seasonId?.year ?? 0;
			if (yearB !== yearA) return yearB - yearA;
			return a.eventNumber - b.eventNumber;
		})
	);
</script>

<div class="container mx-auto max-w-2xl px-4 py-8">
	<div class="mb-6 flex items-center justify-between">
		<h1 class="text-3xl font-bold text-base-content">Edit Plumas Series Result</h1>
		<a href="/admin/plumas-series" class="btn btn-ghost btn-sm"><Icon src={ArrowUturnLeft} class="h-5 w-5" />Back to Admin</a>
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
					<li><strong>{field.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase())}:</strong> {errorMsg}</li>
				{/each}
			</ul>
		</div>
	{/if}

	<form
		method="POST"
		action="?/updateResult"
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
					{#each sortedEvents as event}
						<option value={event.id}>{event.expand?.seasonId?.year ?? '?'} · Event #{event.eventNumber} ({event.type})</option>
					{/each}
				</select>
				{#if selectedEvent?.type === 'Championship'}
					<span class="label-text-alt mt-1 opacity-70">Championship results aren't points-based — leave Points blank and just record Place.</span>
				{/if}
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

			<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
				<div class="form-control">
					<label class="label" for="placeInput"><span class="label-text">Place*</span></label>
					<input name="place" type="text" id="placeInput" placeholder="1st, T2nd, etc." class="input input-bordered w-full" bind:value={place} required />
				</div>
				<div class="form-control">
					<label class="label" for="pointsInput"><span class="label-text">Points</span></label>
					<input name="points" type="number" step="0.01" id="pointsInput" class="input input-bordered w-full" bind:value={points} />
				</div>
			</div>

			<div class="card-actions mt-6 justify-end">
				<a href="/admin/plumas-series" class="btn btn-ghost" disabled={isSaving}>Cancel</a>
				<button type="submit" class="btn btn-primary flex items-center gap-1.5" disabled={isSaving}>
					{#if isSaving}<span class="loading loading-spinner loading-xs"></span>{/if}
					<Icon src={CheckCircle} class="h-5 w-5" />
					Update Result
				</button>
			</div>
		</div>
	</form>
</div>