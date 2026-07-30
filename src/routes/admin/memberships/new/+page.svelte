<script>
    import { enhance } from '$app/forms';
    import { Icon, CheckCircle, XCircle, ArrowUturnLeft } from 'svelte-hero-icons';

    let { data, form } = $props();

    const currentYear = new Date().getFullYear();
    const STATUS_OPTIONS = ['active', 'expired', 'suspended', 'revoked'];

    // bind:value requires $state, not $derived.
    let memberId = $state('');
    let membershipTypeId = $state('');
    let season = $state(String(currentYear));
    let pricePaid = $state('');
    let status = $state('active');
    let startDate = $state(new Date().toISOString().slice(0, 10));

    $effect(() => {
        if (form) {
            memberId = form.memberId ?? memberId;
            membershipTypeId = form.membershipTypeId ?? membershipTypeId;
            season = form.season ?? season;
            pricePaid = form.pricePaid ?? pricePaid;
            status = form.status ?? status;
            startDate = form.startDate ?? startDate;
        }
    });

    // Convenience: selecting a membership type auto-fills pricePaid with that
    // type's list price, UNLESS the admin has already typed something —
    // pricePaid and the type's price are deliberately separate fields (a
    // discount, for instance), so this only ever fills an empty field, never
    // overwrites a value the admin already entered.
    function handleTypeChange() {
        if (pricePaid) return;
        const selectedType = data.membershipTypes.find((t) => t.id === membershipTypeId);
        if (selectedType?.price != null) {
            pricePaid = String(selectedType.price);
        }
    }

    let isSaving = $state(false);
</script>

<div class="container mx-auto px-4 py-8 max-w-2xl">
    <div class="mb-6 flex items-center justify-between">
        <h1 class="text-3xl font-bold text-base-content">Add Membership</h1>
        <a href="/admin/memberships" class="btn btn-ghost btn-sm">
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

    <form method="POST" action="?/createMembership" use:enhance={() => {
        isSaving = true;
        return async ({ update }) => {
            await update();
            isSaving = false;
        };
    }} class="card bg-base-200 shadow-xl">
        <div class="card-body space-y-4">
            <div class="form-control">
                <label class="label" for="memberSelect"><span class="label-text">Member*</span></label>
                <select name="memberId" id="memberSelect" class="select select-bordered w-full" bind:value={memberId} required>
                    <option value="" disabled selected={!memberId}>Select a member...</option>
                    {#each data.members as member (member.id)}
                        <option value={member.id}>{member.firstName} {member.lastName}{member.nickname ? ` (${member.nickname})` : ''}</option>
                    {/each}
                </select>
            </div>

            <div class="form-control">
                <label class="label" for="membershipTypeSelect"><span class="label-text">Membership Type*</span></label>
                <select name="membershipTypeId" id="membershipTypeSelect" class="select select-bordered w-full" bind:value={membershipTypeId} onchange={handleTypeChange} required>
                    <option value="" disabled selected={!membershipTypeId}>Select a type...</option>
                    {#each data.membershipTypes as type (type.id)}
                        <option value={type.id}>{type.name}{type.price != null ? ` — $${Number(type.price).toFixed(2)}` : ''}</option>
                    {/each}
                </select>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="form-control">
                    <label class="label" for="seasonInput"><span class="label-text">Season*</span></label>
                    <input name="season" type="number" step="1" id="seasonInput" class="input input-bordered w-full" bind:value={season} required />
                </div>
                <div class="form-control">
                    <label class="label" for="startDateInput"><span class="label-text">Start Date*</span></label>
                    <input name="startDate" type="date" id="startDateInput" class="input input-bordered w-full" bind:value={startDate} required />
                </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="form-control">
                    <label class="label" for="pricePaidInput"><span class="label-text">Price Paid*</span></label>
                    <input name="pricePaid" type="number" step="0.01" min="0" id="pricePaidInput" class="input input-bordered w-full" bind:value={pricePaid} required />
                </div>
                <div class="form-control">
                    <label class="label" for="statusSelect"><span class="label-text">Status*</span></label>
                    <select name="status" id="statusSelect" class="select select-bordered w-full" bind:value={status} required>
                        {#each STATUS_OPTIONS as opt}
                            <option value={opt} class="capitalize">{opt}</option>
                        {/each}
                    </select>
                </div>
            </div>

            <div class="card-actions justify-end mt-6">
                <a href="/admin/memberships" class="btn btn-ghost" disabled={isSaving}>Cancel</a>
                <button type="submit" class="btn btn-primary flex items-center gap-1.5" disabled={isSaving}>
                    {#if isSaving} <span class="loading loading-spinner loading-xs"></span> {/if}
                    <Icon src={CheckCircle} class="h-5 w-5" />
                    Create Membership
                </button>
            </div>
        </div>
    </form>
</div>