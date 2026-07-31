class StorageScriptDB {
    _checkKey(key) {
        return typeof key === 'string' && key && key.length <= MAX_KEY_BYTES;
    }
    _checkValue(value) {
        try {
            return typeof value !== 'undefined' && JSON.stringify(value).length <= MAX_VALUE_BYTES;
        } catch (error) {
            return false;
        }
    }
    fetchDone(handle, result) {
        if (this.wrappers[handle]) {
            try {
                if (result) {
                    result = JSON.parse(result);
                }
                this.wrappers[handle].notifyDone(result);
                delete this.wrappers[handle];
            } catch (error) {
                this.fetchError(handle, error);
            }
        }
    }
    fetchError(handle, err) {
        if (this.wrappers[handle]) {
            try {
                const fetchErr = JSON.parse(err);
                const error = getErrorMsg(fetchErr.status, fetchErr.msg);
                this.wrappers[handle].notifyError(error);
            } catch (error) {
                this.wrappers[handle].notifyError(error);
            }
            delete this.wrappers[handle];
        }
    }
    constructor(type, name, protocol, logger, schedule){
        this.type = type;
        this.name = name;
        this.protocol = protocol;
        this.logger = logger;
        this.schedule = schedule;
        this.wrappers = {};
        this.handleCounter = 0;
        this.drop = ()=>__awaiter(this, void 0, void 0, function*() {
                const wrapper = new PromiseWrapper(this.schedule);
                const handle = wrapper.handle = this.handleCounter++;
                this.wrappers[handle] = wrapper;
                this.protocol.server.message.dbFetch({
                    handle,
                    type: 'drop',
                    dbType: this.type,
                    dbKey: this.name,
                    params: JSON.stringify('')
                });
                return wrapper.query;
            });
        this._prepareTable = ()=>__awaiter(this, void 0, void 0, function*() {
                const wrapper = new PromiseWrapper(this.schedule);
                const handle = wrapper.handle = this.handleCounter++;
                this.wrappers[handle] = wrapper;
                this.protocol.server.message.dbFetch({
                    handle,
                    type: 'createTable',
                    dbType: this.type,
                    dbKey: this.name,
                    params: JSON.stringify('')
                });
                return wrapper.query;
            });
        this.set = (key, value)=>{
            if (!this._checkKey(key)) {
                throw new Error(getErrorMsg('KEY_INVALID'));
            }
            if (!this._checkValue(value)) {
                throw new Error(getErrorMsg('VALUE_INVALID'));
            }
            const wrapper = new PromiseWrapper(this.schedule);
            const handle = wrapper.handle = this.handleCounter++;
            this.wrappers[handle] = wrapper;
            this.protocol.server.message.dbFetch({
                handle,
                type: 'set',
                dbType: this.type,
                dbKey: this.name,
                params: JSON.stringify({
                    key,
                    value: value
                })
            });
            return wrapper.query;
        };
        this.update = (key, handler)=>__awaiter(this, void 0, void 0, function*() {
                if (!this._checkKey(key)) {
                    throw new Error(getErrorMsg('KEY_INVALID'));
                }
                const prevWrapper = new PromiseWrapper(this.schedule);
                const prevHandle = prevWrapper.handle = this.handleCounter++;
                this.wrappers[prevHandle] = prevWrapper;
                const ticket = nanoid();
                this.protocol.server.message.dbFetch({
                    handle: prevHandle,
                    dbType: this.type,
                    type: 'get',
                    dbKey: this.name,
                    params: JSON.stringify({
                        key,
                        ticket
                    })
                });
                const wrapper = new PromiseWrapper(this.schedule);
                const updateHandle = wrapper.handle = this.handleCounter++;
                this.wrappers[updateHandle] = wrapper;
                try {
                    const prevValue = yield prevWrapper.query;
                    const result = handler(prevValue);
                    if (!this._checkValue(result)) {
                        throw new Error(getErrorMsg('VALUE_INVALID'));
                    }
                    this.protocol.server.message.dbFetch({
                        handle: updateHandle,
                        dbType: this.type,
                        type: 'set',
                        dbKey: this.name,
                        params: JSON.stringify({
                            key,
                            value: result,
                            ticket
                        })
                    });
                } catch (error) {
                    wrapper.notifyError(error);
                }
                return wrapper.query;
            });
        this.increment = (key_1, ...args_1)=>__awaiter(this, [
                key_1,
                ...args_1
            ], void 0, function*(key, value = 1) {
                if (value && typeof value !== 'number') {
                    throw new Error(getErrorMsg('INCREMENT_INVALID'));
                }
                const wrapper = new PromiseWrapper(this.schedule);
                const handle = wrapper.handle = this.handleCounter++;
                this.wrappers[handle] = wrapper;
                this.protocol.server.message.dbFetch({
                    handle,
                    type: 'increment',
                    dbType: this.type,
                    dbKey: this.name,
                    params: JSON.stringify({
                        key,
                        value
                    })
                });
                return wrapper.query;
            });
        this.get = (key)=>{
            if (!this._checkKey(key)) {
                throw new Error(getErrorMsg('KEY_INVALID'));
            }
            const wrapper = new PromiseWrapper(this.schedule);
            const handle = wrapper.handle = this.handleCounter++;
            this.wrappers[handle] = wrapper;
            this.protocol.server.message.dbFetch({
                handle,
                type: 'get',
                dbType: this.type,
                dbKey: this.name,
                params: JSON.stringify({
                    key
                })
            });
            return wrapper.query;
        };
        this.list = (options)=>__awaiter(this, void 0, void 0, function*() {
                const { cursor, pageSize, constraintTarget, max, min, ascending } = options;
                if (typeof cursor !== 'number' || !(typeof pageSize === 'undefined' || typeof pageSize === 'number') || !(typeof max === 'undefined' || typeof max === 'number') || !(typeof min === 'undefined' || typeof min === 'number') || !(typeof ascending === 'undefined' || typeof ascending === 'boolean')) {
                    throw new Error(getErrorMsg('PARAMS_INVALID'));
                }
                if (constraintTarget && constraintTarget.split('.').length > 5) {
                    throw new Error(getErrorMsg('CONSTRAINT_TARGET_INVALID'));
                }
                const optCursor = cursor > 0 ? cursor : 0;
                const optPageSize = pageSize && pageSize > 0 ? pageSize : 100;
                const listPromiseWrapper = new PromiseWrapper(this.schedule, (value)=>{
                    const listWrapper = new QueryListWrapper(value, optCursor, (cursor)=>{
                        const wrapper = new PromiseWrapper(this.schedule);
                        const handle = wrapper.handle = this.handleCounter++;
                        this.wrappers[handle] = wrapper;
                        this._getList(handle, {
                            ascending,
                            constraintTarget,
                            max,
                            min,
                            pageSize: optPageSize,
                            cursor
                        });
                        return wrapper.query;
                    });
                    return listWrapper.queryList;
                });
                const listHandle = listPromiseWrapper.handle = this.handleCounter++;
                this.wrappers[listHandle] = listPromiseWrapper;
                this._getList(listHandle, {
                    ascending,
                    constraintTarget,
                    max,
                    min,
                    pageSize: optPageSize,
                    cursor: optCursor
                });
                return listPromiseWrapper.query;
            });
        this._getList = (handle, opts)=>{
            this.protocol.server.message.dbFetch({
                handle: handle,
                type: 'list',
                dbType: this.type,
                dbKey: this.name,
                params: JSON.stringify(opts)
            });
        };
        this.remove = (key)=>{
            const wrapper = new PromiseWrapper(this.schedule);
            const handle = wrapper.handle = this.handleCounter++;
            this.wrappers[handle] = wrapper;
            const ticket = nanoid();
            this.protocol.server.message.dbFetch({
                handle,
                type: 'remove',
                dbType: this.type,
                dbKey: this.name,
                params: JSON.stringify({
                    key,
                    ticket
                })
            });
            return wrapper.query;
        };
        if (!name || name.length > 50) {
            throw new Error(getErrorMsg('DB_NAME_INVALID'));
        }
        this._prepareTable();
        this.storage = new GameDataStorage(name, this.set, this.update, this.get, this.increment, this.list, this.remove, this.drop);
    }
}