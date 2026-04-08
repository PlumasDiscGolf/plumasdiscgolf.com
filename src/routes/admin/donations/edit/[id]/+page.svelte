<script>
    import { enhance } from '$app/forms';
    import { Icon, CheckCircle, XCircle, ArrowUturnLeft } from 'svelte-hero-icons';
    import { formatPocketBaseDateToDateInput } from '$lib/utils.js';

    let { data, form } = $props(); // data.donation from load, form from action

    const donationTypes = ['Monetary', 'In-Kind', 'Sponsorship', 'Other'];

    let donorName = $derived(form?.donorName || data.donation?.donorName || '');
    let donorEmail = $derived(form?.donorEmail || data.donation?.donorEmail || '');
    let amount = $derived(form?.amount === undefined ? data.donation?.amount : form.amount);
    let donationDate = $derived(form?.donationDate || formatPocketBaseDateToDateInput(data.donation?.donationDate));
    let donationType = $derived(form?.donationType || data.donation?.donationType || 'Monetary');
    let notes = $derived(form?.notes || data.donation?.notes || '');

    let isSaving = $state(false);
</script>

<div class="container mx-auto px-4 py-8 max-w-3xl">
    <div class="mb-6 flex items-center justify-between">
        <h1 class="text-3xl font-bold text-base-content">Edit Donation</h1>
         <a href="/admin#donations" class="btn btn-ghost btn-sm">
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

    <form method="POST" action="?/updateDonation" use:enhance={() => {
        isSaving = true;
        return async ({ update }) => {
            await update({ reset: false });
            isSaving = false;
        };
    }} class="card bg-base-200 shadow-xl">
        <div class="card-body space-y-4">
            <input type="hidden" name="donationId" value={data.donation?.id} />

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="form-control">
                    <label class="label" for="donorNameInput"><span class="label-text">Donor Name*</span></label>
                    <input name="donorName" type="text" id="donorNameInput" class="input input-bordered w-full" bind:value={donorName} required />
                </div>
                <div class="form-control">
                    <label class="label" for="donorEmailInput"><span class="label-text">Donor Email</span></label>
                    <input name="donorEmail" type="email" id="donorEmailInput" class="input input-bordered w-full" bind:value={donorEmail} />
                </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div class="form-control">
                    <label class="label" for="amountInput"><span class="label-text">Amount ($)*</span></label>
                    <input name="amount" type="number" step="0.01" id="amountInput" class="input input-bordered w-full" bind:value={amount} required />
                </div>
                <div class="form-control">
                    <label class="label" for="donationDateInput"><span class="label-text">Donation Date*</span></label>
                    <input name="donationDate" type="date" id="donationDateInput" class="input input-bordered w-full" bind:value={donationDate} required />
                </div>
                <div class="form-control">
                    <label class="label" for="donationTypeSelect"><span class="label-text">Type</span></label>
                    <select name="donationType" id="donationTypeSelect" class="select select-bordered w-full" bind:value={donationType}>
                        {#each donationTypes as type}
                            <option value={type}>{type}</option>
                        {/each}
                    </select>
                </div>
            </div>

             <div class="form-control">
                <label class="label" for="notesTextarea"><span class="label-text">Notes</span></label>
                <textarea name="notes" id="notesTextarea" class="textarea textarea-bordered h-24 w-full" bind:value={notes}></textarea>
            </div>

            <div class="card-actions justify-end mt-6">
                <a href="/admin#donations" class="btn btn-ghost" disabled={isSaving}>Cancel</a>
                <button type="submit" class="btn btn-primary flex items-center gap-1.5" disabled={isSaving}>
                    {#if isSaving} <span class="loading loading-spinner loading-xs"></span> {/if}
                    <Icon src={CheckCircle} class="h-5 w-5" />
                    Update Donation
                </button>
            </div>
        </div>
    </form>
</div>
