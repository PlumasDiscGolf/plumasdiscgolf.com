<script>
    import { enhance } from '$app/forms';
    import { Icon, CheckCircle, XCircle, ArrowUturnLeft } from 'svelte-hero-icons';
    import { format, endOfYear } from 'date-fns';

    let { form } = $props();

    const defaultExpires = format(endOfYear(new Date()), 'yyyy-MM-dd');
    const defaultMemberSince = format(new Date(), 'yyyy-MM-dd');

    let name = $derived(form?.name || '');
    let email = $derived(form?.email || '');
    let memberSince = $derived(form?.memberSince || defaultMemberSince );
    let expires = $derived(form?.expires || defaultExpires);
    let active = $derived(form?.active === undefined ? true : form.active);

    let isSaving = $state(false);
</script>

<div class="container mx-auto px-4 py-8 max-w-3xl">
    <div class="mb-6 flex items-center justify-between">
        <h1 class="text-3xl font-bold text-base-content">Add New Membership</h1>
        <a href="/admin#memberships" class="btn btn-ghost btn-sm">
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

    <form method="POST" action="?/createMembership" use:enhance={() => {
        isSaving = true;
        return async ({ update, result }) => {
            await update({ reset: (result.type === 'success') });
            isSaving = false;
            if (result.type === 'success' && !form?.error) {
                // Reset form fields to their default state
                name = '';
                email = '';
                memberSince = defaultMemberSince;
                expires = defaultExpires;
                active = true;
            }
        };
    }} class="card bg-base-200 shadow-xl">
        <div class="card-body space-y-4">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="form-control">
                    <label class="label" for="nameInput"><span class="label-text">Member Name*</span></label>
                    <input name="name" type="text" id="nameInput" placeholder="e.g., Jane Doe" class="input input-bordered w-full" bind:value={name} required />
                </div>
                <div class="form-control">
                    <label class="label" for="emailInput"><span class="label-text">Email Address</span></label>
                    <input name="email" type="email" id="emailInput" placeholder="e.g., jane@example.com" class="input input-bordered w-full" bind:value={email} />
                </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                <div class="form-control">
                    <label class="label" for="expiresInput"><span class="label-text">Member Since</span></label>
                    <input name="memberSince" type="date" id="memberSinceInput" class="input input-bordered w-full" bind:value={memberSince} required />
                </div>
                 <div class="form-control">
                    <label class="label" for="expiresInput"><span class="label-text">Expires On*</span></label>
                    <input name="expires" type="date" id="expiresInput" class="input input-bordered w-full" bind:value={expires} required />
                </div>
            </div>
            <div class="form-control items-start">
                 <label class="label cursor-pointer gap-4 py-1">
                    <span class="label-text">Membership Active</span>
                    <input name="active" type="checkbox" id="activeToggle" class="toggle toggle-primary" bind:checked={active} />
                </label>
            </div>

            <div class="card-actions justify-end mt-6">
                <a href="/admin#memberships" class="btn btn-ghost" disabled={isSaving}>Cancel</a>
                <button type="submit" class="btn btn-primary flex items-center gap-1.5" disabled={isSaving}>
                    {#if isSaving} <span class="loading loading-spinner loading-xs"></span> {/if}
                    <Icon src={CheckCircle} class="h-5 w-5" />
                    Create Membership
                </button>
            </div>
        </div>
    </form>
</div>
