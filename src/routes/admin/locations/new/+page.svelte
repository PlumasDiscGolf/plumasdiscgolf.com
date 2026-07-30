<!-- src/routes/admin/locations/new/+page.svelte -->
<script>
    import { enhance } from '$app/forms';
    import { Icon, CheckCircle, XCircle, ArrowUturnLeft } from 'svelte-hero-icons';

    let { data, form } = $props(); // data.courses from load

    // bind:value requires $state, not $derived.
    let name = $state('');
    let isCourse = $state(false);
    let course = $state('');
    let address = $state('');
    let city = $state('');
    let state = $state('');
    let zipCode = $state('');
    let latitude = $state('');
    let longitude = $state('');

    $effect(() => {
        if (form) {
            name = form.name ?? name;
            isCourse = form.isCourse ?? isCourse;
            course = form.course ?? course;
            address = form.address ?? address;
            city = form.city ?? city;
            state = form.state ?? state;
            zipCode = form.zipCode ?? zipCode;
            latitude = form.latitude ?? latitude;
            longitude = form.longitude ?? longitude;
        }
    });

    let isSaving = $state(false);
</script>

<div class="container mx-auto px-4 py-8 max-w-xl">
    <div class="mb-6 flex items-center justify-between">
        <h1 class="text-3xl font-bold text-base-content">Add Location</h1>
        <a href="/admin/locations" class="btn btn-ghost btn-sm">
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

    <form method="POST" action="?/createLocation" use:enhance={() => {
        isSaving = true;
        return async ({ update }) => {
            await update();
            isSaving = false;
        };
    }} class="card bg-base-200 shadow-xl">
        <div class="card-body space-y-4">
            <div class="form-control">
                <label class="label" for="nameInput"><span class="label-text">Name*</span></label>
                <input name="name" type="text" id="nameInput" placeholder="e.g., Pioneer Disc Golf Course" class="input input-bordered w-full" bind:value={name} required />
            </div>

            <div class="form-control">
                <label class="label cursor-pointer justify-start gap-4 py-1">
                    <input name="isCourse" type="checkbox" class="toggle toggle-primary" bind:checked={isCourse} />
                    <span class="label-text">This location is one of the club's courses</span>
                </label>
            </div>

            <div class="form-control">
                <label class="label" for="courseSelect"><span class="label-text">Linked Course</span></label>
                <select name="course" id="courseSelect" class="select select-bordered w-full" bind:value={course}>
                    <option value="">-- None --</option>
                    {#each data.courses as c (c.id)}
                        <option value={c.id}>{c.name}</option>
                    {/each}
                </select>
                <span class="label-text-alt mt-1 text-xs">Optional — link this location to one of the actual course records if it represents one.</span>
            </div>

            <div class="divider">Address (Optional)</div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="form-control">
                    <label class="label" for="addressInput"><span class="label-text">Street Address</span></label>
                    <input name="address" type="text" id="addressInput" class="input input-bordered w-full" bind:value={address} />
                </div>
                <div class="form-control">
                    <label class="label" for="cityInput"><span class="label-text">City</span></label>
                    <input name="city" type="text" id="cityInput" class="input input-bordered w-full" bind:value={city} />
                </div>
                <div class="form-control">
                    <label class="label" for="stateInput"><span class="label-text">State</span></label>
                    <input name="state" type="text" id="stateInput" class="input input-bordered w-full" bind:value={state} />
                </div>
                <div class="form-control">
                    <label class="label" for="zipCodeInput"><span class="label-text">Zip Code</span></label>
                    <input name="zipCode" type="text" id="zipCodeInput" class="input input-bordered w-full" bind:value={zipCode} />
                </div>
                <div class="form-control">
                    <label class="label" for="latitudeInput"><span class="label-text">Latitude</span></label>
                    <input name="latitude" type="number" step="any" id="latitudeInput" class="input input-bordered w-full" bind:value={latitude} />
                </div>
                <div class="form-control">
                    <label class="label" for="longitudeInput"><span class="label-text">Longitude</span></label>
                    <input name="longitude" type="number" step="any" id="longitudeInput" class="input input-bordered w-full" bind:value={longitude} />
                </div>
            </div>

            <div class="card-actions justify-end mt-6">
                <a href="/admin/locations" class="btn btn-ghost" disabled={isSaving}>Cancel</a>
                <button type="submit" class="btn btn-primary flex items-center gap-1.5" disabled={isSaving}>
                    {#if isSaving} <span class="loading loading-spinner loading-xs"></span> {/if}
                    <Icon src={CheckCircle} class="h-5 w-5" />
                    Create Location
                </button>
            </div>
        </div>
    </form>
</div>