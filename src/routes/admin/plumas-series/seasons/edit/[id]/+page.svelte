<script>
	import { enhance } from '$app/forms';
	import { Icon, CheckCircle, XCircle, ArrowUturnLeft } from 'svelte-hero-icons';

	let { data, form } = $props(); // data.season, data.hasEvents from load; form from action

	let year = $state(data.season?.year ?? '');
	let totalEvents = $state(data.season?.totalEvents ?? '');
	let countingEvents = $state(data.season?.countingEvents ?? '');
	let notes = $state(data.season?.notes ?? '');

	$effect(() => {
		if (form) {
			year = form.year ?? year;
			totalEvents = form.totalEvents ?? totalEvents;
			countingEvents = form.countingEvents ?? countingEvents;
			notes = form.notes ?? notes;
		}
	});

	let isSaving = $state(false);
</script>

<div class="container mx-auto max-w-2xl px-4 py-8">
	<div class="mb-6 flex items-center justify-between">
		<h1 class="text-3xl font-bold text-base-content">Edit Plumas Series Season</h1>
		<a href="/admin/plumas-series" class="btn btn-ghost btn-sm"><Icon src={ArrowUturnLeft} class="h-5 w-5" />Back to Admin</a>
	</div>

	{#if data.hasEvents}
		<div class="alert alert-info mb-4 shadow-md">
			<span>This season already has events tied to it. Changing Total Events or Counting Events here doesn't move or renumber those events — it only changes how the standings total is calculated going forward.</span>
		</div>
	{/if}

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
		action="?/updateSeason"
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
					<label class="label" for="yearInput"><span class="label-text">Year*</span></label>
					<input name="year" type="number" step="1" id="yearInput" class="input input-bordered w-full" bind:value={year} required />
				</div>
				<div></div>
				<div class="form-control">
					<label class="label" for="totalEventsInput"><span class="label-text">Total Events*</span></label>
					<input name="totalEvents" type="number" min="1" step="1" id="totalEventsInput" class="input input-bordered w-full" bind:value={totalEvents} required />
					<span class="label-text-alt mt-1 opacity-70">Scheduled point-scoring (Handicap) events this season.</span>
				</div>
				<div class="form-control">
					<label class="label" for="countingEventsInput"><span class="label-text">Counting Events*</span></label>
					<input name="countingEvents" type="number" min="1" step="1" id="countingEventsInput" class="input input-bordered w-full" bind:value={countingEvents} required />
					<span class="label-text-alt mt-1 opacity-70">How many best results count toward the total, e.g. "5" for a best-5-of-7 format.</span>
				</div>
				<div class="form-control md:col-span-2">
					<label class="label" for="notesInput"><span class="label-text">Notes</span></label>
					<textarea name="notes" id="notesInput" class="textarea textarea-bordered w-full" rows="2" bind:value={notes}></textarea>
				</div>
			</div>

			<div class="card-actions mt-6 justify-end">
				<a href="/admin/plumas-series" class="btn btn-ghost" disabled={isSaving}>Cancel</a>
				<button type="submit" class="btn btn-primary flex items-center gap-1.5" disabled={isSaving}>
					{#if isSaving}<span class="loading loading-spinner loading-xs"></span>{/if}
					<Icon src={CheckCircle} class="h-5 w-5" />
					Update Season
				</button>
			</div>
		</div>
	</form>
</div>