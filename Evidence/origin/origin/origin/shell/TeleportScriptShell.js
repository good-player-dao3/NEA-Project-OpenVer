class TeleportScriptShell {
    _getErrorMsg(err) {
        const { key, msg } = err;
        let error = errorMsgList$1[key] || errorMsgList$1['UNKNOWN'];
        if (msg) {
            error.msg = msg;
        }
        return JSON.stringify(error);
    }
    constructor(client, schedule){
        this.schedule = schedule;
        this.wrappers = {};
        this.handleCounter = 0;
        this.teleport = (mapId, playerIds, serverId = '')=>{
            const wrapper = new PromiseWrapper(this.schedule);
            const handle = wrapper.handle = this.handleCounter++;
            this.wrappers[handle] = wrapper;
            this.protocol.server.message.teleport({
                handle,
                mapId,
                playerIds,
                serverId
            });
            return wrapper.query;
        };
        this.protocol = client.protocol(TeleportScriptProtocol);
        this.protocol.configure({
            message: {
                teleportDone: ({ handle, serverId })=>{
                    if (this.wrappers[handle]) {
                        const result = {
                            serverId
                        };
                        this.wrappers[handle].notifyDone(result);
                        delete this.wrappers[handle];
                    }
                },
                teleportError: ({ handle, error })=>{
                    if (this.wrappers[handle]) {
                        this.wrappers[handle].notifyError(new Error(this._getErrorMsg(error)));
                        delete this.wrappers[handle];
                    }
                }
            }
        });
    }
}