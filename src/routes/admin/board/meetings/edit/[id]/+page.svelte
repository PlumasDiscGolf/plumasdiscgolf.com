<script>
    import { enhance } from '$app/forms';
    import { Icon, CheckCircle, XCircle, ArrowUturnLeft, ArrowDownTray, Trash } from 'svelte-hero-icons'; // Added Download
    import { formatPocketBaseDateToLocalInput } from '$lib/utils.js';

    let { data, form } = $props(); // data.meeting from load

    let meetingDateTime = $derived(form?.meetingDateTime || formatPocketBaseDateToLocalInput(data.meeting?.meetingDateTime));

    // State for new file uploads
    let agendaFile = $state(null);
    let minutesFile = $state(null);
    let selectedAgendaFileName = $state('');
    let selectedMinutesFileName = $state('');

    // State to track if existing files should be deleted
    let deleteExistingAgenda = $state(false);
    let deleteExistingMinutes = $state(false);

    // To display names/links of currently saved files
    let existingAgendaUrl = $state('');
    let existingMinutesUrl = $state('');
    let existingAgendaName = $derived(data.meeting?.agendaFile || ''); // Assuming 'agendaFile' is field name
    let existingMinutesName = $derived(data.meeting?.minutesFile || '');// Assuming 'minutesFile' is field name


    // This effect runs when `data.meeting` changes (e.g., on initial load)
    $effect(() => {
        if (data.meeting) {
            meetingDateTime = formatPocketBaseDateToLocalInput(data.meeting.meetingDateTime);
            // Assuming your PocketBase client (pb_client) is accessible for getFileUrl
            // or you construct URL manually if pb_client is not directly here.
            // For simplicity, we'll just use the filename for display.
            // To get full URL, you'd need pb_client.files.getUrl(data.meeting, data.meeting.agendaFile)
            existingAgendaName = data.meeting.agendaFile || '';
            existingMinutesName = data.meeting.minutesFile || '';

            // Clear file selections from previous interactions
            agendaFile = null; selectedAgendaFileName = ''; deleteExistingAgenda = false;
            minutesFile = null; selectedMinutesFileName = ''; deleteExistingMinutes = false;
        }
    });


    let isSaving = $state(false);

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
         <a href="/admin#boardMeetings" class="btn btn-ghost btn-sm">
            <Icon src={ArrowUturnLeft} class="h-5 w-5" />
            Back to Admin
        </a>
    </div>

    <!-- {#if form?.error} {/if}
    {#if form?.fieldErrors} {/if} -->

    <form method="POST" action="?/updateBoardMeeting" use:enhance={() => {
        isSaving = true;
        return async ({ update, result }) => {
            await update({ reset: false });
            isSaving = false;
            // On successful update, the page will redirect.
            // If errors, form fields will retain their values.
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
                <a href="/admin?tab=tab4" class="btn btn-ghost" disabled={isSaving}>Cancel</a>
                <button type="submit" class="btn btn-primary flex items-center gap-1.5" disabled={isSaving}>
                    {#if isSaving} <span class="loading loading-spinner loading-xs"></span> {/if}
                    <Icon src={CheckCircle} class="h-5 w-5" />
                    Update Meeting
                </button>
            </div>
        </div>
    </form>
</div>
