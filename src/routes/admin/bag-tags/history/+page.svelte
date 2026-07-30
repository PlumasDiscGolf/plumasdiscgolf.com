<script>
    import { format, parseISO } from 'date-fns';
    import { Icon, ArrowUturnLeft } from 'svelte-hero-icons';

    let { data } = $props();

    // This page is entirely GET-driven — every filter change is a normal link/
    // form navigation that reloads with new query params, so there's no client
    // $state/bind: needed anywhere here, just plain values reflecting whatever
    // was already loaded.

    function pageUrl(targetPage) {
        const params = new URLSearchParams();
        if (data.season) params.set('season', data.season);
        if (data.league) params.set('league', data.league);
        if (data.memberId) params.set('memberId', data.memberId);
        if (data.reason) params.set('reason', data.reason);
        if (data.bagTagId) params.set('bagTagId', data.bagTagId);
        if (data.asOfDate) params.set('asOfDate', data.asOfDate);
        if (targetPage > 1) params.set('page', targetPage);
        const qs = params.toString();
        return qs ? `?${qs}` : '.';
    }
</script>

<div class="container mx-auto px-4 py-8 max-w-5xl">
    <div class="mb-6 flex items-center justify-between">
        <h1 class="text-3xl font-bold text-base-content">Assignment History</h1>
        <a href="/admin/bag-tags" class="btn btn-ghost btn-sm">
            <Icon src={ArrowUturnLeft} class="h-5 w-5" />
            Back to Admin
        </a>
    </div>

    {#if data.focusedTag}
        <div class="alert alert-info mb-4 shadow-md">
            <span>
                Showing history for Tag #{data.focusedTag.tagNumber} — {data.focusedTag.league} League, {data.focusedTag.season}.
                <a href="/admin/bag-tags/history" class="link">Clear this to browse all tags</a>.
            </span>
        </div>
    {/if}

    <form method="GET" class="card bg-base-200 shadow-xl mb-6">
        <div class="card-body">
            {#if data.bagTagId}<input type="hidden" name="bagTagId" value={data.bagTagId} />{/if}
            <div class="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
                <div class="form-control">
                    <label class="label py-0" for="seasonSelect"><span class="label-text">Season</span></label>
                    <select name="season" id="seasonSelect" class="select select-bordered select-sm w-full">
                        <option value="" selected={!data.season}>All</option>
                        {#each data.availableSeasons as s}
                            <option value={s} selected={String(s) === data.season}>{s}</option>
                        {/each}
                    </select>
                </div>
                <div class="form-control">
                    <label class="label py-0" for="leagueSelect"><span class="label-text">League</span></label>
                    <select name="league" id="leagueSelect" class="select select-bordered select-sm w-full">
                        <option value="" selected={!data.league}>All</option>
                        <option value="Open" selected={data.league === 'Open'}>Open</option>
                        <option value="Ladies" selected={data.league === 'Ladies'}>Ladies</option>
                    </select>
                </div>
                <div class="form-control lg:col-span-2">
                    <label class="label py-0" for="memberSelect"><span class="label-text">Member</span></label>
                    <select name="memberId" id="memberSelect" class="select select-bordered select-sm w-full" disabled={!!data.asOfDate}>
                        <option value="" selected={!data.memberId}>All</option>
                        {#each data.members as member (member.id)}
                            <option value={member.id} selected={member.id === data.memberId}>{member.lastName}, {member.firstName}</option>
                        {/each}
                    </select>
                </div>
                <div class="form-control">
                    <label class="label py-0" for="reasonSelect"><span class="label-text">Reason</span></label>
                    <select name="reason" id="reasonSelect" class="select select-bordered select-sm w-full" disabled={!!data.asOfDate}>
                        <option value="" selected={!data.reason}>All</option>
                        {#each data.reasonOptions as opt}
                            <option value={opt} selected={opt === data.reason}>{opt}</option>
                        {/each}
                    </select>
                </div>
                <div class="form-control">
                    <label class="label py-0" for="asOfDateInput"><span class="label-text">As Of Date</span></label>
                    <input type="date" name="asOfDate" id="asOfDateInput" class="input input-bordered input-sm w-full" value={data.asOfDate} />
                </div>
            </div>
            {#if data.asOfDate}
                <p class="text-xs opacity-70 mt-2">Member and Reason filters don't apply in "As Of Date" mode — this reconstructs the full standings as they stood on that date instead of browsing individual log entries.</p>
            {/if}
            <div class="card-actions justify-end mt-4">
                <a href="/admin/bag-tags/history{data.bagTagId ? `?bagTagId=${data.bagTagId}` : ''}" class="btn btn-ghost btn-sm">Clear Filters</a>
                <button type="submit" class="btn btn-primary btn-sm">Apply</button>
            </div>
        </div>
    </form>

    {#if data.mode === 'asOf'}
        {#if data.needsSeasonLeague}
            <div class="alert alert-warning shadow-md">
                <span>Select a Season and League (or arrive via a specific tag's History button) to reconstruct standings for a date.</span>
            </div>
        {:else}
            <div class="overflow-x-auto">
                <table class="table table-zebra w-full">
                    <thead>
                        <tr>
                            <th class="w-24">Tag #</th>
                            <th>League</th>
                            <th>Season</th>
                            <th>Holder as of {format(parseISO(data.asOfDate), 'MMM do, yyyy')}</th>
                            <th>Held Since</th>
                        </tr>
                    </thead>
                    <tbody>
                        {#if data.snapshot.length > 0}
                            {#each data.snapshot as tag (tag.id)}
                                <tr>
                                    <td class="font-bold">#{tag.tagNumber}</td>
                                    <td>{tag.league}</td>
                                    <td>{tag.season}</td>
                                    <td>{#if tag.holderName}{tag.holderName}{:else}<span class="italic opacity-60">Available</span>{/if}</td>
                                    <td>{#if tag.heldSince}{format(parseISO(tag.heldSince), 'MMM do, yyyy')}{/if}</td>
                                </tr>
                            {/each}
                        {:else}
                            <tr><td colspan="5" class="p-4 text-center italic">No tags found for this selection.</td></tr>
                        {/if}
                    </tbody>
                </table>
            </div>
        {/if}
    {:else}
        <div class="overflow-x-auto">
            <table class="table table-zebra w-full">
                <thead>
                    <tr>
                        <th>Date</th>
                        <th>Tag #</th>
                        <th>League</th>
                        <th>Season</th>
                        <th>Member</th>
                        <th>Reason</th>
                        <th>Notes</th>
                    </tr>
                </thead>
                <tbody>
                    {#if data.assignments.length > 0}
                        {#each data.assignments as a (a.id)}
                            <tr>
                                <td>{format(parseISO(a.assignedAt), 'MMM do, yyyy')}</td>
                                <td class="font-bold">{#if a.expand?.bagTagId}#{a.expand.bagTagId.tagNumber}{:else}<span class="italic opacity-60">(deleted tag)</span>{/if}</td>
                                <td>{a.league}</td>
                                <td>{a.season}</td>
                                <td>{#if a.expand?.memberId}{a.expand.memberId.firstName} {a.expand.memberId.lastName}{:else}<span class="italic opacity-60">{a.vacatedByName ? `Vacated by ${a.vacatedByName}` : '— Vacated —'}</span>{/if}</td>
                                <td>{a.reason}</td>
                                <td>{a.notes || ''}</td>
                            </tr>
                        {/each}
                    {:else}
                        <tr><td colspan="7" class="p-4 text-center italic">No history found for this filter.</td></tr>
                    {/if}
                </tbody>
            </table>
        </div>

        {#if data.totalPages > 1}
            <div class="mt-4 flex items-center justify-center gap-2">
                {#if data.page > 1}
                    <a href={pageUrl(data.page - 1)} class="btn btn-sm">Previous</a>
                {/if}
                <span class="btn btn-sm btn-disabled">Page {data.page} of {data.totalPages}</span>
                {#if data.page < data.totalPages}
                    <a href={pageUrl(data.page + 1)} class="btn btn-sm">Next</a>
                {/if}
            </div>
        {/if}
    {/if}
</div>