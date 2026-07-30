<script>
    import { enhance } from '$app/forms';
    import { Icon, CheckCircle, XCircle, ArrowUturnLeft } from 'svelte-hero-icons';

    let { form } = $props();

    const currentYear = new Date().getFullYear();

    // bind:value requires $state, not $derived (derived values are read-only).
    // Initialize once, then sync from `form` via $effect whenever a submission
    // fails and comes back with values to repopulate.
    let league = $state('Open');
    let season = $state(String(currentYear));
    let tagCount = $state('');

    $effect(() => {
        if (form) {
            league = form.league ?? league;
            season = form.season ?? season;
            tagCount = form.tagCount ?? tagCount;
        }
    });

    let isSaving = $state(false);
</script>

<div class="container mx-auto px-4 py-8 max-w-2xl">
    <div class="mb-6 flex items-center justify-between">
        <h1 class="text-3xl font-bold text-base-content">Add New Tags</h1>
        <a href="/admin/bag-tags" class="btn btn-ghost btn-sm">
            <Icon src={ArrowUturnLeft} class="h-5 w-5" />
            Back to Admin
        </a>
    </div>

    <p class="mb-6 text-sm opacity-70">
        Creates the next set of tag numbers after whatever the current highest is for the chosen league and season.
        If none exist yet, this starts fresh at #1 — the same tool works for starting a new season or topping up an existing one mid-season.
        No holders are assigned; new tags start out available.
    </p>

    {#if form?.error}
        <div class="alert alert-error mb-4 shadow-md">
            <div>
                <Icon src={XCircle} class="h-6 w-6 mr-2 shrink-0"></Icon>
                <span>{form.error}</span>
            </div>
        </div>
    {/if}
    {#if form?.fieldErrors}
        <div class="alert alert-warning mb-4 shadow-md">
            <ul class="list-disc pl-5">
                {#each Object.entries(form.fieldErrors) as [field, errorMsg]}
                    <li><strong>{field.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}:</strong> {errorMsg}</li>
                {/each}
            </ul>
        </div>
    {/if}

    <form method="POST" action="?/addTags" use:enhance={() => {
        isSaving = true;
        return async ({ update }) => {
            await update({ reset: false });
            isSaving = false;
        };
    }} class="card bg-base-200 shadow-xl">
        <div class="card-body space-y-4">
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div class="form-control">
                    <label class="label" for="leagueSelect"><span class="label-text">League*</span></label>
                    <select name="league" id="leagueSelect" class="select select-bordered w-full" bind:value={league} required>
                        <option value="Open">Open</option>
                        <option value="Ladies">Ladies</option>
                    </select>
                </div>
                <div class="form-control">
                    <label class="label" for="seasonInput"><span class="label-text">Season*</span></label>
                    <input name="season" type="number" step="1" id="seasonInput" class="input input-bordered w-full" bind:value={season} required />
                </div>
                <div class="form-control">
                    <label class="label" for="tagCountInput"><span class="label-text">Number of Tags to Add*</span></label>
                    <input name="tagCount" type="number" min="1" max="50" step="1" id="tagCountInput" placeholder="e.g., 50" class="input input-bordered w-full" bind:value={tagCount} required />
                    <label class="label py-0" for="tagCountInput"><span class="label-text-alt">Up to 50 tags per submission.</span></label>
                </div>
            </div>

            <div class="card-actions justify-end mt-6">
                <a href="/admin/bag-tags" class="btn btn-ghost" disabled={isSaving}>Cancel</a>
                <button type="submit" class="btn btn-primary flex items-center gap-1.5" disabled={isSaving}>
                    {#if isSaving} <span class="loading loading-spinner loading-xs"></span> {/if}
                    <Icon src={CheckCircle} class="h-5 w-5" />
                    Add Tags
                </button>
            </div>
        </div>
    </form>
</div>