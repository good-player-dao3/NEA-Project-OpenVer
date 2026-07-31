class FetchWrapper {
    close() {
        return __awaiter(this, void 0, void 0, function*() {
            this.protocol.server.message.close(this.handle);
        });
    }
    readBody(type) {
        return __awaiter(this, void 0, void 0, function*() {
            if (this.bodyType !== undefined) {
                throw new Error(`Failed to execute '${type}' on 'Response': body stream already read`);
            }
            this.bodyType = type;
            if (type === BodyType.ARRAY_BUFFER) {
                this.protocol.server.message.readArrayBuffer(this.handle);
            } else {
                this.protocol.server.message.readText(this.handle);
            }
            if (type === BodyType.JSON) {
                return JSON.parse((yield this.body));
            }
            return this.body;
        });
    }
    constructor(handle, protocol, schedule){
        this.handle = handle;
        this.protocol = protocol;
        this.bodyType = undefined;
        this.response = new Promise((resolve, reject)=>{
            this.pendingHead = {
                reject,
                resolve: ({ statusCode, statusMessage, headers })=>{
                    const h = {};
                    for(const name in headers){
                        if (headers[name].length === 1) {
                            h[name] = headers[name][0];
                        } else {
                            h[name] = headers[name].slice();
                        }
                    }
                    schedule(()=>resolve(new GameHttpFetchResponse(statusCode, statusMessage, h, ()=>this.readBody(BodyType.JSON), ()=>this.readBody(BodyType.TEXT), ()=>this.readBody(BodyType.ARRAY_BUFFER), ()=>this.close())));
                }
            };
        });
        this.body = new Promise((resolve, reject)=>{
            this.pendingBody = {
                reject,
                resolve: (body)=>schedule(()=>resolve(body))
            };
        });
    }
}