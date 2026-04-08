<script>
    import { enhance } from '$app/forms';
    import { Icon, CheckCircle, XCircle, ArrowUturnLeft } from 'svelte-hero-icons';
    import { format } from 'date-fns'; // Use date-fns

    let { form } = $props();
    let postTitle = $derived(form?.postTitle || '');
    // Default to today using date-fns
    let postPublishedDate = $derived(form?.postPublishedDate || format(new Date(), 'yyyy-MM-dd'));
    let postCategories = $derived(form?.postCategories || '');
    let postContent = $derived(form?.postContent || '');
    let postPublished = $derived(form?.postPublished === undefined ? true : form.postPublished);
    let postImageFile = $state(null);
    let imagePreviewUrl = $state('');
    let isSaving = $state(false);

    function handleFileSelect(e) {
        const file = e.target.files?.[0];
        if (file) {
            postImageFile = file;
            imagePreviewUrl = URL.createObjectURL(file);
        } else {
            postImageFile = null;
            imagePreviewUrl = '';
        }
    }
</script>

<div class="container mx-auto px-4 py-8 max-w-3xl">
    <div class="mb-6 flex items-center justify-between">
        <h1 class="text-3xl font-bold text-base-content">Add New Post</h1>
        <a href="/admin#posts" class="btn btn-ghost btn-sm">
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
        return async ({ update, result }) => {
            await update({ reset: (result.type === 'success' && !form?.error && !form?.fieldErrors) });
            isSaving = false;
            if (result.type === 'success' && !form?.error && !form?.fieldErrors) {
                postTitle = ''; postPublishedDate = moment().format('YYYY-MM-DD'); postCategories = '';
                postContent = ''; postPublished = true; postImageFile = null; imagePreviewUrl = '';
            }
        };
    }} enctype="multipart/form-data" class="card bg-base-200 shadow-xl">
        <div class="card-body space-y-4">
            <div class="form-control">
                <label class="label" for="postTitleInput"><span class="label-text">Post Title*</span></label>
                <input name="title" type="text" id="postTitleInput" placeholder="Catchy Post Title" class="input input-bordered w-full" bind:value={postTitle} required />
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="form-control">
                    <label class="label" for="postPublishedDateInput"><span class="label-text">Published Date*</span></label>
                    <input name="publishedDate" type="date" id="postPublishedDateInput" class="input input-bordered w-full" bind:value={postPublishedDate} required />
                </div>
                <div class="form-control">
                    <label class="label" for="postCategoriesInput"><span class="label-text">Categories</span></label>
                    <input name="categories" type="text" id="postCategoriesInput" placeholder="e.g., news, update, event" class="input input-bordered w-full" bind:value={postCategories} />
                    <span class="label-text-alt text-xs mt-1">Comma-separated, e.g., news, update</span>
                </div>
            </div>

            <div class="form-control">
                <label class="label" for="postContentTextarea"><span class="label-text">Content*</span></label>
                <textarea name="content" id="postContentTextarea" class="textarea textarea-bordered h-48 w-full" placeholder="Write your post content here. Markdown might be supported depending on display." bind:value={postContent} required></textarea>
            </div>

            <div class="form-control items-start">
                 <label class="label cursor-pointer gap-4 py-1">
                    <span class="label-text">Published</span>
                    <input name="published" type="checkbox" id="postPublishedToggle" class="toggle toggle-primary" bind:checked={postPublished} />
                </label>
            </div>

            <div class="form-control">
                <label class="label" for="postImageInput">
                    <span class="label-text">Header Image</span>
                    <span class="label-text-alt">(Optional)</span>
                </label>
                {#if imagePreviewUrl}
                    <div class="mb-2"><img src={imagePreviewUrl} alt="preview" class="max-h-40 w-auto rounded border object-contain"/></div>
                {/if}
                <input name="image" type="file" id="postImageInput" class="file-input file-input-bordered file-input-sm w-full" onchange={handleFileSelect} accept="image/*" />
            </div>

            <div class="card-actions justify-end mt-6">
                <a href="/admin?tab=tab3" class="btn btn-ghost" disabled={isSaving}>Cancel</a>
                <button type="submit" class="btn btn-primary flex items-center gap-1.5" disabled={isSaving}>
                    {#if isSaving} <span class="loading loading-spinner loading-xs"></span> {/if}
                    <Icon src={CheckCircle} class="h-5 w-5" />
                    Create Post
                </button>
            </div>
        </div>
    </form>
</div>
