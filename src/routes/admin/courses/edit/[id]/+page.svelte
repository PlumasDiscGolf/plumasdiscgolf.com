<script>
    import { enhance } from '$app/forms';
    import { Icon, CheckCircle, XCircle, ArrowUturnLeft } from 'svelte-hero-icons';

    let { data, form } = $props(); // data.course from load, form from action

    let courseName = $derived(form?.courseName || data.course?.name || '');
    let courseNumberOfHoles = $derived(form?.courseNumberOfHoles === undefined ? (data.course?.numberOfHoles === undefined ? 18 : data.course.numberOfHoles) : form.courseNumberOfHoles);
    let coursePar = $derived(form?.coursePar === undefined ? (data.course?.par === undefined ? 54 : data.course.par) : form.coursePar);
    let courseLengthInFeet = $derived(form?.courseLengthInFeet === undefined ? (data.course?.lengthInFeet === undefined ? 0 : data.course.lengthInFeet) : form.courseLengthInFeet);
    let courseLocation = $derived(form?.courseLocation || data.course?.location || '');
    let courseDescription = $derived(form?.courseDescription || data.course?.description || '');

    let isSaving = $state(false);
</script>

<div class="container mx-auto px-4 py-8 max-w-3xl">
    <div class="mb-6 flex items-center justify-between">
        <h1 class="text-3xl font-bold text-base-content">Edit Course: {data.course?.name || 'Loading...'}</h1>
         <a href="/admin#courses" class="btn btn-ghost btn-sm">
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

    <form method="POST" action="?/updateCourse" use:enhance={() => {
        isSaving = true;
        return async ({ update, result }) => {
            await update({ reset: false }); // Don't reset on error, SvelteKit handles redirect on success
            isSaving = false;
        };
    }} class="card bg-base-200 shadow-xl">
        <div class="card-body space-y-4">
            <div class="form-control">
                <label class="label" for="editCourseNameInput"><span class="label-text">Course Name*</span></label>
                <input name="name" type="text" id="editCourseNameInput" class="input input-bordered w-full" bind:value={courseName} required />
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div class="form-control">
                    <label class="label" for="editCourseHolesInput"><span class="label-text">Number of Holes*</span></label>
                    <input name="numberOfHoles" type="number" id="editCourseHolesInput" class="input input-bordered w-full" bind:value={courseNumberOfHoles} required />
                </div>
                <div class="form-control">
                    <label class="label" for="editCourseParInput"><span class="label-text">Course Par*</span></label>
                    <input name="par" type="number" id="editCourseParInput" class="input input-bordered w-full" bind:value={coursePar} required />
                </div>
                <div class="form-control">
                    <label class="label" for="editCourseLengthInput"><span class="label-text">Length (ft)</span></label>
                    <input name="lengthInFeet" type="number" id="editCourseLengthInput" class="input input-bordered w-full" bind:value={courseLengthInFeet} />
                </div>
            </div>

            <div class="form-control">
                <label class="label" for="editCourseLocationInput"><span class="label-text">Location/Town*</span></label>
                <input name="location" type="text" id="editCourseLocationInput" class="input input-bordered w-full" bind:value={courseLocation} required />
            </div>

             <div class="form-control">
                <label class="label" for="editCourseDescriptionTextarea"><span class="label-text">Description</span></label>
                <textarea name="description" id="editCourseDescriptionTextarea" class="textarea textarea-bordered h-24 w-full" bind:value={courseDescription}></textarea>
            </div>

            <div class="card-actions justify-end mt-6">
                <a href="/admin?tab=tab2" class="btn btn-ghost" disabled={isSaving}>Cancel</a>
                <button type="submit" class="btn btn-primary flex items-center gap-1.5" disabled={isSaving}>
                    {#if isSaving} <span class="loading loading-spinner loading-xs"></span> {/if}
                    <Icon src={CheckCircle} class="h-5 w-5" />
                    Update Course
                </button>
            </div>
        </div>
    </form>
</div>
