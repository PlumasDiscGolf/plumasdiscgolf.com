<script>
	import { enhance } from '$app/forms';
	import { Icon, CheckCircle, XCircle, ArrowUturnLeft } from 'svelte-hero-icons';

	let { data, form } = $props(); // data.event, data.seasons, data.courses, data.hasResults from load; form from action

	let seasonId = $state(data.event?.seasonId ?? '');
	let eventNumber = $state(data.event?.eventNumber ?? '');
	let type = $state(data.event?.type ?? 'Handicap');
	let eventDate = $state(data.event?.eventDate ? data.event.eventDate.slice(0, 10) : '');
	let courseId = $state(data.event?.courseId ?? '');

	$effect(() => {
		if (form) {
			seasonId = form.seasonId ?? seasonId;
			eventNumber = form.eventNumber ?? eventNumber;
			type = form.type ?? type;
			eventDate = form.eventDate ?? eventDate;
			courseId = form.courseId ?? courseId;
		}
	});

	let isSaving = $state(false);
</script>

<div class="container mx-auto max-w-2xl px-4 py-8">
	<div class="mb-6 flex items-center justify-between">
		<h1 class="text-3xl font-bold text-base-content">Edit Plumas Series Event</h1>
		<a href="/admin/plumas-series" class="btn btn-ghost btn-sm"><Icon src={ArrowUturnLeft} class="h-5 w-5" />Back to Admin</a>
	</div>

	{#if data.hasResults}
		<div class="alert alert-info mb-4 shadow-md">
			<span>This event already has results recorded. Changing Season, Event Number, or Type here won't move those results — double-check the standings after saving.</span>
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
		action="?/updateEvent"
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
					<label class="label" for="seasonSelect"><span class="label-text">Season*</span></label>
					<select name="seasonId" id="seasonSelect" class="select select-bordered w-full" bind:value={seasonId} required>
						<option value="" disabled>— Select a season —</option>
						{#each data.seasons as season}
							<option value={season.id}>{season.year}</option>
						{/each}
					</select>
				</div>
				<div class="form-control">
					<label class="label" for="eventNumberInput"><span class="label-text">Event Number*</span></label>
					<input name="eventNumber" type="number" min="1" step="1" id="eventNumberInput" class="input input-bordered w-full" bind:value={eventNumber} required />
				</div>
				<div class="form-control">
					<label class="label" for="typeSelect"><span class="label-text">Type*</span></label>
					<select name="type" id="typeSelect" class="select select-bordered w-full" bind:value={type} required>
						<option value="Handicap">Handicap</option>
						<option value="Championship">Championship</option>
					</select>
				</div>
				<div class="form-control">
					<label class="label" for="eventDateInput"><span class="label-text">Event Date*</span></label>
					<input name="eventDate" type="date" id="eventDateInput" class="input input-bordered w-full" bind:value={eventDate} required />
				</div>
				<div class="form-control md:col-span-2">
					<label class="label" for="courseSelect"><span class="label-text">Course</span></label>
					<select name="courseId" id="courseSelect" class="select select-bordered w-full" bind:value={courseId}>
						<option value="">— None —</option>
						{#each data.courses as course}
							<option value={course.id}>{course.name}</option>
						{/each}
					</select>
				</div>
			</div>

			<div class="card-actions mt-6 justify-end">
				<a href="/admin/plumas-series" class="btn btn-ghost" disabled={isSaving}>Cancel</a>
				<button type="submit" class="btn btn-primary flex items-center gap-1.5" disabled={isSaving}>
					{#if isSaving}<span class="loading loading-spinner loading-xs"></span>{/if}
					<Icon src={CheckCircle} class="h-5 w-5" />
					Update Event
				</button>
			</div>
		</div>
	</form>
</div>