<script>
	let { data } = $props();
	let post = $derived(data.post);
</script>

<!-- Hero Section -->
<div class="hero bg-base-200">
	<div class="hero-content py-12 text-center">
		<div class="max-w-lg">
			<h1 class="text-5xl font-bold">{post.title}</h1>
		</div>
	</div>
</div>

<!-- Main Content -->
<main class="py-12">
	<article class="container mx-auto px-4">
		<div class="mx-auto max-w-4xl">
			<!-- Article Content -->
			<div class="prose prose-lg max-w-none">
				{@html post.content}
			</div>

			<!-- Tags -->
			<div class="flex gap-2">
				{#each post.categories as category}
					<div class="badge badge-secondary">{category}</div>
				{/each}
			</div>
		</div>
	</article>
</main>
