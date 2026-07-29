class NavigatorScriptShell {
    notifyMessage(playerId, event) {
        if (!this.listeners[playerId]) {
            return;
        }
        const entity = this.shell.world.entity.entityIndex.get(playerId);
        if (!entity) {
            return;
        }
        if (entity.destroyed) {
            delete this.listeners[playerId];
            return;
        }
        const _event = MessageEventSchema.clone(event);
        this.shell.scheduler.schedule(()=>this.listeners[playerId].forEach((listener)=>{
                listener(_event);
            }));
    }
    constructor(shell){
        this.shell = shell;
        this.listeners = {};
        this.addEventListener = (wrapper, type, listener)=>{
            const { id } = wrapper;
            if (!this.listeners[id]) {
                this.listeners[id] = [
                    listener
                ];
            } else {
                this.listeners[id].push(listener);
            }
        };
        this.postMessage = (wrapper, content)=>{
            try {
                this.protocol.server.message.postMessage({
                    playerId: wrapper.id,
                    content: {
                        type: content.type,
                        value: JSON.stringify(content.value),
                        isOld: content.isOld
                    }
                });
            } catch (error) {
                this.shell.logger.error(`trying post invalid value to ${wrapper.id}.`);
            }
        };
        this.protocol = shell.client.protocol(NavigatorScriptProtocol);
        this.protocol.configure({
            message: {
                notifyMessageEvent: ({ playerId, event })=>{
                    this.notifyMessage(playerId, event);
                },
                reset: ()=>{
                    this.listeners = {};
                }
            }
        });
    }
}