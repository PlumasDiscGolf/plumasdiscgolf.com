<script >
	import * as config from '$lib/config';

</script>

<svelte:head>
	<title>Donate - {config.title}</title>
	<!-- Zeffy Script -->
	<script src="https://zeffy-scripts.s3.ca-central-1.amazonaws.com/embed-form-script.min.js"></script>
</svelte:head>

<!-- Hero Section -->
<div class="hero bg-base-200">
	<div class="hero-content py-12 text-center">
		<div class="max-w-md">
			<h1 class="text-5xl font-bold">Donate</h1>
		</div>
	</div>
</div>

<div class="my-4 w-full text-center">
	<p class="mx-auto my-4 max-w-[72ch] font-semibold text-secondary">If you are interested in making a donation to Plumas Disc Golf, thank you. Donations will help us maintain our current courses, create new courses in Plumas County, and support other projects. We are always working to better our community through the lens of disc golf, and your donation will help us acheive our goals. Thank you for your consideration.</p>
</div>

<div class="flex flex-col">
	<!-- <div class="mt-4 flex w-full justify-center">
		<button zeffy-form-link="https://www.zeffy.com/embed/donation-form/donate-to-plumas-disc-golf?modal=true" class="p btn btn-secondary">Donate to Plumas Disc Golf</button>
	</div> -->
	<div style="position:relative;overflow:hidden;height:1200px;width:100%;">
		<iframe title="Donation form powered by Zeffy" style="position: absolute; border: 0; top:0;left:0;bottom:0;right:0;width:100%;height:100%" src="https://www.zeffy.com/embed/donation-form/donate-to-plumas-disc-golf" allowpaymentrequest allowTransparency="true"></iframe>
	</div>
</div>
