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

<div class="my-4 w-full text-center">
	<p class="mx-auto my-4 max-w-[72ch] font-semibold text-secondary">We are now processing online memberships through Zeffy, our non-profit financial partner. They do not take any fees from our transactions, allowing us to use your full payment to help achieve our goals.</p>
</div>

<div class="grid">
	<div class="m-auto max-w-[72ch] px-4">
		<p class="my-4 font-semibold">Becoming a Club Member is one of the best ways to support Plumas Disc Golf. Memberships are one of our primary fundraising sources each year. Thank you for your support!</p>
		<p class="font-semibold">The Standard Membership includes:</p>
		<ul class="ml-3">
			<li>A Custom PDG Bag Tag</li>
			<li>Entry into all bag tag league events for the year</li>
			<li>Discounted entry into club events for the year</li>
		</ul>
		<p class="font-semibold">The Youth Membership includes everything in the Standard Membership and is available to players who are 18 years old or younger.</p>
		<ul class="ml-3">
			<li> Eligibility follows the PDGA's age-based division guidelines — your age is determined by your year of birth, not your birthday. Any player who turns 18 or younger during the current calendar year qualifies.</li>
		</ul>
	</div>

	<div class="w-full px-2 pt-8">
		<iframe
			title="Membership form powered by Zeffy"
			src="https://www.zeffy.com/embed/ticketing/club-membership--2025"
			style="width: 100%; height: 550px; border: none;"
			allowpaymentrequest
			allowTransparency="true"
			scrolling="no"
		></iframe>
	</div>
</div>
