class MarketScriptShell {
    openMarketplace(clientId, productIds) {
        this.protocol.server.message.openMarketplace({
            clientId,
            productIds
        });
    }
    ackPurchaseSuccess(msgId) {
        this.protocol.server.message.ackPurchaseSuccessMsg({
            msgId
        });
    }
    constructor(client){
        this.protocol = client.protocol(MarketScriptProtocol);
    }
}