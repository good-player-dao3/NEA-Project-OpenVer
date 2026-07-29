class ScriptWorldSync {
    preTick(state) {
        this.world.currentTick = state.tick;
        this.entity.preTick(state);
        WorldPhysicsBinding.preTick(this.world, state.net.physics, this.resource);
        WorldSkyBinding.preTick(this.world, state.environment.sky, this.resource);
        WorldFogBinding.preTick(this.world, state.environment.fog, this.resource);
        WorldSnowBinding.preTick(this.world, state.environment.snow, this.resource);
        WorldRainBinding.preTick(this.world, state.environment.rain, this.resource);
        WorldSoundBinding.preTick(this.world, state.sound.ambient, this.resource);
        this.animationManager.preTick(state.tick);
    }
    _tickWorldComponent(binding, engine, update) {
        const u = binding.postTick(this.world, engine, this.resource);
        if (u) {
            binding.assign(update, u);
            binding.free(u);
        } else {
            binding.assign(update, binding.identity);
        }
    }
    postTick(packet, state) {
        this.perf.animationsLive = this.perf.entitiesLive = this.perf.playersLive = this.perf.zonesLive = 0;
        this.entity.postTick(packet, state);
        this.zones.postTick(packet.zoneUpdates);
        const update = packet.worldUpdates;
        this._tickWorldComponent(WorldPhysicsBinding, state.net.physics, update.physics);
        this._tickWorldComponent(WorldFogBinding, state.environment.fog, update.fog);
        this._tickWorldComponent(WorldSkyBinding, state.environment.sky, update.sky);
        this._tickWorldComponent(WorldSnowBinding, state.environment.snow, update.snow);
        this._tickWorldComponent(WorldRainBinding, state.environment.rain, update.rain);
        this._tickWorldComponent(WorldSoundBinding, state.sound.ambient, update.sound);
        this.animationManager.postTick(packet.animations.world);
    }
    constructor(spec){
        this.physicsSelectors = new ScriptPhysicsSelectorManager();
        this.onTick = new ScriptDispatcher();
        this.onPlayerJoin = new ScriptDispatcher();
        this.onPlayerLeave = new ScriptDispatcher();
        this.onEntityCreate = new ScriptDispatcher();
        this.onEntityDestroy = new ScriptDispatcher();
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
        this.onInteract = new ScriptDispatcher();
        this.onPlayerPurchaseSuccess = new ScriptDispatcher();
        this._onEntityCreate = (entity)=>{
            const t = this._shell.prevTickEvent.state.tick;
            const event = new GameEntityEvent(t, entity.entity);
            this._schedule(this.onEntityCreate, event);
            if (entity.isPlayer) {
                this._schedule(this.onPlayerJoin, event);
            }
        };
        this._onEntityDestroy = (entity)=>{
            const t = this._shell.prevTickEvent.state.tick;
            const event = new GameEntityEvent(t, entity.entity);
            if (entity.isPlayer) {
                this._schedule(this.onPlayerLeave, event);
            }
            this._schedule(entity.onDestroy, event);
            this._schedule(this.onEntityDestroy, event);
        };
        this.raycast = (origin, direction, options)=>{
            const { x: ox, y: oy, z: oz } = coerceVec3(origin, new GameVector3(0, 0, 0));
            let { x: dx, y: dy, z: dz } = coerceVec3(direction, new GameVector3(0, 0, 0));
            const { maxDistance, ignoreEntities, ignoreFluid, ignoreVoxel, ignoreSelector } = coerceRaycastOptions(options || {}, {
                maxDistance: Infinity,
                ignoreFluid: false,
                ignoreEntities: false,
                ignoreVoxel: false,
                ignoreSelector: ''
            });
            const l = Math.sqrt(dx * dx + dy * dy + dz * dz);
            if (l > 1e-8) {
                dx /= l;
                dy /= l;
                dz /= l;
            }
            const result = new GameRaycastResult(false, null, 0, new GameVector3(ox, oy, oz), new GameVector3(dx, dy, dz), maxDistance, new GameVector3(0, 0, 0), new GameVector3(0, 0, 0), new GameVector3(0, 0, 0));
            if (!ignoreEntities) {
                const bodyRaycast = BodyRaycastSchema.alloc();
                let { bodies } = this._shell.prevTickEvent.state.net;
                if (ignoreSelector) {
                    const selector = new ParsedSelector(ignoreSelector);
                    bodies = this.entity.entities.filter((e)=>!selector.testEntity(e)).map((e)=>idExports.getById(bodies, e.id)).filter((o)=>o);
                }
                if (raycastBoxes(bodyRaycast, bodies, ox, oy, oz, dx, dy, dz, 0)) {
                    const e = this.entity.entityIndex.get(bodyRaycast.hitId);
                    if (e && bodyRaycast.hitTime < maxDistance) {
                        result.hit = true;
                        result.hitEntity = e.entity;
                        result.distance = bodyRaycast.hitTime;
                        result.normal.x = bodyRaycast.hitNormal[0];
                        result.normal.y = bodyRaycast.hitNormal[1];
                        result.normal.z = bodyRaycast.hitNormal[2];
                        result.hitPosition.x = bodyRaycast.hitPosition[0];
                        result.hitPosition.y = bodyRaycast.hitPosition[1];
                        result.hitPosition.z = bodyRaycast.hitPosition[2];
                    }
                }
                BodyRaycastSchema.free(bodyRaycast);
            }
            if (!ignoreVoxel) {
                const rayHit = new VoxelRaycastHitResult();
                if (raycast(rayHit, this._blockIndex, this._voxel.voxels, fromValues$4(ox, oy, oz), fromValues$4(dx, dy, dz), result.distance, ignoreFluid)) {
                    result.hit = true;
                    result.hitEntity = null;
                    result.hitVoxel = rayHit.hitBlock;
                    result.distance = rayHit.hitDistance;
                    result.hitPosition.x = rayHit.hitPosition[0];
                    result.hitPosition.y = rayHit.hitPosition[1];
                    result.hitPosition.z = rayHit.hitPosition[2];
                    result.voxelIndex.x = rayHit.hitVoxel[0];
                    result.voxelIndex.y = rayHit.hitVoxel[1];
                    result.voxelIndex.z = rayHit.hitVoxel[2];
                    result.normal.x = rayHit.hitNormal[0];
                    result.normal.y = rayHit.hitNormal[1];
                    result.normal.z = rayHit.hitNormal[2];
                }
            }
            return result;
        };
        this.searchBox = (bounds)=>{
            const { lo: { x: lox, y: loy, z: loz }, hi: { x: hix, y: hiy, z: hiz } } = coerceBounds(bounds, new GameBounds3(new GameVector3(Infinity, Infinity, Infinity), new GameVector3(-Infinity, -Infinity, -Infinity)));
            const entities = [];
            const bodies = this._shell.prevTickEvent.state.net.bodies;
            for(let i = 0; i < bodies.length; ++i){
                const { id, px, py, pz, rx, ry, rz } = bodies[i];
                if (px - rx < hix && lox < px + rx && py - ry < hiy && loy < py + ry && pz - rz < hiz && loz < pz + rz) {
                    const wrapper = this.entity.entityIndex.get(id);
                    if (wrapper && !wrapper.destroyed) {
                        entities.push(wrapper.entity);
                    }
                }
            }
            return entities;
        };
        this.addCollisionFilter = (a, b)=>{
            this.physicsSelectors.addFilter(a + '', b + '');
        };
        this.removeCollisionFilter = (a, b)=>{
            this.physicsSelectors.removeFilter(a + '', b + '');
        };
        this.clearCollisionFilters = ()=>{
            this.physicsSelectors.clear();
            this.zones.rebuildPhysicsSelectorIndex();
        };
        this.collisionFilters = ()=>{
            return this.physicsSelectors.list();
        };
        this.addTempChatPlayer = (chatId, userIds)=>{
            if (!chatId || !userIds) {
                throw new Error('invalid arguments world.addTempChatPlayer() ');
            }
            return this._addTempChatPlayer(chatId, userIds);
        };
        this.removeTempChatPlayer = (chatId, userIds)=>{
            if (!chatId || !userIds) {
                throw new Error('invalid arguments world.removeTempChatPlayer() ');
            }
            return this._removeTempChatPlayer(chatId, userIds);
        };
        this.getTempChatUsers = (chatId)=>{
            if (!chatId) {
                throw new Error('invalid arguments world.getTempChatUsers() ');
            }
            return this._getTempChatUsers(chatId);
        };
        this.destroyTempChat = (chatIds)=>{
            if (!chatIds) {
                throw new Error('invalid arguments world.destroyTempChat() ');
            }
            return this._destroyTempChat(chatIds);
        };
        this.say = (message)=>{
            this._say(0, 0, message);
        };
        this.playWorldSound = (spec)=>{
            if (typeof spec === 'string') {
                return this._playSound(spec, {
                    type: 'global',
                    data: void 0
                }, 1, 1, 0);
            } else if (typeof spec === 'object') {
                const sample = '' + spec.sample || '';
                const pitch = 'pitch' in spec ? +(spec.pitch || 0) : 1;
                const gain = 'gain' in spec ? +(spec.gain || 0) : 1;
                const radius = +(spec.radius || 0);
                if ('position' in spec && radius) {
                    const b = coerceVec3(spec.position, new GameVector3(0, 0, 0));
                    return this._playSound(sample, {
                        type: 'position',
                        data: fromValues$4(b[0], b[1], b[2])
                    }, gain, pitch, radius);
                } else {
                    return this._playSound(sample, {
                        type: 'global',
                        data: void 0
                    }, gain, pitch, radius);
                }
            }
            throw new Error('invalid arguments world.sound()');
        };
        this.teleport = (mapId, players, serverId)=>{
            if (!mapId || typeof mapId !== 'string' || players.length <= 0 || players.length > 50 || typeof serverId !== 'undefined' && typeof serverId !== 'string') {
                throw new Error('invalid arguments world.teleport()');
            }
            const playerIds = [];
            for(let i = 0; i < players.length; i++){
                const playerEntity = players[i];
                const entityWrapper = this.entity.getEntityWrapper(playerEntity);
                if (!entityWrapper || !entityWrapper.isPlayer) {
                    throw new Error('invalid arguments world.teleport()');
                } else {
                    playerIds.push(entityWrapper.id);
                }
            }
            return this._teleport(mapId, playerIds, serverId);
        };
        this.logger = spec.logger.create('world');
        this.config = spec.config;
        this.resource = spec.resource;
        this.perf = spec.perf;
        this._shell = spec.shell;
        this._schedule = spec.schedule;
        this._say = spec.say;
        this._teleport = spec.teleport;
        this._playSound = spec.playSound;
        this._blockInfo = spec.blockInfo;
        this._blockIndex = spec.blockIndex;
        this._createTempChat = spec.createTempChat;
        this._destroyTempChat = spec.destroyTempChat;
        this._addTempChatPlayer = spec.addTempChatPlayer;
        this._removeTempChatPlayer = spec.removeTempChatPlayer;
        this._getTempChats = spec.getTempChats;
        this._getTempChatUsers = spec.getTempChatUsers;
        this.animationManager = new ScriptAnimationManager(WORLD_ANIM_BINDING, this._schedule, spec.scheduler, this.perf, spec.keyframeParser, spec.config);
        this.animations = this.animationManager.createAnimationGroup(0, null);
        this.entity = new ScriptEntitySync(this.config, this.resource, spec.logger.create('entity'), this.perf, spec.scheduler, this._onEntityCreate, this._onEntityDestroy, spec.schedule, this._say, spec.kick, spec.hurtEntity, spec.forceRespawn, spec.openDialog, spec.cancelDialogs, spec.openLink, spec.postMessage, spec.addEventListener, spec.playSound, spec.setCameraPitch, spec.setCameraYaw, this.physicsSelectors, spec.keyframeParser, spec.openMarketplace, spec.getMiaoShells, spec.openShare, spec.openUserProfileDialog, spec.querySocial, spec.querySocialStatistic);
        this.zones = new ScriptZoneSystem(this.resource, spec.schedule, spec.scheduler, this.physicsSelectors, this.perf);
        this._voxel = spec.voxel;
        this.world = new GameWorld(new URL(spec.config.url || 'https://localhost'), this.entity.quota, this.onRespawn.channel, this.onRespawn.future, this.entity.createEntity, this.entity.querySelector, this.entity.querySelectorAll, this.entity.testSelector, this.addCollisionFilter, this.removeCollisionFilter, this.clearCollisionFilters, this.collisionFilters, this.raycast, this.searchBox, this.animations.animate, this.animations.getAnimations, this.entity.animations.getAnimations, this.entity.playerAnimations.getAnimations, this.onTick.channel, this.onTick.future, this.onDamage.channel, this.onDamage.future, this.onDie.channel, this.onDie.future, this.onPlayerJoin.channel, this.onPlayerJoin.future, this.onPlayerLeave.channel, this.onPlayerLeave.future, this.onEntityCreate.channel, this.onEntityCreate.future, this.onEntityDestroy.channel, this.onEntityDestroy.future, this.say, this.onChat.channel, this.onChat.future, this.onClick.channel, this.onClick.future, this.onPress.channel, this.onPress.future, this.onRelease.channel, this.onRelease.future, this.onEntityContact.channel, this.onEntityContact.future, this.onEntitySeparate.channel, this.onEntitySeparate.future, this.onVoxelContact.channel, this.onVoxelContact.future, this.onVoxelSeparate.channel, this.onVoxelSeparate.future, this.onFluidEnter.channel, this.onFluidEnter.future, this.onFluidLeave.channel, this.onFluidLeave.future, this.zones.listZones, this.zones.addZone, this.zones.removeZone, this.onInteract.channel, this.onInteract.future, this.onPlayerPurchaseSuccess.channel, this.onPlayerPurchaseSuccess.future, this.playWorldSound, this.teleport, this._createTempChat, this.destroyTempChat, this.addTempChatPlayer, this.removeTempChatPlayer, this._getTempChats, this.getTempChatUsers, spec.config.serverId);
        this.animations.target = this.world;
    }
}