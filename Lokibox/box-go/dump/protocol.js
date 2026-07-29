import {
  MuASCII,
  MuArray,
  MuDate,
  MuJSON,
  MuStruct,
  MuUTF8,
  MuUint8,
  MuVarint
} from "mudb/schema"

{
  name: 'net-log',
  client: {
    log: new MuStruct({
      level: new MuUint8(),
      message: new MuUTF8(),
      prefix: new MuArray(new MuASCII()),
      timestamp: new MuDate(),
      uuid: new MuASCII()
    }),
  },
  server: {
    log: new MuStruct({
      level: new MuVarint(),
      message: new MuUTF8(),
      prefix: new MuArray(new MuASCII())
    }),
    logASCII: new MuStruct({
      level: new MuVarint(),
      message: new MuASCII(),
      prefix: new MuArray(new MuASCII())
    }),
    logPino: new MuJSON(),
  },
};

import {
  MuASCII,
  MuArray,
  MuQuantizedFloat,
  MuSortedArray,
  MuStruct,
  MuUTF8,
  MuVarint
} from "mudb/schema"

{
  name: 'models',
  client: {
    appendMeshHashes: new MuArray(new MuStruct({
      bodyBX: new MuQuantizedFloat({"precision":1,"identity":64}),
      bodyBY: new MuQuantizedFloat({"precision":1,"identity":64}),
      bodyBZ: new MuQuantizedFloat({"precision":1,"identity":64}),
      bodyOffsetX: new MuQuantizedFloat({"precision":1,"identity":64}),
      bodyOffsetY: new MuQuantizedFloat({"precision":1,"identity":64}),
      bodyOffsetZ: new MuQuantizedFloat({"precision":1,"identity":64}),
      meshBX: new MuQuantizedFloat({"precision":1,"identity":64}),
      meshBY: new MuQuantizedFloat({"precision":1,"identity":64}),
      meshBZ: new MuQuantizedFloat({"precision":1,"identity":64}),
      renderBoxOffsetX: new MuQuantizedFloat({"precision":1,"identity":64}),
      renderBoxOffsetY: new MuQuantizedFloat({"precision":1,"identity":64}),
      renderBoxOffsetZ: new MuQuantizedFloat({"precision":1,"identity":64}),
      hash: new MuASCII(),
      hashType: new MuUTF8()
    })),
    appendSkinHashes: new MuArray(new MuStruct({
      hash: new MuASCII(),
      parts: new MuStruct({
        head: new MuASCII(),
        hips: new MuASCII(),
        leftFoot: new MuASCII(),
        leftHand: new MuASCII(),
        leftLowerArm: new MuASCII(),
        leftLowerLeg: new MuASCII(),
        leftShoulder: new MuASCII(),
        leftUpperArm: new MuASCII(),
        leftUpperLeg: new MuASCII(),
        neck: new MuASCII(),
        rightFoot: new MuASCII(),
        rightHand: new MuASCII(),
        rightLowerArm: new MuASCII(),
        rightLowerLeg: new MuASCII(),
        rightShoulder: new MuASCII(),
        rightUpperArm: new MuASCII(),
        rightUpperLeg: new MuASCII(),
        torso: new MuASCII()
      })
    })),
    appendSkinPartHashes: new MuSortedArray(new MuStruct({
      id: new MuVarint(),
      hash: new MuASCII()
    })),
  },
};

import {
  MuArray,
  MuDictionary,
  MuQuantizedFloat,
  MuRelativeVarint,
  MuSortedArray,
  MuStruct,
  MuUTF8,
  MuUint16,
  MuUint32,
  MuUint8,
  MuVarint,
  MuVoid
} from "mudb/schema"

import {
  MuCubeAxis,
  MuQuantizedVec3
} from "./custom-schema"

{
  name: 'game-net',
  client: {
    scriptEvents: new MuStruct({
      damage: new MuStruct({
        die: new MuArray(new MuVarint()),
        hurt: new MuArray(new MuStruct({
          damage: new MuVarint(),
          id: new MuVarint()
        })),
        respawn: new MuArray(new MuVarint())
      })
    }),
    exceedUserLimit: new MuVarint(),
    kickSessionReason: new MuUint8(),
    syncClientScriptModules: new MuDictionary(new MuUTF8()),
  },
  server: {
    join: new MuVoid(),
    synchronize: new MuVoid(),
    acknowledge: new MuUint32(),
    unpause: new MuUint32(),
    pause: new MuVoid(),
    input: new MuStruct({
      pauseCounter: new MuRelativeVarint(),
      tick: new MuRelativeVarint(),
      events: new MuArray(new MuStruct({
        rayTime: new MuQuantizedFloat({"precision":0.00390625,"identity":-1}),
        tick: new MuQuantizedFloat({"precision":0.015625,"identity":0}),
        rayHitEntity: new MuVarint(),
        rayHitVoxelX: new MuVarint(),
        rayHitVoxelY: new MuVarint(),
        rayHitVoxelZ: new MuVarint(),
        buttonState: new MuUint8(),
        prevButtonState: new MuUint8(),
        position: new MuQuantizedVec3(0.00390625, [0,0,0]),
        rayDirection: new MuQuantizedVec3(0.0009765625, [0,0,0]),
        rayHitNormal: new MuCubeAxis(),
        rayOrigin: new MuQuantizedVec3(0.00390625, [0,0,0])
      })),
      input: new MuStruct({
        inputState: new MuUint16(),
        inputAngle: new MuUint8(),
        inputCameraAngle: new MuUint8(),
        inputPitch: new MuUint8(),
        bodies: new MuSortedArray(new MuStruct({
          px: new MuQuantizedFloat({"precision":0.00390625,"identity":0}),
          py: new MuQuantizedFloat({"precision":0.00390625,"identity":0}),
          pz: new MuQuantizedFloat({"precision":0.00390625,"identity":0}),
          vx: new MuQuantizedFloat({"precision":0.00390625,"identity":0}),
          vy: new MuQuantizedFloat({"precision":0.00390625,"identity":0}),
          vz: new MuQuantizedFloat({"precision":0.00390625,"identity":0}),
          id: new MuVarint()
        }))
      })
    }),
    sendKeyBoardEvent: new MuStruct({
      id: new MuVarint(),
      tick: new MuVarint(),
      keyDownState: new MuArray(new MuUint8()),
      prevKeyDownState: new MuArray(new MuUint8())
    }),
  },
};

import {
  MuFloat64,
  MuStruct,
  MuVarint
} from "mudb/schema"

{
  name: 'game-clock',
  client: {
    pong: new MuStruct({
      frameSkip: new MuVarint(),
      clientClock: new MuFloat64(),
      serverClock: new MuFloat64()
    }),
    frameSkip: new MuVarint(),
  },
  server: {
    ping: new MuFloat64(),
  },
};

import {
  MuUint8
} from "mudb/schema"

{
  name: 'input',
  client: {
    setCameraPitch: new MuUint8(),
    setCameraYaw: new MuUint8(),
  },
};

import {
  MuASCII,
  MuArray,
  MuFloat32,
  MuQuantizedFloat,
  MuStruct,
  MuUnion,
  MuVarint,
  MuVoid
} from "mudb/schema"

import {
  MuQuantizedVec3
} from "./custom-schema"

{
  name: 'sound',
  client: {
    resetDictionary: new MuArray(new MuASCII()),
    play: new MuStruct({
      gain: new MuQuantizedFloat({"precision":0.00390625,"identity":1}),
      pitch: new MuQuantizedFloat({"precision":0.00390625,"identity":1}),
      radius: new MuQuantizedFloat({"precision":0.0625,"identity":0}),
      sampleId: new MuVarint(),
      soundId: new MuVarint(),
      position: new MuUnion({
        global: new MuVoid(),
        player: new MuVarint(),
        entity: new MuVarint(),
        position: new MuQuantizedVec3(0.0625, [0,0,0])
      })
    }),
    resume: new MuVarint(),
    pause: new MuVarint(),
    stop: new MuVarint(),
    setCurrentTime: new MuStruct({
      soundId: new MuVarint(),
      currentTime: new MuFloat32()
    }),
    setCurrentTimeAndResume: new MuStruct({
      soundId: new MuVarint(),
      currentTime: new MuFloat32()
    }),
  },
};

import {
  MuASCII,
  MuArray,
  MuBoolean,
  MuFloat64,
  MuRelativeVarint,
  MuSortedArray,
  MuStruct,
  MuUint16,
  MuUint32,
  MuUint8,
  MuVarint
} from "mudb/schema"

{
  name: 'game-terrain',
  client: {
    reset: new MuStruct({
      positionX: new MuFloat64(),
      positionY: new MuFloat64(),
      positionZ: new MuFloat64(),
      resetCounter: new MuUint32(),
      nx: new MuUint16(),
      ny: new MuUint16(),
      nz: new MuUint16(),
      innerAO: new MuBoolean(),
      blocks: new MuASCII(),
      hashes: new MuArray(new MuASCII())
    }),
    voxelChange: new MuArray(new MuStruct({
      block: new MuRelativeVarint(),
      count: new MuVarint(),
      offset: new MuVarint()
    })),
    chunkResponse: new MuStruct({
      rpcId: new MuVarint(),
      boxes: new MuSortedArray(new MuStruct({
        block: new MuVarint(),
        faces: new MuUint8(),
        maxX: new MuUint8(),
        maxY: new MuUint8(),
        maxZ: new MuUint8(),
        minX: new MuUint8(),
        minY: new MuUint8(),
        minZ: new MuUint8()
      }))
    }),
    lightMapResponse: new MuBoolean(),
    hashesResponse: new MuStruct({
      startI: new MuVarint(),
      startJ: new MuVarint(),
      startK: new MuVarint(),
      chunksInfo: new MuArray(new MuStruct({
        idx: new MuVarint(),
        hash: new MuASCII()
      })),
      dirtyChunks: new MuArray(new MuVarint())
    }),
  },
  server: {
    ready: new MuVarint(),
    fetchChunk: new MuStruct({
      chunkId: new MuVarint(),
      rpcId: new MuVarint()
    }),
    rebuildLightMap: new MuBoolean(),
    fetchHashes: new MuStruct({
      startI: new MuVarint(),
      startJ: new MuVarint(),
      startK: new MuVarint(),
      chunkIds: new MuArray(new MuVarint()),
      dirtyChunks: new MuArray(new MuVarint())
    }),
  },
};

import {
  MuASCII,
  MuBoolean,
  MuInt32,
  MuStruct,
  MuUTF8,
  MuUint32,
  MuUint8
} from "mudb/schema"

{
  name: 'game-chat',
  client: {
    log: new MuStruct({
      duration: new MuInt32(),
      id: new MuUint32(),
      msgType: new MuUint8(),
      hideFloat: new MuBoolean(),
      private: new MuBoolean(),
      valid: new MuBoolean(),
      i18nPrefix: new MuASCII(),
      i18nSuffix: new MuASCII(),
      text: new MuUTF8()
    }),
    globalNotice: new MuStruct({
      detail: new MuUTF8(),
      title: new MuUTF8()
    }),
  },
  server: {
    noticeMessage: new MuStruct({
      detail: new MuUTF8(),
      title: new MuUTF8()
    }),
  },
};

import {
  MuStruct,
  MuUTF8,
  MuVarint,
  MuVector,
  MuVoid
} from "mudb/schema"

{
  name: 'player-protocol',
  client: {
    playerJoin: new MuStruct({
      id: new MuVarint(),
      position: new MuVector('undefined', undefined)
    }),
    playerLeave: new MuStruct({
      id: new MuVarint(),
      position: new MuVector('undefined', undefined)
    }),
    openUserProfileDialog: new MuStruct({
      userId: new MuUTF8()
    }),
  },
  server: {
    updateAvatarSkin: new MuVoid(),
  },
};

import {
  MuQuantizedFloat,
  MuStruct,
  MuUint8,
  MuVarint,
  MuVoid
} from "mudb/schema"

{
  name: 'entity-interact',
  client: {
    acknowledgeInteract: new MuVoid(),
    emoteEvent: new MuStruct({
      id: new MuVarint(),
      emote: new MuUint8()
    }),
  },
  server: {
    interact: new MuStruct({
      tick: new MuQuantizedFloat({"precision":0.0625,"identity":0}),
      id: new MuVarint()
    }),
    playEmote: new MuUint8(),
  },
};

import {
  MuArray,
  MuBoolean,
  MuQuantizedFloat,
  MuStruct,
  MuUTF8,
  MuUnion,
  MuVarint,
  MuVoid
} from "mudb/schema"

{
  name: 'dialog',
  client: {
    open: new MuStruct({
      rpcId: new MuVarint(),
      config: new MuUnion({
        text: new MuStruct({
          hasArrow: new MuBoolean(),
          common: new MuStruct({
            lookEyeEntity: new MuVarint(),
            lookTargetEntity: new MuVarint(),
            lookEyeEnabled: new MuBoolean(),
            lookTargetEnabled: new MuBoolean(),
            lookUpEnabled: new MuBoolean(),
            content: new MuUTF8(),
            contentBackgroundColor: new MuStruct({
              a: new MuQuantizedFloat({"precision":0.00390625,"identity":1}),
              b: new MuQuantizedFloat({"precision":0.00390625,"identity":1}),
              g: new MuQuantizedFloat({"precision":0.00390625,"identity":1}),
              r: new MuQuantizedFloat({"precision":0.00390625,"identity":1})
            }),
            contentTextColor: new MuStruct({
              a: new MuQuantizedFloat({"precision":0.00390625,"identity":1}),
              b: new MuQuantizedFloat({"precision":0.00390625,"identity":1}),
              g: new MuQuantizedFloat({"precision":0.00390625,"identity":1}),
              r: new MuQuantizedFloat({"precision":0.00390625,"identity":1})
            }),
            lookEyeOffset: new MuStruct({
              x: new MuQuantizedFloat({"precision":0.015625,"identity":0}),
              y: new MuQuantizedFloat({"precision":0.015625,"identity":0}),
              z: new MuQuantizedFloat({"precision":0.015625,"identity":0})
            }),
            lookTargetOffset: new MuStruct({
              x: new MuQuantizedFloat({"precision":0.015625,"identity":0}),
              y: new MuQuantizedFloat({"precision":0.015625,"identity":0}),
              z: new MuQuantizedFloat({"precision":0.015625,"identity":0})
            }),
            lookUp: new MuStruct({
              x: new MuQuantizedFloat({"precision":0.015625,"identity":0}),
              y: new MuQuantizedFloat({"precision":0.015625,"identity":0}),
              z: new MuQuantizedFloat({"precision":0.015625,"identity":0})
            }),
            title: new MuUTF8(),
            titleBackgroundColor: new MuStruct({
              a: new MuQuantizedFloat({"precision":0.00390625,"identity":1}),
              b: new MuQuantizedFloat({"precision":0.00390625,"identity":1}),
              g: new MuQuantizedFloat({"precision":0.00390625,"identity":1}),
              r: new MuQuantizedFloat({"precision":0.00390625,"identity":1})
            }),
            titleTextColor: new MuStruct({
              a: new MuQuantizedFloat({"precision":0.00390625,"identity":1}),
              b: new MuQuantizedFloat({"precision":0.00390625,"identity":1}),
              g: new MuQuantizedFloat({"precision":0.00390625,"identity":1}),
              r: new MuQuantizedFloat({"precision":0.00390625,"identity":1})
            })
          })
        }),
        input: new MuStruct({
          common: new MuStruct({
            lookEyeEntity: new MuVarint(),
            lookTargetEntity: new MuVarint(),
            lookEyeEnabled: new MuBoolean(),
            lookTargetEnabled: new MuBoolean(),
            lookUpEnabled: new MuBoolean(),
            content: new MuUTF8(),
            contentBackgroundColor: new MuStruct({
              a: new MuQuantizedFloat({"precision":0.00390625,"identity":1}),
              b: new MuQuantizedFloat({"precision":0.00390625,"identity":1}),
              g: new MuQuantizedFloat({"precision":0.00390625,"identity":1}),
              r: new MuQuantizedFloat({"precision":0.00390625,"identity":1})
            }),
            contentTextColor: new MuStruct({
              a: new MuQuantizedFloat({"precision":0.00390625,"identity":1}),
              b: new MuQuantizedFloat({"precision":0.00390625,"identity":1}),
              g: new MuQuantizedFloat({"precision":0.00390625,"identity":1}),
              r: new MuQuantizedFloat({"precision":0.00390625,"identity":1})
            }),
            lookEyeOffset: new MuStruct({
              x: new MuQuantizedFloat({"precision":0.015625,"identity":0}),
              y: new MuQuantizedFloat({"precision":0.015625,"identity":0}),
              z: new MuQuantizedFloat({"precision":0.015625,"identity":0})
            }),
            lookTargetOffset: new MuStruct({
              x: new MuQuantizedFloat({"precision":0.015625,"identity":0}),
              y: new MuQuantizedFloat({"precision":0.015625,"identity":0}),
              z: new MuQuantizedFloat({"precision":0.015625,"identity":0})
            }),
            lookUp: new MuStruct({
              x: new MuQuantizedFloat({"precision":0.015625,"identity":0}),
              y: new MuQuantizedFloat({"precision":0.015625,"identity":0}),
              z: new MuQuantizedFloat({"precision":0.015625,"identity":0})
            }),
            title: new MuUTF8(),
            titleBackgroundColor: new MuStruct({
              a: new MuQuantizedFloat({"precision":0.00390625,"identity":1}),
              b: new MuQuantizedFloat({"precision":0.00390625,"identity":1}),
              g: new MuQuantizedFloat({"precision":0.00390625,"identity":1}),
              r: new MuQuantizedFloat({"precision":0.00390625,"identity":1})
            }),
            titleTextColor: new MuStruct({
              a: new MuQuantizedFloat({"precision":0.00390625,"identity":1}),
              b: new MuQuantizedFloat({"precision":0.00390625,"identity":1}),
              g: new MuQuantizedFloat({"precision":0.00390625,"identity":1}),
              r: new MuQuantizedFloat({"precision":0.00390625,"identity":1})
            })
          }),
          confirmText: new MuUTF8(),
          placeholder: new MuUTF8()
        }),
        select: new MuStruct({
          common: new MuStruct({
            lookEyeEntity: new MuVarint(),
            lookTargetEntity: new MuVarint(),
            lookEyeEnabled: new MuBoolean(),
            lookTargetEnabled: new MuBoolean(),
            lookUpEnabled: new MuBoolean(),
            content: new MuUTF8(),
            contentBackgroundColor: new MuStruct({
              a: new MuQuantizedFloat({"precision":0.00390625,"identity":1}),
              b: new MuQuantizedFloat({"precision":0.00390625,"identity":1}),
              g: new MuQuantizedFloat({"precision":0.00390625,"identity":1}),
              r: new MuQuantizedFloat({"precision":0.00390625,"identity":1})
            }),
            contentTextColor: new MuStruct({
              a: new MuQuantizedFloat({"precision":0.00390625,"identity":1}),
              b: new MuQuantizedFloat({"precision":0.00390625,"identity":1}),
              g: new MuQuantizedFloat({"precision":0.00390625,"identity":1}),
              r: new MuQuantizedFloat({"precision":0.00390625,"identity":1})
            }),
            lookEyeOffset: new MuStruct({
              x: new MuQuantizedFloat({"precision":0.015625,"identity":0}),
              y: new MuQuantizedFloat({"precision":0.015625,"identity":0}),
              z: new MuQuantizedFloat({"precision":0.015625,"identity":0})
            }),
            lookTargetOffset: new MuStruct({
              x: new MuQuantizedFloat({"precision":0.015625,"identity":0}),
              y: new MuQuantizedFloat({"precision":0.015625,"identity":0}),
              z: new MuQuantizedFloat({"precision":0.015625,"identity":0})
            }),
            lookUp: new MuStruct({
              x: new MuQuantizedFloat({"precision":0.015625,"identity":0}),
              y: new MuQuantizedFloat({"precision":0.015625,"identity":0}),
              z: new MuQuantizedFloat({"precision":0.015625,"identity":0})
            }),
            title: new MuUTF8(),
            titleBackgroundColor: new MuStruct({
              a: new MuQuantizedFloat({"precision":0.00390625,"identity":1}),
              b: new MuQuantizedFloat({"precision":0.00390625,"identity":1}),
              g: new MuQuantizedFloat({"precision":0.00390625,"identity":1}),
              r: new MuQuantizedFloat({"precision":0.00390625,"identity":1})
            }),
            titleTextColor: new MuStruct({
              a: new MuQuantizedFloat({"precision":0.00390625,"identity":1}),
              b: new MuQuantizedFloat({"precision":0.00390625,"identity":1}),
              g: new MuQuantizedFloat({"precision":0.00390625,"identity":1}),
              r: new MuQuantizedFloat({"precision":0.00390625,"identity":1})
            })
          }),
          options: new MuArray(new MuUTF8())
        })
      })
    }),
    cancelDialogs: new MuVoid(),
    cancelDialog: new MuVarint(),
  },
  server: {
    close: new MuStruct({
      rpcId: new MuVarint(),
      result: new MuUnion({
        close: new MuVoid(),
        text: new MuUTF8(),
        input: new MuUTF8(),
        select: new MuStruct({
          index: new MuVarint(),
          value: new MuUTF8()
        })
      })
    }),
  },
};

import {
  MuBoolean,
  MuJSON,
  MuStruct,
  MuUTF8
} from "mudb/schema"

{
  name: 'navigator',
  client: {
    postMessage: new MuStruct({
      isOld: new MuBoolean(),
      type: new MuUTF8(),
      value: new MuUTF8()
    }),
  },
  server: {
    messageEvent: new MuStruct({
      data: new MuJSON()
    }),
  },
};

import {
  MuBoolean,
  MuStruct,
  MuUTF8
} from "mudb/schema"

{
  name: 'ref',
  client: {
    openLink: new MuStruct({
      isConfirm: new MuBoolean(),
      isNewTab: new MuBoolean(),
      warning: new MuBoolean(),
      href: new MuUTF8()
    }),
  },
};

import {
  MuASCII,
  MuBoolean,
  MuFloat32,
  MuStruct,
  MuUTF8,
  MuVarint
} from "mudb/schema"

{
  name: 'rtc',
  client: {
    join: new MuStruct({
      handle: new MuVarint(),
      appId: new MuASCII(),
      channelId: new MuASCII(),
      token: new MuASCII()
    }),
    leave: new MuStruct({
      handle: new MuVarint(),
      channelId: new MuASCII()
    }),
    unpublish: new MuStruct({
      handle: new MuVarint(),
      channelId: new MuASCII()
    }),
    publishMicrophone: new MuStruct({
      handle: new MuVarint(),
      channelId: new MuASCII()
    }),
    getVolume: new MuStruct({
      handle: new MuVarint(),
      channelId: new MuASCII()
    }),
    setVolume: new MuStruct({
      handle: new MuVarint(),
      volume: new MuFloat32(),
      channelId: new MuASCII()
    }),
    getMicrophonePermission: new MuStruct({
      handle: new MuVarint()
    }),
    tokenReturn: new MuStruct({
      handle: new MuVarint(),
      token: new MuASCII()
    }),
  },
  server: {
    return: new MuStruct({
      handle: new MuVarint()
    }),
    volumeReturn: new MuStruct({
      handle: new MuVarint(),
      volume: new MuFloat32()
    }),
    permissionReturn: new MuStruct({
      handle: new MuVarint(),
      permission: new MuBoolean()
    }),
    throw: new MuStruct({
      handle: new MuVarint(),
      message: new MuUTF8()
    }),
    fetchToken: new MuStruct({
      handle: new MuVarint(),
      uid: new MuVarint(),
      channelId: new MuASCII()
    }),
  },
};

import {
  MuBoolean,
  MuStruct,
  MuUTF8,
  MuVarint,
  MuVoid
} from "mudb/schema"

{
  name: 'gui',
  client: {
    init: new MuStruct({
      handle: new MuVarint(),
      data: new MuUTF8()
    }),
    append: new MuStruct({
      handle: new MuVarint(),
      data: new MuUTF8(),
      selector: new MuUTF8()
    }),
    remove: new MuStruct({
      handle: new MuVarint(),
      selector: new MuUTF8()
    }),
    show: new MuStruct({
      handle: new MuVarint(),
      allowMultiple: new MuBoolean(),
      name: new MuUTF8()
    }),
    getAttribute: new MuStruct({
      handle: new MuVarint(),
      name: new MuUTF8(),
      selector: new MuUTF8()
    }),
    setAttribute: new MuStruct({
      handle: new MuVarint(),
      name: new MuUTF8(),
      selector: new MuUTF8(),
      value: new MuUTF8()
    }),
    reset: new MuVoid(),
  },
  server: {
    return: new MuStruct({
      handle: new MuVarint(),
      value: new MuUTF8()
    }),
    throw: new MuStruct({
      handle: new MuVarint(),
      message: new MuUTF8()
    }),
    sendMessage: new MuStruct({
      name: new MuUTF8(),
      payload: new MuUTF8()
    }),
  },
};

import {
  MuArray,
  MuStruct,
  MuUTF8
} from "mudb/schema"

{
  name: 'market',
  client: {
    openMarketplace: new MuStruct({
      productIds: new MuArray(new MuUTF8())
    }),
  },
};

import {
  MuASCII,
  MuStruct,
  MuUTF8
} from "mudb/schema"

{
  name: 'teleport',
  client: {
    teleport: new MuStruct({
      playHash: new MuASCII(),
      serverId: new MuUTF8()
    }),
    editTeleport: new MuASCII(),
  },
};

import {
  MuStruct,
  MuUTF8,
  MuVarint
} from "mudb/schema"

{
  name: 'remote-channel',
  client: {
    sendClientEvent: new MuStruct({
      tick: new MuVarint(),
      args: new MuUTF8()
    }),
  },
  server: {
    sendServerEvent: new MuStruct({
      tick: new MuVarint(),
      args: new MuUTF8()
    }),
  },
};

import {
  MuASCII,
  MuArray,
  MuBoolean,
  MuDictionary,
  MuInt32,
  MuOption,
  MuQuantizedFloat,
  MuStruct,
  MuUTF8,
  MuUint8,
  MuUnion,
  MuVarint,
  MuVoid
} from "mudb/schema"

import {
  MuQuantizedVec2,
  MuQuantizedVec3
} from "./custom-schema"

{
  name: 'gameUI',
  client: {
    reset: new MuStruct({
      running: new MuBoolean(),
      defaultScreenId: new MuUTF8(),
      pictureAssets: new MuDictionary(new MuStruct({
        height: new MuInt32(),
        width: new MuInt32(),
        hash: new MuASCII(),
        metadataHash: new MuASCII()
      })),
      uiTree: new MuDictionary(new MuStruct({
        type: new MuVarint(),
        childrenIds: new MuArray(new MuASCII()),
        id: new MuASCII(),
        name: new MuUTF8(),
        parentId: new MuASCII(),
        value: new MuOption(new MuUnion({
          screen: new MuStruct({
            zIndex: new MuVarint(),
            enable: new MuBoolean(),
            layout: new MuUnion({
              none: new MuVoid(),
              autoLayout: new MuStruct({
                maxCells: new MuVarint(),
                fillDirection: new MuUint8(),
                horizontalAlignment: new MuUint8(),
                startCorner: new MuUint8(),
                verticalAlignment: new MuUint8(),
                columnWidthEnabled: new MuBoolean(),
                lineHeightEnabled: new MuBoolean(),
                maxCellsEnabled: new MuBoolean(),
                cellPadding: new MuStruct({
                  offset: new MuQuantizedVec2(0.00390625, [5,5]),
                  ratio: new MuQuantizedVec2(0.0009765625, [0,0])
                }),
                cellSize: new MuStruct({
                  offset: new MuQuantizedVec2(0.00390625, [50,50]),
                  ratio: new MuQuantizedVec2(0.0009765625, [0,0])
                })
              })
            })
          }),
          element: new MuUnion({
            box: new MuStruct({
              backgroundOpacity: new MuQuantizedFloat({"precision":0.0009765625,"identity":1}),
              rotation: new MuQuantizedFloat({"precision":0.0009765625,"identity":0}),
              layoutOrder: new MuVarint(),
              zIndex: new MuVarint(),
              autoResize: new MuUint8(),
              clipsDescendants: new MuBoolean(),
              visible: new MuBoolean(),
              anchor: new MuQuantizedVec2(0.0009765625, [0,0]),
              backgroundColor: new MuQuantizedVec3(1, [255,255,255]),
              layout: new MuUnion({
                none: new MuVoid(),
                autoLayout: new MuStruct({
                  maxCells: new MuVarint(),
                  fillDirection: new MuUint8(),
                  horizontalAlignment: new MuUint8(),
                  startCorner: new MuUint8(),
                  verticalAlignment: new MuUint8(),
                  columnWidthEnabled: new MuBoolean(),
                  lineHeightEnabled: new MuBoolean(),
                  maxCellsEnabled: new MuBoolean(),
                  cellPadding: new MuStruct({
                    offset: new MuQuantizedVec2(0.00390625, [5,5]),
                    ratio: new MuQuantizedVec2(0.0009765625, [0,0])
                  }),
                  cellSize: new MuStruct({
                    offset: new MuQuantizedVec2(0.00390625, [50,50]),
                    ratio: new MuQuantizedVec2(0.0009765625, [0,0])
                  })
                })
              }),
              position: new MuStruct({
                offset: new MuQuantizedVec2(0.00390625, [0,0]),
                ratio: new MuQuantizedVec2(0.0009765625, [0,0])
              }),
              size: new MuStruct({
                offset: new MuQuantizedVec2(0.00390625, [400,300]),
                ratio: new MuQuantizedVec2(0.0009765625, [0,0])
              })
            }),
            image: new MuStruct({
              backgroundOpacity: new MuQuantizedFloat({"precision":0.0009765625,"identity":1}),
              imageOpacity: new MuQuantizedFloat({"precision":0.0009765625,"identity":1}),
              rotation: new MuQuantizedFloat({"precision":0.0009765625,"identity":0}),
              layoutOrder: new MuVarint(),
              zIndex: new MuVarint(),
              autoResize: new MuUint8(),
              imageDisplayMode: new MuUint8(),
              clipsDescendants: new MuBoolean(),
              visible: new MuBoolean(),
              anchor: new MuQuantizedVec2(0.0009765625, [0,0]),
              backgroundColor: new MuQuantizedVec3(1, [255,255,255]),
              image: new MuUTF8(),
              layout: new MuUnion({
                none: new MuVoid(),
                autoLayout: new MuStruct({
                  maxCells: new MuVarint(),
                  fillDirection: new MuUint8(),
                  horizontalAlignment: new MuUint8(),
                  startCorner: new MuUint8(),
                  verticalAlignment: new MuUint8(),
                  columnWidthEnabled: new MuBoolean(),
                  lineHeightEnabled: new MuBoolean(),
                  maxCellsEnabled: new MuBoolean(),
                  cellPadding: new MuStruct({
                    offset: new MuQuantizedVec2(0.00390625, [5,5]),
                    ratio: new MuQuantizedVec2(0.0009765625, [0,0])
                  }),
                  cellSize: new MuStruct({
                    offset: new MuQuantizedVec2(0.00390625, [50,50]),
                    ratio: new MuQuantizedVec2(0.0009765625, [0,0])
                  })
                })
              }),
              position: new MuStruct({
                offset: new MuQuantizedVec2(0.00390625, [0,0]),
                ratio: new MuQuantizedVec2(0.0009765625, [0,0])
              }),
              size: new MuStruct({
                offset: new MuQuantizedVec2(0.00390625, [200,200]),
                ratio: new MuQuantizedVec2(0.0009765625, [0,0])
              })
            }),
            text: new MuStruct({
              backgroundOpacity: new MuQuantizedFloat({"precision":0.0009765625,"identity":0}),
              rotation: new MuQuantizedFloat({"precision":0.0009765625,"identity":0}),
              textLineHeight: new MuQuantizedFloat({"precision":0.00390625,"identity":1.19921875}),
              textOpacity: new MuQuantizedFloat({"precision":0.0009765625,"identity":1}),
              textStrokeOpacity: new MuQuantizedFloat({"precision":0.0009765625,"identity":1}),
              textStrokeThickness: new MuQuantizedFloat({"precision":0.0009765625,"identity":0}),
              layoutOrder: new MuVarint(),
              zIndex: new MuVarint(),
              autoResize: new MuUint8(),
              textFontFamily: new MuUint8(),
              textFontSize: new MuUint8(),
              textXAlignment: new MuUint8(),
              textYAlignment: new MuUint8(),
              autoWordWrap: new MuBoolean(),
              clipsDescendants: new MuBoolean(),
              richText: new MuBoolean(),
              visible: new MuBoolean(),
              anchor: new MuQuantizedVec2(0.0009765625, [0,0]),
              backgroundColor: new MuQuantizedVec3(1, [255,255,255]),
              layout: new MuUnion({
                none: new MuVoid(),
                autoLayout: new MuStruct({
                  maxCells: new MuVarint(),
                  fillDirection: new MuUint8(),
                  horizontalAlignment: new MuUint8(),
                  startCorner: new MuUint8(),
                  verticalAlignment: new MuUint8(),
                  columnWidthEnabled: new MuBoolean(),
                  lineHeightEnabled: new MuBoolean(),
                  maxCellsEnabled: new MuBoolean(),
                  cellPadding: new MuStruct({
                    offset: new MuQuantizedVec2(0.00390625, [5,5]),
                    ratio: new MuQuantizedVec2(0.0009765625, [0,0])
                  }),
                  cellSize: new MuStruct({
                    offset: new MuQuantizedVec2(0.00390625, [50,50]),
                    ratio: new MuQuantizedVec2(0.0009765625, [0,0])
                  })
                })
              }),
              position: new MuStruct({
                offset: new MuQuantizedVec2(0.00390625, [0,0]),
                ratio: new MuQuantizedVec2(0.0009765625, [0,0])
              }),
              size: new MuStruct({
                offset: new MuQuantizedVec2(0.00390625, [200,50]),
                ratio: new MuQuantizedVec2(0.0009765625, [0,0])
              }),
              textColor: new MuQuantizedVec3(1, [0,0,0]),
              textContent: new MuUTF8(),
              textStrokeColor: new MuQuantizedVec3(1, [255,255,255])
            }),
            scrollBox: new MuStruct({
              backgroundOpacity: new MuQuantizedFloat({"precision":0.0009765625,"identity":1}),
              rotation: new MuQuantizedFloat({"precision":0.0009765625,"identity":0}),
              scrollbarOpacity: new MuQuantizedFloat({"precision":0.0009765625,"identity":1}),
              layoutOrder: new MuVarint(),
              scrollbarThickness: new MuVarint(),
              zIndex: new MuVarint(),
              autoResize: new MuUint8(),
              scrollCanvasAutoResize: new MuUint8(),
              scrollDirection: new MuUint8(),
              scrollbarHorizontal: new MuUint8(),
              scrollbarVertical: new MuUint8(),
              scrollbarVisibility: new MuUint8(),
              clipsDescendants: new MuBoolean(),
              visible: new MuBoolean(),
              anchor: new MuQuantizedVec2(0.0009765625, [0,0]),
              backgroundColor: new MuQuantizedVec3(1, [255,255,255]),
              layout: new MuUnion({
                none: new MuVoid(),
                autoLayout: new MuStruct({
                  maxCells: new MuVarint(),
                  fillDirection: new MuUint8(),
                  horizontalAlignment: new MuUint8(),
                  startCorner: new MuUint8(),
                  verticalAlignment: new MuUint8(),
                  columnWidthEnabled: new MuBoolean(),
                  lineHeightEnabled: new MuBoolean(),
                  maxCellsEnabled: new MuBoolean(),
                  cellPadding: new MuStruct({
                    offset: new MuQuantizedVec2(0.00390625, [5,5]),
                    ratio: new MuQuantizedVec2(0.0009765625, [0,0])
                  }),
                  cellSize: new MuStruct({
                    offset: new MuQuantizedVec2(0.00390625, [50,50]),
                    ratio: new MuQuantizedVec2(0.0009765625, [0,0])
                  })
                })
              }),
              position: new MuStruct({
                offset: new MuQuantizedVec2(0.00390625, [0,0]),
                ratio: new MuQuantizedVec2(0.0009765625, [0,0])
              }),
              scrollCanvasSize: new MuStruct({
                offset: new MuQuantizedVec2(0.00390625, [500,500]),
                ratio: new MuQuantizedVec2(0.0009765625, [0,0])
              }),
              scrollPosition: new MuQuantizedVec2(0.00390625, [0,0]),
              scrollbarColor: new MuQuantizedVec3(1, [153,153,153]),
              size: new MuStruct({
                offset: new MuQuantizedVec2(0.00390625, [300,300]),
                ratio: new MuQuantizedVec2(0.0009765625, [0,0])
              })
            }),
            input: new MuStruct({
              backgroundOpacity: new MuQuantizedFloat({"precision":0.0009765625,"identity":1}),
              placeholderOpacity: new MuQuantizedFloat({"precision":0.0009765625,"identity":1}),
              rotation: new MuQuantizedFloat({"precision":0.0009765625,"identity":0}),
              textLineHeight: new MuQuantizedFloat({"precision":0.00390625,"identity":1.19921875}),
              textOpacity: new MuQuantizedFloat({"precision":0.0009765625,"identity":1}),
              textStrokeOpacity: new MuQuantizedFloat({"precision":0.0009765625,"identity":1}),
              textStrokeThickness: new MuQuantizedFloat({"precision":0.0009765625,"identity":0}),
              layoutOrder: new MuVarint(),
              zIndex: new MuVarint(),
              autoResize: new MuUint8(),
              textFontFamily: new MuUint8(),
              textFontSize: new MuUint8(),
              textXAlignment: new MuUint8(),
              textYAlignment: new MuUint8(),
              autoWordWrap: new MuBoolean(),
              clipsDescendants: new MuBoolean(),
              visible: new MuBoolean(),
              anchor: new MuQuantizedVec2(0.0009765625, [0,0]),
              backgroundColor: new MuQuantizedVec3(1, [255,255,255]),
              layout: new MuUnion({
                none: new MuVoid(),
                autoLayout: new MuStruct({
                  maxCells: new MuVarint(),
                  fillDirection: new MuUint8(),
                  horizontalAlignment: new MuUint8(),
                  startCorner: new MuUint8(),
                  verticalAlignment: new MuUint8(),
                  columnWidthEnabled: new MuBoolean(),
                  lineHeightEnabled: new MuBoolean(),
                  maxCellsEnabled: new MuBoolean(),
                  cellPadding: new MuStruct({
                    offset: new MuQuantizedVec2(0.00390625, [5,5]),
                    ratio: new MuQuantizedVec2(0.0009765625, [0,0])
                  }),
                  cellSize: new MuStruct({
                    offset: new MuQuantizedVec2(0.00390625, [50,50]),
                    ratio: new MuQuantizedVec2(0.0009765625, [0,0])
                  })
                })
              }),
              placeholder: new MuUTF8(),
              placeholderColor: new MuQuantizedVec3(1, [172,172,164]),
              position: new MuStruct({
                offset: new MuQuantizedVec2(0.00390625, [0,0]),
                ratio: new MuQuantizedVec2(0.0009765625, [0,0])
              }),
              size: new MuStruct({
                offset: new MuQuantizedVec2(0.00390625, [200,50]),
                ratio: new MuQuantizedVec2(0.0009765625, [0,0])
              }),
              textColor: new MuQuantizedVec3(1, [0,0,0]),
              textContent: new MuUTF8(),
              textStrokeColor: new MuQuantizedVec3(1, [255,255,255])
            })
          })
        }))
      }))
    }),
  },
};

import {
  MuUTF8,
  MuVoid
} from "mudb/schema"

{
  name: 'admin',
  client: {
    redirect: new MuUTF8(),
    alert: new MuUTF8(),
  },
  server: {
    closeWebsocket: new MuVoid(),
    logCurrentStore: new MuVoid(),
  },
};