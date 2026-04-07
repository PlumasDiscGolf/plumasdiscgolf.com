<script>
    import { format, parseISO, isSameDay } from 'date-fns';

    import * as config from '$lib/config.js';
    import { Icon, Clock, Calendar, ClipboardDocumentCheck } from 'svelte-hero-icons';

    let { data } = $props();
</script>

<svelte:head>
    <title>Events Page - {config.title}</title>
</svelte:head>

<div class="hero bg-base-200">
    <div class="hero-content py-12 text-center">
        <div class="max-w-md">
            <h1 class="text-5xl font-bold">Upcoming Events</h1>
            {#if data.upcomingEvents.length === 0}
                <p class="mt-4 text-xl">There are no upcoming events announced at this time.</p>
            {/if}
        </div>
    </div>
</div>

<div class="container mx-auto px-4 py-8">
    {#each data.upcomingEvents as event}
      <div class="card mb-8 border border-gray-400 bg-base-100 shadow-lg shadow-gray-400 lg:card-side lg:h-96">
            <figure class="lg:h-full lg:w-1/3">
                {#if event.eventImage}
                    <img src="https://pdg.pockethost.io/api/files/{event.collectionId}/{event.id}/{event.eventImage}?download=1" alt="Event banner" class="h-full w-full object-cover object-top" />
                {/if}
            </figure>
            <div class="card-body flex flex-col lg:w-2/3">
                <div class="flex flex-wrap gap-2">
                    {#if event.type}
                        <div class="badge badge-secondary uppercase">{event.type}</div>
                    {/if}
                </div>
                <h2 class="card-title text-2xl">{event.name}</h2>
                <div class="prose flex items-center gap-2 text-sm">
                    <Icon src={Calendar} class="size-5" />
                    {#if !event.endDateTime || isSameDay(parseISO(event.startDateTime), parseISO(event.endDateTime))}
                        <span>{format(parseISO(event.startDateTime), 'MMMM do, yyyy, h:mm a')}</span>
                    {:else}
                        <span>{format(parseISO(event.startDateTime), 'MMMM do, yyyy')}</span>
                        <span class="mx-1">-</span>
                        <span>{format(parseISO(event.endDateTime), 'MMMM do, yyyy')}</span>
                    {/if}
                </div>
                {#if event.checkInTime}
                    <div class="prose flex items-center gap-2 text-sm">
                        <Icon src={ClipboardDocumentCheck} class="size-5" />
                        <span>Check-In begins at {format(parseISO(event.checkInTime), 'h:mm a')}</span>
                    </div>
                {/if}
                <div class="relative max-h-36 overflow-hidden">
                    <div class="prose max-w-none">{@html event.description}</div>
                    <div class="absolute bottom-0 left-0 h-10 w-full" style="background: linear-gradient(to top, oklch(var(--b1)) 0%, transparent 100%);"></div>
                </div>
                <div class="card-actions mt-4 items-center justify-between">
                    <a href="/events/{event.id}" class="btn btn-info">More Info</a>
                    {#if event.registratinURL}
                        <button class="btn btn-primary">Register Now</button>
                    {/if}
                    {#if event.resultsPosted === true}
                        <button class="btn btn-warning">Results</button>
                    {/if}
                </div>
            </div>
        </div>
    {/each}
</div>

<div class="hero bg-base-200">
    <div class="hero-content py-12 text-center">
        <div class="max-w-md">
            <h1 class="text-5xl font-bold">Past Events</h1>
        </div>
    </div>
</div>

<div class="container mx-auto px-4 py-8">
    {#each data.pastEvents as event}
      <div class="card mb-8 border border-gray-400 bg-base-100 shadow-lg shadow-gray-400 lg:card-side lg:h-96">
            <figure class="lg:h-full lg:w-1/3">
                {#if event.eventImage}
                    <img src="https://pdg.pockethost.io/api/files/{event.collectionId}/{event.id}/{event.eventImage}?download=1" alt="Event banner" class="h-full w-full object-cover object-top" />
                {/if}
            </figure>
            <div class="card-body flex flex-col lg:w-2/3">
                <div class="flex flex-wrap gap-2">
                    {#if event.type}
                        <div class="badge badge-secondary uppercase">{event.type}</div>
                    {/if}
                </div>
                <h2 class="card-title text-2xl">{event.name}</h2>
                <div class="prose flex items-center gap-2 text-sm">
                    <Icon src={Calendar} class="size-5" />
                    {#if !event.endDateTime || isSameDay(parseISO(event.startDateTime), parseISO(event.endDateTime))}
                        <span>{format(parseISO(event.startDateTime), 'MMMM do, yyyy, h:mm a')}</span>
                    {:else}
                        <span>{format(parseISO(event.startDateTime), 'MMMM do, yyyy')}</span>
                        <span class="mx-1">-</span>
                        <span>{format(parseISO(event.endDateTime), 'MMMM do, yyyy')}</span>
                    {/if}
                </div>
                {#if event.checkInTime}
                    <div class="prose flex items-center gap-2 text-sm">
                        <Icon src={ClipboardDocumentCheck} class="size-5" />
                        <span>Check-In begins at {format(parseISO(event.checkInTime), 'h:mm a')}</span>
                    </div>
                {/if}
                <div class="relative max-h-36 overflow-hidden">
                    <div class="prose max-w-none">{@html event.description}</div>
                    <div class="absolute bottom-0 left-0 h-10 w-full" style="background: linear-gradient(to top, oklch(var(--b1)) 0%, transparent 100%);"></div>
                </div>
                <div class="card-actions mt-4 items-center justify-between">
                    <a href="/events/{event.id}" class="btn btn-info">More Info</a>
                    {#if event.resultsPosted === true}
                        <button class="btn btn-warning">Results</button>
                    {/if}
                </div>
            </div>
        </div>
    {/each}
</div>
