<!-- src/routes/courses/[id]/+page.svelte -->

<script >
	import { Icon, Calendar, Map, InformationCircle, Sparkles, MapPin } from "svelte-hero-icons"
	import { env } from '$env/dynamic/public';
	let { data } = $props();

	let course = $derived(data.course);

	let fullAddress = $derived(
		[course.address, course.city, [course.state, course.zipCode].filter(Boolean).join(' ')].filter(Boolean).join(', ')
	);
</script>

<!-- Hero Section -->
<div class="hero relative min-h-[40vh]" style="background-image: url({env.PUBLIC_POCKETBASE_FILES_URL}/api/files/{course.collectionId}/{course.id}/{course.image}?download=1)">
	<div class="hero-overlay bg-opacity-60"></div>
	<div class="hero-content text-center text-neutral-content">
		<div class="max-w-md">
			<h1 class="mb-5 text-5xl font-bold">{course.name}</h1>
		</div>
	</div>
</div>

<div class="container mx-auto px-4 py-8">
	<!-- Quick Info Cards -->
	<div class="mb-8 grid grid-cols-1 gap-4 md:grid-cols-3">
		<!-- Location Card -->
		<div class="card bg-base-100 shadow-lg shadow-gray-400">
			<div class="card-body">
				<div class="flex items-center gap-2">
					<Icon src={MapPin} class="size-6"/>
					<h3 class="card-title">Location</h3>
				</div>
				<p>{fullAddress}</p>
				{#if course.latitude && course.longitude}
					<p>{course.latitude}, {course.longitude}</p>
				{/if}

				<!-- <div class="card-actions">
					<a href={course.directions} target="_blank" class="btn btn-primary btn-sm"
						>Get Directions</a
					>
				</div> -->
			</div>
		</div>

		<!-- Course Info Card -->
		<div class="card bg-base-100 shadow-lg shadow-gray-400">
			<div class="card-body">
				<div class="flex items-center gap-2">
					<Icon src={InformationCircle} class="size-6"/>
					<h3 class="card-title">Course Info</h3>
				</div>
				<ul class="space-y-1">
					<li>Holes: {course.numberOfHoles}</li>
					<li>Par: {course.par}</li>
					<li>Length: {course.lengthInFeet} ft / {Math.floor(course.lengthInFeet/3.28)} m</li>
				</ul>
			</div>
		</div>

		<!-- Course Type Card -->
		<div class="card bg-base-100 shadow-lg shadow-gray-400">
			<div class="card-body">
				<div class="flex items-center gap-2">
					<Icon src={Sparkles} class="size-6"/>
					<h3 class="card-title">Course Type</h3>
				</div>
				<div class="">
					{#each course.tags as tag}
						<p class="">{tag}</p>
					{/each}
				</div>
			</div>
		</div>
	</div>

	<!-- Course Description -->
	<div class="card mb-8 bg-base-100 shadow-lg shadow-gray-400">
		<div class="card-body">
			<h2 class="card-title">About the Course</h2>
			<p>{@html course.description}</p>
		</div>
	</div>
</div>