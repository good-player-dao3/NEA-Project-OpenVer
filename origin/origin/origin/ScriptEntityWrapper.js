class ScriptEntityWrapper {
    setSkinByName(skinName, resource) {
        if (!this.entity.player) {
            return;
        }
        if (typeof skinName !== 'string') {
            console.warn(`error read param ${JSON.stringify(skinName)}, skin name must be string`);
            return;
        }
        if (!resource.nameToSkinId[skinName]) {
            console.warn(`cannot find skin name ${skinName} in resources`);
            return;
        }
        const { skin } = this.entity.player;
        Object.keys(skin).forEach((partName)=>skin[partName] = skinName);
    }
    resetToDefaultSkin(resource) {
        if (!this.entity.player) {
            return;
        }
        const { skin } = this.entity.player;
        Object.keys(skin).forEach((partName)=>skin[partName] = resource.defaultSkinName);
    }
    pollWearables(resource) {
        const wearableScript = this.wearables;
        const wearableEngine = [];
        for(let i = 0; i < wearableScript.length; ++i){
            const script = wearableScript[i];
            coerceWearableConfig(script, script);
            const meshId = resource.getMeshId(script.mesh);
            if (!meshId) {
                continue;
            }
            const engine = ScriptWearableSchema.alloc();
            engine.part = BodyPart[script.bodyPart] || 0;
            engine.red = +script.color.r;
            engine.green = +script.color.g;
            engine.blue = +script.color.b;
            engine.emissive = +script.emissive;
            engine.metalness = +script.metalness;
            engine.shininess = +script.shininess;
            engine.meshId = meshId;
            engine.offset[0] = +script.offset.x;
            engine.offset[1] = +script.offset.y;
            engine.offset[2] = +script.offset.z;
            engine.scale[0] = +script.scale.x;
            engine.scale[1] = +script.scale.y;
            engine.scale[2] = +script.scale.z;
            engine.orientation[0] = +script.orientation.w;
            engine.orientation[1] = +script.orientation.x;
            engine.orientation[2] = +script.orientation.y;
            engine.orientation[3] = +script.orientation.z;
            wearableEngine.push(engine);
        }
        const changed = !ScriptWearableSetSchema.equal(wearableEngine, this.wearableState.wearables);
        if (changed) {
            const prevWearable = this.wearableState.wearables;
            this.wearableState.wearables = wearableEngine;
            ScriptWearableSetSchema.free(prevWearable);
        } else {
            ScriptWearableSetSchema.free(wearableEngine);
        }
        return changed;
    }
    applyTransform(px, py, pz) {
        const sx = this.entity.meshScale.x;
        const sy = this.entity.meshScale.y;
        const sz = this.entity.meshScale.z;
        const qx = this.entity.meshOrientation.w;
        const qy = this.entity.meshOrientation.x;
        const qz = this.entity.meshOrientation.y;
        const qw = this.entity.meshOrientation.z;
        const x2 = qx + qx;
        const y2 = qy + qy;
        const z2 = qz + qz;
        const xx = qx * x2;
        const yx = qy * x2;
        const yy = qy * y2;
        const zx = qz * x2;
        const zy = qz * y2;
        const zz = qz * z2;
        const wx = qw * x2;
        const wy = qw * y2;
        const wz = qw * z2;
        const m0 = 1 - yy - zz;
        const m1 = yx + wz;
        const m2 = zx - wy;
        const m3 = yx - wz;
        const m4 = 1 - xx - zz;
        const m5 = zy + wx;
        const m6 = zx + wy;
        const m7 = zy - wx;
        const m8 = 1 - xx - yy;
        let tempX = sx * px;
        let tempY = sy * py;
        let tempZ = sz * pz;
        return {
            px: tempX * m0 + tempY * m3 + tempZ * m6,
            py: tempX * m1 + tempY * m4 + tempZ * m7,
            pz: tempX * m2 + tempY * m5 + tempZ * m8
        };
    }
    destroyWrapper(reason, scheduler) {
        this.onDamage.destroy(reason, scheduler);
        this.onDie.destroy(reason, scheduler);
        this.onRespawn.destroy(reason, scheduler);
        this.onEntityContact.destroy(reason, scheduler);
        this.onEntitySeparate.destroy(reason, scheduler);
        this.onVoxelContact.destroy(reason, scheduler);
        this.onVoxelSeparate.destroy(reason, scheduler);
        this.onFluidEnter.destroy(reason, scheduler);
        this.onFluidLeave.destroy(reason, scheduler);
        this.onChat.destroy(reason, scheduler);
        this.onClick.destroy(reason, scheduler);
        this.onPress.destroy(reason, scheduler);
        this.onKeyUp.destroy(reason, scheduler);
        this.onKeyDown.destroy(reason, scheduler);
        this.onRelease.destroy(reason, scheduler);
        this.animations.destroy(reason);
        this.playerAnimations.destroy(reason);
        this.motion.destroy(reason);
        ScriptWearableUpdateSchema.free(this.wearableState);
    }
    constructor(id, destroy, hurt, say, playSound, physicsSelectors, animations, playerAnimations, motion){
        this.id = id;
        this.destroy = destroy;
        this.hurt = hurt;
        this.say = say;
        this.playSound = playSound;
        this.physicsSelectors = physicsSelectors;
        this.animations = animations;
        this.playerAnimations = playerAnimations;
        this.motion = motion;
        this.destroyed = false;
        this.isPlayer = false;
        this.pendingDestroy = false;
        this.seedId = '';
        this.tags = {};
        this.onDestroy = new ScriptDispatcher(true);
        this.onDamage = new ScriptDispatcher();
        this.onDie = new ScriptDispatcher();
        this.onRespawn = new ScriptDispatcher();
        this.onEntityContact = new ScriptDispatcher();
        this.onEntitySeparate = new ScriptDispatcher();
        this.onVoxelContact = new ScriptDispatcher();
        this.onVoxelSeparate = new ScriptDispatcher();
        this.onFluidEnter = new ScriptDispatcher();
        this.onFluidLeave = new ScriptDispatcher();
        this.onChat = new ScriptDispatcher();
        this.onClick = new ScriptDispatcher();
        this.onPress = new ScriptDispatcher();
        this.onRelease = new ScriptDispatcher();
        this.onKeyUp = new ScriptDispatcher();
        this.onKeyDown = new ScriptDispatcher();
        this.onInteract = new ScriptDispatcher();
        this.dieTick = Infinity;
        this.lastAttacker = null;
        this.lastDamageType = '';
        this.collisionGroup = null;
        this.hasTag = (x)=>!!this.tags['' + x];
        this.addTag = (x_)=>{
            const x = '' + x_;
            if (this.tags[x]) {
                return;
            }
            this.tags[x] = true;
            this.collisionGroup = null;
            this.physicsSelectors.notifyDirty();
        };
        this.removeTag = (x_)=>{
            const x = '' + x_;
            if (!this.tags[x]) {
                return;
            }
            delete this.tags[x];
            this.collisionGroup = null;
            this.physicsSelectors.notifyDirty();
        };
        this.getTags = ()=>Object.keys(this.tags);
        this.wearableState = ScriptWearableUpdateSchema.clone(ScriptWearableUpdateSchema.identity);
        this.wearables = [];
        this.listWearables = (bodyPart)=>{
            if (bodyPart) {
                const partName = coerceBodypart(bodyPart);
                return this.wearables.filter((x)=>x.bodyPart === partName);
            } else {
                return this.wearables.slice();
            }
        };
        this.addWearable = (spec)=>{
            const wearable = new GameWearable();
            wearable.player = this.entity.player || null;
            coerceWearableConfig(spec, wearable);
            this.wearables.push(wearable);
            return wearable;
        };
        this.removeWearable = (wearable)=>{
            const idx = this.wearables.indexOf(wearable);
            if (idx >= 0) {
                wearable.player = null;
                this.wearables.splice(idx, 1);
            }
        };
        this.clearSkin = ()=>{
            if (!this.entity.player) {
                return;
            }
            const { skin } = this.entity.player;
            Object.keys(skin).forEach((partName)=>skin[partName] = null);
        };
        this.lookAt = (target, facingDirection = 'Z', up = new GameVector3(0, 1, 0))=>{
            target = coerceVec3(target, new GameVector3(0, 0, 0));
            up = coerceVec3(up, new GameVector3(0, 1, 0));
            if (facingDirection && ![
                'X',
                'Y',
                'Z'
            ].includes(facingDirection)) {
                console.warn(`unexpected read '${JSON.stringify(facingDirection)}', param "facingDirection" must be "X", "Y" or "Z"`);
                facingDirection = 'Z';
            }
            const position = this.entity.position;
            const upVec3 = fromValues$4(up.x, up.y, up.z);
            normalize$4(upVec3, upVec3);
            const rotateQuat = create$2();
            const rotMat = create$6();
            const currentX = create$4();
            const currentY = create$4();
            const currentZ = create$4();
            normalize$4(currentZ, sub$2(currentZ, [
                target.x,
                target.y,
                target.z
            ], [
                position.x,
                position.y,
                position.z
            ]));
            if (length$4(currentZ) === 0) {
                currentZ[2] = 1;
            }
            cross$2(currentX, upVec3, currentZ);
            if (length$4(currentX) === 0) {
                if (Math.abs(up[2]) === 1) {
                    currentZ[0] += 0.0001;
                } else {
                    currentZ[2] += 0.0001;
                }
                normalize$4(currentZ, currentZ);
                cross$2(currentX, upVec3, currentZ);
            }
            cross$2(currentY, currentZ, currentX);
            switch(facingDirection){
                case 'X':
                    set$6(rotMat, currentZ[0], currentZ[1], currentZ[2], currentY[0], currentY[1], currentY[2], -currentX[0], -currentX[1], -currentX[2]);
                    break;
                case 'Y':
                    set$6(rotMat, -currentX[0], -currentX[1], -currentX[2], currentZ[0], currentZ[1], currentZ[2], currentY[0], currentY[1], currentY[2]);
                    break;
                case 'Z':
                    set$6(rotMat, currentX[0], currentX[1], currentX[2], currentY[0], currentY[1], currentY[2], currentZ[0], currentZ[1], currentZ[2]);
                    break;
            }
            fromMat3(rotateQuat, rotMat);
            normalize$2(rotateQuat, rotateQuat);
            this.entity.meshOrientation.set(rotateQuat[0], rotateQuat[1], rotateQuat[2], rotateQuat[3]);
        };
        this.rotateLocal = (localPosition, axis, rad)=>{
            const { px, py, pz } = this.applyTransform(localPosition.x, localPosition.y, localPosition.z);
            let tempQuat;
            switch(axis){
                case 'X':
                    tempQuat = this.entity.meshOrientation.rotateX(rad);
                    break;
                case 'Y':
                    tempQuat = this.entity.meshOrientation.rotateY(rad);
                    break;
                case 'Z':
                    tempQuat = this.entity.meshOrientation.rotateZ(rad);
                    break;
            }
            this.entity.meshOrientation.copy(tempQuat.normalize());
            const { px: px2, py: py2, pz: pz2 } = this.applyTransform(localPosition.x, localPosition.y, localPosition.z);
            this.entity.position.x = this.entity.position.x + px - px2;
            this.entity.position.y = this.entity.position.y + py - py2;
            this.entity.position.z = this.entity.position.z + pz - pz2;
        };
        this.scaleLocal = (localPos, v)=>{
            const { px, py, pz } = this.applyTransform(localPos.x, localPos.y, localPos.z);
            this.entity.meshScale.copy(v);
            const { px: px2, py: py2, pz: pz2 } = this.applyTransform(localPos.x, localPos.y, localPos.z);
            this.entity.position.x = this.entity.position.x + px - px2;
            this.entity.position.y = this.entity.position.y + py - py2;
            this.entity.position.z = this.entity.position.z + pz - pz2;
        };
        this.entity = new GameEntity(this.getTags, this.addTag, this.removeTag, this.hasTag, destroy, this.onDestroy.channel, this.onDestroy.future, this.onDamage.channel, this.onDamage.future, this.onDie.channel, this.onDie.future, hurt, say, this.animations.animate, this.animations.getAnimations, this.onClick.channel, this.onClick.future, this.onEntityContact.channel, this.onEntityContact.future, this.onEntitySeparate.channel, this.onEntitySeparate.future, this.onVoxelContact.channel, this.onVoxelContact.future, this.onVoxelSeparate.channel, this.onVoxelSeparate.future, this.onFluidEnter.channel, this.onFluidEnter.future, this.onFluidLeave.channel, this.onFluidLeave.future, this.onInteract.channel, this.onInteract.future, this.playSound, this.motion, this.lookAt, this.rotateLocal, this.scaleLocal);
        this.animations.target = this.entity;
        this.motion.target = this.entity;
        this.wearableState.id = id;
        this.entity.uid = id;
    }
}