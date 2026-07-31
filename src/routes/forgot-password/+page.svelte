<script>
	import { enhance } from '$app/forms';
	import { Icon, XCircle, CheckCircle } from 'svelte-hero-icons';
	import * as config from '$lib/config';

	let { form } = $props();

	let email = $state('');
	let submitting = $state(false);

	$effect(() => {
		if (form?.email) {
			email = form.email;
		}
	});
</script>

<svelte:head>
	<title>Forgot Password - {config.title}</title>
</svelte:head>

<div class="container mx-auto px-4 py-16 flex justify-center items-center min-h-screen">
	<div class="card w-full max-w-md bg-base-100 shadow-xl">
		<div class="card-body">
			<h1 class="text-3xl font-bold text-center mb-2 text-base-content">Reset Your Password</h1>
			<p class="text-sm text-base-content/70 text-center mb-6">
				Enter your email and we'll send you a link to set a new password.
			</p>

			{#if form?.success}
				<div class="alert alert-success mb-4 text-sm p-3 shadow-lg">
					<Icon src={CheckCircle} size="20" />
					<span>
						If an account exists for {form.email}, a password reset link is on its way. Check your inbox
						(and spam folder) in the next few minutes.
					</span>
				</div>
				<div class="text-center">
					<a href="/login" class="link link-primary">Back to login</a>
				</div>
			{:else}
				{#if form?.error}
					<div class="alert alert-error mb-4 text-sm p-3 shadow-lg">
						<Icon src={XCircle} size="20" />
						<span>{form.error}</span>
					</div>
				{/if}

				<form
					method="POST"
					use:enhance={() => {
						submitting = true;
						return async ({ update }) => {
							await update();
							submitting = false;
						};
					}}
					class="space-y-4"
				>
					<div class="form-control">
						<label class="label" for="forgotEmailInput">
							<span class="label-text">Email</span>
						</label>
						<input
							name="email"
							type="email"
							id="forgotEmailInput"
							placeholder="admin@example.com"
							class="input input-bordered w-full"
							bind:value={email}
							required
						/>
					</div>
					<div class="form-control mt-6">
						<button type="submit" class="btn btn-primary w-full" disabled={submitting}>
							{#if submitting}
								<span class="loading loading-spinner loading-sm"></span>
							{/if}
							Send Reset Link
						</button>
					</div>
				</form>

				<div class="text-center mt-4">
					<a href="/login" class="link link-hover text-sm">Back to login</a>
				</div>
			{/if}
		</div>
	</div>
</div>