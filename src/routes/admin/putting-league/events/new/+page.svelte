<!-- src/routes/admin/putting-league/events/new/+page.svelte -->
<script>
	import { enhance } from '$app/forms';
	import { Icon, CheckCircle, XCircle, ArrowUturnLeft } from 'svelte-hero-icons';

	let { data, form } = $props();

	let date = $state(form?.date ?? '');
	let locationId = $state(form?.locationId ?? '');
	let entryFee = $state(form?.entryFee ?? '5');
	let payoutPortion = $state(form?.payoutPortion ?? '3');
	let notes = $state(form?.notes ?? '');

	$effect(() => {
		if (form) {
			date = form.date ?? date;
			locationId = form.locationId ?? locationId;
			entryFee = form.entryFee ?? entryFee;
			payoutPortion = form.payoutPortion ?? payoutPortion;
			notes = form.notes ?? notes;
		}
	});

	let isSaving = $state(false);
</script>

<div class="container mx-auto max-w-2xl px-4 py-8">
	<div class="mb-6 flex items-center justify-between">
		<h1 class="text-3xl font-bold text-base-content">Add Putting League Event</h1>
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
					<li><strong>{field.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase())}:</strong> {errorMsg}</li>
				{/each}
			</ul>
		</div>
	{/if}

	<form
		method="POST"
		action="?/createEvent"
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
			<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
				<div class="form-control">
					<label class="label" for="dateInput"><span class="label-text">Date*</span></label>
					<input name="date" type="date" id="dateInput" class="input input-bordered w-full" bind:value={date} required />
				</div>
				<div class="form-control">
					<label class="label" for="locationSelect"><span class="label-text">Location</span></label>
					<select name="locationId" id="locationSelect" class="select select-bordered w-full" bind:value={locationId}>
						<option value="">— None —</option>
						{#each data.locations as location}
							<option value={location.id}>{location.name}</option>
						{/each}
					</select>
				</div>
			</div>

			<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
				<div class="form-control">
					<label class="label" for="entryFeeInput"><span class="label-text">Entry Fee ($)*</span></label>
					<input name="entryFee" type="number" step="0.01" min="0" id="entryFeeInput" class="input input-bordered w-full" bind:value={entryFee} required />
				</div>
				<div class="form-control">
					<label class="label" for="payoutPortionInput"><span class="label-text">Payout Portion ($)*</span></label>
					<input name="payoutPortion" type="number" step="0.01" min="0" id="payoutPortionInput" class="input input-bordered w-full" bind:value={payoutPortion} required />
					<span class="label-text-alt mt-1 opacity-70">The part of the entry fee that feeds the payout pool — the rest stays with the club.</span>
				</div>
			</div>

			<div class="form-control">
				<label class="label" for="notesInput"><span class="label-text">Notes</span></label>
				<textarea name="notes" id="notesInput" class="textarea textarea-bordered w-full" rows="2" bind:value={notes}></textarea>
			</div>

			<div class="card-actions mt-6 justify-end">
				<a href="/admin/putting-league" class="btn btn-ghost" disabled={isSaving}>Done</a>
				<button type="submit" class="btn btn-primary flex items-center gap-1.5" disabled={isSaving}>
					{#if isSaving}<span class="loading loading-spinner loading-xs"></span>{/if}
					<Icon src={CheckCircle} class="h-5 w-5" />
					Save Event
				</button>
			</div>
		</div>
	</form>
</div>