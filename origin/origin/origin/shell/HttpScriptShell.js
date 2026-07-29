class HttpScriptShell {
    constructor(client, schedule, config){
        this.schedule = schedule;
        this.whitelist = null;
        this.requests = {};
        this.requestCounter = 0;
        this.fetch = (url_1, ...args_1)=>__awaiter(this, [
                url_1,
                ...args_1
            ], void 0, function*(url, options = {}) {
                if (!this.whitelist) {
                    this.whitelist = new whitelistExports.Whitelist(this.scriptConfig.scriptWhiteList);
                }
                if (!this.whitelist.test(url)) {
                    throw new Error(`Blocked url ${url}`);
                }
                const handle = this.requestCounter++;
                let headers;
                if (options.headers) {
                    headers = {};
                    for(const name in options.headers){
                        const value = options.headers[name];
                        headers[name] = typeof value === 'string' ? [
                            value
                        ] : value;
                    }
                }
                this.protocol.server.message.fetch({
                    handle,
                    url,
                    timeout: options.timeout || HttpScriptProtocol.server.fetch.identity.timeout,
                    method: options.method || HttpScriptProtocol.server.fetch.identity.method,
                    headers: headers || HttpScriptProtocol.server.fetch.identity.headers,
                    body: options.body instanceof ArrayBuffer ? {
                        type: 'arrayBuffer',
                        data: new Uint8Array(options.body)
                    } : {
                        type: 'text',
                        data: options.body || ''
                    }
                });
                this.requests[handle] = new FetchWrapper(handle, this.protocol, this.schedule);
                return this.requests[handle].response;
            });
        this.onRequest = (handler)=>{};
        this.scriptConfig = config;
        this.protocol = client.protocol(HttpScriptProtocol);
        this.protocol.configure({
            message: {
                fetchError: ({ handle, error })=>{
                    const req = this.requests[handle];
                    if (req) {
                        req.pendingHead.reject(error);
                    }
                },
                fetchResponseHead: (head)=>{
                    const req = this.requests[head.handle];
                    if (req) {
                        req.pendingHead.resolve(head);
                    }
                },
                readBodyError: ({ handle, error })=>{
                    const req = this.requests[handle];
                    if (req) {
                        req.pendingBody.reject(error);
                    }
                },
                fetchBodyText: ({ handle, body })=>{
                    const req = this.requests[handle];
                    if (req) {
                        req.pendingBody.resolve(body);
                    }
                },
                fetchBodyArrayBuffer: ({ handle, body })=>{
                    const req = this.requests[handle];
                    if (req) {
                        req.pendingBody.resolve(body);
                    }
                }
            }
        });
        this.httpAPI = new GameHttpAPI(this.fetch);
    }
}