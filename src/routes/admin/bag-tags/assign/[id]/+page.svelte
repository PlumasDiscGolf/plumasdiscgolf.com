<script>
    import { enhance } from '$app/forms';
    import { Icon, CheckCircle, XCircle, ArrowUturnLeft } from 'svelte-hero-icons';

    let { data, form } = $props(); // data.bagTag, data.currentHolderName, data.members from load; form from action

    const REASON_OPTIONS = ['League Round', 'Challenge Win', 'Season Opener', 'Manual Correction', 'Other'];

    // bind:value requires $state, not $derived.
    let memberId = $state('');
    let reason = $state('League Round');
    let assignedAt = $state('');
    let notes = $state('');

    $effect(() => {
        if (form) {
            memberId = form.memberId ?? memberId;
            reason = form.reason ?? reason;
            assignedAt = form.assignedAt ?? assignedAt;
            notes = form.notes ?? notes;
        }
    });

    let isSaving = $state(false);
</script>

<div class="container mx-auto px-4 py-8 max-w-2xl">
    <div class="mb-6 flex items-center justify-between">
        <h1 class="text-3xl font-bold text-base-content">Assign Bag Tag</h1>
        <a href="/admin/bag-tags" class="btn btn-ghost btn-sm">
            <Icon src={ArrowUturnLeft} class="h-5 w-5" />
            Back to Admin
        </a>
    </div>

    <p class="mb-6 text-sm opacity-70">
        Tag #{data.bagTag.tagNumber} — {data.bagTag.league} League, {data.bagTag.season}
        {#if data.currentHolderName}
            <br />Currently held by <strong>{data.currentHolderName}</strong>. Assigning to someone new here will replace them — no separate forfeiture step needed for a direct hand-off (e.g. a challenge win).
        {:else}
            <br />Currently available.
        {/if}
    </p>

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

    <form method="POST" action="?/assignTag" use:enhance={() => {
        isSaving = true;
        return async ({ update }) => {
            await update({ reset: false });
            isSaving = false;
        };
    }} class="card bg-base-200 shadow-xl">
        <div class="card-body space-y-4">
            <div class="form-control">
                <label class="label" for="memberSelect"><span class="label-text">Member*</span></label>
                <select name="memberId" id="memberSelect" class="select select-bordered w-full" bind:value={memberId} required>
                    <option value="" disabled selected={!memberId}>Select a member...</option>
                    {#each data.members as member (member.id)}
                        <option value={member.id}>{member.firstName} {member.lastName}{member.nickname ? ` (${member.nickname})` : ''}</option>
                    {/each}
                </select>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="form-control">
                    <label class="label" for="reasonSelect"><span class="label-text">Reason*</span></label>
                    <select name="reason" id="reasonSelect" class="select select-bordered w-full" bind:value={reason} required>
                        {#each REASON_OPTIONS as opt}
                            <option value={opt}>{opt}</option>
                        {/each}
                    </select>
                </div>
                <div class="form-control">
                    <label class="label" for="assignedAtInput"><span class="label-text">Date*</span></label>
                    <input name="assignedAt" type="date" id="assignedAtInput" class="input input-bordered w-full" bind:value={assignedAt} required />
                </div>
            </div>

            <div class="form-control">
                <label class="label" for="notesTextarea"><span class="label-text">Notes</span></label>
                <textarea name="notes" id="notesTextarea" class="textarea textarea-bordered h-24 w-full" placeholder="Optional — especially useful if Reason is Other" bind:value={notes}></textarea>
            </div>

            <div class="card-actions justify-end mt-6">
                <a href="/admin/bag-tags" class="btn btn-ghost" disabled={isSaving}>Cancel</a>
                <button type="submit" class="btn btn-primary flex items-center gap-1.5" disabled={isSaving}>
                    {#if isSaving} <span class="loading loading-spinner loading-xs"></span> {/if}
                    <Icon src={CheckCircle} class="h-5 w-5" />
                    Assign Tag
                </button>
            </div>
        </div>
    </form>
</div>