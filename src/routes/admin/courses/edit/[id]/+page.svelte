<!-- src/routes/admin/courses/edit/[id]/+page.svelte -->
<script>
    import { enhance } from '$app/forms';
    import { Icon, CheckCircle, XCircle, ArrowUturnLeft } from 'svelte-hero-icons';
    import { env } from '$env/dynamic/public';

    let { data, form } = $props(); // data.course from load

    const TAG_OPTIONS = [
        'Heavily Wooded',
        'Moderately Wooded',
        'Lightly Wooded',
        'Open',
        'Very Hilly',
        'Moderately Hilly',
        'Slightly Hilly',
        'Flat',
        'Water Hazards'
    ];
    const MAX_TAGS = 3;

    // bind:value requires $state, not $derived. Initialize once from
    // data.course, then sync from `form` via $effect whenever a submission
    // fails and comes back with values to repopulate.
    let name = $state(data.course?.name || '');
    let description = $state(data.course?.description || '');
    let location = $state(data.course?.location || '');
    let numberOfHoles = $state(data.course?.numberOfHoles != null ? String(data.course.numberOfHoles) : '');
    let par = $state(data.course?.par != null ? String(data.course.par) : '');
    let lengthInFeet = $state(data.course?.lengthInFeet != null ? String(data.course.lengthInFeet) : '');
    let selectedTags = $state(data.course?.tags || []);

    let imageFile = $state(null);
    let selectedImageFileName = $state('');
    let deleteExistingImage = $state(false);

    $effect(() => {
        if (form) {
            name = form.name ?? name;
            description = form.description ?? description;
            location = form.location ?? location;
            numberOfHoles = form.numberOfHoles ?? numberOfHoles;
            par = form.par ?? par;
            lengthInFeet = form.lengthInFeet ?? lengthInFeet;
            selectedTags = form.tags ?? selectedTags;
        }
    });

    function toggleTag(tag) {
        if (selectedTags.includes(tag)) {
            selectedTags = selectedTags.filter((t) => t !== tag);
        } else if (selectedTags.length < MAX_TAGS) {
            selectedTags = [...selectedTags, tag];
        }
    }

    function handleImageSelect(e) {
        const file = e.target.files?.[0];
        if (file) {
            imageFile = file;
            selectedImageFileName = file.name;
            deleteExistingImage = false;
        } else {
            imageFile = null;
            selectedImageFileName = '';
        }
    }

    let isSaving = $state(false);
</script>

<div class="container mx-auto px-4 py-8 max-w-3xl">
    <div class="mb-6 flex items-center justify-between">
        <h1 class="text-3xl font-bold text-base-content">Edit Course: {data.course?.name || 'Loading...'}</h1>
        <a href="/admin/courses" class="btn btn-ghost btn-sm">
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
        action="?/updateCourse"
        use:enhance={() => {
            isSaving = true;
            return async ({ update }) => {
                await update({ reset: false });
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
                    <label class="label" for="locationInput"><span class="label-text">Location</span></label>
                    <input name="location" type="text" id="locationInput" class="input input-bordered w-full" bind:value={location} />
                </div>
            </div>

            <div class="form-control">
                <label class="label" for="descriptionTextarea"><span class="label-text">Description</span></label>
                <textarea name="description" id="descriptionTextarea" class="textarea textarea-bordered h-28 w-full" bind:value={description}></textarea>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div class="form-control">
                    <label class="label" for="numberOfHolesInput"><span class="label-text">Number of Holes*</span></label>
                    <input name="numberOfHoles" type="number" min="1" step="1" id="numberOfHolesInput" class="input input-bordered w-full" bind:value={numberOfHoles} required />
                </div>
                <div class="form-control">
                    <label class="label" for="parInput"><span class="label-text">Par*</span></label>
                    <input name="par" type="number" min="1" step="1" id="parInput" class="input input-bordered w-full" bind:value={par} required />
                </div>
                <div class="form-control">
                    <label class="label" for="lengthInFeetInput"><span class="label-text">Length (feet)</span></label>
                    <input name="lengthInFeet" type="number" min="0" step="1" id="lengthInFeetInput" class="input input-bordered w-full" bind:value={lengthInFeet} />
                </div>
            </div>

            <div class="form-control">
                <span class="label-text">Tags <span class="text-xs opacity-70">(up to {MAX_TAGS})</span></span>
                <div class="flex flex-wrap gap-3 mt-1">
                    {#each TAG_OPTIONS as tag}
                        <label class="label cursor-pointer gap-2 py-1">
                            <input
                                type="checkbox"
                                name="tags"
                                value={tag}
                                class="checkbox checkbox-sm"
                                checked={selectedTags.includes(tag)}
                                disabled={!selectedTags.includes(tag) && selectedTags.length >= MAX_TAGS}
                                onchange={() => toggleTag(tag)}
                            />
                            <span class="label-text text-sm">{tag}</span>
                        </label>
                    {/each}
                </div>
            </div>

            <div class="form-control">
                <label class="label" for="imageInput"><span class="label-text">Course Image</span></label>
                {#if data.course?.image && !deleteExistingImage}
                    <div class="mb-2 flex items-center gap-3">
                        <img
                            src="{env.PUBLIC_POCKETBASE_FILES_URL}/api/files/{data.course.collectionId}/{data.course.id}/{data.course.image}?thumb=100x100"
                            alt="Current course"
                            class="h-16 w-16 rounded object-cover"
                        />
                        <div class="flex flex-col gap-1">
                            <span class="text-sm text-base-content/70">Current image — upload a new one to replace it</span>
                            <label class="flex cursor-pointer items-center gap-2 text-sm text-error">
                                <input type="checkbox" class="checkbox checkbox-error checkbox-sm" bind:checked={deleteExistingImage} />
                                Remove current image
                            </label>
                        </div>
                    </div>
                {/if}
                {#if deleteExistingImage}
                    <div class="alert alert-warning mb-2 py-2 text-sm">Current image will be removed on save.</div>
                {/if}
                <input type="hidden" name="deleteExistingImage" value={deleteExistingImage} />
                <input
                    name="image"
                    type="file"
                    id="imageInput"
                    class="file-input file-input-bordered file-input-sm w-full"
                    onchange={handleImageSelect}
                    accept="image/*"
                    disabled={deleteExistingImage}
                />
                {#if selectedImageFileName}
                    <span class="label-text-alt mt-1 text-xs">Selected: {selectedImageFileName}</span>
                {/if}
            </div>

            <div class="card-actions justify-end mt-6">
                <a href="/admin/courses" class="btn btn-ghost" disabled={isSaving}>Cancel</a>
                <button type="submit" class="btn btn-primary flex items-center gap-1.5" disabled={isSaving}>
                    {#if isSaving} <span class="loading loading-spinner loading-xs"></span> {/if}
                    <Icon src={CheckCircle} class="h-5 w-5" />
                    Update Course
                </button>
            </div>
        </div>
    </form>
</div>