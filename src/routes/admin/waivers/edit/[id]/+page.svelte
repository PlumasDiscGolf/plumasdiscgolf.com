<!-- src/routes/admin/waivers/edit/[id]/+page.svelte -->
<script>
    import { enhance } from '$app/forms';
    import { Icon, CheckCircle, XCircle, ArrowUturnLeft } from 'svelte-hero-icons';
    import { formatPocketBaseDateToDateInput } from '$lib/utils.js';
    import { env } from '$env/dynamic/public';

    let { data, form } = $props(); // data.waiver, data.memberships, data.waiverTemplates from load

    // bind:value requires $state, not $derived. Initialize once from
    // data.waiver, then sync from `form` via $effect whenever a submission
    // fails and comes back with values to repopulate.
    let membershipId = $state(data.waiver?.membershipId || '');
    let waiverTemplateId = $state(data.waiver?.waiverTemplateId || '');
    let signedByName = $state(data.waiver?.signedByName || '');
    let signedAt = $state(formatPocketBaseDateToDateInput(data.waiver?.signedAt));
    let acknowledged = $state(data.waiver?.acknowledged || false);
    let guardianName = $state(data.waiver?.guardianName || '');
    let scannedFile = $state(null);
    let selectedFileName = $state('');
    let deleteExistingFile = $state(false);

    function handleFileSelect(e) {
        const file = e.target.files?.[0];
        if (file) {
            scannedFile = file;
            selectedFileName = file.name;
            deleteExistingFile = false;
        } else {
            scannedFile = null;
            selectedFileName = '';
        }
    }

    $effect(() => {
        if (form) {
            membershipId = form.membershipId ?? membershipId;
            waiverTemplateId = form.waiverTemplateId ?? waiverTemplateId;
            signedByName = form.signedByName ?? signedByName;
            signedAt = form.signedAt ?? signedAt;
            acknowledged = form.acknowledged ?? acknowledged;
            guardianName = form.guardianName ?? guardianName;
        }
    });

    function membershipLabel(m) {
        const member = m.expand?.memberId;
        const type = m.expand?.membershipTypeId;
        const name = member ? `${member.firstName} ${member.lastName}` : '(unknown member)';
        const typeName = type?.name || '(unknown type)';
        return `${name} — ${m.season} ${typeName}`;
    }

    let isSaving = $state(false);
</script>

<div class="container mx-auto px-4 py-8 max-w-2xl">
    <div class="mb-6 flex items-center justify-between">
        <h1 class="text-3xl font-bold text-base-content">Edit Waiver Signature</h1>
        <a href="/admin/waivers" class="btn btn-ghost btn-sm">
            <Icon src={ArrowUturnLeft} class="h-5 w-5" />
            Back to Admin
        </a>
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

    <form method="POST" action="?/updateWaiverSignature" use:enhance={() => {
        isSaving = true;
        return async ({ update }) => {
            await update({ reset: false });
            isSaving = false;
        };
    }} enctype="multipart/form-data" class="card bg-base-200 shadow-xl">
        <div class="card-body space-y-4">
            <div class="form-control">
                <label class="label" for="membershipSelect"><span class="label-text">Membership*</span></label>
                <select name="membershipId" id="membershipSelect" class="select select-bordered w-full" bind:value={membershipId} required>
                    {#each data.memberships as m (m.id)}
                        <option value={m.id}>{membershipLabel(m)}</option>
                    {/each}
                </select>
            </div>

            <div class="form-control">
                <label class="label" for="waiverTemplateSelect"><span class="label-text">Waiver Template*</span></label>
                <select name="waiverTemplateId" id="waiverTemplateSelect" class="select select-bordered w-full" bind:value={waiverTemplateId} required>
                    {#each data.waiverTemplates as t (t.id)}
                        <option value={t.id}>{t.name} ({t.season})</option>
                    {/each}
                </select>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="form-control">
                    <label class="label" for="signedByNameInput"><span class="label-text">Signed By (printed name)*</span></label>
                    <input name="signedByName" type="text" id="signedByNameInput" class="input input-bordered w-full" bind:value={signedByName} required />
                </div>
                <div class="form-control">
                    <label class="label" for="signedAtInput"><span class="label-text">Signed Date*</span></label>
                    <input name="signedAt" type="date" id="signedAtInput" class="input input-bordered w-full" bind:value={signedAt} required />
                </div>
            </div>

            <div class="form-control">
                <label class="label" for="guardianNameInput"><span class="label-text">Guardian Name</span></label>
                <input name="guardianName" type="text" id="guardianNameInput" placeholder="Only for a Youth membership signed by a guardian" class="input input-bordered w-full" bind:value={guardianName} />
            </div>

            <div class="form-control">
                <label class="label" for="scannedFileInput"><span class="label-text">Scanned Waiver (PDF)</span></label>
                {#if data.waiver?.scannedFile && !deleteExistingFile}
                    <div class="mb-2 flex items-center gap-3">
                        <a
                            href="{env.PUBLIC_POCKETBASE_FILES_URL}/api/files/{data.waiver.collectionId}/{data.waiver.id}/{data.waiver.scannedFile}"
                            target="_blank"
                            rel="noopener noreferrer"
                            class="link-hover link link-info text-sm"
                        >
                            View current PDF
                        </a>
                        <label class="flex cursor-pointer items-center gap-2 text-sm text-error">
                            <input type="checkbox" class="checkbox checkbox-error checkbox-sm" bind:checked={deleteExistingFile} />
                            Remove file
                        </label>
                    </div>
                {/if}
                {#if deleteExistingFile}
                    <div class="alert alert-warning mb-2 py-2 text-sm">Current file will be removed on save.</div>
                {/if}
                <input type="hidden" name="deleteExistingFile" value={deleteExistingFile} />
                <input
                    name="scannedFile"
                    type="file"
                    id="scannedFileInput"
                    class="file-input file-input-bordered file-input-sm w-full"
                    onchange={handleFileSelect}
                    accept="application/pdf"
                    disabled={deleteExistingFile}
                />
                {#if selectedFileName}
                    <span class="label-text-alt mt-1 text-xs">New: {selectedFileName} (will replace existing if saved)</span>
                {/if}
            </div>

            <div class="form-control">
                <label class="label cursor-pointer justify-start gap-4 py-1">
                    <input name="acknowledged" type="checkbox" class="checkbox" bind:checked={acknowledged} />
                    <span class="label-text">Physical form received and on file</span>
                </label>
            </div>

            <div class="card-actions justify-end mt-6">
                <a href="/admin/waivers" class="btn btn-ghost" disabled={isSaving}>Cancel</a>
                <button type="submit" class="btn btn-primary flex items-center gap-1.5" disabled={isSaving}>
                    {#if isSaving} <span class="loading loading-spinner loading-xs"></span> {/if}
                    <Icon src={CheckCircle} class="h-5 w-5" />
                    Update Signature
                </button>
            </div>
        </div>
    </form>
</div>