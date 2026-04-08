<script>
    import { enhance } from '$app/forms';
    import { Icon, CheckCircle, XCircle, ArrowUturnLeft } from 'svelte-hero-icons';
    import { format, parseISO } from 'date-fns'; // Replaced moment with date-fns

    // data.event comes from the load function in +page.server.js
    // form prop contains feedback from the server action
    let { data, form } = $props();
    // Initialize state with loaded event data or form data (if action failed)
    let eventName = $derived(form?.eventName || data.event?.name || '');
    let eventType = $derived(form?.eventType || data.event?.eventType || 'League');

    // Helper to format for datetime-local input
    function formatForInput(isoString) {
        if (!isoString) return '';
        // Use date-fns to parse the string and format it for the input
        const date = parseISO(isoString);
        return format(date, "yyyy-MM-dd'T'HH:mm");
    }

    let eventStartDateTime = $derived(form?.eventStartDateTime || formatForInput(data.event?.startDateTime));
    let eventEndDateTime = $derived(form?.eventEndDateTime || formatForInput(data.event?.endDateTime));
    let eventDescription = $derived(form?.eventDescription || data.event?.description || '');
    let eventPublished = $derived(form?.eventPublished === undefined ? (data.event?.published === undefined ? true : data.event.published) : form.eventPublished);
    let eventImageFile = $state(null);
    // Construct initial image preview URL
    let imagePreviewUrl = $derived(
        (data.event?.eventImage && data.event?.id && data.event?.collectionId) ?
        `https://pdg.pockethost.io/api/files/${data.event.collectionId}/${data.event.id}/${data.event.eventImage}?thumb=200x200` : ''
    );

    let isSaving = $state(false);
    function handleFileSelect(e) {
        const file = e.target.files?.[0];
        if (file) {
            eventImageFile = file;
            imagePreviewUrl = URL.createObjectURL(file);
        } else {
            eventImageFile = null;
            // If file cleared, revert to original or clear preview
            imagePreviewUrl = (data.event?.eventImage && data.event?.id && data.event?.collectionId) ?
            `https://pdg.pockethost.io/api/files/${data.event.collectionId}/${data.event.id}/${data.event.eventImage}?thumb=200x200` : '';
        }
    }

    // To display existing file name if no new one chosen for edit
    let existingFileName = $derived(data.event?.eventImage || '');

</script>

<div class="container mx-auto px-4 py-8 max-w-3xl">
    <div class="mb-6 flex items-center justify-between">
        <h1 class="text-3xl font-bold text-base-content">Edit Event: {data.event?.name || 'Loading...'}</h1>
         <a href="/admin#events" class="btn btn-ghost btn-sm">
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
                {#each Object.entries(form.fieldErrors) as [field, error]}
                    <li><strong>{field}:</strong> {error}</li>
                {/each}
            </ul>
        </div>
    {/if}

    <form method="POST" action="?/updateEvent" use:enhance={() => {
        isSaving = true;
        return async ({ update, result }) => {
            await update({ reset: false }); // Don't reset form fields on error so user can correct
            isSaving = false;
            if (result.type === 'redirect') {
                // Form will clear on redirect
            } else if (form?.fieldErrors || form?.error) {
                // Retain values for correction
            } else if (result.type === 'success') {
                // Values should be updated from new `data` prop if needed, or clear form if staying on page
                // However, action redirects on success
            }
        };
    }} enctype="multipart/form-data" class="card bg-base-200 shadow-xl">
        <div class="card-body space-y-4">
             <div class="grid grid-cols-1 gap-x-4 gap-y-4 md:grid-cols-2">
                <input type="hidden" name="eventId" value={data.event?.id} /> <div class="form-control">
                    <label class="label" for="editEventNameInput"><span class="label-text">Event Name*</span></label>
                    <input name="name" type="text" id="editEventNameInput" class="input input-bordered w-full" bind:value={eventName} required />
                </div>
                <div class="form-control">
                    <label class="label" for="editEventTypeSelect"><span class="label-text">Event Type</span></label>
                    <select name="eventType" id="editEventTypeSelect" class="select select-bordered w-full" bind:value={eventType}>
                        <option>Tournament</option><option>League</option><option>Series</option><option>Clinic</option><option>Work Party</option><option>Meeting</option><option>Other</option>
                    </select>
                </div>
                <div class="form-control">
                    <label class="label" for="editEventStartDateTimeInput"><span class="label-text">Start Date & Time*</span></label>
                    <input name="startDateTime" type="datetime-local" id="editEventStartDateTimeInput" class="input input-bordered w-full" bind:value={eventStartDateTime} required />
                </div>
                <div class="form-control">
                    <label class="label" for="editEventEndDateTimeInput"><span class="label-text">End Date & Time</span><span class="label-text-alt">(Optional)</span></label>
                    <input name="endDateTime" type="datetime-local" id="editEventEndDateTimeInput" class="input input-bordered w-full" bind:value={eventEndDateTime} />
                </div>
                <div class="form-control md:col-span-2">
                    <label class="label" for="editEventDescriptionTextarea"><span class="label-text">Description</span></label>
                    <textarea name="description" id="editEventDescriptionTextarea" class="textarea textarea-bordered h-24 w-full" bind:value={eventDescription}></textarea>
                </div>
                <div class="form-control items-start md:col-span-2">
                     <label class="label cursor-pointer gap-4 py-1">
                        <span class="label-text">Published</span>
                        <input type="hidden" name="published" value={eventPublished ? 'on' : 'off'} />
                        <input type="checkbox" id="editEventPublishedToggle" class="toggle toggle-primary" bind:checked={eventPublished} />
                    </label>
                </div>
                <div class="form-control md:col-span-2">
                    <label class="label" for="editEventImageInput"><span class="label-text">Event Image</span><span class="label-text-alt">(Optional - new image will replace old)</span></label>
                    {#if imagePreviewUrl}
                        <div class="mb-2"><img src={imagePreviewUrl} alt="preview" class="max-h-32 w-auto rounded border object-contain"/></div>
                    {:else if existingFileName}
                        <p class="text-xs mb-1">Current image: {existingFileName} (upload new to replace)</p>
                    {/if}
                    <input name="eventImage" type="file" id="editEventImageInput" class="file-input file-input-bordered file-input-sm w-full" onchange={handleFileSelect} accept="image/*" />
                    <p class="label">
                        <span class="label-text-alt">To remove image, upload nothing or use a 'remove image' feature (if implemented). Currently, not uploading a new image keeps the old one.</span>
                    </p>
                     <input type="hidden" name="deleteExistingImage" value="false" /> </div>
            </div>
            <div class="card-actions justify-end mt-6">
                <a href="/admin" class="btn btn-ghost" disabled={isSaving}>Cancel</a>
                <button type="submit" class="btn btn-primary flex items-center gap-1.5" disabled={isSaving}>
                    {#if isSaving} <span class="loading loading-spinner loading-xs"></span> {/if}
                    <Icon src={CheckCircle} class="h-5 w-5" />
                    Update Event
                </button>
            </div>
        </div>
    </form>
</div>
