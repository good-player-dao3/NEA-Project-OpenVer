class GUIScriptShell {
    notifyMessage(entity, name, payload) {
        for (const l of this.listeners){
            l({
                entity,
                name,
                payload
            });
        }
    }
    constructor(shell){
        this.shell = shell;
        this.listeners = [];
        this.wrappers = {};
        this.handleCounter = 0;
        this.init = (entity, config)=>__awaiter(this, void 0, void 0, function*() {
                const handle = this.handleCounter++;
                this.protocol.server.message.init({
                    handle,
                    id: entity.uid,
                    data: JSON.stringify(config)
                });
                const wrapper = new promiseWrapperExports.PromiseWrapper(handle);
                this.wrappers[handle] = wrapper;
                yield wrapper.promise;
            });
        this.append = (entity, selector, data)=>__awaiter(this, void 0, void 0, function*() {
                const handle = this.handleCounter++;
                this.protocol.server.message.append({
                    handle,
                    id: entity.uid,
                    selector,
                    data: JSON.stringify(data)
                });
                const wrapper = new promiseWrapperExports.PromiseWrapper(handle);
                this.wrappers[handle] = wrapper;
                yield wrapper.promise;
            });
        this.show = (entity_1, name_1, ...args_1)=>__awaiter(this, [
                entity_1,
                name_1,
                ...args_1
            ], void 0, function*(entity, name, allowMultiple = false) {
                const handle = this.handleCounter++;
                this.protocol.server.message.show({
                    handle,
                    id: entity.uid,
                    name,
                    allowMultiple
                });
                const wrapper = new promiseWrapperExports.PromiseWrapper(handle);
                this.wrappers[handle] = wrapper;
                yield wrapper.promise;
            });
        this.remove = (entity, selector)=>__awaiter(this, void 0, void 0, function*() {
                const handle = this.handleCounter++;
                this.protocol.server.message.remove({
                    handle,
                    id: entity.uid,
                    selector
                });
                const wrapper = new promiseWrapperExports.PromiseWrapper(handle);
                this.wrappers[handle] = wrapper;
                yield wrapper.promise;
            });
        this.getAttribute = (entity, selector, name)=>__awaiter(this, void 0, void 0, function*() {
                const handle = this.handleCounter++;
                this.protocol.server.message.getAttribute({
                    handle,
                    id: entity.uid,
                    selector,
                    name
                });
                const wrapper = new promiseWrapperExports.PromiseWrapper(handle);
                this.wrappers[handle] = wrapper;
                return wrapper.promise;
            });
        this.setAttribute = (entity, selector, name, value)=>__awaiter(this, void 0, void 0, function*() {
                const handle = this.handleCounter++;
                this.protocol.server.message.setAttribute({
                    handle,
                    id: entity.uid,
                    selector,
                    name,
                    value: JSON.stringify(value)
                });
                const wrapper = new promiseWrapperExports.PromiseWrapper(handle);
                this.wrappers[handle] = wrapper;
                yield wrapper.promise;
            });
        this.addEventListener = (listener)=>{
            this.listeners.push(listener);
        };
        this.protocol = shell.client.protocol(GUIScriptProtocol);
        const resolve = ({ handle, value })=>{
            const p = this.wrappers[handle];
            if (p) {
                p.resolve(value ? JSON.parse(value) : undefined);
            }
        };
        const reject = ({ handle, message })=>{
            const p = this.wrappers[handle];
            if (p) {
                p.reject(new Error(message));
            }
        };
        this.protocol.configure({
            message: {
                sendMessage: ({ id, name, payload })=>{
                    const entity = shell.world.entity.entityIndex.get(id);
                    if (entity) {
                        this.notifyMessage(entity.entity, name, JSON.parse(payload));
                    }
                },
                return: resolve,
                throw: reject
            }
        });
        this.guiAPI = new GameGUI(this.init, this.show, this.remove, this.getAttribute, this.setAttribute, this.addEventListener);
    }
}