class GameEntity {
    constructor(tags, addTag, removeTag, hasTag, destroy, onDestroy, nextDestroy, onTakeDamage, nextTakeDamage, onDie, nextDie, hurt, say, animate, getAnimations, onClick, nextClick, onEntityContact, nextEntityContact, onEntitySeparate, nextEntitySeparate, onVoxelContact, nextVoxelContact, onVoxelSeparate, nextVoxelSeparate, onFluidEnter, nextFluidEnter, onFluidLeave, nextFluidLeave, onInteract, nextInteract, sound, motion, lookAt, rotateLocal, scaleLocal){
        this.tags = tags;
        this.addTag = addTag;
        this.removeTag = removeTag;
        this.hasTag = hasTag;
        this.destroy = destroy;
        this.onDestroy = onDestroy;
        this.nextDestroy = nextDestroy;
        this.onTakeDamage = onTakeDamage;
        this.nextTakeDamage = nextTakeDamage;
        this.onDie = onDie;
        this.nextDie = nextDie;
        this.hurt = hurt;
        this.say = say;
        this.animate = animate;
        this.getAnimations = getAnimations;
        this.onClick = onClick;
        this.nextClick = nextClick;
        this.onEntityContact = onEntityContact;
        this.nextEntityContact = nextEntityContact;
        this.onEntitySeparate = onEntitySeparate;
        this.nextEntitySeparate = nextEntitySeparate;
        this.onVoxelContact = onVoxelContact;
        this.nextVoxelContact = nextVoxelContact;
        this.onVoxelSeparate = onVoxelSeparate;
        this.nextVoxelSeparate = nextVoxelSeparate;
        this.onFluidEnter = onFluidEnter;
        this.nextFluidEnter = nextFluidEnter;
        this.onFluidLeave = onFluidLeave;
        this.nextFluidLeave = nextFluidLeave;
        this.onInteract = onInteract;
        this.nextInteract = nextInteract;
        this.sound = sound;
        this.motion = motion;
        this.lookAt = lookAt;
        this.rotateLocal = rotateLocal;
        this.scaleLocal = scaleLocal;
        this.id = '';
        this.destroyed = false;
        this.position = new GameVector3(0, 0, 0);
        this.velocity = new GameVector3(0, 0, 0);
        this.bounds = new GameVector3(1, 1, 1);
        this.mass = 1;
        this.friction = 0;
        this.restitution = 0;
        this.collides = true;
        this.gravity = true;
        this.fixed = false;
        this.contactForce = new GameVector3(0, 0, 0);
        this.entityContacts = [];
        this.voxelContacts = [];
        this.fluidContacts = [];
        this.mesh = '';
        this.meshInvisible = false;
        this.meshScale = new GameVector3(1 / 64, 1 / 64, 1 / 64);
        this.meshOrientation = new GameQuaternion(0, 0, 0, 1);
        this.meshOffset = new GameVector3(0, 0, 0);
        this.meshColor = new GameRGBAColor(1, 1, 1, 1);
        this.meshMetalness = 0;
        this.meshEmissive = 0;
        this.meshShininess = 0;
        this.anchorOffset = new GameVector3(0, 0, 0);
        this.enableDamage = false;
        this.showHealthBar = true;
        this.hp = 100;
        this.maxHp = 100;
        this.isPlayer = false;
        this.particleRate = 0;
        this.particleRateSpread = 0;
        this.particleLimit = 100;
        this.particleColor = [
            new GameRGBColor(1, 1, 1),
            new GameRGBColor(1, 1, 1),
            new GameRGBColor(1, 1, 1),
            new GameRGBColor(1, 1, 1),
            new GameRGBColor(1, 1, 1)
        ];
        this.particleSize = [
            1,
            1,
            1,
            1,
            1
        ];
        this.particleSizeSpread = 0;
        this.particleLifetime = 10;
        this.particleLifetimeSpread = 0;
        this.particleVelocity = new GameVector3(0, 0, 0);
        this.particleVelocitySpread = new GameVector3(0, 0, 0);
        this.particleDamping = 0;
        this.particleAcceleration = new GameVector3(0, 0, 0);
        this.particleNoise = 0;
        this.particleNoiseFrequency = 1;
        this.particleTarget = null;
        this.particleTargetWeight = 1;
        this.enableInteract = false;
        this.interactColor = new GameRGBColor(0, 1, 0);
        this.interactHint = '';
        this.interactRadius = 16;
        this.showEntityName = false;
        this.customName = '';
        this.nameRadius = 16;
        this.nameColor = new GameRGBColor(1, 1, 1);
        this.chatSound = new GameSoundEffect();
        this.hurtSound = new GameSoundEffect();
        this.dieSound = new GameSoundEffect();
        this.interactSound = new GameSoundEffect();
    }
}