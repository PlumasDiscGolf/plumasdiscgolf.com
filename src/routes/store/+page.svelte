<script >
	import * as config from '$lib/config';

</script>

<svelte:head>
	<title>Store - {config.title}</title>
</svelte:head>

<!-- Hero Section -->
<div class="hero bg-base-200">
	<div class="hero-content py-12 text-center">
		<div class="max-w-md">
			<h1 class="text-5xl font-bold">Store</h1>
		</div>
	</div>
</div>

<div class="container mx-auto px-4 py-8">
	<div class="flex flex-col gap-6 lg:flex-row">

		<!-- Left column: description -->
		<div class="lg:w-1/3">
			<div class="card border border-gray-400 bg-base-100 shadow-lg shadow-gray-400">
				<div class="card-body">
					<h2 class="card-title text-2xl">Welcome to the PDG Store</h2>
					<p class="text-secondary font-semibold">Welcome to our online shop! Every purchase you make directly supports our mission. Browse our selection and find the perfect items for you. By shopping with us, you help us achieve our goals and positively impact our community. Thank you for supporting our mission — your contribution is invaluable. Happy shopping!</p>
				</div>
			</div>
		</div>

		<!-- Right column: store embed -->
		<div class="lg:w-2/3">
			<div class="card overflow-hidden border border-gray-400 bg-base-100 shadow-lg shadow-gray-400">
				<div class="card-body p-0">
					<iframe
						title="Plumas Disc Golf Store"
						style="border: 0; width: 100%; height: 3000px; display: block;"
						src="https://www.zeffy.com/embed/ticketing/plumas-disc-golf"
						allowpaymentrequest
						allowtransparency="true"
					></iframe>
				</div>
			</div>
		</div>

	</div>
</div>
