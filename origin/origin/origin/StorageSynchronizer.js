class StorageSynchronizer {
    checkSQL(sql) {
        sql.forEach((part)=>{
            if (part.match(/\?|\$|\@|\:/g)) {
                throw new Error('invalid sql expression');
            }
        });
    }
    prepareParams(params) {
        return params.map((data)=>{
            if (data instanceof Uint8Array) {
                return {
                    type: 'bytes',
                    data
                };
            } else if (data === null || data === void 0) {
                return {
                    type: 'null',
                    data: void 0
                };
            }
            const type = typeof data;
            if (type === 'number' || type === 'boolean' || type === 'string') {
                return {
                    type,
                    data
                };
            }
            throw new Error('invalid sql parameter');
        });
    }
    constructor(spec){
        this.queryCounter = 1;
        this.queries = {};
        this.storageDbs = {};
        this.groupDbs = {};
        this.groupId = '';
        this.execQuery = (sql, ...params_)=>{
            if (!Array.isArray(sql) || sql.length === 0 || typeof sql[0] !== 'string') {
                throw new Error(`db.sql must be called as a tag function. do not use ()`);
            }
            this.checkSQL(sql);
            const sqlExpr = sql;
            const params = this.prepareParams(params_);
            const q = new QueryWrapper({
                step: this.stepQuery,
                abort: this.abortQuery,
                schedule: this.schedule
            });
            const h = q.handle = ++this.queryCounter;
            this.queries[h] = q;
            this.protocol.server.message.query({
                handle: h,
                sqlExpr,
                params
            });
            return q.query;
        };
        this.stepQuery = (handle)=>{
            this.protocol.server.message.queryStep(handle);
        };
        this.abortQuery = (handle)=>{
            this.protocol.server.message.queryAbort(handle);
        };
        this.protocol = spec.client.protocol(StorageProtocol);
        this.schedule = spec.schedule;
        this.db = new GameDatabase(this.execQuery);
        this.storage = new GameStorage((key)=>{
            if (!this.storageDbs[key]) {
                this.storageDbs[key] = new StorageScriptDB('project', key, this.protocol, spec.logger, this.schedule);
            }
            return this.storageDbs[key].storage;
        }, (key)=>{
            if (!this.groupId) {
                return;
            }
            if (!this.groupDbs[key]) {
                this.groupDbs[key] = new StorageScriptDB('group', key, this.protocol, spec.logger, this.schedule);
            }
            return this.groupDbs[key].storage;
        });
        this.protocol.configure({
            message: {
                queryRows: ({ handle, columns, rows })=>{
                    const q = this.queries[handle];
                    if (q) {
                        q.notifyRows(columns, rows);
                    }
                },
                queryDone: (handle)=>{
                    const q = this.queries[handle];
                    if (q) {
                        delete this.queries[handle];
                        q.notifyDone();
                    }
                },
                queryError: ({ handle, error })=>{
                    const q = this.queries[handle];
                    if (q) {
                        delete this.queries[handle];
                        q.notifyError(error);
                    }
                },
                dbResultDone: ({ handle, dbKey, dbType, result })=>{
                    var _a, _b;
                    if (dbType === 'group') {
                        (_a = this.groupDbs[dbKey]) === null || _a === void 0 ? void 0 : _a.fetchDone(handle, result);
                    } else {
                        (_b = this.storageDbs[dbKey]) === null || _b === void 0 ? void 0 : _b.fetchDone(handle, result);
                    }
                },
                dbFetchError: ({ handle, dbKey, dbType, error })=>{
                    var _a, _b;
                    if (dbType === 'group') {
                        (_a = this.groupDbs[dbKey]) === null || _a === void 0 ? void 0 : _a.fetchError(handle, error);
                    } else {
                        (_b = this.storageDbs[dbKey]) === null || _b === void 0 ? void 0 : _b.fetchError(handle, error);
                    }
                }
            }
        });
    }
}