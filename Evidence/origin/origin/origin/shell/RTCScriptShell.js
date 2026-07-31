class RTCScriptShell {
    joinChannel(channelId, id) {
        return __awaiter(this, void 0, void 0, function*() {
            const handle = this.handleCounter++;
            this.protocol.server.message.joinChannel({
                handle,
                channelId,
                id
            });
            const wrapper = new PromiseWrapper$1(handle);
            this.wrappers[handle] = wrapper;
            yield wrapper.promise;
        });
    }
    leaveChannel(channelId, id) {
        return __awaiter(this, void 0, void 0, function*() {
            const handle = this.handleCounter++;
            this.protocol.server.message.leaveChannel({
                handle,
                channelId,
                id
            });
            const wrapper = new PromiseWrapper$1(handle);
            this.wrappers[handle] = wrapper;
            yield wrapper.promise;
        });
    }
    unpublish(channelId, id) {
        return __awaiter(this, void 0, void 0, function*() {
            const handle = this.handleCounter++;
            this.protocol.server.message.unpublish({
                handle,
                channelId,
                id
            });
            const wrapper = new PromiseWrapper$1(handle);
            this.wrappers[handle] = wrapper;
            return wrapper.promise;
        });
    }
    publishMicrophone(channelId, id) {
        return __awaiter(this, void 0, void 0, function*() {
            const handle = this.handleCounter++;
            this.protocol.server.message.publishMicrophone({
                handle,
                channelId,
                id
            });
            const wrapper = new PromiseWrapper$1(handle);
            this.wrappers[handle] = wrapper;
            yield wrapper.promise;
        });
    }
    getPlayers(channelId) {
        return __awaiter(this, void 0, void 0, function*() {
            const handle = this.handleCounter++;
            this.protocol.server.message.listChannelPlayers({
                handle,
                channelId
            });
            const wrapper = new PromiseWrapper$1(handle);
            this.wrappers[handle] = wrapper;
            const { list } = yield wrapper.promise;
            const entities = [];
            for (const { entity } of this.shell.world.entity.entities){
                if (entity.isPlayer && list.includes(entity.uid)) {
                    entities.push(entity);
                }
            }
            return entities;
        });
    }
    destroy(channelId) {
        return __awaiter(this, void 0, void 0, function*() {
            const handle = this.handleCounter++;
            this.protocol.server.message.destroyChannel({
                handle,
                channelId
            });
            const wrapper = new PromiseWrapper$1(handle);
            this.wrappers[handle] = wrapper;
            yield wrapper.promise;
        });
    }
    getVolume(channelId, id) {
        return __awaiter(this, void 0, void 0, function*() {
            const handle = this.handleCounter++;
            this.protocol.server.message.getVolume({
                handle,
                channelId,
                id
            });
            const wrapper = new PromiseWrapper$1(handle);
            this.wrappers[handle] = wrapper;
            return (yield wrapper.promise).volume;
        });
    }
    setVolume(channelId, id, volume) {
        return __awaiter(this, void 0, void 0, function*() {
            const handle = this.handleCounter++;
            this.protocol.server.message.setVolume({
                handle,
                channelId,
                id,
                volume
            });
            const wrapper = new PromiseWrapper$1(handle);
            this.wrappers[handle] = wrapper;
            yield wrapper.promise;
        });
    }
    getMicrophonePermission(id) {
        return __awaiter(this, void 0, void 0, function*() {
            const handle = this.handleCounter++;
            this.protocol.server.message.getMicrophonePermission({
                handle,
                id
            });
            const wrapper = new PromiseWrapper$1(handle);
            this.wrappers[handle] = wrapper;
            return (yield wrapper.promise).permission;
        });
    }
    constructor(shell){
        this.shell = shell;
        this.wrappers = {};
        this.handleCounter = 0;
        this.createChannel = (...args_1)=>__awaiter(this, [
                ...args_1
            ], void 0, function*(channelId = generateChannelId()) {
                return new GameRTCChannel((entity)=>this.joinChannel(channelId, entity.uid), (entity)=>this.leaveChannel(channelId, entity.uid), (entity)=>this.unpublish(channelId, entity.uid), (entity)=>this.publishMicrophone(channelId, entity.uid), ()=>this.getPlayers(channelId), ()=>this.destroy(channelId), (entity)=>this.getVolume(channelId, entity.uid), (entity, volume)=>this.setVolume(channelId, entity.uid, volume), (entity)=>this.getMicrophonePermission(entity.uid));
            });
        this.protocol = shell.client.protocol(RTCScriptProtocol);
        const resolve = (message)=>{
            const p = this.wrappers[message.handle];
            if (p) {
                p.resolve(shallowExtract(message));
            }
        };
        const reject = (message)=>{
            const p = this.wrappers[message.handle];
            if (p) {
                p.reject(shallowExtract(message));
            }
        };
        this.protocol.configure({
            message: {
                return: resolve,
                throw: reject,
                listReturn: resolve,
                volumeReturn: resolve,
                permissionReturn: resolve
            }
        });
        this.rtcAPI = new GameRTC(this.createChannel);
    }
}