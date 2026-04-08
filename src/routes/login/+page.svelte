<script>
    import { enhance } from '$app/forms';
    import { Icon, XCircle } from 'svelte-hero-icons'; // Assuming you want an icon for errors
    // No need for preventDefault import if using SvelteKit actions correctly

    let { form } = $props(); // For receiving errors from the server action

    let loginEmail = $derived(form?.email || ''); // Pre-fill email on error
    let loginPassword = $state('');
    let loginInProgress = $state(false);

    // Clear password if form had an error and email was prefilled
    $effect(() => {
        if (form?.loginError && form?.email) {
            loginPassword = '';
        }
    });
</script>

<div class="container mx-auto px-4 py-16 flex justify-center items-center min-h-screen">
    <div class="card w-full max-w-md bg-base-100 shadow-xl">
        <div class="card-body">
            <h1 class="text-3xl font-bold text-center mb-6 text-base-content">Admin Login</h1>

            {#if form?.loginError}
                <div class="alert alert-error mb-4 text-sm p-3 shadow-lg">
                    <div>
                        <Icon src={XCircle} class="h-5 w-5"></Icon>
                        <span>{form.loginError}</span>
                    </div>
                    </div>
            {/if}

            <form method="POST" action="?/login" use:enhance={() => {
                loginInProgress = true;
                return async ({ update }) => {
                    await update({ reset: false }); // reset:false to keep bound values unless action returns new ones
                    loginInProgress = false;
                    // If login successful, action will redirect, so this page won't show updated form values.
                    // If error, `form` prop updates, and password should be cleared.
                    if (form?.loginError) {
                        loginPassword = ''; // Always clear password on error
                    }
                };
            }} class="space-y-4">
                <div class="form-control">
                    <label class="label" for="loginEmailInput">
                        <span class="label-text">Email</span>
                    </label>
                    <input name="email" type="email" id="loginEmailInput" placeholder="admin@example.com" class="input input-bordered w-full" bind:value={loginEmail} required />
                </div>
                <div class="form-control">
                    <label class="label" for="loginPasswordInput">
                        <span class="label-text">Password</span>
                    </label>
                    <input name="password" type="password" id="loginPasswordInput" placeholder="••••••••" class="input input-bordered w-full" bind:value={loginPassword} required />
                </div>
                <div class="form-control mt-6">
                    <button type="submit" class="btn btn-primary w-full" disabled={loginInProgress}>
                        {#if loginInProgress}
                            <span class="loading loading-spinner loading-sm"></span>
                        {/if}
                        Login
                    </button>
                </div>
            </form>
        </div>
    </div>
</div>
