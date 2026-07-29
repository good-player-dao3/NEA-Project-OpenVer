class ServerRemoteChannel {
    constructor(sendClientEvent, broadcastClientEvent, onServerEvent){
        this.sendClientEvent = sendClientEvent;
        this.broadcastClientEvent = broadcastClientEvent;
        this.onServerEvent = onServerEvent;
    }
}