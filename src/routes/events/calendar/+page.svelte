<script>
	/** @type {import('./$types').PageData} */
</script>

<!-- Hero Section -->
<div class="hero bg-base-200">
	<div class="hero-content py-12 text-center">
		<div class="max-w-md">
			<h1 class="text-5xl font-bold">Calendar</h1>
		</div>
	</div>
</div>
<div class="mt-6 flex w-full">
	<div class="responsiveCal mx-auto">
		<div class="hidden md:block">
			<!-- svelte-ignore a11y_missing_attribute -->
			<iframe
				src="https://calendar.google.com/calendar/embed?height=600&wkst=1&bgcolor=%231abc9c&ctz=America%2FLos_Angeles&showTitle=1&showCalendars=0&showDate=1&src=Y19yb21mcjVtaWRzaGIxdm9uODVxZm92M29pOEBncm91cC5jYWxlbmRhci5nb29nbGUuY29t&color=%23009688"
				style="border: 0"
				width="800"
				height="600"
				frameborder="0"
				scrolling="no"
			></iframe>
		</div>
		<div class="md:hidden">
			<!-- svelte-ignore a11y_missing_attribute -->
			<iframe
				src="https://calendar.google.com/calendar/embed?height=600&wkst=1&bgcolor=%231abc9c&ctz=America%2FLos_Angeles&mode=AGENDA&showTabs=0&showCalendars=0&src=Y19yb21mcjVtaWRzaGIxdm9uODVxZm92M29pOEBncm91cC5jYWxlbmRhci5nb29nbGUuY29t&color=%23009688"
				style="border: 0"
				width="300"
				height="500"
				frameborder="0"
				scrolling="no"
			></iframe>
		</div>
	</div>
</div>
