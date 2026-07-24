<script>
	import {Icon, Bars3} from 'svelte-hero-icons'
	import logoImg from '$lib/images/header_logo.png';
</script>

<div class="navbar bg-neutral text-neutral-content uppercase">
	<div class="navbar-start">
		<!-- Menu for small screens -->
		<div class="dropdown">
			<div tabindex="0" role="button" class="btn btn-ghost font-semibold text-white lg:hidden">
				<Icon src={Bars3} class="h-5 w-5 justify-self-end"></Icon>
			</div>
			<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
			<ul tabindex="0" class="menu dropdown-content menu-sm rounded-box bg-neutral z-[1] mt-3 w-52 p-2 font-semibold text-white shadow">
				<li><a href="/membership" aria-label="membership link">Membership</a></li>
				<li class=""><a href="/events" aria-label="events link">Events</a></li>
				<li class="pl-3"><a href="/events/calendar" aria-label="calendar link">Calendar</a></li>
				<li class="pl-3"><a href="/events/bag-tags" aria-label="bag tags link">Bag Tags League</a></li>
				<li class="pl-3"><a href="/events/plumas-series" aria-label="plumas series link">Plumas Series</a></li>
				<li><a href="/courses" aria-label="courses link">Courses</a></li>
				<li><a href="/rules" aria-label="club and events rules link">Rules</a></li>
				<li class="pl-3"><a href="/rules/disc-golf">Rules of Disc Golf</a></li>
				<li class="pl-3"><a href="/rules/disc-golf">Club Rules</a></li>
				<li class="pl-3"><a href="/rules/disc-golf">Bag Tags Rules</a></li>
				<li class="pl-3"><a href="/rules/disc-golf">Plumas Series Rules</a></li>
				<li><a href="/board" aria-label="board link">Board</a></li>
				<li><a href="/donate" aria-label="donate link">Donate</a></li>
				<li><a href="/about" aria-label="about link">About</a></li>
				<li><a href="https://shop.plumasdiscgolf.com" aria-label="shop link">Shop</a></li>
			</ul>
		</div>
		<!-- Logo -->
		<a href="/" class="btn btn-ghost hidden lg:block" aria-label="logo"><img src={logoImg} alt="Plumas Disc Golf's Logo" class="max-h-full scale-125 hover:scale-105" /></a>
	</div>
	<div class="navbar-center">
		<div>
			<a href="/" class="btn btn-ghost lg:hidden" aria-label="logo"><img src={logoImg} alt="Plumas Disc Golf's Logo" class="max-h-full hover:scale-105" /></a>
		</div>
		<!-- Menu for Larger screens -->
		<ul class="menu menu-horizontal clear hidden px-1 font-semibold text-white lg:flex">
			<li><a href="/membership" aria-label="membership link">Membership</a></li>
			<li>
				<a href="/events" aria-label="events link">Events</a>
				<ul class="clear bg-neutral mt-4 rounded-xl py-2">
					<li><a href="/events/calendar">Calendar</a></li>
					<li><a href="/events">Event Listing</a></li>
					<li><a href="/events/bag-tags">Bag Tags Leagues</a></li>
					<li><a href="/events/plumas-series">Plumas Series</a></li>
				</ul>
			</li>
			<li>
				<a href="/courses" aria-label="events link">Courses</a>
				<ul class="clear bg-neutral mt-4 rounded-xl py-2">
					<li><a href="/courses/390f1cfs6hb80b0">Pioneer DGC</a></li>
					<li><a href="/courses/0hwk22l0al0sr9m">Cascades DGC</a></li>
				</ul>
			</li>
			<li>
				<div aria-label="club and events rules menu">Rules</div>
				<ul class="clear bg-neutral mt-4 rounded-xl py-2">
					<li><a href="/rules/disc-golf">Rules of Disc Golf</a></li>
					<li><a href="/rules/club">Club Rules</a></li>
					<li><a href="/rules/bag-tags">Bag Tag League Rules</a></li>
					<li><a href="/rules/plumas-series">Plumas Series Rules</a></li>
				</ul>
			</li>
			<li><a href="/board" aria-label="board link">Board</a></li>
			<li><a href="/donate" aria-label="donate link">Donate</a></li>
			<li><a href="/about" aria-label="about link">About</a></li>
			<li><a href="https://shop.plumasdiscgolf.com" aria-label="shop link">Shop</a></li>
		</ul>
	</div>
	<div class="navbar-end">
		<a href="/membership" class="btn btn-info mr-4 uppercase">Join Now</a>
	</div>
</div>

<style>
	/** ALL UL */
	.navbar-center ul {
		list-style: none;

		z-index: 10;
	}
	/** ALL LI */
	.navbar-center ul li {
		position: relative;
	}
	/** FIRST LEVEL LI */
	.navbar-center > ul > li {
		float: left;
	}
	.navbar-center li ul {
		display: none;
		position: absolute;
		top: 20px;
		left: 0;
		width: 200px;
	}
	.navbar-center li:hover ul {
		display: block;
	}
	.clear {
		_zoom: 1;
	}
	.clear:after {
		content: '';
		clear: both;
		display: block;
	}
</style>
