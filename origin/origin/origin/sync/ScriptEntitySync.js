class ScriptEntitySync {
    initSeeds(info) {
        idExports.zipId((seed, wrapper)=>{
            wrapper.seedId = seed.seed;
            wrapper.entity.id = seed.name;
            for(let i = 0; i < seed.tags.length; ++i){
                wrapper.addTag(seed.tags[i]);
            }
        }, info, this.entities);
    }
    getEntityWrapper(entity) {
        return this.wrapperIndex.get(entity);
    }
    _createEntity(id) {
        this.perf.entitiesCreated++;
        const wrapper = new ScriptEntityWrapper(id, ()=>this.destroyEntity(id), (damage, options)=>{
            const entity = this.entityIndex.get(id);
            if (entity) {
                this.hurtEntity(entity, options && options.attacker && WRAPPER_INDEX.get(options.attacker) || null, +damage, (options && options.damageType || '') + '');
            }
        }, (message, options)=>this.sendChat(id, 0, message, options), (spec)=>this.playSoundEntity(id, spec), this.physicsSelectors, this.animations.createAnimationGroup(id, null), this.playerAnimations.createAnimationGroup(id, null), this.motions.createMotionGroup(id, null));
        this.entities.push(wrapper);
        this.entityIndex.set(id, wrapper);
        this.wrapperIndex.set(wrapper.entity, wrapper);
        this.physicsSelectors.notifyDirty();
        return wrapper;
    }
    getEntities() {
        const result = [];
        for(let i = 0; i < this.entities.length; ++i){
            const e = this.entities[i];
            if (!e.destroyed) {
                result.push(e.entity);
            }
        }
        return result;
    }
    getPlayers() {
        const result = [];
        for(let i = 0; i < this.entities.length; ++i){
            const e = this.entities[i];
            if (!e.destroyed && e.isPlayer) {
                result.push(e.entity);
            }
        }
        return result;
    }
    destroyEntity(id) {
        const wrapper = this.entityIndex.get(id);
        if (wrapper && !wrapper.isPlayer && !wrapper.destroyed && !wrapper.pendingDestroy) {
            wrapper.pendingDestroy = true;
            this.entityCount -= 1;
            this.pendingDelete.push(id);
        }
    }
    _preTickSyncEntitySet(entities) {
        for(let i = 0; i < this.entities.length; ++i){
            const e = this.entities[i];
            e.destroyed = true;
            this.entityIndex.set(e.id, e);
        }
        let needsSort = false;
        this._createdEntities.length = 0;
        for(let i = 0; i < entities.length; ++i){
            const id = entities[i];
            const e = this.entityIndex.get(id);
            if (e) {
                e.destroyed = false;
            } else {
                needsSort = true;
                this._createdEntities.push(this._createEntity(id));
            }
        }
        if (needsSort) {
            this.entities.sort(idExports.compareId);
        }
        let ptr = 0;
        this.entityIndex.clear();
        for(let i = 0; i < this.entities.length; ++i){
            const e = this.entities[i];
            if (e.destroyed) {
                this.perf.entitiesDestroyed++;
                e.entity.destroyed = true;
                this.wrapperIndex.delete(e.entity);
                e.destroyWrapper('entity destroyed', this.scheduler);
                this.physicsSelectors.notifyDirty();
                this.notifyEntityDestroy(e);
            } else {
                this.entityIndex.set(e.id, e);
                this.entities[ptr++] = e;
            }
        }
        this.entities.length = ptr;
    }
    _preTickComponentSparse(synchronizer, component, setComponent) {
        const entities = this.entities;
        let eptr = 0;
        let cptr = 0;
        while(eptr < entities.length && cptr < component.length){
            const e = entities[eptr];
            const c = component[cptr];
            if (e.id < c.id) {
                eptr++;
                setComponent(e.entity, false);
            } else if (c.id < e.id) {
                cptr++;
            } else {
                setComponent(e.entity, true);
                synchronizer.preTick(e.entity, c, this.resources);
                eptr++;
                cptr++;
            }
        }
        while(eptr < entities.length){
            const e = entities[eptr++];
            setComponent(e.entity, false);
        }
    }
    _preTickComponentDense(synchronizer, component) {
        const index = this.entityIndex;
        const resources = this.resources;
        for(let i = 0; i < component.length; ++i){
            const c = component[i];
            const e = index.get(c.id);
            if (e) {
                synchronizer.preTick(e.entity, c, resources);
            }
        }
    }
    _preTickComponent(synchronizer, component) {
        if (synchronizer.setComponent) {
            this._preTickComponentSparse(synchronizer, component, synchronizer.setComponent);
        } else {
            this._preTickComponentDense(synchronizer, component);
        }
    }
    _preTickServerPlayerBinding(players) {
        const index = this.entityIndex;
        for(let i = 0; i < players.length; ++i){
            const player = players[i];
            const userId = player.userId;
            const wrapper = index.get(player.id);
            if (!wrapper || wrapper.destroyed) {
                continue;
            }
            const entity = wrapper.entity;
            if (!entity.player) {
                wrapper.playerAnimations.target = entity.player = new GamePlayer((message)=>this.sendChat(0, wrapper.id, message), wrapper.onChat.channel, wrapper.onChat.future, wrapper.onPress.channel, wrapper.onPress.future, wrapper.onRelease.channel, wrapper.onRelease.future, wrapper.onRespawn.channel, wrapper.onRespawn.future, ()=>{
                    this.forceRespawn(wrapper);
                }, (params)=>this.handleDialog(wrapper, params), ()=>this.cancelDialogs(wrapper), (href, options)=>{
                    this.openLink(wrapper, '' + href, options);
                }, wrapper.listWearables, wrapper.addWearable, wrapper.removeWearable, (skinName)=>wrapper.setSkinByName(skinName, this.resources), ()=>wrapper.resetToDefaultSkin(this.resources), wrapper.clearSkin, (spec)=>this.playSoundPlayer(wrapper.id, spec), wrapper.playerAnimations.animate, wrapper.playerAnimations.getAnimations, ()=>this.kick(wrapper.id), (value)=>this.setCameraPitch(wrapper.id, value), (value)=>this.setCameraYaw(wrapper.id, value), (content)=>this.postMessage(wrapper, content), (type, listener)=>this.addEventListener(wrapper, type, listener), (value)=>this.openMarketplace(wrapper, value), ()=>this.getMiaoShells(wrapper.id), (content)=>this.openShare(wrapper, {
                        type: 'share',
                        value: {
                            text: content
                        },
                        isOld: true
                    }), (userId)=>{
                    this.openUserProfileDialog(wrapper, userId);
                }, (socialType)=>{
                    if (![
                        SocialType.FOLLOWERS,
                        SocialType.FOLLOWING,
                        SocialType.FRIENDS
                    ].includes(socialType)) {
                        console.warn('invalid arguments player.querySocial()');
                        return Promise.resolve([]);
                    }
                    return this.querySocial(socialType, userId);
                }, ()=>this.querySocialStatistic(userId), wrapper.onKeyDown.channel, wrapper.onKeyUp.channel);
                WRAPPER_PLAYER_INDEX.set(entity.player, wrapper);
            }
            wrapper.isPlayer = true;
            entity.isPlayer = true;
            PlayerServerBinding.preTick(entity.player, player, this.resources);
        }
    }
    _pretickPlayerComponent(synchronizer, component) {
        const resources = this.resources;
        const index = this.entityIndex;
        for(let i = 0; i < component.length; ++i){
            const c = component[i];
            const wrapper = index.get(c.id);
            if (wrapper && !wrapper.destroyed) {
                const p = wrapper.entity.player;
                if (p) {
                    synchronizer.preTick(p, c, resources);
                }
            }
        }
    }
    _preTickPlayer(state) {
        this._preTickServerPlayerBinding(state.serverPlayers);
        this._pretickPlayerComponent(PlayerBinding, state.net.players);
        this._pretickPlayerComponent(PlayerDisplayBinding, state.players);
        this._pretickPlayerComponent(PlayerInputBinding, state.net.playerInputs);
        this._pretickPlayerComponent(PlayerReplicaBinding, state.playerReplicas);
        this._pretickPlayerComponent(PlayerSoundBinding, state.sound.player);
    }
    preTick(state) {
        this._preTickSyncEntitySet(state.entities);
        if (state.entities.length > 0 || this.entities.length > 0) {
            this.entityCounter = Math.max(this.entityCounter, this.entities[this.entities.length - 1].id >> 1, state.entities[state.entities.length - 1] >> 1);
        }
        this.entityCounter = Math.max(this.entityCounter, state.entityCounter);
        this._preTickComponent(ModelBinding, state.models);
        this._preTickComponent(RigidBodyBinding, state.net.bodies);
        this._preTickComponent(DamageBinding, state.damage);
        this._preTickComponent(ContactBinding, state.contact);
        this._preTickComponent(ParticleBinding, state.particles);
        this._preTickComponent(InteractBinding, state.interact);
        this._preTickComponent(EntityNameBinding, state.entityName);
        this._preTickComponent(SoundBinding, state.sound.entity);
        this._preTickPlayer(state);
        this._createdEntities.forEach(this.notifyEntityCreate);
        this._createdEntities.length = 0;
        this.entityCount = this.playerCount = 0;
        for(let i = 0; i < this.entities.length; ++i){
            const e = this.entities[i];
            this.entityCount += 1;
            if (e.isPlayer) {
                this.playerCount += 1;
            }
        }
        this.animations.preTick(state.tick);
        this.playerAnimations.preTick(state.tick);
        this.motions.preTick(state.tick);
    }
    _postTickComponentSparse(synchronizer, component, patch, remove, hasComponent) {
        const entities = this.entities;
        const resources = this.resources;
        let eptr = 0;
        let cptr = 0;
        while(eptr < entities.length && cptr < component.length){
            const e = entities[eptr];
            const c = component[cptr];
            if (e.id < c.id) {
                if (hasComponent(e.entity, resources)) {
                    const delta = synchronizer.postTick(e.entity, synchronizer.engineSchema.identity, resources) || synchronizer.clone(synchronizer.identity);
                    delta.id = e.id;
                    patch.push(delta);
                }
                eptr++;
            } else if (c.id < e.id) {
                remove.push(e.id);
                cptr++;
            } else {
                if (hasComponent(e.entity, resources)) {
                    const delta = synchronizer.postTick(e.entity, c, resources);
                    if (delta) {
                        delta.id = e.id;
                        patch.push(delta);
                    }
                } else {
                    remove.push(e.id);
                }
                eptr++;
                cptr++;
            }
        }
        while(eptr < entities.length){
            const e = entities[eptr++];
            if (hasComponent(e.entity, resources)) {
                const delta = synchronizer.postTick(e.entity, synchronizer.engineSchema.identity, resources) || synchronizer.clone(synchronizer.identity);
                delta.id = e.id;
                patch.push(delta);
            }
        }
    }
    _postTickComponentDense(synchronizer, component, patch) {
        const entities = this.entities;
        const resources = this.resources;
        let eptr = 0;
        let cptr = 0;
        while(eptr < entities.length && cptr < component.length){
            const e = entities[eptr];
            const c = component[cptr];
            if (c.id === e.id) {
                const delta = synchronizer.postTick(e.entity, c, resources);
                if (delta) {
                    delta.id = e.id;
                    patch.push(delta);
                }
                eptr++;
                cptr++;
            } else if (e.id < c.id) {
                const delta = synchronizer.postTick(e.entity, synchronizer.engineSchema.identity, resources) || synchronizer.clone(synchronizer.identity);
                delta.id = e.id;
                patch.push(delta);
                eptr++;
            } else {
                cptr++;
            }
        }
        while(eptr < entities.length){
            const e = entities[eptr++];
            const delta = synchronizer.postTick(e.entity, synchronizer.engineSchema.identity, resources) || synchronizer.clone(synchronizer.identity);
            delta.id = e.id;
            patch.push(delta);
        }
    }
    _postTickComponent(synchronizer, component, patch, remove) {
        if (synchronizer.hasComponent) {
            this._postTickComponentSparse(synchronizer, component, patch, remove, synchronizer.hasComponent);
        } else {
            this._postTickComponentDense(synchronizer, component, patch);
        }
    }
    _postTickPlayerComponent(synchronizer, component, patch) {
        patch.length = 0;
        for(let i = 0; i < component.length; ++i){
            const c = component[i];
            const entity = this.entityIndex.get(c.id);
            if (entity && entity.entity.player) {
                const delta = synchronizer.postTick(entity.entity.player, c, this.resources);
                if (delta) {
                    delta.id = c.id;
                    patch.push(delta);
                }
            }
        }
    }
    postTick(packet, state) {
        this.perf.entitiesLive = this.entities.length;
        const update = packet.entityUpdates;
        const tmpCreated = this.pendingCreate;
        this.pendingCreate = update.createdEntities;
        update.createdEntities = tmpCreated;
        this.pendingCreate.length = 0;
        if (tmpCreated.length > 0) {
            tmpCreated.sort(compareNum);
        }
        const tmpDeleted = this.pendingDelete;
        this.pendingDelete = update.deletedEntities;
        update.deletedEntities = tmpDeleted;
        this.pendingDelete.length = 0;
        if (tmpDeleted.length > 0) {
            tmpDeleted.sort(compareNum);
            let ptr = 1;
            for(let i = 1; i < tmpDeleted.length; ++i){
                if (tmpDeleted[i - 1] !== tmpDeleted[i]) {
                    tmpDeleted[ptr++] = tmpDeleted[i];
                }
            }
            tmpDeleted.length = ptr;
        }
        this.physicsSelectors.update(this.entities);
        update.wearableUpdates.length = 0;
        for(let i = 0; i < this.entities.length; ++i){
            const e = this.entities[i];
            if (e.isPlayer) {
                this.perf.playersLive++;
            }
            if (e.pollWearables(this.resources)) {
                update.wearableUpdates.push(ScriptWearableUpdateSchema.clone(e.wearableState));
            }
        }
        this._postTickComponent(RigidBodyBinding, state.net.bodies, update.bodies, []);
        this._postTickComponent(DamageBinding, state.damage, update.damage, update.deletedDamage);
        this._postTickComponent(ModelBinding, state.models, update.models, update.deletedModels);
        this._postTickComponent(ParticleBinding, state.particles, update.particles, update.deletedParticles);
        this._postTickComponent(InteractBinding, state.interact, update.interactive, update.deletedInteractive);
        this._postTickComponent(EntityNameBinding, state.entityName, update.entityName, update.deletedEntityName);
        this._postTickComponent(SoundBinding, state.sound.entity, update.sound, update.deletedSound);
        this._postTickPlayerComponent(PlayerBinding, state.net.players, update.players);
        this._postTickPlayerComponent(PlayerDisplayBinding, state.players, update.playerDisplay);
        this._postTickPlayerComponent(PlayerServerBinding, state.serverPlayers, update.serverPlayer);
        this._postTickPlayerComponent(PlayerSoundBinding, state.sound.player, update.playerSound);
        this._postTickPlayerComponent(PlayerReplicaBinding, state.playerReplicas, update.playerReplicas);
        if (this.physicsSelectors.indexDirty) {
            update.needsCollisionFilterUpdate = true;
            CollisionFilterSchema.assign(update.collisionFilter, this.physicsSelectors.filter);
        } else {
            update.needsCollisionFilterUpdate = false;
            CollisionFilterSchema.assign(update.collisionFilter, CollisionFilterSchema.identity);
        }
        this.animations.postTick(packet.animations.entity);
        this.playerAnimations.postTick(packet.animations.player);
    }
    constructor(config, resources, logger, perf, scheduler, notifyEntityCreate, notifyEntityDestroy, schedule, sendChat, kick, hurtEntity, forceRespawn, handleDialog, cancelDialogs, openLink, postMessage, addEventListener, playSound, setCameraPitch, setCameraYaw, physicsSelectors, keyframeParser, openMarketplace, getMiaoShells, openShare, openUserProfileDialog, querySocial, querySocialStatistic){
        this.config = config;
        this.resources = resources;
        this.logger = logger;
        this.perf = perf;
        this.scheduler = scheduler;
        this.notifyEntityCreate = notifyEntityCreate;
        this.notifyEntityDestroy = notifyEntityDestroy;
        this.schedule = schedule;
        this.sendChat = sendChat;
        this.kick = kick;
        this.hurtEntity = hurtEntity;
        this.forceRespawn = forceRespawn;
        this.handleDialog = handleDialog;
        this.cancelDialogs = cancelDialogs;
        this.openLink = openLink;
        this.postMessage = postMessage;
        this.addEventListener = addEventListener;
        this.playSound = playSound;
        this.setCameraPitch = setCameraPitch;
        this.setCameraYaw = setCameraYaw;
        this.physicsSelectors = physicsSelectors;
        this.keyframeParser = keyframeParser;
        this.openMarketplace = openMarketplace;
        this.getMiaoShells = getMiaoShells;
        this.openShare = openShare;
        this.openUserProfileDialog = openUserProfileDialog;
        this.querySocial = querySocial;
        this.querySocialStatistic = querySocialStatistic;
        this.entityCounter = 0;
        this.entities = [];
        this.entityIndex = ENTITY_INDEX;
        this.pendingCreate = [];
        this.pendingDelete = [];
        this.wrapperIndex = WRAPPER_INDEX;
        this.playerCount = 0;
        this.entityCount = 0;
        this.quota = ()=>{
            return this.config.entityLimit - this.entityCount + this.playerCount;
        };
        this.querySelector = (selector)=>{
            const testSelector = new ParsedSelector(selector + '');
            for(let i = 0; i < this.entities.length; ++i){
                const wrapper = this.entities[i];
                if (testSelector.testEntity(wrapper)) {
                    return wrapper.entity;
                }
            }
            return null;
        };
        this.querySelectorAll = (selector)=>{
            if (selector === '*') {
                return this.getEntities();
            } else if (selector === 'player') {
                return this.getPlayers();
            }
            const testSelector = new ParsedSelector(selector + '');
            const result = [];
            for(let i = 0; i < this.entities.length; ++i){
                const wrapper = this.entities[i];
                if (testSelector.testEntity(wrapper)) {
                    result.push(wrapper.entity);
                }
            }
            return result;
        };
        this.testSelector = (selector, entity)=>{
            const testSelector = new ParsedSelector(selector + '');
            const wrapper = this.wrapperIndex.get(entity);
            if (!wrapper) {
                return false;
            }
            return testSelector.testEntity(wrapper);
        };
        this.playSoundEntity = (data, spec)=>{
            if (typeof spec === 'string') {
                return this.playSound(spec, {
                    type: 'entity',
                    data
                }, 1, 1, 32);
            } else if (typeof spec === 'object') {
                const sample = '' + spec.sample;
                const gain = 'gain' in spec ? +(spec.gain || 0) : 1;
                const pitch = 'pitch' in spec ? +(spec.pitch || 0) : 1;
                const radius = 'radius' in spec ? +(spec.radius || 0) : 32;
                return this.playSound(sample, {
                    type: 'entity',
                    data
                }, gain, pitch, radius);
            } else {
                throw new Error('invalid arguments entity.sound()');
            }
        };
        this.playSoundPlayer = (data, spec)=>{
            if (typeof spec === 'string') {
                return this.playSound(spec, {
                    type: 'player',
                    data
                }, 1, 1, 0);
            } else if (typeof spec === 'object') {
                const sample = '' + spec.sample;
                const gain = 'gain' in spec ? +(spec.gain || 0) : 1;
                const pitch = 'pitch' in spec ? +(spec.pitch || 0) : 1;
                return this.playSound(sample, {
                    type: 'player',
                    data
                }, gain, pitch, 0);
            } else {
                throw new Error('invalid arguments entity.sound()');
            }
        };
        this.createEntity = (spec)=>{
            if (this.entityCount - this.playerCount >= this.config.entityLimit) {
                console.error('entity limit exceeded');
                return null;
            }
            this.entityCount += 1;
            const id = (++this.entityCounter << 1) + 1;
            const wrapper = this._createEntity(id);
            const prevTags = wrapper.entity.tags;
            coerceEntityConfig(spec, wrapper.entity);
            const nextTags = wrapper.entity.tags;
            if (Array.isArray(nextTags)) {
                wrapper.entity.tags = prevTags;
                nextTags.forEach((t)=>wrapper.entity.addTag(t));
            }
            this.physicsSelectors.notifyDirty();
            this.pendingCreate.push(id);
            this.notifyEntityCreate(wrapper);
            return wrapper.entity;
        };
        this._createdEntities = [];
        this.animations = new ScriptAnimationManager(ENTITY_ANIM_BINDING, this.schedule, this.scheduler, this.perf, this.keyframeParser, config);
        this.playerAnimations = new ScriptAnimationManager(PLAYER_ANIM_BINDING, this.schedule, this.scheduler, this.perf, this.keyframeParser, config);
        this.motions = new ScriptMotionManager(this.resources, this.schedule, this.scheduler);
    }
}