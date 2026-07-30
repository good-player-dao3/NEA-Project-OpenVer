# Capability Gate Audit

This report converts the anonymized script corpus ABI inventory into the same conservative launch states used by the project Capability Manifest. It does not read private script source.

## Summary

- Requirements: 74
- Gated requirements: 59
- Ready: 26 (563 occurrences)
- Partial: 33 (373 occurrences)
- Blocked: 0 (0 occurrences)
- Script-owned extensions: 15

## Blocked

None.

## Partial

| Side | Usage | Occurrences | Canonical ABI | Capability | Reason |
| --- | --- | ---: | --- | --- | --- |
| server | `world.querySelectorAll` | 119 | `server.world.querySelectorAll` | `server.world.entities` | Executable recovered canonical surface is outside the documented declaration matrix and cannot be claimed as fully conformant. Executable recovered canonical surface is not present in the documented declaration matrix: server.world.querySelectorAll. |
| server | `world.say` | 72 | `server.world.say` | `server.world.chat` | Executable recovered canonical surface is outside the documented declaration matrix and cannot be claimed as fully conformant. Executable recovered canonical surface is not present in the documented declaration matrix: server.world.say. |
| server | `world.onPlayerJoin` | 28 | `server.world.onPlayerJoin` | `server.world.events` | Executable recovered canonical surface is outside the documented declaration matrix and cannot be claimed as fully conformant. Executable recovered canonical surface is not present in the documented declaration matrix: server.world.onPlayerJoin. |
| client | `remoteChannel.events` | 22 | `client.remoteChannel.events` | `client.remote-channel` | Executable recovered canonical surface is outside the documented declaration matrix and cannot be claimed as fully conformant. Executable recovered canonical surface is not present in the documented declaration matrix: client.remoteChannel.events. |
| server | `world.createEntity` | 20 | `server.world.createEntity` | `server.world.entities` | Executable recovered canonical surface is outside the documented declaration matrix and cannot be claimed as fully conformant. Executable recovered canonical surface is not present in the documented declaration matrix: server.world.createEntity. |
| server | `world.size` | 15 | `server.world.size` | `server.world.voxels` | Executable recovered canonical surface is outside the documented declaration matrix and cannot be claimed as fully conformant. Executable recovered canonical surface is not present in the documented declaration matrix: server.world.size. |
| server | `world.onChat` | 12 | `server.GameWorld.onChat` | `server.world.chat` | At least one evidence-backed behavioral gap remains on the executable binding. Recovered event fields are emitted by the local bridge; native moderation, cancellation, and transport timing remain unverified. |
| server | `world.onTick` | 12 | `server.world.onTick` | `server.world.events` | Executable recovered canonical surface is outside the documented declaration matrix and cannot be claimed as fully conformant. Executable recovered canonical surface is not present in the documented declaration matrix: server.world.onTick. |
| server | `world.querySelector` | 9 | `server.world.querySelector` | `server.world.entities` | Executable recovered canonical surface is outside the documented declaration matrix and cannot be claimed as fully conformant. Executable recovered canonical surface is not present in the documented declaration matrix: server.world.querySelector. |
| server | `world.raycast` | 8 | `server.GameWorld.raycast` | `server.world.entities` | At least one evidence-backed behavioral gap remains on the executable binding. The recovered engine raycastBoxes implementation and body-orientation semantics are not available locally; entity intersections therefore remain an explicit AABB approximation. GameWorld.useOBB is a separate world-physics property, not a GameRaycastOptions field. Voxel DDA, fluid filtering, selector filtering, player/entity AABBs, recovered result fields, the historical Infinity maxDistance default, and zero-direction preservation are implemented and exercised by conformance tests and the anonymous captured-script corpus. |
| server | `gui.remove` | 5 | `server.GameGUI.remove` | `server.gui` | Executable recovered canonical surface is outside the documented declaration matrix and cannot be claimed as fully conformant. Executable recovered canonical surface is not present in the documented declaration matrix: server.GameGUI.remove. |
| server | `storage.getDataStorage` | 5 | `server.GameStorage.getDataStorage` | `server.storage` | Executable recovered canonical surface is outside the documented declaration matrix and cannot be claimed as fully conformant. Executable recovered canonical surface is not present in the documented declaration matrix: server.GameStorage.getDataStorage. |
| server | `world.onVoxelContact` | 5 | `server.world.onVoxelContact` | `server.world.events` | Executable recovered canonical surface is outside the documented declaration matrix and cannot be claimed as fully conformant. Executable recovered canonical surface is not present in the documented declaration matrix: server.world.onVoxelContact. |
| server | `gui.setAttribute` | 4 | `server.GameGUI.setAttribute` | `server.gui` | Executable recovered canonical surface is outside the documented declaration matrix and cannot be claimed as fully conformant. Executable recovered canonical surface is not present in the documented declaration matrix: server.GameGUI.setAttribute. |
| server | `world.onClick` | 4 | `server.GameWorld.onClick` | `server.world.events` | At least one evidence-backed behavioral gap remains on the executable binding. Non-player clicks require an authoritative backend entity binding; the latest capture still has two entities without sufficient model evidence for projection. The game-net bridge reconstructs the declared GameClickEvent fields, applies the recovered PlayerFlags mask, and dispatches the same event to world and the clicked entity in historical order. |
| server | `world.onPlayerLeave` | 4 | `server.world.onPlayerLeave` | `server.world.events` | Executable recovered canonical surface is outside the documented declaration matrix and cannot be claimed as fully conformant. Executable recovered canonical surface is not present in the documented declaration matrix: server.world.onPlayerLeave. |
| server | `gui.init` | 3 | `server.GameGUI.init` | `server.gui` | Executable recovered canonical surface is outside the documented declaration matrix and cannot be claimed as fully conformant. Executable recovered canonical surface is not present in the documented declaration matrix: server.GameGUI.init. |
| client | `input.pointerLockEvents` | 3 | `client.input.pointerLockEvents` | `client.ui` | Executable recovered canonical surface is outside the documented declaration matrix and cannot be claimed as fully conformant. Executable recovered canonical surface is not present in the documented declaration matrix: client.input.pointerLockEvents. |
| server | `world.onFluidEnter` | 3 | `server.GameWorld.onFluidEnter` | `server.world.events` | At least one evidence-backed behavioral gap remains on the executable binding. The event surface and local physics dispatch exist; native fluid metadata and exact transition timing remain unverified. |
| server | `gui.getAttribute` | 2 | `server.GameGUI.getAttribute` | `server.gui` | Executable recovered canonical surface is outside the documented declaration matrix and cannot be claimed as fully conformant. Executable recovered canonical surface is not present in the documented declaration matrix: server.GameGUI.getAttribute. |
| client | `screen.events` | 2 | `client.ClientScreen.events` | `client.ui` | Executable recovered canonical surface is outside the documented declaration matrix and cannot be claimed as fully conformant. Executable recovered canonical surface is not present in the documented declaration matrix: client.ClientScreen.events. |
| server | `world.addCollisionFilter` | 2 | `server.GameWorld.addCollisionFilter` | `server.world.entities` | At least one evidence-backed behavioral gap remains on the executable binding. Filter registration/list lifecycle is implemented; the local physics solver does not yet consume selector pairs. |
| server | `world.addZone` | 2 | `server.GameWorld.addZone` | `server.world.events` | At least one evidence-backed behavioral gap remains on the executable binding. Zone creation, polling, enter/leave events, and removal exist; selector grammar and environmental effects remain partial. |
| server | `world.onEntityContact` | 2 | `server.GameWorld.onEntityContact` | `server.world.events` | At least one evidence-backed behavioral gap remains on the executable binding. Local collider abstraction is not a historical GameEntityContactEvent. The event surface is dispatchable; full native GameEntityContactEvent production remains covered separately by the contact model. |
| server | `world.onPlayerPurchaseSuccess` | 2 | `server.GameWorld.onPlayerPurchaseSuccess` | `server.world.events` | At least one evidence-backed behavioral gap remains on the executable binding. The event surface is dispatchable; the native purchase producer and full payload remain unverified. |
| server | `storage.getGroupStorage` | 1 | `server.GameStorage.getGroupStorage` | `server.storage` | Executable recovered canonical surface is outside the documented declaration matrix and cannot be claimed as fully conformant. Executable recovered canonical surface is not present in the documented declaration matrix: server.GameStorage.getGroupStorage. |
| server | `world.airFriction` | 1 | `server.GameWorld.airFriction` | `server.world.config` | At least one evidence-backed behavioral gap remains on the executable binding. The recovered property is script-visible, but writes do not yet reconfigure the fixed-step physics engine. |
| server | `world.fogColor` | 1 | `server.GameWorld.fogColor` | `server.world.config` | At least one evidence-backed behavioral gap remains on the executable binding. The recovered GameRGBColor property is script-visible; client rendering propagation remains unimplemented. |
| server | `world.gravity` | 1 | `server.GameWorld.gravity` | `server.world.config` | At least one evidence-backed behavioral gap remains on the executable binding. The recovered property is script-visible, but writes do not yet reconfigure the fixed-step physics engine. |
| server | `world.onDie` | 1 | `server.world.onDie` | `server.world.events` | Executable recovered canonical surface is outside the documented declaration matrix and cannot be claimed as fully conformant. Executable recovered canonical surface is not present in the documented declaration matrix: server.world.onDie. |
| server | `world.onFluidLeave` | 1 | `server.GameWorld.onFluidLeave` | `server.world.events` | At least one evidence-backed behavioral gap remains on the executable binding. The event surface and local physics dispatch exist; native fluid metadata and exact transition timing remain unverified. |
| server | `world.onRespawn` | 1 | `server.GameWorld.onRespawn` | `server.world.events` | At least one evidence-backed behavioral gap remains on the executable binding. Local forceRespawn emits the recovered event shape; automatic engine respawn triggers remain unverified. |
| server | `world.onTakeDamage` | 1 | `server.world.onTakeDamage` | `server.world.events` | Executable recovered canonical surface is outside the documented declaration matrix and cannot be claimed as fully conformant. Executable recovered canonical surface is not present in the documented declaration matrix: server.world.onTakeDamage. |

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

