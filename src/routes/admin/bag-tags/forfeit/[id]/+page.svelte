<script>
    import { enhance } from '$app/forms';
    import { Icon, CheckCircle, XCircle, ArrowUturnLeft } from 'svelte-hero-icons';

    let { data, form } = $props(); // data.bagTag, data.currentHolder from load; form from action

    // bind:value requires $state, not $derived.
    let assignedAt = $state('');
    let notes = $state('');

    $effect(() => {
        if (form) {
            assignedAt = form.assignedAt ?? assignedAt;
            notes = form.notes ?? notes;
        }
    });

    let isSaving = $state(false);
</script>

<div class="container mx-auto px-4 py-8 max-w-2xl">
    <div class="mb-6 flex items-center justify-between">
        <h1 class="text-3xl font-bold text-base-content">Forfeit Bag Tag</h1>
        <a href="/admin/bag-tags" class="btn btn-ghost btn-sm">
            <Icon src={ArrowUturnLeft} class="h-5 w-5" />
            Back to Admin
        </a>
    </div>

    <p class="mb-6 text-sm opacity-70">
        Tag #{data.bagTag.tagNumber} — {data.bagTag.league} League, {data.bagTag.season}
    </p>

    {#if !data.currentHolder}
        <div class="alert alert-warning mb-4 shadow-md">
            <span>This tag has no current holder — there's nothing to forfeit.</span>
        </div>
        <a href="/admin/bag-tags" class="btn btn-ghost">Back to Admin</a>
    {:else}
        <div class="alert alert-info mb-4 shadow-md">
            <span>Currently held by <strong>{data.currentHolder.name}</strong>. Recording a forfeiture will mark this tag as available — it does not assign it to anyone new.</span>
        </div>

        {#if form?.error}
            <div class="alert alert-error mb-4 shadow-md">
                <div><Icon src={XCircle} class="h-6 w-6 mr-2 shrink-0"></Icon><span>{form.error}</span></div>
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

        <form method="POST" action="?/forfeitTag" use:enhance={() => {
            isSaving = true;
            return async ({ update }) => {
                await update({ reset: false });
                isSaving = false;
            };
        }} class="card bg-base-200 shadow-xl">
            <div class="card-body space-y-4">
                <div class="form-control">
                    <label class="label" for="assignedAtInput"><span class="label-text">Date*</span></label>
                    <input name="assignedAt" type="date" id="assignedAtInput" class="input input-bordered w-full" bind:value={assignedAt} required />
                </div>
                <div class="form-control">
                    <label class="label" for="notesTextarea"><span class="label-text">Notes</span></label>
                    <textarea name="notes" id="notesTextarea" class="textarea textarea-bordered h-24 w-full" placeholder="Optional — e.g. missed two consecutive events" bind:value={notes}></textarea>
                </div>

                <div class="card-actions justify-end mt-6">
                    <a href="/admin/bag-tags" class="btn btn-ghost" disabled={isSaving}>Cancel</a>
                    <button type="submit" class="btn btn-warning flex items-center gap-1.5" disabled={isSaving}>
                        {#if isSaving} <span class="loading loading-spinner loading-xs"></span> {/if}
                        <Icon src={CheckCircle} class="h-5 w-5" />
                        Confirm Forfeiture
                    </button>
                </div>
            </div>
        </form>
    {/if}
</div>