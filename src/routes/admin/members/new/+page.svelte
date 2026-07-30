<script>
    import { enhance } from '$app/forms';
    import { Icon, CheckCircle, XCircle, ArrowUturnLeft } from 'svelte-hero-icons';

    let { data, form } = $props(); // data.members (for duplicate check) from load

    // bind:value requires $state, not $derived.
    let firstName = $state('');
    let lastName = $state('');
    let nickname = $state('');
    let email = $state('');
    let phone = $state('');
    let consentEmail = $state(false);
    let consentSms = $state(false);
    let notes = $state('');

    $effect(() => {
        if (form) {
            firstName = form.firstName ?? firstName;
            lastName = form.lastName ?? lastName;
            nickname = form.nickname ?? nickname;
            email = form.email ?? email;
            phone = form.phone ?? phone;
            consentEmail = form.consentEmail ?? consentEmail;
            consentSms = form.consentSms ?? consentSms;
            notes = form.notes ?? notes;
        }
    });

    // Soft duplicate check: no hard uniqueness constraint on name (two real
    // people can share a name), but warn the admin before creating a member
    // that matches an existing one on first + last name, in case it's
    // actually a repeat entry rather than a coincidence.
    function checkForDuplicate() {
        const fn = firstName.trim().toLowerCase();
        const ln = lastName.trim().toLowerCase();
        if (!fn || !ln) return true; // let required-field validation handle empty names
        const match = data.members.find(
            (m) => m.firstName?.trim().toLowerCase() === fn && m.lastName?.trim().toLowerCase() === ln
        );
        if (match) {
            return window.confirm(`A member named "${firstName} ${lastName}" already exists. Create this one anyway?`);
        }
        return true;
    }

    let isSaving = $state(false);
</script>

<div class="container mx-auto px-4 py-8 max-w-2xl">
    <div class="mb-6 flex items-center justify-between">
        <h1 class="text-3xl font-bold text-base-content">Add Member</h1>
        <a href="/admin/members" class="btn btn-ghost btn-sm">
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
        action="?/createMember"
        use:enhance={() => {
            isSaving = true;
            return async ({ update }) => {
                await update();
                isSaving = false;
            };
        }}
        onsubmit={(e) => {
            if (!checkForDuplicate()) { e.preventDefault(); e.stopImmediatePropagation(); }
        }}
        class="card bg-base-200 shadow-xl"
    >
        <div class="card-body space-y-4">
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div class="form-control">
                    <label class="label" for="firstNameInput"><span class="label-text">First Name*</span></label>
                    <input name="firstName" type="text" id="firstNameInput" class="input input-bordered w-full" bind:value={firstName} required />
                </div>
                <div class="form-control">
                    <label class="label" for="lastNameInput"><span class="label-text">Last Name*</span></label>
                    <input name="lastName" type="text" id="lastNameInput" class="input input-bordered w-full" bind:value={lastName} required />
                </div>
                <div class="form-control">
                    <label class="label" for="nicknameInput"><span class="label-text">Nickname</span></label>
                    <input name="nickname" type="text" id="nicknameInput" class="input input-bordered w-full" bind:value={nickname} />
                </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="form-control">
                    <label class="label" for="emailInput"><span class="label-text">Email</span></label>
                    <input name="email" type="email" id="emailInput" class="input input-bordered w-full" bind:value={email} />
                </div>
                <div class="form-control">
                    <label class="label" for="phoneInput"><span class="label-text">Phone</span></label>
                    <input name="phone" type="tel" id="phoneInput" class="input input-bordered w-full" bind:value={phone} />
                </div>
            </div>

            <div class="flex gap-6">
                <label class="label cursor-pointer gap-2">
                    <input name="consentEmail" type="checkbox" class="checkbox" bind:checked={consentEmail} />
                    <span class="label-text">Email consent</span>
                </label>
                <label class="label cursor-pointer gap-2">
                    <input name="consentSms" type="checkbox" class="checkbox" bind:checked={consentSms} />
                    <span class="label-text">SMS consent</span>
                </label>
            </div>

            <div class="form-control">
                <label class="label" for="notesTextarea"><span class="label-text">Notes</span></label>
                <textarea name="notes" id="notesTextarea" class="textarea textarea-bordered h-24 w-full" bind:value={notes}></textarea>
            </div>

            <div class="card-actions justify-end mt-6">
                <a href="/admin/members" class="btn btn-ghost" disabled={isSaving}>Cancel</a>
                <button type="submit" class="btn btn-primary flex items-center gap-1.5" disabled={isSaving}>
                    {#if isSaving} <span class="loading loading-spinner loading-xs"></span> {/if}
                    <Icon src={CheckCircle} class="h-5 w-5" />
                    Create Member
                </button>
            </div>
        </div>
    </form>
</div>