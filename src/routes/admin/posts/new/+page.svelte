<script>
    import { enhance } from '$app/forms';
    import { Icon, CheckCircle, XCircle, ArrowUturnLeft } from 'svelte-hero-icons';

    let { form } = $props();

    const CATEGORY_OPTIONS = ['Club News', 'Board', 'Website Updates', 'Cascades DGC', 'Pioneer DGC', 'Event'];

    // bind:value requires $state, not $derived.
    let title = $state('');
    let content = $state('');
    let published = $state(false);
    let publishedDate = $state(new Date().toISOString().slice(0, 10));
    let selectedCategories = $state([]);

    $effect(() => {
        if (form) {
            title = form.title ?? title;
            content = form.content ?? content;
            published = form.published ?? published;
            publishedDate = form.publishedDate ?? publishedDate;
            selectedCategories = form.categories ?? selectedCategories;
        }
    });

    function toggleCategory(cat) {
        if (selectedCategories.includes(cat)) {
            selectedCategories = selectedCategories.filter((c) => c !== cat);
        } else {
            selectedCategories = [...selectedCategories, cat];
        }
    }

    let isSaving = $state(false);
</script>

<div class="container mx-auto px-4 py-8 max-w-3xl">
    <div class="mb-6 flex items-center justify-between">
        <h1 class="text-3xl font-bold text-base-content">Add New Post</h1>
        <a href="/admin/posts" class="btn btn-ghost btn-sm">
            <Icon src={ArrowUturnLeft} class="h-5 w-5" />
            Back to Admin
        </a>
    </div>

    {#if form?.error}
        <div class="alert alert-error mb-4 shadow-md">
            <div><Icon src={XCircle} class="h-6 w-6 mr-2 shrink-0"></Icon><span>{form.error}</span></div>
        </div>
    {/if}
    {#if form?.fieldErrors}
        <div class="alert alert-warning mb-4 shadow-md">
            <ul class="list-disc pl-5">
                {#each Object.entries(form.fieldErrors) as [field, errorMsg]}
                    <li><strong>{field.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}:</strong> {errorMsg}</li>
                {/each}
            </ul>
        </div>
    {/if}

    <form method="POST" action="?/createPost" use:enhance={() => {
        isSaving = true;
        return async ({ update }) => {
            await update();
            isSaving = false;
        };
    }} class="card bg-base-200 shadow-xl">
        <div class="card-body space-y-4">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="form-control">
                    <label class="label" for="titleInput"><span class="label-text">Title*</span></label>
                    <input name="title" type="text" id="titleInput" class="input input-bordered w-full" bind:value={title} required />
                </div>
                <div class="form-control">
                    <label class="label" for="publishedDateInput"><span class="label-text">Published Date</span></label>
                    <input name="publishedDate" type="date" id="publishedDateInput" class="input input-bordered w-full" bind:value={publishedDate} />
                </div>
            </div>

            <div class="form-control">
                <label class="label" for="contentTextarea"><span class="label-text">Content</span></label>
                <textarea name="content" id="contentTextarea" class="textarea textarea-bordered h-48 w-full" bind:value={content}></textarea>
            </div>

            <div class="form-control">
                <span class="label-text">Categories</span>
                <div class="flex flex-wrap gap-3 mt-1">
                    {#each CATEGORY_OPTIONS as cat}
                        <label class="label cursor-pointer gap-2 py-1">
                            <input
                                type="checkbox"
                                name="categories"
                                value={cat}
                                class="checkbox checkbox-sm"
                                checked={selectedCategories.includes(cat)}
                                onchange={() => toggleCategory(cat)}
                            />
                            <span class="label-text text-sm">{cat}</span>
                        </label>
                    {/each}
                </div>
            </div>

            <div class="form-control">
                <label class="label cursor-pointer justify-start gap-4 py-1">
                    <input name="published" type="checkbox" class="toggle toggle-primary" bind:checked={published} />
                    <span class="label-text">Published</span>
                </label>
            </div>

            <div class="card-actions justify-end mt-6">
                <a href="/admin/posts" class="btn btn-ghost" disabled={isSaving}>Cancel</a>
                <button type="submit" class="btn btn-primary flex items-center gap-1.5" disabled={isSaving}>
                    {#if isSaving} <span class="loading loading-spinner loading-xs"></span> {/if}
                    <Icon src={CheckCircle} class="h-5 w-5" />
                    Create Post
                </button>
            </div>
        </div>
    </form>
</div>