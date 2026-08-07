<!-- src/routes/admin/putting-league/entries/[id]/record/[field]/+page.svelte -->
<script>
	import { enhance } from '$app/forms';
	import { Icon, ArrowUturnLeft, XCircle } from 'svelte-hero-icons';

	let { data, form } = $props();

	function playerName(entry) {
		const member = entry.expand?.memberId;
		return member ? `${member.firstName} ${member.lastName}` : entry.guestName || 'Unknown Player';
	}

	let isSaving = $state(false);
</script>

<div class="container mx-auto max-w-md px-4 py-8">
	<div class="mb-6 flex items-center justify-between">
		<h1 class="text-2xl font-bold text-base-content">Round {data.round}, Station {data.station}</h1>
		<a href={data.returnTo} class="btn btn-ghost btn-sm">
			<Icon src={ArrowUturnLeft} class="h-5 w-5" />Back
		</a>
	</div>

	<p class="mb-6 text-center opacity-70">{playerName(data.entry)} · {data.distance}ft</p>

	{#if form?.error}
		<div class="alert alert-error mb-4 shadow-md">
			<div><Icon src={XCircle} class="mr-2 h-6 w-6 shrink-0"></Icon><span>{form.error}</span></div>
		</div>
	{/if}

	<div class="grid grid-cols-2 gap-4">
		{#each [0, 1, 2, 3] as makes}
			<form
				method="POST"
				action="?/recordMakes"
				use:enhance={() => {
					isSaving = true;
					return async ({ update }) => {
						await update();
						isSaving = false;
					};
				}}
			>
				<input type="hidden" name="makes" value={makes} />
				<input type="hidden" name="returnTo" value={data.returnTo} />
				<button
					type="submit"
					disabled={isSaving}
					class="btn h-24 w-full text-2xl font-bold {data.currentValue === makes ? 'btn-primary' : 'btn-outline'}"
				>
					{makes}
					<span class="text-sm font-normal">{makes === 1 ? 'Make' : 'Makes'}</span>
				</button>
			</form>
		{/each}
	</div>

	<p class="mt-4 text-center text-sm opacity-60">Worth {data.station} pt{data.station === 1 ? '' : 's'} per make at this station.</p>
</div>