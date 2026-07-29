class RemoteChannelScriptShell {
    constructor(client, logger){
        this.logger = logger;
        this.onRemoteChannel = new ScriptDispatcher();
        this.sendEventToClients = (ids, args)=>{
            if (ids.length > 0) {
                try {
                    const data = JSON.stringify(args);
                    this.protocol.server.message.sendEventToClients({
                        entityIds: ids,
                        args: data
                    });
                } catch (error) {
                    this.logger.error(error);
                }
            }
        };
        this.sendEventToAllClient = (args)=>{
            try {
                const data = JSON.stringify(args);
                this.protocol.server.message.broadcastEvent(data);
            } catch (error) {}
        };
        this.protocol = client.protocol(RemoteChannelScriptProtocol);
    }
}