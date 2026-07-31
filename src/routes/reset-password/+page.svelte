<script>
	import { enhance } from '$app/forms';
	import { Icon, XCircle } from 'svelte-hero-icons';
	import * as config from '$lib/config';

	let { data, form } = $props();

	let token = $state(data.token);
	let password = $state('');
	let passwordConfirm = $state('');
	let submitting = $state(false);

	$effect(() => {
		if (form?.token) {
			token = form.token;
		}
	});
</script>

<svelte:head>
	<title>Reset Password - {config.title}</title>
</svelte:head>

<div class="container mx-auto px-4 py-16 flex justify-center items-center min-h-screen">
	<div class="card w-full max-w-md bg-base-100 shadow-xl">
		<div class="card-body">
			<h1 class="text-3xl font-bold text-center mb-6 text-base-content">Set a New Password</h1>

			{#if !token}
				<div class="alert alert-error mb-4 text-sm p-3 shadow-lg">
					<Icon src={XCircle} size="20" />
					<span>This reset link is missing its token.</span>
				</div>
				<div class="text-center">
					<a href="/forgot-password" class="link link-primary">Request a new reset link</a>
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
							await update({ reset: false });
							submitting = false;
						};
					}}
					class="space-y-4"
				>
					<input type="hidden" name="token" value={token} />

					<div class="form-control">
						<label class="label" for="newPasswordInput">
							<span class="label-text">New Password</span>
						</label>
						<input
							name="password"
							type="password"
							id="newPasswordInput"
							placeholder="••••••••"
							class="input input-bordered w-full"
							bind:value={password}
							required
						/>
					</div>
					<div class="form-control">
						<label class="label" for="confirmPasswordInput">
							<span class="label-text">Confirm New Password</span>
						</label>
						<input
							name="passwordConfirm"
							type="password"
							id="confirmPasswordInput"
							placeholder="••••••••"
							class="input input-bordered w-full"
							bind:value={passwordConfirm}
							required
						/>
					</div>
					<div class="form-control mt-6">
						<button type="submit" class="btn btn-primary w-full" disabled={submitting}>
							{#if submitting}
								<span class="loading loading-spinner loading-sm"></span>
							{/if}
							Update Password
						</button>
					</div>
				</form>
			{/if}
		</div>
	</div>
</div>