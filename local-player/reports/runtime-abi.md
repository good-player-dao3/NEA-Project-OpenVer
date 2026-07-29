# DAO3 / Box3 Local Runtime ABI

- Player protocols: 20
- Player messages: client 58, server 32
- Script runtime protocols: 12
- Script messages: client 28, server 62

## Startup Flow

1. Platform loads `/play/{gameName}` and creates the historical Player iframe.
2. Iframe and parent complete the Penpal `syn` / `synAck` / `ack` bridge.
3. Player loads manifest-verified Next.js chunks and content-addressed assets.
4. Player calls `POST /api/createSession`.
5. Player opens three WebSockets with the same `sid`.
6. Server marks the first socket reliable and the other two unreliable.
7. Reliable socket begins the binary MuDB protocol negotiation.

## Player Protocols

### admin

- Client receives: redirect, alert
- Server receives: closeWebsocket, logCurrentStore

### dialog

- Client receives: open, cancelDialogs, cancelDialog
- Server receives: close

### entity-interact

- Client receives: acknowledgeInteract, emoteEvent
- Server receives: interact, playEmote

### game-chat

- Client receives: log, globalNotice
- Server receives: noticeMessage

### game-clock

- Client receives: pong, frameSkip
- Server receives: ping

### game-net

- Client receives: scriptEvents, exceedUserLimit, kickSessionReason, syncClientScriptModules
- Server receives: join, synchronize, acknowledge, unpause, pause, input, sendKeyBoardEvent

### game-terrain

- Client receives: reset, voxelChange, chunkResponse, lightMapResponse, hashesResponse
- Server receives: ready, fetchChunk, rebuildLightMap, fetchHashes

### gameUI

- Client receives: reset
- Server receives: none

### gui

- Client receives: init, append, remove, show, getAttribute, setAttribute, reset
- Server receives: return, throw, sendMessage

### input

- Client receives: setCameraPitch, setCameraYaw
- Server receives: none

### market

- Client receives: openMarketplace
- Server receives: none

### models

- Client receives: appendMeshHashes, appendSkinHashes, appendSkinPartHashes
- Server receives: none

### navigator

- Client receives: postMessage
- Server receives: messageEvent

### net-log

- Client receives: log
- Server receives: log, logASCII, logPino

### player-protocol

- Client receives: playerJoin, playerLeave, openUserProfileDialog
- Server receives: updateAvatarSkin

### ref

- Client receives: openLink
- Server receives: none

### remote-channel

- Client receives: sendClientEvent
- Server receives: sendServerEvent

### rtc

- Client receives: join, leave, unpublish, publishMicrophone, getVolume, setVolume, getMicrophonePermission, tokenReturn
- Server receives: return, volumeReturn, permissionReturn, throw, fetchToken

### sound

- Client receives: resetDictionary, play, resume, pause, stop, setCurrentTime, setCurrentTimeAndResume
- Server receives: none

### teleport

- Client receives: teleport, editTeleport
- Server receives: none

## Script Runtime Protocols

### script-protocol

- Client receives: start, poll, invokeEval, syncResources
- Server receives: log, clearLog, systemLogSink, chatLog, dialog, cancelAllDialogs, cancelDialog, exception, postTick, replyEval, pump, sound, resumeSound, pauseSound, stopSound, setSoundCurrentTime, setSoundCurrentTimeAndResume, kick, setCameraPitch, setCameraYaw, openUserProfileDialog

### storage-api

- Client receives: queryRows, queryDone, queryError, dbResultDone, dbFetchError
- Server receives: query, queryStep, queryAbort, dbFetch

### navigator-script

- Client receives: notifyMessageEvent, reset
- Server receives: postMessage

### hyperlink-script

- Client receives: none
- Server receives: openLink

### http

- Client receives: fetchResponseHead, fetchError, fetchBodyText, fetchBodyArrayBuffer, readBodyError
- Server receives: fetch, readText, readArrayBuffer, close

### rtc

- Client receives: return, throw, listReturn, volumeReturn, permissionReturn
- Server receives: destroyChannel, joinChannel, leaveChannel, unpublish, publishMicrophone, listChannelPlayers, setVolume, getVolume, getMicrophonePermission

### gui

- Client receives: return, throw, sendMessage
- Server receives: init, append, remove, show, getAttribute, setAttribute

### market-script

- Client receives: none
- Server receives: openMarketplace, ackPurchaseSuccessMsg

### teleport-api

- Client receives: teleportDone, teleportError
- Server receives: teleport

### fetch-api

- Client receives: fetchDone, fetchError
- Server receives: getMiaoShells, querySocial, querySocialStatistic, createTempChat, destroyTempChat, addTempChatPlayer, removeTempChatPlayer, getTempChats, getTempChatUsers

### remote-channel-api

- Client receives: none
- Server receives: sendEventToClients, broadcastEvent

### analytics

- Client receives: none
- Server receives: initSensor, trackSensor

## Backend Gap

- Implement MuDB protocol negotiation after the WebSocket reliability marker.
- Register the 20 Player protocols in the captured order and byte-exact schemas.
- Emit bootstrap model, sound, terrain, player, game-net, and clock state from the recovered bootstrap archive.
- Serve terrain chunk/hash/light-map requests and authoritative input acknowledgements.
- Connect the 12 Script runtime protocols to the recovered `origin` ScriptShell implementation.
