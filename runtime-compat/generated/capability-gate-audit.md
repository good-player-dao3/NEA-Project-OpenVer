# Capability Gate Audit

This report converts the anonymized script corpus ABI inventory into the same conservative launch states used by the project Capability Manifest. It does not read private script source.

## Summary

- Requirements: 74
- Gated requirements: 59
- Ready: 26 (563 occurrences)
- Partial: 30 (358 occurrences)
- Blocked: 3 (15 occurrences)
- Script-owned extensions: 15

## Blocked

| Side | Usage | Occurrences | Canonical ABI | Capability | Reason |
| --- | --- | ---: | --- | --- | --- |
| server | `world.onChat` | 12 | `server.GameWorld.onChat` | `server.world.chat` | The historical GameChatEvent shape is recovered, but no Player/browser-to-backend chat ingress reaches the local Server Script Runtime. No Player/browser-to-backend chat ingress is recovered, so Capability Manifest blocks projects that depend on this event; moderation, cancellation, and transport timing also remain unavailable. The recovered GameChatEvent fields are represented by the Runtime signal shell. |
| server | `world.onPlayerPurchaseSuccess` | 2 | `server.GameWorld.onPlayerPurchaseSuccess` | `server.world.events` | The market protocols recover marketplace open/acknowledgement messages but no purchase-success ingress into the local Server Script Runtime. No browser-to-backend purchase-success producer or Server Runtime ingress is recovered locally, so Capability Manifest blocks projects that depend on this event. The recovered event fields are tick, userId, productId, and orderId. |
| server | `storage.getGroupStorage` | 1 | `server.GameStorage.getGroupStorage` | `server.storage` | The default local Runtime has no authoritative DAO3 group identity or group-scoped storage provider. The function surface exists, but default project runtimes disable cross-map group storage because no authoritative group identity/configuration is available. |

## Partial

| Side | Usage | Occurrences | Canonical ABI | Capability | Reason |
| --- | --- | ---: | --- | --- | --- |
| server | `world.querySelectorAll` | 119 | `server.GameWorld.querySelectorAll` | `server.world.entities` | At least one evidence-backed behavioral gap remains on the executable binding. Recovered ParsedSelector coercion, comma-union, universal/entity, player, id, tag, destroyed filtering, entity order, and fresh mutable result arrays are implemented. The historical testComponent implementation for component names other than player/entity was not recovered and remains unsupported. |
| server | `world.say` | 72 | `server.GameWorld.say` | `server.world.chat` | At least one evidence-backed behavioral gap remains on the executable binding. Broadcast delivery now uses the recovered Player game-chat.log packet through connected MuDB sessions. The historical MAX_CHATS_PER_TICK buffering/flush policy and Player display acknowledgement remain unimplemented. |
| server | `world.onPlayerJoin` | 28 | `server.GameWorld.onPlayerJoin` | `server.world.events` | At least one evidence-backed behavioral gap remains on the executable binding. Event fields now match GameEntityEvent, but RuntimePlayer is still only a subset of GamePlayerEntity. |
| client | `remoteChannel.events` | 22 | `client.remoteChannel.events` | `client.remote-channel` | Executable recovered canonical surface is outside the documented declaration matrix and cannot be claimed as fully conformant. Executable recovered canonical surface is not present in the documented declaration matrix: client.remoteChannel.events. |
| server | `world.createEntity` | 20 | `server.GameWorld.createEntity` | `server.world.entities` | At least one evidence-backed behavioral gap remains on the executable binding. Creation remains synchronous and emits the recovered entity-create lifecycle event. Captured mesh bindings can create an authoritative browser/backend replica with documented transform and model/body fields; unknown meshes deliberately remain script-local rather than receiving a fabricated placeholder. Generic native gravity, collision response, and in-place Vector3 mutation replication are still unverified. |
| server | `world.size` | 15 | `server.world.size` | `server.world.voxels` | Executable recovered canonical surface is outside the documented declaration matrix and cannot be claimed as fully conformant. Executable recovered canonical surface is not present in the documented declaration matrix: server.world.size. |
| server | `world.onTick` | 12 | `server.GameWorld.onTick` | `server.world.events` | At least one evidence-backed behavioral gap remains on the executable binding. The local scheduler advances one tick per callback and has no authoritative multi-tick frame input, so native delayed-frame catch-up behavior remains unavailable. The recovered Date.now wall-clock elapsedTimeMS formula and skip = tick - prevTick > 1 formula are implemented. |
| server | `world.querySelector` | 9 | `server.GameWorld.querySelector` | `server.world.entities` | At least one evidence-backed behavioral gap remains on the executable binding. Recovered ParsedSelector coercion, comma-union, universal/entity, player, id, tag, destroyed filtering, and first-match order are implemented. The historical testComponent implementation for component names other than player/entity was not recovered and remains unsupported. |
| server | `world.raycast` | 8 | `server.GameWorld.raycast` | `server.world.entities` | At least one evidence-backed behavioral gap remains on the executable binding. The recovered engine raycastBoxes implementation and body-orientation semantics are not available locally; entity intersections therefore remain an explicit AABB approximation. GameWorld.useOBB is a separate world-physics property, not a GameRaycastOptions field. Voxel DDA, fluid filtering, selector filtering, player/entity AABBs, recovered result fields, the historical Infinity maxDistance default, and zero-direction preservation are implemented and exercised by conformance tests and the anonymous captured-script corpus. |
| server | `gui.remove` | 5 | `server.GameGUI.remove` | `server.gui` | Executable recovered canonical surface is outside the documented declaration matrix and cannot be claimed as fully conformant. Executable recovered canonical surface is not present in the documented declaration matrix: server.GameGUI.remove. |
| server | `storage.getDataStorage` | 5 | `server.GameStorage.getDataStorage` | `server.storage` | At least one evidence-backed behavioral gap remains on the executable binding. Local JSON persistence implements the recovered data-space operations; native cloud scope, quotas, consistency, and version semantics remain unverified. |
| server | `world.onVoxelContact` | 5 | `server.GameWorld.onVoxelContact` | `server.world.events` | At least one evidence-backed behavioral gap remains on the executable binding. The recovered impulse-derived GameVoxelContactEvent force is implemented; RuntimePlayer is still only a subset of GamePlayerEntity. |
| server | `gui.setAttribute` | 4 | `server.GameGUI.setAttribute` | `server.gui` | Executable recovered canonical surface is outside the documented declaration matrix and cannot be claimed as fully conformant. Executable recovered canonical surface is not present in the documented declaration matrix: server.GameGUI.setAttribute. |
| server | `world.onClick` | 4 | `server.GameWorld.onClick` | `server.world.events` | At least one evidence-backed behavioral gap remains on the executable binding. Non-player clicks require an authoritative backend entity binding; the latest capture still has two entities without sufficient model evidence for projection. The game-net bridge reconstructs the declared GameClickEvent fields, applies the recovered PlayerFlags mask, and dispatches the same event to world and the clicked entity in historical order. |
| server | `world.onPlayerLeave` | 4 | `server.GameWorld.onPlayerLeave` | `server.world.events` | At least one evidence-backed behavioral gap remains on the executable binding. Event fields now match GameEntityEvent, but RuntimePlayer is still only a subset of GamePlayerEntity. |
| server | `gui.init` | 3 | `server.GameGUI.init` | `server.gui` | Executable recovered canonical surface is outside the documented declaration matrix and cannot be claimed as fully conformant. Executable recovered canonical surface is not present in the documented declaration matrix: server.GameGUI.init. |
| client | `input.pointerLockEvents` | 3 | `client.input.pointerLockEvents` | `client.ui` | Executable recovered canonical surface is outside the documented declaration matrix and cannot be claimed as fully conformant. Executable recovered canonical surface is not present in the documented declaration matrix: client.input.pointerLockEvents. |
| server | `world.onFluidEnter` | 3 | `server.GameWorld.onFluidEnter` | `server.world.events` | At least one evidence-backed behavioral gap remains on the executable binding. BlockInfo fluid ids, per-tick body overlap transitions, recovered {tick,entity,voxel} fields, and world-before-entity dispatch are implemented. Native fluid solver timing, buoyancy, drag, and producer-side volume fraction remain unrecovered. |
| server | `gui.getAttribute` | 2 | `server.GameGUI.getAttribute` | `server.gui` | Executable recovered canonical surface is outside the documented declaration matrix and cannot be claimed as fully conformant. Executable recovered canonical surface is not present in the documented declaration matrix: server.GameGUI.getAttribute. |
| client | `screen.events` | 2 | `client.ClientScreen.events` | `client.ui` | Executable recovered canonical surface is outside the documented declaration matrix and cannot be claimed as fully conformant. Executable recovered canonical surface is not present in the documented declaration matrix: client.ClientScreen.events. |
| server | `world.addCollisionFilter` | 2 | `server.GameWorld.addCollisionFilter` | `server.world.entities` | At least one evidence-backed behavioral gap remains on the executable binding. Filter registration/list lifecycle is implemented; the local physics solver does not yet consume selector pairs. |
| server | `world.addZone` | 2 | `server.GameWorld.addZone` | `server.world.events` | At least one evidence-backed behavioral gap remains on the executable binding. Non-player/entity component selector tests remain unavailable because historical testComponent was not recovered; native physics-selector force application and client environment projection remain unavailable. Zone creation, recovered selector normalization and mutation refresh, collides=false exclusion, polling, enter/leave events, and removal are implemented. |
| server | `world.onEntityContact` | 2 | `server.GameWorld.onEntityContact` | `server.world.events` | At least one evidence-backed behavioral gap remains on the executable binding. The event surface is dispatchable; full native GameEntityContactEvent production remains covered separately by the contact model. |
| server | `world.airFriction` | 1 | `server.GameWorld.airFriction` | `server.world.config` | At least one evidence-backed behavioral gap remains on the executable binding. The recovered property is script-visible, but writes do not yet reconfigure the fixed-step physics engine. |
| server | `world.fogColor` | 1 | `server.GameWorld.fogColor` | `server.world.config` | At least one evidence-backed behavioral gap remains on the executable binding. The recovered GameRGBColor property is script-visible; client rendering propagation remains unimplemented. |
| server | `world.gravity` | 1 | `server.GameWorld.gravity` | `server.world.config` | At least one evidence-backed behavioral gap remains on the executable binding. The recovered property is script-visible, but writes do not yet reconfigure the fixed-step physics engine. |
| server | `world.onDie` | 1 | `server.GameWorld.onDie` | `server.world.events` | At least one evidence-backed behavioral gap remains on the executable binding. Script-produced hurt emits one GameDieEvent when hp crosses from positive to zero and queues the native game-net die effect; non-script engine death transitions remain unverified. |
| server | `world.onFluidLeave` | 1 | `server.GameWorld.onFluidLeave` | `server.world.events` | At least one evidence-backed behavioral gap remains on the executable binding. BlockInfo fluid ids, per-tick body overlap transitions, recovered {tick,entity,voxel} fields, and world-before-entity dispatch are implemented. Native fluid solver timing, buoyancy, drag, and producer-side volume fraction remain unrecovered. |
| server | `world.onRespawn` | 1 | `server.GameWorld.onRespawn` | `server.world.events` | At least one evidence-backed behavioral gap remains on the executable binding. Local forceRespawn emits the recovered event shape; automatic engine respawn triggers remain unverified. |
| server | `world.onTakeDamage` | 1 | `server.GameWorld.onTakeDamage` | `server.world.events` | At least one evidence-backed behavioral gap remains on the executable binding. Script-produced GameEntity.hurt calls preserve enableDamage, healing, attacker, damageType, hp transitions, recovered GameDamageEvent fields, native replica.damage state, and game-net hurt effects; non-script engine damage ingress remains unverified. |

## Ready

| Side | Usage | Occurrences | Canonical ABI | Capability | Reason |
| --- | --- | ---: | --- | --- | --- |
| server | `remoteChannel.sendClientEvent` | 168 | `server.remoteChannel.sendClientEvent` | `server.remote-channel` | RuntimePlayer remains a subset of historical GamePlayerEntity. |
| client | `ui.findChildByName` | 63 | `client.UiNode.findChildByName` | `client.ui` | Executable evidence-backed binding. |
| server | `voxels.getVoxelId` | 62 | `server.GameVoxels.getVoxelId` | `server.world.voxels` | Executable evidence-backed binding. |
| client | `remoteChannel.sendServerEvent` | 59 | `client.remoteChannel.sendServerEvent` | `client.remote-channel` | Executable evidence-backed binding. |
| server | `voxels.setVoxelId` | 48 | `server.GameVoxels.setVoxelId` | `server.world.voxels` | Executable evidence-backed binding. |
| server | `voxels.id` | 26 | `server.GameVoxels.id` | `server.world.voxels` | Executable evidence-backed binding. |
| server | `voxels.setVoxel` | 17 | `server.GameVoxels.setVoxel` | `server.world.voxels` | Four Chinese string rotation aliases remain unresolved because the recovered historical source contains mojibake at those switch cases. |
| client | `UiImage.create` | 14 | `client.UiImage.create` | `client.ui` | Executable evidence-backed binding. |
| client | `UiText.create` | 14 | `client.UiText.create` | `client.ui` | Executable evidence-backed binding. |
| client | `UiScreen.getAllScreen` | 13 | `client.UiScreen.getAllScreen` | `client.ui` | Executable evidence-backed binding. |
| client | `input.unlockPointer` | 12 | `client.input.unlockPointer` | `client.ui` | Executable evidence-backed binding. |
| client | `UiBox.create` | 12 | `client.UiBox.create` | `client.ui` | Executable evidence-backed binding. |
| server | `remoteChannel.onServerEvent` | 10 | `server.remoteChannel.onServerEvent` | `server.remote-channel` | Executable evidence-backed binding. |
| server | `world.onPress` | 8 | `server.GameWorld.onPress` | `server.world.events` | Executable evidence-backed binding. |
| client | `input.lockPointer` | 7 | `client.input.lockPointer` | `client.ui` | Executable evidence-backed binding. |
| client | `screen.findChildByName` | 6 | `client.UiNode.findChildByName` | `client.ui` | Executable evidence-backed binding. |
| client | `screen.name` | 5 | `client.UiNode.name` | `client.ui` | Executable evidence-backed binding. |
| client | `UiScale.create` | 5 | `client.UiScale.create` | `client.ui` | Executable evidence-backed binding. |
| server | `voxels.getVoxel` | 3 | `server.GameVoxels.getVoxel` | `server.world.voxels` | Executable evidence-backed binding. |
| client | `screen.visible` | 2 | `client.UiScreen.visible` | `client.ui` | Executable evidence-backed binding. |
| client | `UiScrollBox.create` | 2 | `client.UiScrollBox.create` | `client.ui` | Executable evidence-backed binding. |
| server | `voxels.name` | 2 | `server.GameVoxels.name` | `server.world.voxels` | Executable evidence-backed binding. |
| server | `world.onRelease` | 2 | `server.GameWorld.onRelease` | `server.world.events` | Executable evidence-backed binding. |
| server | `remoteChannel.broadcastClientEvent` | 1 | `server.remoteChannel.broadcastClientEvent` | `server.remote-channel` | RuntimePlayer remains a subset of historical GamePlayerEntity. |
| client | `UiInput.create` | 1 | `client.UiInput.create` | `client.ui` | Executable evidence-backed binding. |
| server | `voxels.getVoxelRotation` | 1 | `server.GameVoxels.getVoxelRotation` | `server.world.voxels` | Executable evidence-backed binding. |

