<script>
    import { enhance } from '$app/forms';
    import { Icon, CheckCircle, XCircle, ArrowUturnLeft } from 'svelte-hero-icons';
    import moment from 'moment';

    let { form } = $props();

    let meetingDateTime = $derived(form?.meetingDateTime || moment().format('YYYY-MM-DDTHH:mm'));

    let agendaFile = $state(null); // For <input type="file">
    let minutesFile = $state(null); // For <input type="file">
    let selectedAgendaFileName = $state('');
    let selectedMinutesFileName = $state('');

    let isSaving = $state(false);

    function handleAgendaFileSelect(e) {
        const file = e.target.files?.[0];
        if (file) {
            agendaFile = file;
            selectedAgendaFileName = file.name;
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
        } else {
            minutesFile = null;
            selectedMinutesFileName = '';
        }
    }
</script>

<div class="container mx-auto px-4 py-8 max-w-xl">
    <div class="mb-6 flex items-center justify-between">
        <h1 class="text-3xl font-bold text-base-content">Add New Board Meeting</h1>
        <a href="/admin#boardMeetings" class="btn btn-ghost btn-sm">
            <Icon src={ArrowUturnLeft} class="h-5 w-5" />
            Back to Admin
        </a>
    </div>

    {#if form?.error}
        <div class="alert alert-error mb-4 shadow-md">
            <Icon src={XCircle} class="h-5 w-5 shrink-0" />
            <span>{form.error}</span>
        </div>
    {/if}
    {#if form?.fieldErrors}
        <div class="alert alert-warning mb-4 shadow-md">
            <Icon src={XCircle} class="h-5 w-5 shrink-0" />
            <ul class="list-disc list-inside">
                {#each Object.entries(form.fieldErrors) as [field, message]}
                    <li>{message}</li>
                {/each}
            </ul>
        </div>
    {/if}

    <form method="POST" action="?/createBoardMeeting" use:enhance={() => {
        isSaving = true;
        return async ({ update, result }) => {
            await update({ reset: (result.type === 'success' && !form?.error && !form?.fieldErrors) });
            isSaving = false;
            if (result.type === 'success' && !form?.error && !form?.fieldErrors) {
                meetingDateTime = moment().format('YYYY-MM-DDTHH:mm');
                // agendaLink = ''; minutesLink = ''; // If keeping links
                agendaFile = null; selectedAgendaFileName = '';
                minutesFile = null; selectedMinutesFileName = '';
            }
        };
    }} enctype="multipart/form-data" class="card bg-base-200 shadow-xl">
        <div class="card-body space-y-4">
            <div class="form-control">
                <label class="label" for="meetingDateTimeInput"><span class="label-text">Meeting Date & Time*</span></label>
                <input name="meetingDateTime" type="datetime-local" id="meetingDateTimeInput" class="input input-bordered w-full" bind:value={meetingDateTime} required />
            </div>

            <div class="form-control">
                <label class="label" for="agendaFileInput">
                    <span class="label-text">Agenda Document</span>
                    <span class="label-text-alt">(Optional)</span>
                </label>
                <input name="agendaFile" type="file" id="agendaFileInput" class="file-input file-input-bordered file-input-sm w-full" onchange={handleAgendaFileSelect} accept=".pdf,.doc,.docx,.txt" />
                {#if selectedAgendaFileName}
                    <span class="label-text-alt text-xs mt-1">Selected: {selectedAgendaFileName}</span>
                {/if}
            </div>

            <div class="form-control">
                <label class="label" for="minutesFileInput">
                    <span class="label-text">Minutes Document</span>
                    <span class="label-text-alt">(Optional)</span>
                </label>
                <input name="minutesFile" type="file" id="minutesFileInput" class="file-input file-input-bordered file-input-sm w-full" onchange={handleMinutesFileSelect} accept=".pdf,.doc,.docx,.txt" />
                 {#if selectedMinutesFileName}
                    <span class="label-text-alt text-xs mt-1">Selected: {selectedMinutesFileName}</span>
                {/if}
            </div>

            <div class="card-actions justify-end mt-6">
                <a href="/admin?tab=tab4" class="btn btn-ghost" disabled={isSaving}>Cancel</a>
                <button type="submit" class="btn btn-primary flex items-center gap-1.5" disabled={isSaving}>
                    {#if isSaving} <span class="loading loading-spinner loading-xs"></span> {/if}
                    <Icon src={CheckCircle} class="h-5 w-5" />
                    Create Meeting
                </button>
            </div>
        </div>
    </form>
</div>
