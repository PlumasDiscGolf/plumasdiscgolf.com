<script>
	import * as config from '$lib/config.js';
</script>

<svelte:head>
	<title>Membership Page - {config.title}</title>
	<script src="https://zeffy-scripts.s3.ca-central-1.amazonaws.com/embed-form-script.min.js"></script>
</svelte:head>

<div class="hero bg-base-200">
	<div class="hero-content py-12 text-center">
		<div class="max-w-md">
			<h1 class="text-5xl font-bold">Membership</h1>
		</div>
	</div>
</div>

<div class="container mx-auto px-4 py-8">
	<div class="flex flex-col gap-6 lg:flex-row">

		<!-- Left column: description -->
		<div class="lg:w-2/5">
			<div class="card bg-base-100 shadow-lg shadow-gray-400">
				<div class="card-body lg:prose lg:min-h-[800px]">
  				<div class="my-4 w-full text-pretty">
        		<p class="my-4 font-semibold text-secondary">Becoming a Club Member is one of the best ways to support Plumas Disc Golf. Memberships are one of our primary fundraising sources each year. Thank you for your support!</p>
        		<p class="font-bold">The Standard Membership includes:</p>
        		<ul class="ml-3">
         			<li>A Custom PDG Bag Tag</li>
         			<li>Entry into all bag tag league events for the year</li>
         			<li>Discounted entry into club events for the year</li>
        		</ul>
        		<p class="font-bold">The Youth Membership includes everything in the Standard Membership and is available to players who are 18 years old or younger.</p>
        		<ul class="ml-3">
         			<li> Eligibility follows the PDGA's age-based division guidelines — your age is determined by your year of birth, not your birthday. Any player who turns 18 or younger during the current calendar year qualifies.</li>
        		</ul>
         	</div>
				</div>
			</div>
		</div>

		<!-- Right column: membership embed -->
		<div class="lg:w-3/5">
			<div class="card overflow-hidden bg-base-100 shadow-lg shadow-gray-400">
				<div class="card-body p-0">
					<iframe
						title="Membership Powered by Zeffy"
						style="border: 0; width: 100%; height: 800px; display: block;"
						src="https://www.zeffy.com/embed/ticketing/club-membership--2025"
						allowpaymentrequest
						allowtransparency="true"
					></iframe>
				</div>
			</div>
		</div>

	</div>
</div>
