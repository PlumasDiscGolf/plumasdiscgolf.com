<script>
	import { Navbar, NavDropdown, Footer, Link, Button, Stack } from 'glideui';
	import PageTransition from './transition.svelte';
	import logoImg from '$lib/images/header_logo.png';
	import 'glideui/tokens/index.css';
	// import '../app.css';
	let { children, data } = $props();
</script>

<div class="min-h-screen">
	<Navbar tone="dark" sticky style="font-size: var(--foont-size-sm); font-weight: var(--font-weight-semibold);">
		{#snippet brand()}
			<a href="/" aria-label="logo"><img src={logoImg} alt="Plumas Disc Golf's Logo" height="48px" /></a>
		{/snippet}
		{#snippet links()}
			<Link href="/membership" variant="subtle">Membership</Link>
			<NavDropdown
				label="Events"
				items={[
					{ href: '/events/calendar', label: 'Calendar' },
					{ href: '/events', label: 'Event Listing' },
					{ href: '/events/bag-tags', label: 'Bag Tags Leagues' },
					{ href: '/events/putting-league', label: 'Putting League' },
					{ href: '/events/plumas-series', label: 'Plumas Series' }
				]}
			/>
			<Link href="/courses" variant="subtle">Courses</Link>
			<NavDropdown
				label="Rules"
				items={[
					{ href: '/rules/disc-golf', label: 'Rules of Disc Golf' },
					{ href: '/rules/club', label: 'Club Rules' },
					{ href: '/rules/bag-tags', label: 'Bag Tags League Rules' },
					{ href: '/rules/putting-league', label: 'Putting League Rules' },
					{ href: '/rules/plumas-series', label: 'Plumas Series Rules' }
				]}
			/>
			<Link href="/board" variant="subtle">Board</Link>
			<Link href="/donate" variant="subtle">Donate</Link>
			<Link href="/about" variant="subtle">About</Link>
		{/snippet}
		{#snippet actions()}
			<Button variant="primary" size="md">Join Now</Button>
		{/snippet}
	</Navbar>
	<main class="p-4">
		<PageTransition url={data.url}>
			{@render children?.()}
		</PageTransition>
	</main>
	<Footer tone="dark">
		<Stack direction="row" justify="between" align="center" wrap gap={4}>
			<a href="/login"><img src={logoImg} alt="Plumas Disc Golf's Logo" height="48px" /></a>
			<span style="font-size: var(--font-size-sm)">© 2026 Plumas Disc Golf - All rights reserved</span>

			<Stack direction="row" gap={2}>
				<a href="https://facebook.com/plumasdiscgolf" aria-label="plumas disc golf facebook page" target="_blank"
					><svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="35" height="35" viewBox="0,0,256,256">
						<g fill="#ffffff" fill-rule="nonzero" stroke="none" stroke-width="1" stroke-linecap="butt" stroke-linejoin="miter" stroke-miterlimit="10" stroke-dasharray="" stroke-dashoffset="0" font-family="none" font-weight="none" font-size="none" text-anchor="none" style="mix-blend-mode: normal"
							><g transform="scale(10.66667,10.66667)"><path d="M17,3h-10c-2.209,0 -4,1.791 -4,4v10c0,2.209 1.791,4 4,4h5.621v-6.961h-2.343v-2.725h2.343v-2.005c0,-2.324 1.421,-3.591 3.495,-3.591c0.699,-0.002 1.397,0.034 2.092,0.105v2.43h-1.428c-1.13,0 -1.35,0.534 -1.35,1.322v1.735h2.7l-0.351,2.725h-2.365v6.965h1.586c2.209,0 4,-1.791 4,-4v-10c0,-2.209 -1.791,-4 -4,-4z"></path></g></g
						>
					</svg></a
				>
				<a href="https://instagram.com/plumasdiscgolf" aria-label="plumas disc golf instagram page" target="_blank"
					><svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="35" height="35" viewBox="0,0,256,256">
						<g fill="#ffffff" fill-rule="nonzero" stroke="none" stroke-width="1" stroke-linecap="butt" stroke-linejoin="miter" stroke-miterlimit="10" stroke-dasharray="" stroke-dashoffset="0" font-family="none" font-weight="none" font-size="none" text-anchor="none" style="mix-blend-mode: normal"
							><g transform="scale(10.66667,10.66667)"><path d="M8,3c-2.761,0 -5,2.239 -5,5v8c0,2.761 2.239,5 5,5h8c2.761,0 5,-2.239 5,-5v-8c0,-2.761 -2.239,-5 -5,-5zM18,5c0.552,0 1,0.448 1,1c0,0.552 -0.448,1 -1,1c-0.552,0 -1,-0.448 -1,-1c0,-0.552 0.448,-1 1,-1zM12,7c2.761,0 5,2.239 5,5c0,2.761 -2.239,5 -5,5c-2.761,0 -5,-2.239 -5,-5c0,-2.761 2.239,-5 5,-5zM12,9c-1.65685,0 -3,1.34315 -3,3c0,1.65685 1.34315,3 3,3c1.65685,0 3,-1.34315 3,-3c0,-1.65685 -1.34315,-3 -3,-3z"></path></g></g
						>
					</svg></a
				>
				<a href="https://x.com/plumasdiscgolf" aria-label="twitter / x page" target="_blank"
					><svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="35" height="35" viewBox="0,0,256,256">
						<g fill="#ffffff" fill-rule="nonzero" stroke="none" stroke-width="1" stroke-linecap="butt" stroke-linejoin="miter" stroke-miterlimit="10" stroke-dasharray="" stroke-dashoffset="0" font-family="none" font-weight="none" font-size="none" text-anchor="none" style="mix-blend-mode: normal"><g transform="scale(10.66667,10.66667)"><path d="M10.053,7.988l5.631,8.024h-1.497l-5.621,-8.024zM21,21h-18v-18h18zM17.538,17l-4.186,-5.99l3.422,-4.01h-1.311l-2.704,3.16l-2.207,-3.16h-3.85l3.941,5.633l-3.737,4.367h1.333l3.001,-3.516l2.458,3.516z"></path></g></g>
					</svg></a
				>
			</Stack>
		</Stack>
	</Footer>
</div>

