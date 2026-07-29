<script lang="ts">
  import type { PresencePlayer } from 'src/api/schema';
  import PackageOpen from 'lucide-svelte/icons/package-open';
  import UserPlus from 'lucide-svelte/icons/user-plus';
  import UserMinus from 'lucide-svelte/icons/user-minus';
  import Camera from 'lucide-svelte/icons/camera';
  import './entry.css';
  import { Core } from 'src/core/core';
  import { FriendManager } from 'src/friend/remote-friends';
  import { ExclusionManager } from 'src/features/exclusion';
  import PlayerContextMenu from './PlayerContextMenu.svelte';
  import type { ContextAction } from './PlayerContextMenu.svelte';
  import { LokiAPI } from 'src/api/api';

  let {
    player,
    gameName,
  }: { player: PresencePlayer; gameName?: string } = $props();

  const core = Core.getInstance();
  const fm = FriendManager.getInstance();
  const em = ExclusionManager.getInstance();
  const api = LokiAPI.getInstance();

  let cameraTarget = $state(core.camera?.targetId ?? 0);
  let isFriend = $state(fm.isFriend(player.username));
  let toggling = $state(false);

  fm.onChange(() => {
    isFriend = fm.isFriend(player.username);
  });

  // ── 左键：添加/删除远程好友 ────────────────────────

  async function toggleFriend() {
    if (toggling) return;
    if (api.selfUsername === player.username) return;
    toggling = true;
    try {
      if (isFriend) {
        await fm.removeFriend(player.username);
      } else {
        await fm.addFriend(player.username);
        await fm.fetch();
      }
    } finally {
      toggling = false;
    }
  }

  // ── 右键菜单动作 ──────────────────────────────────

  function toggleCamera() {
    if (player.player_id == null) return;
    if (cameraTarget === player.player_id) {
      const selfId = core.bodies.getSelfBody()!.id;
      core.camera.targetId = selfId;
      cameraTarget = selfId;
    } else {
      core.camera.targetId = player.player_id;
      cameraTarget = player.player_id;
    }
  }

  const isSelf = $derived(api.selfUsername === player.username);

  const actions = $derived.by(() => {
    const camera: ContextAction[] =
      player.player_id != null
        ? [
            {
              label:
                cameraTarget === player.player_id
                  ? 'Return to Self'
                  : 'Focus Camera',
              icon: Camera,
              onClick: toggleCamera,
            },
          ]
        : [];

    return camera satisfies ContextAction[];
  });
</script>

<PlayerContextMenu {actions}>
  <button
    type="button"
    class="entry presence-entry"
    class:merged={gameName != null}
    class:is-friend={isFriend}
    onclick={toggleFriend}
    onmousedown={e => { if (e.button === 1 && player.player_id != null) { e.preventDefault(); if (em.isFriend(player.player_id)) em.removeFriend(player.player_id); else em.addFriend(player.player_id); } }}
  >
    {#if gameName}
      <div class="merged-rows">
        <span class="merged-game-name">{gameName}</span>
        <span class="merged-meta">
          <PackageOpen size={11} />
          <span class="presence-name">{player.nickname}</span>
        </span>
      </div>
    {:else}
      <PackageOpen size={13} />
      <span class="presence-name">{player.nickname}</span>
      <span class="presence-username">@{player.username}</span>
    {/if}
  </button>
</PlayerContextMenu>

<style>
  .presence-entry {
    gap: 8px;
  }

  /* ── Merged (two-row) ─────────────────────────────── */

  .presence-entry.merged {
    height: auto;
    padding-top: 6px;
    padding-bottom: 6px;
  }

  .merged-rows {
    display: flex;
    flex-direction: column;
    gap: 2px;
    width: 100%;
  }

  .merged-game-name {
    font-size: 12px;
    text-align: left;
  }

  .merged-meta {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 10px;
    opacity: 0.7;
  }

  /* ── Single-row (unmatched) ────────────────────────── */

  .presence-name {
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    text-align: left;
  }

  .presence-username {
    font-size: 11px;
    opacity: 0.55;
    flex-shrink: 0;
  }

  /* ── 远程好友标记 ────────────────────────────────── */

  .presence-entry.is-friend {
    border-left: 2px solid var(--accent);
  }
</style>
