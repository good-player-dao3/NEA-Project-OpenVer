<script lang="ts">
  import { FolderManager } from 'src/folders/manager';
  import { FolderStorageManager } from 'src/storage/folders';
  import UIEntry from '../entries/UIEntry.svelte';
  import { onMount } from 'svelte';
  import { LokiAPI } from 'src/api/api';
  import {
    getSelfUsername,
    getSelfNickname,
    setSelfNickname,
    getSelfAvatar,
    setSelfAvatar,
  } from 'src/auth/auth';
  import { draggable } from '../draggable';
  import Modal from '../Modal.svelte';
  import SettingsPage from '../pages/SettingsPage.svelte';
  import User from 'lucide-svelte/icons/user';
  import Palette from 'lucide-svelte/icons/palette';
  import Settings from 'lucide-svelte/icons/settings';
  import logoSrc from '../../../logo.png';
  import './folder.css';

  const id = 'main';
  const fm = FolderManager.getInstance();
  const fpm = FolderStorageManager.getInstance();

  let position = $state(fpm.getPosition(id));
  let display = $state(true);
  let showPanel = $state(false);
  let panelTab: string = $state('account');
  let nickname = $state(getSelfNickname());
  let avatarUrl = $state<string | null>(getSelfAvatar());

  onMount(async () => {
    try {
      const [details, auth] = await Promise.all([
        LokiAPI.getInstance().getDetails(),
        LokiAPI.getInstance().userAuth(),
      ]);
      if (details.code === 'OK') {
        nickname = details.data.nickname;
        setSelfNickname(nickname);
      }
      if (auth.code === 'OK' && auth.data.avatar_url) {
        avatarUrl = auth.data.avatar_url;
        setSelfAvatar(auth.data.avatar_url);
      }
    } catch {
      /* 沿用缓存 */
    }
  });

  const TABS = [
    { id: 'account', label: 'Account', icon: User },
    { id: 'theme', label: 'Theme', icon: Palette },
  ] as const;

  fm.getFolderById(id)?.onVisibilityChange(v => {
    display = true; // always display
    if (v) position = fpm.getPosition(id);
  });

  const exclusion = ['main', 'minimap', 'target-hud', 'category'];
</script>

{#if position && display}
  <div
    data-folder-id="main"
    class="folder"
    style:transform="translate({position.x}px,{position.y}px)"
    style:width="250px"
  >
    <div
      class="main-head"
      use:draggable={{ id, x0: position.x, y0: position.y }}
    >
      <img class="head-logo" src={logoSrc} alt="LokiBox" draggable="false" />
    </div>
    <div class="container">
      {#each fm
        .getFolders()
        .filter(({ meta: { id: fid } }) => !exclusion.includes(fid)) as f}
        <UIEntry id={f.meta.id} />
      {/each}
    </div>
    <div class="main-footer">
      <div
        class="footer-left"
        role="button"
        tabindex="0"
        onclick={() => (showPanel = true)}
        onkeydown={e => {
          if (e.key === 'Enter' || e.key === ' ') showPanel = true;
        }}
      >
        {#if avatarUrl}
          <img
            class="footer-avatar"
            src={avatarUrl}
            alt=""
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
        <span class="footer-nickname">{nickname || getSelfUsername()}</span>
      </div>
      <button class="footer-settings" onclick={() => (showPanel = true)}>
        <Settings size={15} />
      </button>
    </div>
  </div>
{/if}

{#if showPanel}
  <Modal title="Profile" onclose={() => (showPanel = false)}>
    <div class="panel-layout">
      <div class="panel-sidebar">
        {#each TABS as t}
          <button
            class="tab-btn"
            class:active={panelTab === t.id}
            onclick={() => (panelTab = t.id)}
          >
            <t.icon size={16} />
            <span>{t.label}</span>
          </button>
        {/each}
      </div>
      <div class="panel-content">
        <SettingsPage tab={panelTab} />
      </div>
    </div>
  </Modal>
{/if}

<style>
  .main-head {
    width: 100%;
    height: 40px;
    background-color: var(--bg-default);
    cursor: move;
    user-select: none;
    display: flex;
    align-items: center;
    justify-content: left;
    flex-shrink: 0;
    padding: 0 10px;
  }

  .main-head:hover {
    background-color: var(--bg-hover);
  }

  .head-logo {
    height: 18px;
    width: auto;
    display: block;
    pointer-events: none;
    user-select: none;
  }

  .main-footer {
    height: 40px;
    background-color: var(--bg-default);
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 10px;
    flex-shrink: 0;
    border-top: 1px solid #2a2a2a;
  }

  .footer-left {
    display: flex;
    align-items: center;
    gap: 8px;
    cursor: pointer;
    user-select: none;
    transition: opacity 0.15s;
  }

  .footer-left:hover {
    opacity: 0.7;
  }

  .avatar-placeholder,
  .footer-avatar {
    width: 26px;
    height: 26px;
    border-radius: 50%;
    flex-shrink: 0;
  }

  .avatar-placeholder {
    background: #111;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .avatar-placeholder svg {
    width: 16px;
    height: 16px;
    color: var(--text-default);
    opacity: 0.3;
  }

  .footer-avatar {
    object-fit: cover;
  }

  .footer-nickname {
    font-family: 'Poppins', sans-serif;
    font-size: 12px;
    color: var(--text-default);
    opacity: 0.65;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    max-width: 120px;
  }

  .footer-settings {
    flex-shrink: 0;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 26px;
    height: 26px;
    padding: 0;
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

  .footer-settings:hover {
    color: var(--text-default);
    opacity: 0.65;
    background: #ffffff08;
  }

  /* ── Panel 布局 ─────────────────────────────── */

  .panel-layout {
    display: flex;
    height: 100%;
  }

  .panel-sidebar {
    flex: 3 0 0;
    background: var(--bg-default);
    display: flex;
    flex-direction: column;
    gap: 2px;
    padding: 8px;
    border-right: 1px solid #fff1;
  }

  .tab-btn {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 6px 10px;
    background: transparent;
    border: none;
    border-radius: 6px;
    color: var(--text-default);
    cursor: pointer;
    font-family: 'Poppins', sans-serif;
    font-size: 12px;
    white-space: nowrap;
    transition:
      color 0.15s,
      background 0.15s;
  }

  .tab-btn:hover {
    color: var(--text-default);
    background: #ffffff08;
  }

  .tab-btn.active {
    color: var(--accent, #fff);
    background: #ffffff0c;
  }

  .panel-content {
    flex: 7 1 0;
    overflow-y: auto;
    scrollbar-width: none;
  }

  .panel-content::-webkit-scrollbar {
    display: none;
  }
</style>
