<script>
    import { enhance } from '$app/forms';
    import { Icon, CheckCircle, XCircle, ArrowUturnLeft } from 'svelte-hero-icons';

    let { data, form } = $props(); // data.locations from load

    const EVENT_TYPE_OPTIONS = ['League', 'Tournament', 'Series', 'Outreach', 'Clinic', 'Maintenance'];

    // bind:value requires $state, not $derived.
    let name = $state('');
    let description = $state('');
    let startDateTime = $state('');
    let endDateTime = $state('');
    let checkInTime = $state('');
    let selectedLocation = $state('');
    let eventType = $state('');
    let registrationURL = $state('');
    let pdgaURL = $state('');
    let discGolfSceneURL = $state('');
    let eventInfoURL = $state('');
    let resultsURL = $state('');
    let registrationRequired = $state(false);
    let registrationDeadline = $state('');
    let cost = $state('');
    let onlineRegistration = $state(false);
    let onsiteRegistration = $state(false);
    let lateRegistration = $state(false);
    let lateFee = $state('');

    let eventImageFile = $state(null);
    let selectedEventImageName = $state('');
    let bannerImageFile = $state(null);
    let selectedBannerImageName = $state('');

    $effect(() => {
        if (form) {
            name = form.name ?? name;
            description = form.description ?? description;
            startDateTime = form.startDateTime ?? startDateTime;
            endDateTime = form.endDateTime ?? endDateTime;
            checkInTime = form.checkInTime ?? checkInTime;
            selectedLocation = form.location ?? selectedLocation;
            eventType = form.eventType ?? eventType;
            registrationURL = form.registrationURL ?? registrationURL;
            pdgaURL = form.pdgaURL ?? pdgaURL;
            discGolfSceneURL = form.discGolfSceneURL ?? discGolfSceneURL;
            eventInfoURL = form.eventInfoURL ?? eventInfoURL;
            resultsURL = form.resultsURL ?? resultsURL;
            registrationRequired = form.registrationRequired ?? registrationRequired;
            registrationDeadline = form.registrationDeadline ?? registrationDeadline;
            cost = form.cost ?? cost;
            onlineRegistration = form.onlineRegistration ?? onlineRegistration;
            onsiteRegistration = form.onsiteRegistration ?? onsiteRegistration;
            lateRegistration = form.lateRegistration ?? lateRegistration;
            lateFee = form.lateFee ?? lateFee;
        }
    });

    function handleEventImageSelect(e) {
        const file = e.target.files?.[0];
        eventImageFile = file || null;
        selectedEventImageName = file?.name || '';
    }

    function handleBannerImageSelect(e) {
        const file = e.target.files?.[0];
        bannerImageFile = file || null;
        selectedBannerImageName = file?.name || '';
    }

    let isSaving = $state(false);
</script>

<div class="container mx-auto px-4 py-8 max-w-3xl">
    <div class="mb-6 flex items-center justify-between">
        <h1 class="text-3xl font-bold text-base-content">Add New Event</h1>
        <a href="/admin/events" class="btn btn-ghost btn-sm">
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

    <form
        method="POST"
        action="?/createEvent"
        use:enhance={() => {
            isSaving = true;
            return async ({ update }) => {
                await update();
                isSaving = false;
            };
        }}
        enctype="multipart/form-data"
        class="card bg-base-200 shadow-xl"
    >
        <div class="card-body space-y-4">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="form-control">
                    <label class="label" for="nameInput"><span class="label-text">Name*</span></label>
                    <input name="name" type="text" id="nameInput" class="input input-bordered w-full" bind:value={name} required />
                </div>
                <div class="form-control">
                    <label class="label" for="eventTypeSelect"><span class="label-text">Event Type</span></label>
                    <select name="eventType" id="eventTypeSelect" class="select select-bordered w-full" bind:value={eventType}>
                        <option value="">Select a type...</option>
                        {#each EVENT_TYPE_OPTIONS as opt}
                            <option value={opt}>{opt}</option>
                        {/each}
                    </select>
                </div>
            </div>

            <div class="form-control">
                <label class="label" for="descriptionTextarea"><span class="label-text">Description</span></label>
                <textarea name="description" id="descriptionTextarea" class="textarea textarea-bordered h-28 w-full" bind:value={description}></textarea>
            </div>

            <div class="divider">Dates</div>

            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div class="form-control">
                    <label class="label" for="startDateTimeInput"><span class="label-text">Start</span></label>
                    <input name="startDateTime" type="datetime-local" id="startDateTimeInput" class="input input-bordered w-full" bind:value={startDateTime} />
                </div>
                <div class="form-control">
                    <label class="label" for="endDateTimeInput"><span class="label-text">End</span></label>
                    <input name="endDateTime" type="datetime-local" id="endDateTimeInput" class="input input-bordered w-full" bind:value={endDateTime} />
                </div>
                <div class="form-control">
                    <label class="label" for="checkInTimeInput"><span class="label-text">Check-In Time</span></label>
                    <input name="checkInTime" type="datetime-local" id="checkInTimeInput" class="input input-bordered w-full" bind:value={checkInTime} />
                </div>
            </div>

            <div class="divider">Location</div>

            <div class="form-control">
                <label class="label" for="locationSelect"><span class="label-text">Location</span></label>
                <select name="location" id="locationSelect" class="select select-bordered w-full" bind:value={selectedLocation}>
                    <option value="">-- No Location --</option>
                    {#each data.locations as loc (loc.id)}
                        <option value={loc.id}>{loc.name}</option>
                    {/each}
                </select>
            </div>

            <div class="divider">Registration</div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="form-control">
                    <label class="label" for="registrationURLInput"><span class="label-text">Registration URL</span></label>
                    <input name="registrationURL" type="url" id="registrationURLInput" class="input input-bordered w-full" bind:value={registrationURL} />
                </div>
                <div class="form-control">
                    <label class="label" for="registrationDeadlineInput"><span class="label-text">Registration Deadline</span></label>
                    <input name="registrationDeadline" type="datetime-local" id="registrationDeadlineInput" class="input input-bordered w-full" bind:value={registrationDeadline} />
                </div>
                <div class="form-control">
                    <label class="label" for="costInput"><span class="label-text">Cost</span></label>
                    <input name="cost" type="text" id="costInput" placeholder="e.g., $10 members / $15 non-members" class="input input-bordered w-full" bind:value={cost} />
                </div>
                <div class="form-control">
                    <label class="label" for="lateFeeInput"><span class="label-text">Late Fee</span></label>
                    <input name="lateFee" type="text" id="lateFeeInput" class="input input-bordered w-full" bind:value={lateFee} />
                </div>
            </div>

            <div class="flex flex-wrap gap-6">
                <label class="label cursor-pointer gap-2">
                    <input name="registrationRequired" type="checkbox" class="checkbox" bind:checked={registrationRequired} />
                    <span class="label-text">Registration Required</span>
                </label>
                <label class="label cursor-pointer gap-2">
                    <input name="onlineRegistration" type="checkbox" class="checkbox" bind:checked={onlineRegistration} />
                    <span class="label-text">Online Registration</span>
                </label>
                <label class="label cursor-pointer gap-2">
                    <input name="onsiteRegistration" type="checkbox" class="checkbox" bind:checked={onsiteRegistration} />
                    <span class="label-text">Onsite Registration</span>
                </label>
                <label class="label cursor-pointer gap-2">
                    <input name="lateRegistration" type="checkbox" class="checkbox" bind:checked={lateRegistration} />
                    <span class="label-text">Late Registration</span>
                </label>
            </div>

            <div class="divider">Links</div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="form-control">
                    <label class="label" for="pdgaURLInput"><span class="label-text">PDGA URL</span></label>
                    <input name="pdgaURL" type="url" id="pdgaURLInput" class="input input-bordered w-full" bind:value={pdgaURL} />
                </div>
                <div class="form-control">
                    <label class="label" for="discGolfSceneURLInput"><span class="label-text">DiscGolfScene URL</span></label>
                    <input name="discGolfSceneURL" type="url" id="discGolfSceneURLInput" class="input input-bordered w-full" bind:value={discGolfSceneURL} />
                </div>
                <div class="form-control">
                    <label class="label" for="eventInfoURLInput"><span class="label-text">Event Info URL</span></label>
                    <input name="eventInfoURL" type="url" id="eventInfoURLInput" class="input input-bordered w-full" bind:value={eventInfoURL} />
                </div>
                <div class="form-control">
                    <label class="label" for="resultsURLInput"><span class="label-text">Results URL</span></label>
                    <input name="resultsURL" type="url" id="resultsURLInput" class="input input-bordered w-full" bind:value={resultsURL} />
                </div>
            </div>

            <div class="divider">Images</div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="form-control">
                    <label class="label" for="eventImageInput">
                        <span class="label-text">Event Image</span>
                        <span class="label-text-alt">(Optional)</span>
                    </label>
                    <input name="eventImage" type="file" id="eventImageInput" class="file-input file-input-bordered file-input-sm w-full" onchange={handleEventImageSelect} accept="image/*" />
                    {#if selectedEventImageName}<span class="label-text-alt mt-1 text-xs">Selected: {selectedEventImageName}</span>{/if}
                </div>
                <div class="form-control">
                    <label class="label" for="bannerImageInput">
                        <span class="label-text">Banner Image</span>
                        <span class="label-text-alt">(Optional)</span>
                    </label>
                    <input name="bannerImage" type="file" id="bannerImageInput" class="file-input file-input-bordered file-input-sm w-full" onchange={handleBannerImageSelect} accept="image/*" />
                    {#if selectedBannerImageName}<span class="label-text-alt mt-1 text-xs">Selected: {selectedBannerImageName}</span>{/if}
                </div>
            </div>

            <div class="card-actions justify-end mt-6">
                <a href="/admin/events" class="btn btn-ghost" disabled={isSaving}>Cancel</a>
                <button type="submit" class="btn btn-primary flex items-center gap-1.5" disabled={isSaving}>
                    {#if isSaving} <span class="loading loading-spinner loading-xs"></span> {/if}
                    <Icon src={CheckCircle} class="h-5 w-5" />
                    Create Event
                </button>
            </div>
        </div>
    </form>
</div>