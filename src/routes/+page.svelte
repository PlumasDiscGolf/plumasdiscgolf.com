<script>
	import { format, parseISO, isSameDay } from 'date-fns';
	import { Hero, Container, Button, Stack, Card, Surface } from 'glideui';
	import Map from '@lucide/svelte/icons/map';
	import Calendar from '@lucide/svelte/icons/calendar';
	import Users from '@lucide/svelte/icons/users';
	import Ticket from '@lucide/svelte/icons/ticket';
	import CircleCheck from '@lucide/svelte/icons/circle-check';
	import pioneerImg from '$lib/images/Pioneer.jpg';
	import cascadesImg from '$lib/images/Cascades.jpg';
	import { env } from '$env/dynamic/public';
	import * as config from '$lib/config.js';

	let { data } = $props();
</script>

<svelte:head>
	<title>{config.title} - Homepage</title>
</svelte:head>

<!-- Hero -->
<Container maxWidth="lg" style="padding: var(--space-2);">
	<Hero minHeight="md" image={pioneerImg}>
		<Container maxWidth="md">
			<h2 style="font-size: var(--font-size-3xl); margin: 0 0 var(--space-3) 0; font-weight: 900;">Plumas Disc Golf</h2>
			<Surface tone="neutral" rounded="lg">
				<p>Serving disc golfers in the Plumas County area with well-loved courses, a full season of events, and a club that feels like family. Join us on the course.</p>
			</Surface>
			<div style="padding-bottom: 12px"></div>
			<Stack direction="row" justify="center">
				<Button variant="primary">Join the Club</Button>
				<Button variant="secondary">See Upcoming Events</Button>
			</Stack>
		</Container>
	</Hero>
	<Surface tone="muted">
		<Stack align="center" gap={0}>
			<h2>What Plumas Disc Golf Offers</h2>
			<p>A club run by local players, for local players - courses to play, events to compete in, and a community to be part of.</p>
		</Stack>
		<div style="padding-bottom: 16px"></div>
		<Stack direction="row" justify="between">
			<Card title="Local Courses" align="center">
				{#snippet media()}
					<Map size={64} color="var(--color-accent)" strokeWidth={2} />
				{/snippet}
				Two well-maintained courses in the Plumas County area, open to players of every skill level.
				{#snippet footer()}
					<Button href="/courses" variant="secondary" size="sm">View Courses</Button>
				{/snippet}
			</Card>
			<Card title="Events & Leagues" align="center">
				{#snippet media()}
					<Calendar size={64} color="var(--color-accent)" strokeWidth={2} />
				{/snippet}
				Bag Tag League play, the Plumas Series, and one-off tournaments throughout the season.
				{#snippet footer()}
					<Button href="/events" variant="secondary" size="sm">View Events</Button>
				{/snippet}
			</Card>
			<Card title="A Real Community" align="center">
				{#snippet media()}
					<Users size={64} color="var(--color-accent)" strokeWidth={2} />
				{/snippet}
				Volunteers, board members, and donors who keep our courses in great shape year-round.
				{#snippet footer()}
					<Button href="/about" variant="secondary" size="sm">About Us</Button>
				{/snippet}
			</Card>
		</Stack>
	</Surface>
	<Container maxWidth="l">
	<Card layout="horizontal" title="Why Become a Member?">
		{#snippet media()}
			<Ticket size="200" color="var(--color-accent)" strokeWidth={1.1}></Ticket>
		{/snippet}
		<ul style="list-style-type: none;">
			<li><CircleCheck size={14} color="var(--color-primary)"></CircleCheck> A Custom PDG Bag Tag</li>
			<li><CircleCheck size={14} color="var(--color-primary)"></CircleCheck> Entry into all Bag Tag Leage events for the year</li>
			<li><CircleCheck size={14} color="var(--color-primary)"></CircleCheck> Discounted entru into all other club events for the season</li>
			<li><CircleCheck size={14} color="var(--color-primary)"></CircleCheck> A Youth Membership option for players under 18</li>
		</ul>
		{#snippet footer()}
			<p style="font-weight: bold;">Ready to make it official?</p>
			<Button href="/membership" variant="primary">Become a Member</Button>
		{/snippet}
	</Card>
</Container>
	<div style="padding-bottom: 32px"></div>
	<Surface tone="muted">
		<Stack align="center">
			<h2>Our Courses</h2>
		</Stack>
		<Stack direction="row" gap={4} equal>
			<Card title="Pioneer DGC" image={pioneerImg} imageAlt="View from hole 1's tee">
				<Stack direction="row" equal>
					<p>9 Holes • Par 28</p>

					<Button href="/courses/390f1cfs6hb80b0" variant="accent">Course Info</Button>
				</Stack>
			</Card>
			<Card title="Cascades DGC" image={cascadesImg} imageAlt="View from hole 1's tee">
				<Stack direction="row" equal>
					<p>18 Holes • Par 57</p>
					<Button href="/courses/0hwk22l0al0sr9m" variant="accent">Course Info</Button>
				</Stack>
			</Card>
		</Stack>
	</Surface>
</Container>
