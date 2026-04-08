<script>
    import { enhance } from '$app/forms';
    import { Icon, CheckCircle, XCircle, ArrowUturnLeft } from 'svelte-hero-icons';

    let { form } = $props(); // For receiving errors/data from the server action

    let courseName = $derived(form?.courseName || '');
    let courseNumberOfHoles = $derived(form?.courseNumberOfHoles || 18);
    let coursePar = $derived(form?.coursePar || 54);
    let courseLengthInFeet = $derived(form?.courseLengthInFeet || 0);
    let courseLocation = $derived(form?.courseLocation || '');
    let courseDescription = $derived(form?.courseDescription || '');

    let isSaving = $state(false);
</script>

<div class="container mx-auto px-4 py-8 max-w-3xl">
    <div class="mb-6 flex items-center justify-between">
        <h1 class="text-3xl font-bold text-base-content">Add New Course</h1>
        <a href="/admin#courses" class="btn btn-ghost btn-sm"> <Icon src={ArrowUturnLeft} class="h-5 w-5" />
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
                {#each Object.entries(form.fieldErrors) as [field, errorMsg]}
                    <li><strong>{field.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}:</strong> {errorMsg}</li>
                {/each}
            </ul>
        </div>
    {/if}

    <form method="POST" action="?/createCourse" use:enhance={() => {
        isSaving = true;
        return async ({ update, result }) => {
            await update({ reset: (result.type === 'success' && !form?.error && !form?.fieldErrors) });
            isSaving = false;
            if (result.type === 'success' && !form?.error && !form?.fieldErrors) {
                // Form reset by SvelteKit or handled by redirect
                courseName = ''; courseNumberOfHoles = 18; coursePar = 54;
                courseLengthInFeet = 0; courseLocation = ''; courseDescription = '';
            }
        };
    }} class="card bg-base-200 shadow-xl">
        <div class="card-body space-y-4">
            <div class="form-control">
                <label class="label" for="courseNameInput"><span class="label-text">Course Name*</span></label>
                <input name="name" type="text" id="courseNameInput" placeholder="e.g., Pioneer Park DGC" class="input input-bordered w-full" bind:value={courseName} required />
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div class="form-control">
                    <label class="label" for="courseHolesInput"><span class="label-text">Number of Holes*</span></label>
                    <input name="numberOfHoles" type="number" id="courseHolesInput" placeholder="18" class="input input-bordered w-full" bind:value={courseNumberOfHoles} required />
                </div>
                <div class="form-control">
                    <label class="label" for="courseParInput"><span class="label-text">Course Par*</span></label>
                    <input name="par" type="number" id="courseParInput" placeholder="54" class="input input-bordered w-full" bind:value={coursePar} required />
                </div>
                <div class="form-control">
                    <label class="label" for="courseLengthInput"><span class="label-text">Length (ft)</span></label>
                    <input name="lengthInFeet" type="number" id="courseLengthInput" placeholder="e.g., 6200" class="input input-bordered w-full" bind:value={courseLengthInFeet} />
                </div>
            </div>

            <div class="form-control">
                <label class="label" for="courseLocationInput"><span class="label-text">Location/Town*</span></label>
                <input name="location" type="text" id="courseLocationInput" placeholder="e.g., Quincy, CA" class="input input-bordered w-full" bind:value={courseLocation} required />
            </div>

             <div class="form-control">
                <label class="label" for="courseDescriptionTextarea"><span class="label-text">Description</span></label>
                <textarea name="description" id="courseDescriptionTextarea" class="textarea textarea-bordered h-24 w-full" placeholder="Brief description of the course, access notes, etc." bind:value={courseDescription}></textarea>
            </div>

            <div class="card-actions justify-end mt-6">
                <a href="/admin?tab=tab2" class="btn btn-ghost" disabled={isSaving}>Cancel</a>
                <button type="submit" class="btn btn-primary flex items-center gap-1.5" disabled={isSaving}>
                    {#if isSaving} <span class="loading loading-spinner loading-xs"></span> {/if}
                    <Icon src={CheckCircle} class="h-5 w-5" />
                    Create Course
                </button>
            </div>
        </div>
    </form>
</div>
