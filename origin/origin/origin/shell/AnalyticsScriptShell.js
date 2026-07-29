class AnalyticsScriptShell {
    constructor(client){
        const protocol = client.protocol(AnalyticsScriptProtocol);
        protocol.configure({
            message: {}
        });
        this.api = new GameAnalytics(new GameSensorAnalytics((url, timeout = 30000)=>{
            protocol.server.message.initSensor({
                url,
                timeout
            });
        }, (distinctId, eventName, properties)=>{
            protocol.server.message.trackSensor({
                distinctId,
                eventName,
                properties: JSON.stringify(properties)
            });
        }));
    }
}