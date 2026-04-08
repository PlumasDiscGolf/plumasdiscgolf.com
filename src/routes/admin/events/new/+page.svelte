<script>
    import { enhance } from '$app/forms';
    import { Icon, CheckCircle, XCircle, ArrowUturnLeft } from 'svelte-hero-icons';
    import { format } from 'date-fns'; // Use date-fns

    let { form } = $props();
    let eventName = $derived(form?.eventName || '');
    let eventType = $derived(form?.eventType || 'League');
    // Default to today's date and time using date-fns
    let eventStartDateTime = $derived(form?.eventStartDateTime || format(new Date(), "yyyy-MM-dd'T'HH:mm"));
    let eventEndDateTime = $derived(form?.eventEndDateTime || '');
    let eventDescription = $derived(form?.eventDescription || '');
    let eventPublished = $derived(form?.eventPublished === undefined ? true : form.eventPublished);
    let eventImageFile = $state(null);
    let imagePreviewUrl = $state('');

    let isSaving = $state(false);
    function handleFileSelect(e) {
        const file = e.target.files?.[0];
        if (file) {
            eventImageFile = file;
            imagePreviewUrl = URL.createObjectURL(file);
        } else {
            eventImageFile = null;
            imagePreviewUrl = '';
        }
    }
</script>

<div class="container mx-auto px-4 py-8 max-w-3xl">
    <div class="mb-6 flex items-center justify-between">
        <h1 class="text-3xl font-bold text-base-content">Add New Event</h1>
        <a href="/admin#events" class="btn btn-ghost btn-sm">
            <Icon src={ArrowUturnLeft} class="h-5 w-5" />
            Back to Admin
        </a>
    </div>

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
                {#each Object.entries(form.fieldErrors) as [field, error]}
                    <li><strong>{field}:</strong> {error}</li>
                {/each}
            </ul>
        </div>
    {/if}


    <form method="POST" action="?/createEvent" use:enhance={() => {
        isSaving = true;
        return async ({ update, result }) => {
            await update({ reset: (result.type === 'success') }); // Reset form only on success
            isSaving = false;
            if (result.type === 'success' && !form?.error && !form?.fieldErrors) { // SvelteKit redirects on success by default if action does
                // Usually, redirect is handled by server action.
                // If action doesn't redirect, but you want to clear form:
                eventName = ''; eventType = 'League'; eventStartDateTime = moment().format('YYYY-MM-DDTHH:mm');
                eventEndDateTime = ''; eventDescription = ''; eventPublished = true;
                eventImageFile = null; imagePreviewUrl = '';
            } else if (result.type === 'failure' || form?.error || form?.fieldErrors) {
                // Retain values for correction, password-like fields might be cleared if desired
            }
        };
    }} enctype="multipart/form-data" class="card bg-base-200 shadow-xl">
        <div class="card-body space-y-4">
            <div class="grid grid-cols-1 gap-x-4 gap-y-4 md:grid-cols-2">
                <div class="form-control">
                    <label class="label" for="eventNameInput"><span class="label-text">Event Name*</span></label>
                    <input name="name" type="text" id="eventNameInput" placeholder="e.g., Summer Flex Start" class="input input-bordered w-full" bind:value={eventName} required />
                </div>
                <div class="form-control">
                    <label class="label" for="eventTypeSelect"><span class="label-text">Event Type</span></label>
                    <select name="eventType" id="eventTypeSelect" class="select select-bordered w-full" bind:value={eventType}>
                        <option>Tournament</option><option>League</option><option>Clinic</option><option>Work Party</option><option>Meeting</option><option>Other</option>
                    </select>
                </div>
                <div class="form-control">
                    <label class="label" for="eventStartDateTimeInput"><span class="label-text">Start Date & Time*</span></label>
                    <input name="startDateTime" type="datetime-local" id="eventStartDateTimeInput" class="input input-bordered w-full" bind:value={eventStartDateTime} required />
                </div>
                <div class="form-control">
                    <label class="label" for="eventEndDateTimeInput"><span class="label-text">End Date & Time</span><span class="label-text-alt">(Optional)</span></label>
                    <input name="endDateTime" type="datetime-local" id="eventEndDateTimeInput" class="input input-bordered w-full" bind:value={eventEndDateTime} />
                </div>
                <div class="form-control md:col-span-2">
                    <label class="label" for="eventDescriptionTextarea"><span class="label-text">Description</span></label>
                    <textarea name="description" id="eventDescriptionTextarea" class="textarea textarea-bordered h-24 w-full" placeholder="Event details..." bind:value={eventDescription}></textarea>
                </div>
                <div class="form-control items-start md:col-span-2">
                     <label class="label cursor-pointer gap-4 py-1">
                        <span class="label-text">Published</span>
                        <input name="published" type="checkbox" id="eventPublishedToggle" class="toggle toggle-primary" bind:checked={eventPublished} />
                    </label>
                </div>
                <div class="form-control md:col-span-2">
                    <label class="label" for="eventImageInput"><span class="label-text">Event Image</span><span class="label-text-alt">(Optional)</span></label>
                    {#if imagePreviewUrl}
                        <div class="mb-2"><img src={imagePreviewUrl} alt="preview" class="max-h-32 w-auto rounded border object-contain"/></div>
                    {/if}
                    <input name="eventImage" type="file" id="eventImageInput" class="file-input file-input-bordered file-input-sm w-full" onchange={handleFileSelect} accept="image/*" />
                </div>
            </div>
            <div class="card-actions justify-end mt-6">
                <a href="/admin" class="btn btn-ghost" disabled={isSaving}>Cancel</a>
                <button type="submit" class="btn btn-primary flex items-center gap-1.5" disabled={isSaving}>
                    {#if isSaving} <span class="loading loading-spinner loading-xs"></span> {/if}
                    <Icon src={CheckCircle} class="h-5 w-5" />
                    Create Event
                </button>
            </div>
        </div>
    </form>
</div>
