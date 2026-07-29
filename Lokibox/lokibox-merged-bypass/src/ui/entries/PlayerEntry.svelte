<script lang="ts">
  import { onMount } from 'svelte';
  import type { PlayerAdapter } from 'src/core/players';
  import './entry.css';
  import { Core } from 'src/core/core';
  import { ExclusionManager } from 'src/features/exclusion';
  import Camera from 'lucide-svelte/icons/camera';
  import PlayerContextMenu from './PlayerContextMenu.svelte';
  import type { ContextAction } from './PlayerContextMenu.svelte';

  let { player }: { player: PlayerAdapter } = $props();

  const core = Core.getInstance();
  const em = ExclusionManager.getInstance();

  let isFriend = $state(em.isFriend(player.id));
  let cameraTarget = $state(core.camera?.targetId ?? 0);

  onMount(() => {
    em.onChange(() => {
      isFriend = em.isFriend(player.id);
    });
  });

  function toggleFriend() {
    if (player.id === core.bodies.getSelfBody()?.id) return;
    if (isFriend) {
      em.removeFriend(player.id);
    } else {
      em.addFriend(player.id);
    }
  }

  function toggleCamera() {
    if (cameraTarget === player.id) {
      const selfId = core.bodies.getSelfBody()!.id;
      core.camera.targetId = selfId;
      cameraTarget = selfId;
    } else {
      core.camera.targetId = player.id;
      cameraTarget = player.id;
    }
  }

  const actions = $derived<ContextAction[]>([
    {
      label: cameraTarget === player.id ? 'Return to Self' : 'Focus Camera',
      icon: Camera,
      onClick: toggleCamera,
    },
  ]);
</script>

<PlayerContextMenu {actions}>
  <button
    type="button"
    class="entry player-entry"
    class:is-friend={isFriend}
    onclick={toggleFriend}
  >
    {player.name}
  </button>
</PlayerContextMenu>

<style>
  .player-entry.is-friend {
    border-left: 2px solid var(--accent);
  }
</style>
