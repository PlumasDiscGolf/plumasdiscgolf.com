<script>
	import { format, parseISO, isSameDay } from 'date-fns';
	import { Icon, Map, Calendar, UserGroup, CheckCircle, Ticket, Sparkles } from 'svelte-hero-icons';
	import { env } from '$env/dynamic/public';
	import * as config from '$lib/config.js';

	let { data } = $props();
</script>

<svelte:head>
	<title>{config.title} - Homepage</title>
</svelte:head>

<!-- Hero -->
<div class="hero relative min-h-[60vh]" style="background-image: url('/images/Pioneer.jpg')">
	<div class="hero-overlay bg-opacity-20"></div>
	<div class="hero-content text-neutral-content h-full text-center">
		<div class="mt-auto mb-10 max-w-2xl">
			<h1 class="mb-4 text-5xl font-bold drop-shadow-[0_4px_3px_rgba(0,0,0,0.8)]">Plumas Disc Golf</h1>
			<div class="bg-neutral mx-auto max-w-lg rounded-xl bg-opacity-90 p-4">
				<p>
					Serving disc golfers in the Plumas County area with well-loved courses, a full
					season of events, and a club that feels like family. Join us on the course.
				</p>
			</div>
			<div class="mt-6 flex flex-wrap justify-center gap-3">
				<a href="/membership" class="btn btn-primary">Join the Club</a>
				<a href="/events" class="btn btn-secondary">See Upcoming Events</a>
			</div>
		</div>
	</div>
</div>

<!-- What We Offer -->
<div class="bg-base-200 py-12">
	<div class="container mx-auto px-4">
		<h2 class="mb-2 text-center text-3xl font-bold">What Plumas Disc Golf Offers</h2>
		<p class="text-base-content/70 mx-auto mb-8 max-w-2xl text-center">
			A club run by local players, for local players — courses to play, events to compete
			in, and a community to be part of.
		</p>
		<div class="grid grid-cols-1 gap-6 md:grid-cols-3">
			<div class="card bg-base-100 shadow-lg shadow-gray-400">
				<div class="card-body items-center text-center">
					<Icon src={Map} size="128" class="text-primary" />
					<h3 class="card-title">Local Courses</h3>
					<p>Two well-maintained courses in the Plumas County area, open to players of every skill level.</p>
					<div class="card-actions mt-2">
						<a href="/courses" class="btn btn-sm btn-secondary">View Courses</a>
					</div>
				</div>
			</div>
			<div class="card bg-base-100 shadow-lg shadow-gray-400">
				<div class="card-body items-center text-center">
					<Icon src={Calendar} size="128" class="text-primary" />
					<h3 class="card-title">Events & Leagues</h3>
					<p>Bag Tag League play, the Plumas Series, and one-off tournaments throughout the season.</p>
					<div class="card-actions mt-2">
						<a href="/events" class="btn btn-sm btn-secondary">View Events</a>
					</div>
				</div>
			</div>
			<div class="card bg-base-100 shadow-lg shadow-gray-400">
				<div class="card-body items-center text-center">
					<Icon src={UserGroup} size="128" class="text-primary" />
					<h3 class="card-title">A Real Community</h3>
					<p>Volunteers, board members, and donors who keep our courses in great shape year-round.</p>
					<div class="card-actions mt-2">
						<a href="/about" class="btn btn-sm btn-secondary">About Us</a>
					</div>
				</div>
			</div>
		</div>
	</div>
</div>

<!-- Why Join -->
<div class="py-12">
	<div class="container mx-auto px-4">
		<div class="card bg-base-100 shadow-lg shadow-gray-400 lg:card-side">
			<div class="card-body lg:w-3/5">
				<h2 class="card-title text-3xl">Why Become a Member?</h2>
				<p class="text-base-content/70 mb-2">
					Memberships are one of our primary fundraising sources each year, and every
					membership goes directly toward course upkeep and club events. Here's what you get:
				</p>
				<ul class="space-y-2">
					<li class="flex items-center gap-2">
						<Icon src={CheckCircle} class="text-success size-5 shrink-0" />
						<span>A Custom PDG Bag Tag</span>
					</li>
					<li class="flex items-center gap-2">
						<Icon src={CheckCircle} class="text-success size-5 shrink-0" />
						<span>Entry into all Bag Tag League events for the year</span>
					</li>
					<li class="flex items-center gap-2">
						<Icon src={CheckCircle} class="text-success size-5 shrink-0" />
						<span>Discounted entry into club events all season</span>
					</li>
					<li class="flex items-center gap-2">
						<Icon src={CheckCircle} class="text-success size-5 shrink-0" />
						<span>A Youth Membership option for players 18 and under</span>
					</li>
				</ul>
			</div>
			<div class="card-body items-center justify-center bg-base-200 lg:w-2/5">
				<Icon src={Ticket} size="192" class="text-primary" />
				<p class="mt-2 text-center font-semibold">Ready to make it official?</p>
				<a href="/membership" class="btn btn-primary btn-lg mt-2">Become a Member</a>
			</div>
		</div>
	</div>
</div>

<!-- Our Courses -->
<div class="bg-base-200 py-12">
	<div class="container mx-auto px-4">
		<h2 class="mb-6 text-center text-3xl font-bold">Our Courses</h2>
		<div class="grid grid-cols-1 gap-6 md:grid-cols-2">
			{#each data.courses as course}
				<div class="card overflow-hidden bg-base-100 shadow-lg shadow-gray-400">
					<figure class="h-48 w-full">
						<img
							src="{env.PUBLIC_POCKETBASE_FILES_URL}/api/files/{course.collectionId}/{course.id}/{course.image}?download=1"
							alt="{course.name} banner"
							class="h-full w-full object-cover"
						/>
					</figure>
					<div class="card-body">
                    <div class="grid grid-cols-2">
                        <div>
                            <h3 class="card-title">{course.name}</h3>
                                <div class="flex items-center gap-2 text-sm">
                                    <span>{course.numberOfHoles} Holes • Par {course.par}</span>
                                </div>
                            </div>
                            <div class="h-full">
                                <div class="card-actions justify-end">
                                    <a href="/courses/{course.id}" class="btn btn-primary btn-sm">Course Info</a>
                                </div>
                            </div>
                        </div>
                    </div>
				</div>
			{/each}
		</div>
	</div>
</div>

<!-- Upcoming Events -->
{#if data.upcomingEvents.length > 0}
	<div class="py-12">
		<div class="container mx-auto px-4">
			<h2 class="mb-6 text-center text-3xl font-bold">Upcoming Events</h2>
			<div class="grid grid-cols-1 gap-6 md:grid-cols-3">
				{#each data.upcomingEvents as event}
					<div class="card bg-base-100 shadow-lg shadow-gray-400">
						<div class="card-body">
							{#if event.type}
								<div class="badge badge-secondary uppercase">{event.type}</div>
							{/if}

                            <div class="flex justify-center">
                                <h3 class="card-title">{event.name}</h3>
                            </div>
                            <div class="flex items-center gap-2 text-sm justify-center">
                                {#if !event.endDateTime || isSameDay(parseISO(event.startDateTime), parseISO(event.endDateTime))}
                                    <span>{format(parseISO(event.startDateTime), 'MMMM do, yyyy')}</span>
                                {:else}
                                    <span>{format(parseISO(event.startDateTime), 'MMM do')} - {format(parseISO(event.endDateTime), 'MMM do, yyyy')}</span>
                                {/if}
                            </div>
                            <div>
                            <div class="card-actions mt-2 justify-between">
                                <img src="{env.PUBLIC_POCKETBASE_FILES_URL}/api/files/{event.collectionId}/{event.id}/{event.eventImage}?download=1" alt="" width="64px">
                                <div class="mt-auto">
                                    <a href="/events/{event.id}" class="btn btn-primary btn-sm">More Info</a>
                                </div>
                            </div>
                            </div>

						</div>
					</div>
				{/each}
			</div>
			<div class="mt-6 flex w-full justify-center">
				<a href="/events" class="btn btn-secondary">View All Events</a>
			</div>
		</div>
	</div>
{/if}

<!-- Latest News -->
<div class="bg-base-200 py-12">
	<div class="container mx-auto px-4">
		<h2 class="mb-6 text-center text-3xl font-bold">Latest News</h2>
		<div class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
			{#each data.posts.items as post}
				<div class="card bg-base-100 shadow-lg shadow-gray-400">
					<div class="card-body">
						<p class="font-semibold">
							{format(parseISO(post.publishedDate), 'MMMM do, yyyy')}
						</p>
						<h2 class="card-title">{post.title}</h2>
						<p>{@html post.content.substring(0, 150)} ...</p>
						<div class="card-actions mt-4 justify-end">
							<a href="/posts/{post.id}" class="btn btn-primary btn-sm" data-sveltekit-preload-data="off">Read More</a>
						</div>
						<div class="flex gap-2">
							{#each post.categories as category}
								<div class="badge badge-secondary">{category}</div>
							{/each}
						</div>
					</div>
				</div>
			{/each}
		</div>
		<div class="mt-6 flex w-full justify-center">
			<a href="/posts" class="btn btn-secondary">View All</a>
		</div>
	</div>
</div>

<!-- Final CTA -->
<div class="hero bg-neutral text-neutral-content py-16">
	<div class="hero-content text-center">
		<div class="max-w-xl">
			<h2 class="text-3xl font-bold">Ready to Join the Plumas Disc Golf Family?</h2>
			<p class="mt-2">Make new friends, play more disc golf, and support our local courses.</p>
			<a href="/membership" class="btn btn-primary mt-6">Join the Club</a>
		</div>
	</div>
</div>