<script >
	import * as config from '$lib/config';

</script>

<svelte:head>
	<title>Donate - {config.title}</title>
</svelte:head>

<!-- Hero Section -->
<div class="hero bg-base-200">
	<div class="hero-content py-12 text-center">
		<div class="max-w-md">
			<h1 class="text-5xl font-bold">Donate</h1>
		</div>
	</div>
</div>

<div class="container mx-auto px-4 py-8">
	<div class="flex flex-col gap-6 lg:flex-row">

		<!-- Left column: description -->
		<div class="lg:w-2/5">
			<div class="card border border-gray-400 bg-base-100 shadow-lg shadow-gray-400">
				<div class="card-body lg:prose lg:min-h-[600px]">
  				<div class="my-4 w-full text-pretty">
  					<p class="my-4 font-semibold">If you're interested in making a donation to Plumas Disc Golf, thank you — it means a lot to us. Your support goes directly toward maintaining our current courses, developing new ones across Plumas County, and funding the events and programs that make this community what it is.</p>
        		<p class="my-4 font-semibold">Since our founding in 2018, we've grown from a single course in Quincy into an active non-profit with leagues, tournaments, and a second course on the way. None of that happens without people who believe in what we're building — and every donation, big or small, helps us keep that momentum going.</p>
        		<p class="my-4 font-semibold">We envision a Plumas County where disc golf is accessible to everyone, regardless of age or skill level. Whether you're a longtime player or you've never thrown a disc, this community has a place for you — and your generosity helps make sure it stays that way.</p>
         	</div>
				</div>
			</div>
		</div>

		<!-- Right column: membership embed -->
		<div class="lg:w-3/5">
			<div class="card overflow-hidden border border-gray-400 bg-base-100 shadow-lg shadow-gray-400">
				<div class="card-body p-0">
					<iframe
						title="Donations Powered by Zeffy"
						style="border: 0; width: 100%; height: 600px; display: block;"
						src="https://www.zeffy.com/embed/donation-form/donate-to-plumas-disc-golf"
						allowpaymentrequest
						allowtransparency="true"
					></iframe>
				</div>
			</div>
		</div>

	</div>
</div>
