<script>
    import { enhance } from '$app/forms';
    import { Icon, CheckCircle, XCircle, ArrowUturnLeft } from 'svelte-hero-icons';
    import { formatPocketBaseDateToDateInput } from '$lib/utils.js'; // For YYYY-MM-DD format

    let { data, form } = $props(); // data.post from load, form from action

    let postTitle = $derived(form?.postTitle || data.post?.title || '');
    let postPublishedDate = $derived(form?.postPublishedDate || formatPocketBaseDateToDateInput(data.post?.publishedDate));
    let postCategories = $derived(form?.postCategories || (Array.isArray(data.post?.categories) ? data.post.categories.join(', ') : (data.post?.categories || '')));
    let postContent = $derived(form?.postContent || data.post?.content || '');
    let postPublished = $derived(form?.postPublished === undefined ? (data.post?.published === undefined ? true : data.post.published) : form.postPublished);

    let postImageFile = $state(null);
    let imagePreviewUrl = $derived(
        (data.post?.image && data.post?.id && data.post?.collectionId) ?
        `https://pdg.pockethost.io/api/files/${data.post.collectionId}/${data.post.id}/${data.post.image}?thumb=200x200` : ''
    );
    let existingFileName = $derived(data.post?.image || '');

    let isSaving = $state(false);

    function handleFileSelect(e) {
        const file = e.target.files?.[0];
        if (file) {
            postImageFile = file;
            imagePreviewUrl = URL.createObjectURL(file);
        } else {
            postImageFile = null;
            imagePreviewUrl = (data.post?.image && data.post?.id && data.post?.collectionId) ?
                `https://pdg.pockethost.io/api/files/${data.post.collectionId}/${data.post.id}/${data.post.image}?thumb=200x200` : '';
        }
    }
</script>

<div class="container mx-auto px-4 py-8 max-w-3xl">
    <div class="mb-6 flex items-center justify-between">
        <h1 class="text-3xl font-bold text-base-content">Edit Post: {data.post?.title || 'Loading...'}</h1>
         <a href="/admin#posts" class="btn btn-ghost btn-sm">
            <Icon src={ArrowUturnLeft} class="h-5 w-5" />
            Back to Admin
        </a>
    </div>

    {#if form?.error}
        <div class="alert alert-error mb-4 shadow-md"> </div>
    {/if}
    {#if form?.fieldErrors}
        <div class="alert alert-warning mb-4 shadow-md"> </div>
    {/if}

    <form method="POST" action="?/updatePost" use:enhance={() => {
        isSaving = true;
        return async ({ update, result }) => {
            await update({ reset: false });
            isSaving = false;
        };
    }} enctype="multipart/form-data" class="card bg-base-200 shadow-xl">
        <div class="card-body space-y-4">
            <div class="form-control">
                <label class="label" for="editPostTitleInput"><span class="label-text">Post Title*</span></label>
                <input name="title" type="text" id="editPostTitleInput" class="input input-bordered w-full" bind:value={postTitle} required />
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="form-control">
                    <label class="label" for="editPostPublishedDateInput"><span class="label-text">Published Date*</span></label>
                    <input name="publishedDate" type="date" id="editPostPublishedDateInput" class="input input-bordered w-full" bind:value={postPublishedDate} required />
                </div>
                <div class="form-control">
                    <label class="label" for="editPostCategoriesInput"><span class="label-text">Categories</span></label>
                    <input name="categories" type="text" id="editPostCategoriesInput" class="input input-bordered w-full" bind:value={postCategories} />
                     <span class="label-text-alt text-xs mt-1">Comma-separated, e.g., news, update</span>
                </div>
            </div>

            <div class="form-control">
                <label class="label" for="editPostContentTextarea"><span class="label-text">Content*</span></label>
                <textarea name="content" id="editPostContentTextarea" class="textarea textarea-bordered h-48 w-full" bind:value={postContent} required></textarea>
            </div>

            <div class="form-control items-start">
                 <label class="label cursor-pointer gap-4 py-1">
                    <span class="label-text">Published</span>
                    <input type="hidden" name="published" value={postPublished ? 'on' : 'off'} />
                    <input type="checkbox" id="editPostPublishedToggle" class="toggle toggle-primary" bind:checked={postPublished} />
                </label>
            </div>

            <div class="form-control">
                <label class="label" for="editPostImageInput">
                    <span class="label-text">Header Image</span>
                    <span class="label-text-alt">(Optional - new image will replace old)</span>
                </label>
                {#if imagePreviewUrl}
                    <div class="mb-2"><img src={imagePreviewUrl} alt="preview" class="max-h-40 w-auto rounded border object-contain"/></div>
                {:else if existingFileName}
                     <p class="text-xs mb-1">Current image: {existingFileName} (upload new to replace)</p>
                {/if}
                <input name="image" type="file" id="editPostImageInput" class="file-input file-input-bordered file-input-sm w-full" onchange={handleFileSelect} accept="image/*" />
                <input type="hidden" name="deleteExistingImage" value="false" /> </div>

            <div class="card-actions justify-end mt-6">
                <a href="/admin?tab=tab3" class="btn btn-ghost" disabled={isSaving}>Cancel</a>
                <button type="submit" class="btn btn-primary flex items-center gap-1.5" disabled={isSaving}>
                    {#if isSaving} <span class="loading loading-spinner loading-xs"></span> {/if}
                    <Icon src={CheckCircle} class="h-5 w-5" />
                    Update Post
                </button>
            </div>
        </div>
    </form>
</div>
