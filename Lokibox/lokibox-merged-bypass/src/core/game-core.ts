export interface GameCore {
  game: Game;
  onGameReady: { handlers: Function[] };
}

export type NetInputArg = {
  pauseCount: number;
  tick: number;
  events: {
    buttonState: number;
    position: [number, number, number];
    prevButtonState: number;
    rayDirection: [number, number, number];
    rayHitEntity: number;
    rayHitNormal: [number, number, number];
    rayHitVoxelX: number;
    rayHitVoxelY: number;
    rayHitVoxelZ: number;
    rayOrigin: [number, number, number];
    rayTime: number;
    tick: number;
  }[];
  input: {
    bodies: Body[];
    inputAngle: number;
    inputCameraAngle: number;
    inputPitch: number;
    inputState: number;
  };
};

export interface Game {
  state: State;
  input: Input;
  voxel: Voxel;
  onTick: { handlers: Function[] };
  net: {
    _protocol: { server: { message: { input: (n: NetInputArg) => void } } };
  };
  clientScript: {
    scriptRemoteChannel: {
      remoteChannel: {
        onClientEvent: (fn: (e: { type: string; args: any }) => void) => void;
        sendServerEvent: (e: { type: string; args: any }) => void;
      };
    };
  };
}
export interface Input {
  _applyAxisMovement: (x: number, y: number) => void;
}
export interface State {
  bodies: Body[];
  clock: Clock;
  config: { mapInfo: { contentId: number } };
  secret: Secret;
  physics: Physics;
  camera: Camera;
  players: StatePlayer[];
  playerIndex: Record<number, number>;
  playerInputs: PlayerInput[];
  replica: StateReplica;
  input: Input;
  voxel: StateVoxel;
  local: Local;
  /** 钓鱼/系统聊天消息。某些地图在钓鱼咬钩时写入此字段。 */
  chat?: import('./chat').ChatMessage;
}
export interface StatePlayer {
  flags: number;
  id: number;
  walkSpeed: number;
  walkAcceleration: number;
  runSpeed: number;
  runAcceleration: number;
  jumpPower: number;
  physGround: boolean;
}
export interface Clock {
  tick: number;
  ping: number;
  clock: number;
}
export interface StateVoxel {
  shape: [number, number, number];
}

export interface Voxel {
  _setVoxel: (x: number, y: number, z: number, id: number) => void;
  getVoxel: (x: number, y: number, z: number) => number;
}
export interface Secret {
  id: number;
  replica: SecretReplica;
}
export interface Physics {
  gravity: number;
}
export interface Camera {
  axis: Float32Array;
  rotation: number[];
  viewport: [number, number];
  viewProjection: Float32Array;
  eye: [number, number, number];
  view: Float32Array;
}
export interface Input {
  mouseButton: number;
  keyState: Record<number, number>; // Use Record instead of array to allow sparse keys like 6
}
export interface Body {
  ax: number;
  ay: number;
  az: number;
  flags: number;
  friction: number;
  group: number;
  hsx: number;
  hsy: number;
  hsz: number;
  id: number;
  mass: number;
  px: number;
  py: number;
  pz: number;
  qw: number;
  qx: number;
  qy: number;
  qz: number;
  restitution: number;
  rx: number;
  ry: number;
  rz: number;
  vx: number;
  vy: number;
  vz: number;
}
export interface StateReplica {
  players: Player[];
  damage: Damage[];
}

export interface Damage {
  id: number;
  hp: number;
  maxHp: number;
  showHealthBar: boolean;
}
export interface SecretReplica {
  camera: ReplicaCamera;
}
export interface ReplicaCamera {
  distance: number;
  fovY: number;
  freezedAxis: number;
  mode: number;
  targetId: number;
  eye: number[];
  target: number[];
  up: number[];
}
export interface Player {
  id: number;
  emissive: number;
  name: string;
  avatar_hash: string;
  flags: number;
}

export interface Local {
  pitch: number;
  yaw: number;
  prevButtonState: number;
  isLooking: boolean;
  buttonPressed: [number, number];
  lookNormal: [number, number, number];
  lookTarget: [number, number, number];
  prevKeyDown: [number, number, number];
}

export interface PlayerInput {
  angle: number;
  cameraAngle: number;
  pitch: number;
  id: number;
}
