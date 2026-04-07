<!-- src/routes/admin/board/members/edit/[id]/+page.svelte -->
<script>
	import { enhance } from '$app/forms';
	import { Icon, CheckCircle, XCircle, ArrowUturnLeft } from 'svelte-hero-icons';

	let { data, form } = $props();

	const boardRoles = ['Director', 'President', 'Vice President', 'Secretary', 'Treasurer', ''];

	let memberName = $state('');
	let memberRole = $state('');
	let memberBio = $state('');
	let memberActive = $state(true);
	let memberImageFile = $state(null);
	let selectedImageFileName = $state('');
	let deleteExistingImage = $state(false);

	$effect(() => {
		memberName = form?.memberName || data.member?.name || '';
		memberRole = form?.memberRole || data.member?.role || '';
		memberBio = form?.memberBio || data.member?.bio || '';
		memberActive = form?.memberActive ?? data.member?.active ?? true;
	});

	let isSaving = $state(false);

	function handleImageSelect(e) {
		const file = e.target.files?.[0];
		if (file) {
			memberImageFile = file;
			selectedImageFileName = file.name;
		} else {
			memberImageFile = null;
			selectedImageFileName = '';
		}
	}
</script>

<div class="container mx-auto max-w-xl px-4 py-8">
	<div class="mb-6 flex items-center justify-between">
		<h1 class="text-3xl font-bold text-base-content">Edit Board Member: {data.member?.name || 'Loading...'}</h1>
		<a href="/admin#boardMembers" class="btn btn-ghost btn-sm">
			<Icon src={ArrowUturnLeft} class="h-5 w-5" />
			Back to Admin
		</a>
	</div>

	{#if form?.error}
		<div class="alert alert-error mb-4 shadow-md">
			<Icon src={XCircle} class="mr-2 h-6 w-6 shrink-0" />
			<span>{form.error}</span>
		</div>
	{/if}
	{#if form?.fieldErrors}
		<div class="alert alert-warning mb-4 shadow-md">
			<ul class="list-disc pl-5">
				{#each Object.entries(form.fieldErrors) as [field, errorMsg]}
					<li><strong>{field.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase())}:</strong> {errorMsg}</li>
				{/each}
			</ul>
		</div>
	{/if}

	<form
		method="POST"
		action="?/updateBoardMember"
		use:enhance={() => {
			isSaving = true;
			return async ({ update }) => {
				await update({ reset: false });
				isSaving = false;
			};
		}}
		enctype="multipart/form-data"
		class="card bg-base-200 shadow-xl"
	>
		<div class="card-body space-y-4">
			<div class="form-control">
				<label class="label" for="editMemberNameInput"><span class="label-text">Full Name*</span></label>
				<input name="name" type="text" id="editMemberNameInput" class="input input-bordered w-full" bind:value={memberName} required />
			</div>

			<div class="form-control">
				<label class="label" for="editMemberRoleSelect"><span class="label-text">Role/Title</span></label>
				<select name="role" id="editMemberRoleSelect" class="select select-bordered w-full" bind:value={memberRole}>
					{#each boardRoles as roleOption}
						<option value={roleOption}>{roleOption || '--- No Role ---'}</option>
					{/each}
				</select>
			</div>

			<div class="form-control">
				<label class="label" for="memberBioInput">
					<span class="label-text">Bio</span>
					<span class="label-text-alt">(Optional)</span>
				</label>
				<textarea
					name="bio"
					id="memberBioInput"
					placeholder="A short bio for this board member..."
					class="textarea textarea-bordered w-full"
					rows="4"
					bind:value={memberBio}
				></textarea>
			</div>

			<div class="form-control">
				<label class="label" for="memberImageInput">
					<span class="label-text">Profile Image</span>
					<span class="label-text-alt">(Optional)</span>
				</label>
				{#if data.member?.image && !deleteExistingImage}
					<div class="mb-2 flex items-center gap-3">
						<img
							src="https://pdg.pockethost.io/api/files/{data.member.collectionId}/{data.member.id}/{data.member.image}?thumb=100x100"
							alt="Current profile"
							class="h-16 w-16 rounded-full object-cover"
						/>
						<div class="flex flex-col gap-1">
							<span class="text-sm text-base-content/70">Current image — upload a new one to replace it</span>
							<label class="flex cursor-pointer items-center gap-2 text-sm text-error">
								<input
									type="checkbox"
									class="checkbox checkbox-error checkbox-sm"
									bind:checked={deleteExistingImage}
								/>
								Remove current image
							</label>
						</div>
					</div>
				{/if}
				{#if deleteExistingImage}
					<div class="alert alert-warning mb-2 py-2 text-sm">
						Current image will be removed on save.
					</div>
				{/if}
				<input type="hidden" name="deleteExistingImage" value={deleteExistingImage} />
				<input
					name="image"
					type="file"
					id="memberImageInput"
					class="file-input file-input-bordered file-input-sm w-full"
					onchange={handleImageSelect}
					accept="image/*"
					disabled={deleteExistingImage}
				/>
				{#if selectedImageFileName}
					<span class="label-text-alt mt-1 text-xs">Selected: {selectedImageFileName}</span>
				{/if}
			</div>

			<div class="form-control items-start">
				<label class="label cursor-pointer gap-4 py-1">
					<span class="label-text">Active Member</span>
					<input type="hidden" name="active" value={memberActive ? 'on' : 'off'} />
					<input type="checkbox" id="editMemberActiveToggle" class="toggle toggle-primary" bind:checked={memberActive} />
				</label>
			</div>

			<div class="card-actions mt-6 justify-end">
				<a href="/admin#boardMembers" class="btn btn-ghost" disabled={isSaving}>Cancel</a>
				<button type="submit" class="btn btn-primary flex items-center gap-1.5" disabled={isSaving}>
					{#if isSaving}<span class="loading loading-spinner loading-xs"></span>{/if}
					<Icon src={CheckCircle} class="h-5 w-5" />
					Update Member
				</button>
			</div>
		</div>
	</form>
</div>
