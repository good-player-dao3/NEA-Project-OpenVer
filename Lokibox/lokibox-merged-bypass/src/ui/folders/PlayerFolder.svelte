<script lang="ts">
  import { Core } from 'src/core/core';
  import Folder from './Folder.svelte';
  import type { PlayerAdapter } from 'src/core/players';
  import PlayerEntry from '../entries/PlayerEntry.svelte';
  import PresenceEntry from '../entries/PresenceEntry.svelte';
  import { PresenceManager } from 'src/presence/presence';
  import type { PresencePlayer } from 'src/api/schema';
  import { onMount } from 'svelte';

  let playerList = $state<PlayerAdapter[]>([]);
  let presenceList = $state<PresencePlayer[]>([]);
  /** 已被 presence 匹配的本地 player id 集合 */
  let matchedIds = $state<Set<number>>(new Set());

  const pm = PresenceManager.getInstance();

  function refreshPresence() {
    presenceList = [...pm.getPlayers()];
    matchedIds = new Set(
      presenceList
        .map(p => p.player_id)
        .filter((id): id is number => id != null),
    );
  }

  onMount(() => {
    const core = Core.getInstance();
    core.onReady(() => {
      core.players.onPlayerChange(() => {
        playerList = core.players.getAllPlayers();
      });
      if (core.ready) {
        playerList = core.players.getAllPlayers();
      }
    });

    refreshPresence();
    pm.onChange(refreshPresence);
  });
</script>

<Folder id="player">
  {#each presenceList as player (player.username)}
    {@const localName = player.player_id != null
      ? Core.getInstance().players.getPlayerById(player.player_id)?.name
      : undefined}
    <PresenceEntry {player} gameName={localName} />
  {/each}
  {#each playerList as player (player.id)}
    {#if !matchedIds.has(player.id)}
      <PlayerEntry {player} />
    {/if}
  {/each}
</Folder>
