<!-- src/routes/courses/+page.svelte -->

<script >
	import { env } from '$env/dynamic/public';
	import * as config from '$lib/config.js';

	let { data } = $props();
</script>

<svelte:head>
	<title>{config.title} - Courses Page</title>
</svelte:head>

<!-- Hero Section -->
<div class="hero bg-base-200">
	<div class="hero-content py-12 text-center">
		<div class="max-w-md">
			<h1 class="text-5xl font-bold">Courses</h1>
		</div>
	</div>
</div>

<!-- courses List -->
<div class="container mx-auto px-4 py-8">
	<!-- Course Card -->
	{#each data.courses as course}
		<div class="card mb-8 md:max-h-72 bg-base-100 shadow-lg shadow-gray-400 lg:card-side">
			<figure class="w-full lg:w-1/3">
				<img
					src="{env.PUBLIC_POCKETBASE_FILES_URL}/api/files/{course.collectionId}/{course.id}/{course.image}?download=1"
					alt="course banner"
					class="h-full w-full object-cover"
				/>
			</figure>
			<div class="card-body lg:w-2/3">
				<h2 class="card-title text-2xl">{course.name}</h2>
				<div class="flex items-center gap-2 text-sm">
					<svg
						xmlns="http://www.w3.org/2000/svg"
						class="h-4 w-4"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 13l5.447-2.724A1 1 0 0021 16.382V5.618a1 1 0 00-1.447-.894L15 7m0 13V7m0 0L9 4"
						/>
					</svg>
					<span>{course.numberOfHoles} Holes</span>
					<span class="mx-2">•</span>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						class="h-4 w-4"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M17.657 16.657L13.414 20.9a2 2 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
						/>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
						/>
					</svg>
					<span>{course.cityState}</span>
				</div>
				<div class="md:h-96">
					<p>{@html course.description.substring(0, 250)} ...</p>
				</div>
				<div class="flex gap-2">
					{#each course.tags as tag}
						<div class="badge badge-outline">{tag}</div>
					{/each}
				</div>
				<div class="card-actions items-center justify-end">
					<a href="/courses/{course.id}" class="btn btn-info">Course Info</a>
				</div>
			</div>
		</div>
	{/each}
</div>