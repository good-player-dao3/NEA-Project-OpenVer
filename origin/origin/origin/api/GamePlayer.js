class GamePlayer {
    constructor(directMessage, onChat, nextChat, onPress, nextPress, onRelease, nextRelease, onRespawn, nextRespawn, forceRespawn, dialog, cancelDialogs, link, wearables, addWearable, removeWearable, setSkinByName, resetToDefaultSkin, clearSkin, sound, animate, getAnimations, kick, setCameraPitch, setCameraYaw, postMessage, addEventListener, openMarketplace, getMiaoShells, share, openUserProfileDialog, querySocial, querySocialStatistic, onKeyDown, onKeyUp){
        this.directMessage = directMessage;
        this.onChat = onChat;
        this.nextChat = nextChat;
        this.onPress = onPress;
        this.nextPress = nextPress;
        this.onRelease = onRelease;
        this.nextRelease = nextRelease;
        this.onRespawn = onRespawn;
        this.nextRespawn = nextRespawn;
        this.forceRespawn = forceRespawn;
        this.dialog = dialog;
        this.cancelDialogs = cancelDialogs;
        this.link = link;
        this.wearables = wearables;
        this.addWearable = addWearable;
        this.removeWearable = removeWearable;
        this.setSkinByName = setSkinByName;
        this.resetToDefaultSkin = resetToDefaultSkin;
        this.clearSkin = clearSkin;
        this.sound = sound;
        this.animate = animate;
        this.getAnimations = getAnimations;
        this.kick = kick;
        this.setCameraPitch = setCameraPitch;
        this.setCameraYaw = setCameraYaw;
        this.openMarketplace = openMarketplace;
        this.getMiaoShells = getMiaoShells;
        this.share = share;
        this.openUserProfileDialog = openUserProfileDialog;
        this.querySocial = querySocial;
        this.querySocialStatistic = querySocialStatistic;
        this.onKeyDown = onKeyDown;
        this.onKeyUp = onKeyUp;
        this.gamepad = {
            joystickBackground: '',
            joystickController: '',
            flyButton: '',
            flyingBackground: '',
            flyingController: '',
            jump: '',
            crouch: '',
            actionA: '',
            actionB: ''
        };
        this.name = 'player';
        this.userId = '';
        this.userKey = '';
        this.boxId = '';
        this.avatar = '';
        this.url = null;
        this.spawnPoint = new GameVector3(0, 0, 0);
        this.movementBounds = new GameBounds3(new GameVector3(-50, -50, -50), new GameVector3(178, 178, 178));
        this.scale = 1;
        this.color = new GameRGBColor(1, 1, 1);
        this.metalness = 0;
        this.emissive = 0;
        this.shininess = 0;
        this.invisible = false;
        this.showName = true;
        this.showIndicator = false;
        this.dead = false;
        this.colorLUT = '';
        this.cameraMode = GameCameraMode.FOLLOW;
        this.cameraEntity = null;
        this.cameraTarget = new GameVector3(0, 0, 0);
        this.cameraUp = new GameVector3(0, 1, 0);
        this.cameraPosition = new GameVector3(0, 0, 0);
        this.cameraFreezedAxis = GameCameraFreezedAxis.NONE;
        this.cameraFovY = 0.25;
        this.cameraDistance = 8.5;
        this.canFly = false;
        this.spectator = false;
        this.walkSpeed = 0.22;
        this.walkAcceleration = 0.19;
        this.runSpeed = 0.4;
        this.runAcceleration = 0.35;
        this.crouchSpeed = 0.1;
        this.crouchAcceleration = 0.09;
        this.swimSpeed = 0.4;
        this.swimAcceleration = 0.1;
        this.flySpeed = 2;
        this.flyAcceleration = 2;
        this.jumpSpeedFactor = 0.85;
        this.jumpAccelerationFactor = 0.55;
        this.jumpPower = 0.96;
        this.doubleJumpPower = 0.9;
        this.freezedForwardDirection = null;
        this.moveState = GamePlayerMoveState.FALL;
        this.walkState = GamePlayerWalkState.NONE;
        this.swapInputDirection = false;
        this.reverseInputDirection = GameInputDirection.NONE;
        this.disableInputDirection = GameInputDirection.NONE;
        this.walkButton = false;
        this.crouchButton = false;
        this.jumpButton = false;
        this.enableAction0 = true;
        this.enableAction1 = true;
        this.action0Button = false;
        this.action1Button = false;
        this.enableJump = true;
        this.enableDoubleJump = true;
        this.enableCrouch = true;
        this.enable3DCursor = false;
        this.facingDirection = new GameVector3(1, 0, 0);
        this.cameraYaw = 0;
        this.cameraPitch = 0;
        this.spawnSound = new GameSoundEffect();
        this.jumpSound = new GameSoundEffect();
        this.doubleJumpSound = new GameSoundEffect();
        this.landSound = new GameSoundEffect();
        this.crouchSound = new GameSoundEffect();
        this.stepSound = new GameSoundEffect();
        this.swimSound = new GameSoundEffect();
        this.action0Sound = new GameSoundEffect();
        this.action1Sound = new GameSoundEffect();
        this.enterWaterSound = new GameSoundEffect();
        this.leaveWaterSound = new GameSoundEffect();
        this.startFlySound = new GameSoundEffect();
        this.stopFlySound = new GameSoundEffect();
        this.music = new GameSoundEffect();
        this.muted = false;
        this.skin = {
            hips: undefined,
            torso: undefined,
            neck: undefined,
            head: undefined,
            leftShoulder: undefined,
            leftUpperArm: undefined,
            leftLowerArm: undefined,
            leftHand: undefined,
            rightShoulder: undefined,
            rightUpperArm: undefined,
            rightLowerArm: undefined,
            rightHand: undefined,
            leftUpperLeg: undefined,
            leftLowerLeg: undefined,
            leftFoot: undefined,
            rightUpperLeg: undefined,
            rightLowerLeg: undefined,
            rightFoot: undefined
        };
        this.skinInvisible = {
            hips: false,
            torso: false,
            neck: false,
            head: false,
            leftShoulder: false,
            leftUpperArm: false,
            leftLowerArm: false,
            leftHand: false,
            rightShoulder: false,
            rightUpperArm: false,
            rightLowerArm: false,
            rightHand: false,
            leftUpperLeg: false,
            leftLowerLeg: false,
            leftFoot: false,
            rightUpperLeg: false,
            rightLowerLeg: false,
            rightFoot: false
        };
        this.navigator = new PlayerNavigator((type, value)=>postMessage({
                type,
                value,
                isOld: true
            }), (type, listener)=>addEventListener(type, listener), (type, value)=>postMessage({
                type,
                value,
                isOld: false
            }));
    }
}