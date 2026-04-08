<script>
    import { enhance } from '$app/forms';
    import { Icon, CheckCircle, XCircle, ArrowUturnLeft } from 'svelte-hero-icons';
    import { format } from 'date-fns';

    let { form } = $props();

    let name = $derived(form?.name || '');
    let task = $derived(form?.task || '');
    let volunteerDate = $derived(form?.volunteerDate || format(new Date(), 'yyyy-MM-dd'));

    let isSaving = $state(false);
</script>

<div class="container mx-auto px-4 py-8 max-w-3xl">
    <div class="mb-6 flex items-center justify-between">
        <h1 class="text-3xl font-bold text-base-content">Add Volunteer Record</h1>
        <a href="/admin#volunteers" class="btn btn-ghost btn-sm">
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
                {#each Object.entries(form.fieldErrors) as [field, errorMsg]}
                    <li><strong>{field.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}:</strong> {errorMsg}</li>
                {/each}
            </ul>
        </div>
    {/if}

    <form method="POST" action="?/createVolunteer" use:enhance={() => {
        isSaving = true;
        return async ({ update, result }) => {
            await update({ reset: (result.type === 'success') });
            isSaving = false;
            if (result.type === 'success' && !form?.error) {
                name = '';
                task = '';
                volunteerDate = format(new Date(), 'yyyy-MM-dd');
            }
        };
    }} class="card bg-base-200 shadow-xl">
        <div class="card-body space-y-4">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="form-control">
                    <label class="label" for="nameInput"><span class="label-text">Volunteer Name*</span></label>
                    <input name="name" type="text" id="nameInput" placeholder="e.g., John Appleseed" class="input input-bordered w-full" bind:value={name} required />
                </div>
                 <div class="form-control">
                    <label class="label" for="volunteerDateInput"><span class="label-text">Date*</span></label>
                    <input name="volunteerDate" type="date" id="volunteerDateInput" class="input input-bordered w-full" bind:value={volunteerDate} required />
                </div>
            </div>

            <div class="form-control">
                <label class="label" for="taskTextarea"><span class="label-text">Event / Task</span></label>
                <textarea name="task" id="taskTextarea" class="textarea textarea-bordered h-24 w-full" placeholder="e.g., Course cleanup day, Trilogy Challenge setup" bind:value={task}></textarea>
                 <span class="label-text-alt text-xs mt-1">Describe the event or task the volunteer helped with.</span>
            </div>

            <div class="card-actions justify-end mt-6">
                <a href="/admin#volunteers" class="btn btn-ghost" disabled={isSaving}>Cancel</a>
                <button type="submit" class="btn btn-primary flex items-center gap-1.5" disabled={isSaving}>
                    {#if isSaving} <span class="loading loading-spinner loading-xs"></span> {/if}
                    <Icon src={CheckCircle} class="h-5 w-5" />
                    Create Record
                </button>
            </div>
        </div>
    </form>
</div>
