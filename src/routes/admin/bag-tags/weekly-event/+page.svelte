<script>
    import { enhance } from '$app/forms';
    import { Icon, CheckCircle, XCircle, ArrowUturnLeft } from 'svelte-hero-icons';

    let { data, form } = $props();

    const currentYear = new Date().getFullYear();

    // Event context — plain $state, bound directly.
    let selectedLeague = $state('Open');
    let selectedSeason = $state(currentYear);
    let eventDate = $state('');

    // Per-member attendance/placement state. Initialized once from the member
    // list; each entry is its own reactive object.
    let attendance = $state(Object.fromEntries(data.members.map((m) => [m.id, { attended: false, placement: '' }])));

    $effect(() => {
        if (form) {
            selectedLeague = form.league ?? selectedLeague;
            selectedSeason = form.season ? Number(form.season) : selectedSeason;
            eventDate = form.eventDate ?? eventDate;
        }
    });

    // --- Live preview only — the server independently re-verifies all of this
    // at submission time, so this is purely to help the admin catch problems
    // (like "not enough available tags") before submitting, not authoritative. ---
    let latestAssignmentByTagId = $derived.by(() => {
        const map = new Map();
        for (const a of data.bagTagAssignments || []) {
            if (!map.has(a.bagTagId)) map.set(a.bagTagId, a);
        }
        return map;
    });

    let bagTagsForSelection = $derived((data.bagTags || []).filter((t) => t.league === selectedLeague && t.season === selectedSeason));

    let currentTagByMemberId = $derived.by(() => {
        const map = new Map();
        for (const tag of bagTagsForSelection) {
            const latest = latestAssignmentByTagId.get(tag.id);
            if (latest?.memberId) map.set(latest.memberId, tag.tagNumber);
        }
        return map;
    });

    let availableTagCount = $derived(
        bagTagsForSelection.filter((tag) => {
            const latest = latestAssignmentByTagId.get(tag.id);
            return !latest || !latest.memberId;
        }).length
    );

    let attendeeIds = $derived(Object.entries(attendance).filter(([, v]) => v.attended).map(([id]) => id));
    let noTagAttendeeCount = $derived(attendeeIds.filter((id) => !currentTagByMemberId.has(id)).length);
    let notEnoughTags = $derived(noTagAttendeeCount > availableTagCount);

    let isSaving = $state(false);
</script>

<div class="container mx-auto px-4 py-8 max-w-4xl">
    <div class="mb-6 flex items-center justify-between">
        <h1 class="text-3xl font-bold text-base-content">Weekly Event Redistribution</h1>
        <a href="/admin/bag-tags" class="btn btn-ghost btn-sm">
            <Icon src={ArrowUturnLeft} class="h-5 w-5" />
            Back to Admin
        </a>
    </div>

    <p class="mb-6 text-sm opacity-70">
        Check off who attended, enter each attendee's finishing placement (1st, 2nd, 3rd...), and this will redistribute
        the pool of tags among them — the best placement gets the lowest tag number. Everyone checked gets a new history
        row, even if their tag doesn't actually change, since that record also tracks attendance. Ties are fine — the
        tied attendee who came in with the lower tag number gets priority.
    </p>

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

    <form method="POST" action="?/redistribute" use:enhance={() => {
        isSaving = true;
        return async ({ update }) => {
            await update({ reset: false });
            isSaving = false;
        };
    }}>
        <div class="card bg-base-200 shadow-xl mb-6">
            <div class="card-body">
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div class="form-control">
                        <label class="label" for="leagueSelect"><span class="label-text">League*</span></label>
                        <select name="league" id="leagueSelect" class="select select-bordered w-full" bind:value={selectedLeague} required>
                            <option value="Open">Open</option>
                            <option value="Ladies">Ladies</option>
                        </select>
                    </div>
                    <div class="form-control">
                        <label class="label" for="seasonInput"><span class="label-text">Season*</span></label>
                        <input name="season" type="number" step="1" id="seasonInput" class="input input-bordered w-full" bind:value={selectedSeason} required />
                    </div>
                    <div class="form-control">
                        <label class="label" for="eventDateInput"><span class="label-text">Event Date*</span></label>
                        <input name="eventDate" type="date" id="eventDateInput" class="input input-bordered w-full" bind:value={eventDate} required />
                    </div>
                </div>
            </div>
        </div>

        <div class="alert {notEnoughTags ? 'alert-warning' : 'alert-info'} mb-4 shadow-md">
            <span>
                {attendeeIds.length} attendee{attendeeIds.length === 1 ? '' : 's'} selected —
                {noTagAttendeeCount} need{noTagAttendeeCount === 1 ? 's' : ''} a tag from the pool,
                {availableTagCount} currently available for {selectedLeague} League {selectedSeason}.
                {#if notEnoughTags}
                    <strong>Not enough available tags — add more before running this.</strong>
                {/if}
            </span>
        </div>

        <div class="card bg-base-200 shadow-xl">
            <div class="card-body p-0">
                <div class="overflow-x-auto">
                    <table class="table table-zebra w-full">
                        <thead>
                            <tr>
                                <th class="w-16">Attended</th>
                                <th>Member</th>
                                <th>Current Tag</th>
                                <th class="w-32">Placement</th>
                            </tr>
                        </thead>
                        <tbody>
                            {#each data.members as member (member.id)}
                                <tr>
                                    <td>
                                        <input type="checkbox" name="attended_{member.id}" class="checkbox" bind:checked={attendance[member.id].attended} />
                                    </td>
                                    <td>{member.firstName} {member.lastName} {member.nickname ? ` (${member.nickname})` : ''}</td>
                                    <td>{currentTagByMemberId.has(member.id) ? `#${currentTagByMemberId.get(member.id)}` : 'None'}</td>
                                    <td>
                                        <input
                                            type="number"
                                            name="placement_{member.id}"
                                            min="1"
                                            step="1"
                                            class="input input-bordered input-sm w-20"
                                            bind:value={attendance[member.id].placement}
                                            disabled={!attendance[member.id].attended}
                                        />
                                    </td>
                                </tr>
                            {/each}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>

        <div class="card-actions justify-end mt-6">
            <a href="/admin/bag-tags" class="btn btn-ghost" disabled={isSaving}>Cancel</a>
            <button
                type="submit"
                class="btn btn-primary flex items-center gap-1.5"
                disabled={isSaving}
                onclick={(e) => {
                    if (!window.confirm(`Redistribute tags for ${attendeeIds.length} attendee(s) on ${eventDate || '(no date set)'}? This creates a new history row for each of them.`)) e.preventDefault();
                }}
            >
                {#if isSaving} <span class="loading loading-spinner loading-xs"></span> {/if}
                <Icon src={CheckCircle} class="h-5 w-5" />
                Redistribute Tags
            </button>
        </div>
    </form>
</div>