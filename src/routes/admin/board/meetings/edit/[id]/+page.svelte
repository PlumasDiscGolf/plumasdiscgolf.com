<!-- src/routes/admin/board/meetings/edit/[id]/+page.svelte -->
<script>
    import { enhance } from '$app/forms';
    import { Icon, CheckCircle, XCircle, ArrowUturnLeft, ArrowDownTray, Trash } from 'svelte-hero-icons';
    import { formatPocketBaseDateToLocalInput } from '$lib/utils.js';

    let { data, form } = $props(); // data.meeting from load

    // All of these must be $state, not $derived — $derived values are
    // read-only and can't be assigned to, which is what the effects below
    // (and bind:value) need to do.
    let meetingDateTime = $state(formatPocketBaseDateToLocalInput(data.meeting?.meetingDateTime));
    let existingAgendaName = $state(data.meeting?.agendaFile || '');
    let existingMinutesName = $state(data.meeting?.minutesFile || '');

    // State for new file uploads
    let agendaFile = $state(null);
    let minutesFile = $state(null);
    let selectedAgendaFileName = $state('');
    let selectedMinutesFileName = $state('');

    // State to track if existing files should be deleted
    let deleteExistingAgenda = $state(false);
    let deleteExistingMinutes = $state(false);

    let isSaving = $state(false);

    // Reset the display fields and any transient file-selection state
    // whenever the underlying meeting record changes — e.g. navigating
    // directly between two different meetings' edit pages without a full
    // component remount.
    $effect(() => {
        if (data.meeting) {
            meetingDateTime = formatPocketBaseDateToLocalInput(data.meeting.meetingDateTime);
            existingAgendaName = data.meeting.agendaFile || '';
            existingMinutesName = data.meeting.minutesFile || '';

            agendaFile = null; selectedAgendaFileName = ''; deleteExistingAgenda = false;
            minutesFile = null; selectedMinutesFileName = ''; deleteExistingMinutes = false;
        }
    });

    // Separately, repopulate the date field if a submission fails and comes
    // back with a value to fix.
    $effect(() => {
        if (form?.meetingDateTime) {
            meetingDateTime = form.meetingDateTime;
        }
    });

    function handleAgendaFileSelect(e) {
        const file = e.target.files?.[0];
        if (file) {
            agendaFile = file;
            selectedAgendaFileName = file.name;
            deleteExistingAgenda = false; // If a new file is selected, don't delete old one (it will be replaced)
        } else {
            agendaFile = null;
            selectedAgendaFileName = '';
        }
    }

    function handleMinutesFileSelect(e) {
        const file = e.target.files?.[0];
        if (file) {
            minutesFile = file;
            selectedMinutesFileName = file.name;
            deleteExistingMinutes = false; // If a new file is selected, don't delete old one
        } else {
            minutesFile = null;
            selectedMinutesFileName = '';
        }
    }
</script>

<div class="container mx-auto px-4 py-8 max-w-xl">
    <div class="mb-6 flex items-center justify-between">
        <h1 class="text-3xl font-bold text-base-content">Edit Board Meeting</h1>
         <a href="/admin/board/meetings" class="btn btn-ghost btn-sm">
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
                {#each Object.entries(form.fieldErrors) as [field, message]}
                    <li>{message}</li>
                {/each}
            </ul>
        </div>
    {/if}

    <form method="POST" action="?/updateBoardMeeting" use:enhance={() => {
        isSaving = true;
        return async ({ update }) => {
            await update({ reset: false });
            isSaving = false;
            // On successful update, the page will redirect.
            // If errors, form fields retain their values via the $effect above.
        };
    }} enctype="multipart/form-data" class="card bg-base-200 shadow-xl">
        <div class="card-body space-y-4">
            <div class="form-control">
                <label class="label" for="editMeetingDateTimeInput"><span class="label-text">Meeting Date & Time*</span></label>
                <input name="meetingDateTime" type="datetime-local" id="editMeetingDateTimeInput" class="input input-bordered w-full" bind:value={meetingDateTime} required />
            </div>

            <div class="form-control">
                <label class="label" for="editAgendaFileInput"><span class="label-text">Agenda Document</span></label>
                {#if existingAgendaName && !agendaFile}
                    <div class="text-sm mb-1 p-2 border border-base-300 rounded flex justify-between items-center">
                        <span>Current: {existingAgendaName}</span>
                        <label class="label cursor-pointer text-xs text-error hover:underline">
                            <input type="checkbox" name="deleteExistingAgenda" class="checkbox checkbox-error checkbox-xs mr-1" bind:checked={deleteExistingAgenda}/>
                            Delete
                        </label>
                    </div>
                {/if}
                <input name="agendaFile" type="file" id="editAgendaFileInput" class="file-input file-input-bordered file-input-sm w-full" onchange={handleAgendaFileSelect} accept=".pdf,.doc,.docx,.txt" />
                {#if selectedAgendaFileName}
                    <span class="label-text-alt text-xs mt-1">New: {selectedAgendaFileName} (will replace existing if saved)</span>
                {/if}
            </div>

            <div class="form-control">
                <label class="label" for="editMinutesFileInput"><span class="label-text">Minutes Document</span></label>
                 {#if existingMinutesName && !minutesFile}
                     <div class="text-sm mb-1 p-2 border border-base-300 rounded flex justify-between items-center">
                        <span>Current: {existingMinutesName}</span>
                        <label class="label cursor-pointer text-xs text-error hover:underline">
                            <input type="checkbox" name="deleteExistingMinutes" class="checkbox checkbox-error checkbox-xs mr-1" bind:checked={deleteExistingMinutes}/>
                            Delete
                        </label>
                    </div>
                {/if}
                <input name="minutesFile" type="file" id="editMinutesFileInput" class="file-input file-input-bordered file-input-sm w-full" onchange={handleMinutesFileSelect} accept=".pdf,.doc,.docx,.txt" />
                {#if selectedMinutesFileName}
                    <span class="label-text-alt text-xs mt-1">New: {selectedMinutesFileName} (will replace existing if saved)</span>
                {/if}
            </div>

            <div class="card-actions justify-end mt-6">
                <a href="/admin/board/meetings" class="btn btn-ghost" disabled={isSaving}>Cancel</a>
                <button type="submit" class="btn btn-primary flex items-center gap-1.5" disabled={isSaving}>
                    {#if isSaving} <span class="loading loading-spinner loading-xs"></span> {/if}
                    <Icon src={CheckCircle} class="h-5 w-5" />
                    Update Meeting
                </button>
            </div>
        </div>
    </form>
</div>