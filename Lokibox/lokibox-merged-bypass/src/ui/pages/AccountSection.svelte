<script lang="ts">
  import { onMount } from 'svelte';
  import { LokiAPI } from 'src/api/api';
  import { setSelfNickname } from 'src/auth/auth';
  import { ToastManager } from 'src/utils/toast';
  import LoaderCircle from 'lucide-svelte/icons/loader-circle';
  import LogOut from 'lucide-svelte/icons/log-out';
  import Pencil from 'lucide-svelte/icons/pencil';
  import Check from 'lucide-svelte/icons/check';
  import X from 'lucide-svelte/icons/x';

  const api = LokiAPI.getInstance();
  const toast = ToastManager.getInstance();

  let username = $state('');
  let nickname = $state('');
  let avatarUrl = $state<string | null>(null);
  let loading = $state(true);
  let uploading = $state(false);
  let editingNickname = $state(false);
  let editValue = $state('');
  let saving = $state(false);
  let logoutStep = $state(0);
  let loggingOut = $state(false);

  let fileInput = $state<HTMLInputElement | null>(null);

  onMount(async () => {
    try {
      const [details, auth] = await Promise.all([
        api.getDetails(),
        api.userAuth(),
      ]);
      if (details.code === 'OK') {
        username = details.data.username;
        nickname = details.data.nickname;
        setSelfNickname(nickname);
      } else {
        toast.show('Failed to load profile', 'error');
      }
      if (auth.code === 'OK') {
        avatarUrl = auth.data.avatar_url;
      }
    } catch {
      toast.show('Network error', 'error');
    } finally {
      loading = false;
    }
  });

  function triggerFileSelect() {
    fileInput?.click();
  }

  async function onFileSelected(e: Event) {
    const input = e.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    uploading = true;
    try {
      const url = await api.uploadImage(file);
      await api.updateAvatar(url);
      avatarUrl = url;
      toast.show('Avatar updated', 'success');
    } catch {
      toast.show('Avatar upload failed', 'error');
    } finally {
      uploading = false;
      input.value = '';
    }
  }

  function startEditNickname() {
    editValue = nickname;
    editingNickname = true;
  }

  function cancelEditNickname() {
    editingNickname = false;
  }

  async function saveNickname() {
    const trimmed = editValue.trim();
    if (!trimmed || trimmed === nickname) {
      editingNickname = false;
      return;
    }
    saving = true;
    try {
      await api.updateNickname(trimmed);
      nickname = trimmed;
      setSelfNickname(trimmed);
      toast.show('Nickname updated', 'success');
      editingNickname = false;
    } catch {
      toast.show('Failed to update nickname', 'error');
    } finally {
      saving = false;
    }
  }

  function startLogout() {
    logoutStep = 1;
  }

  async function confirmLogout() {
    if (loggingOut) return;
    loggingOut = true;
    try {
      await api.logout();
      toast.show('Logged out', 'info');
      setTimeout(() => location.reload(), 500);
    } catch {
      toast.show('Logout failed', 'error');
      loggingOut = false;
    }
  }

  function cancelLogout() {
    logoutStep = 0;
  }
</script>

{#if loading}
  <div class="loading-row">
    <LoaderCircle class="spinner" size={16} />
    <span>Loading…</span>
  </div>
{:else}
  <div class="section">
    <div class="section-title">Account</div>
    <div class="avatar-row">
      <div
        class="avatar-wrap"
        class:uploading
        role="button"
        tabindex="0"
        onclick={triggerFileSelect}
        onkeydown={e => {
          if (e.key === 'Enter') triggerFileSelect();
        }}
      >
        {#if avatarUrl}
          <img
            class="avatar-img"
            src={avatarUrl}
            alt="avatar"
            onerror={() => (avatarUrl = null)}
          />
        {:else}
          <div class="avatar-placeholder">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <circle cx="12" cy="8" r="4" />
              <path d="M4 22a8 8 0 0 1 16 0" />
            </svg>
          </div>
        {/if}
        <div class="avatar-overlay">
          {#if uploading}
            <LoaderCircle class="spinner" size={16} />
          {:else}
            <Pencil size={14} />
          {/if}
        </div>
      </div>
      <input
        bind:this={fileInput}
        type="file"
        accept="image/*"
        class="file-input"
        onchange={onFileSelected}
      />
    </div>
    <div class="info-row">
      <span class="info-label">Username</span>
      <span class="info-value">@{username}</span>
    </div>
    <div class="info-row">
      <span class="info-label">Nickname</span>
      {#if editingNickname}
        <div class="edit-inline">
          <input
            class="edit-input"
            type="text"
            maxlength="32"
            bind:value={editValue}
            onkeydown={e => {
              if (e.key === 'Enter') saveNickname();
              else if (e.key === 'Escape') cancelEditNickname();
            }}
          />
          <button
            class="edit-btn save"
            onclick={saveNickname}
            disabled={saving}
          >
            {#if saving}<LoaderCircle class="spinner" size={13} />{:else}<Check
                size={13}
              />{/if}
          </button>
          <button class="edit-btn cancel" onclick={cancelEditNickname}>
            <X size={13} />
          </button>
        </div>
      {:else}
        <div class="value-group">
          <span class="info-value">{nickname}</span>
          <button class="edit-trigger" onclick={startEditNickname}>
            <Pencil size={12} />
          </button>
        </div>
      {/if}
    </div>
  </div>

  <div class="section">
    {#if logoutStep === 0}
      <button class="action-btn logout" onclick={startLogout}>
        <LogOut size={14} />
        Log Out
      </button>
    {:else if logoutStep === 1}
      <div class="confirm-row">
        <span class="confirm-text">Are you sure you want to log out?</span>
        <button
          class="action-btn confirm-yes"
          onclick={confirmLogout}
          disabled={loggingOut}
        >
          {#if loggingOut}<LoaderCircle class="spinner" size={14} />{/if}
          Definitely
        </button>
        <button class="action-btn confirm-no" onclick={cancelLogout}
          >Cancel</button
        >
      </div>
    {/if}
  </div>
{/if}

<style>
  .loading-row {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 24px 16px;
    opacity: 0.6;
    font-size: 12px;
  }

  .section {
    padding: 0 14px;
  }

  .section + .section {
    border-top: 1px solid #fff1;
  }

  .section-title {
    padding: 10px 0 6px;
    font-size: 11px;
    font-weight: 600;
    opacity: 0.45;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .info-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 8px 0;
  }

  .info-label {
    opacity: 0.6;
    font-size: 12px;
  }

  .info-value {
    font-size: 12px;
    font-weight: 500;
  }

  .value-group {
    display: flex;
    align-items: center;
    gap: 2px;
  }

  .action-btn {
    width: 100%;
    height: 34px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    border-radius: 6px;
    border: 1px solid #fff1;
    cursor: pointer;
    font-family: 'Poppins', sans-serif;
    font-size: 12px;
    transition:
      background 0.15s,
      border-color 0.15s;
  }

  .avatar-row {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 12px 0;
  }

  .avatar-wrap {
    position: relative;
    width: 64px;
    height: 64px;
    border-radius: 50%;
    overflow: hidden;
    cursor: pointer;
  }

  .avatar-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }

  .avatar-placeholder {
    width: 100%;
    height: 100%;
    background: #111;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .avatar-placeholder svg {
    width: 28px;
    height: 28px;
    color: var(--text-default);
    opacity: 0.3;
  }

  .avatar-overlay {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(0, 0, 0, 0.5);
    color: var(--text-default);
    opacity: 0;
    transition: opacity 0.15s;
  }

  .avatar-wrap:hover .avatar-overlay,
  .avatar-wrap.uploading .avatar-overlay {
    opacity: 1;
  }

  .file-input {
    display: none;
  }

  .edit-trigger {
    flex-shrink: 0;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 22px;
    height: 22px;
    padding: 0;
    margin-left: 6px;
    background: transparent;
    border: none;
    border-radius: 4px;
    color: var(--text-default);
    opacity: 0.3;
    cursor: pointer;
    transition:
      color 0.15s,
      background 0.15s;
  }

  .edit-trigger:hover {
    color: var(--text-default);
    opacity: 0.65;
    background: #ffffff08;
  }

  .edit-inline {
    display: flex;
    align-items: center;
    gap: 4px;
    flex: 1;
    justify-content: flex-end;
  }

  .edit-input {
    width: 120px;
    height: 26px;
    padding: 0 8px;
    background: #111;
    border: 1px solid #444;
    border-radius: 4px;
    color: var(--text-default);
    font-family: 'Poppins', sans-serif;
    font-size: 12px;
    outline: none;
  }

  .edit-input:focus {
    border-color: #666;
  }

  .edit-btn {
    flex-shrink: 0;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 22px;
    height: 22px;
    padding: 0;
    background: transparent;
    border: 1px solid #fff1;
    border-radius: 4px;
    color: var(--text-default);
    opacity: 0.5;
    cursor: pointer;
    transition:
      color 0.15s,
      background 0.15s;
  }

  .edit-btn:hover {
    color: var(--text-default);
    opacity: 0.85;
    background: #ffffff0c;
  }

  .edit-btn.save:hover {
    border-color: #4ade8055;
    color: #4ade80;
  }

  .edit-btn.cancel:hover {
    border-color: #f8717155;
    color: #f87171;
  }

  .edit-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .action-btn.logout {
    margin: 10px 0;
    background: transparent;
    color: #f87171;
  }

  .action-btn.logout:hover {
    background: rgba(248, 113, 113, 0.12);
    border-color: rgba(248, 113, 113, 0.3);
  }

  .confirm-row {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 0;
  }

  .confirm-text {
    flex: 1;
    font-size: 12px;
    opacity: 0.8;
  }

  .action-btn.confirm-yes {
    width: auto;
    padding: 0 14px;
    border-color: #c44;
    color: #f87171;
    background: transparent;
  }

  .action-btn.confirm-yes:hover {
    background: rgba(248, 113, 113, 0.12);
  }

  .action-btn.confirm-no {
    width: auto;
    padding: 0 14px;
    border-color: #fff1;
    color: var(--text-default);
    opacity: 0.65;
    background: transparent;
  }

  .action-btn.confirm-no:hover {
    background: #ffffff08;
  }
</style>
