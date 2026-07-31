class QueryWrapper {
    drainDone() {
        if (this.thenResolve) {
            if (this.error) {
                if (this.thenReject) {
                    try {
                        this.thenReject(new Error(this.error));
                    } catch (e) {}
                }
            } else {
                const rows = this.pendingRow;
                this.pendingRow = [];
                try {
                    this.thenResolve(rows);
                } catch (e) {}
            }
            this.thenResolve = void 0;
            this.thenReject = void 0;
        }
        if (this.pendingDone.length > 0) {
            this.pendingRow.length = 0;
        }
        if (this.pendingRow.length > 0) {
            return;
        }
        while(this.pendingNext.length > 0){
            const p = this.pendingNext.shift();
            if (p) {
                try {
                    if (this.error) {
                        const e = new Error(this.error);
                        p.reject(e);
                    } else {
                        p.resolve({
                            done: true,
                            value: void 0
                        });
                    }
                } catch (e) {}
            }
        }
        while(this.pendingDone.length > 0){
            const p = this.pendingDone.shift();
            if (p) {
                try {
                    if (this.error) {
                        const e = new Error(this.error);
                        p.reject(e);
                    } else {
                        p.resolve({
                            done: true,
                            value: void 0
                        });
                    }
                } catch (e) {}
            }
        }
    }
    constructor(spec){
        this.handle = 0;
        this.pendingDone = [];
        this.pendingNext = [];
        this.pendingRow = [];
        this.error = null;
        this.done = false;
        this.aborted = false;
        this.stepMutex = new semaphoreExports.Semaphore(0);
        this.handleNext = ()=>{
            return new Promise((resolve, reject)=>{
                if (this.thenResolve && !this.done) {
                    this.pendingNext.push({
                        resolve,
                        reject
                    });
                    return;
                }
                const value = this.pendingRow.shift();
                if (value) {
                    resolve({
                        done: false,
                        value
                    });
                    if (this.done && this.pendingRow.length === 0) {
                        this.drainDone();
                    }
                } else if (this.done) {
                    if (this.error) {
                        const e = new Error(this.error);
                        reject(e);
                    } else {
                        resolve({
                            done: true,
                            value: null
                        });
                    }
                } else {
                    this.pendingNext.push({
                        resolve,
                        reject
                    });
                    if (!this.thenResolve) {
                        this.stepMutex.p().then(()=>{
                            if (this.done || this.aborted) {
                                return;
                            }
                            this.stepQuery(this.handle);
                        }).catch((e)=>console.error(e));
                    }
                }
            });
        };
        this.handleReturn = ()=>{
            return new Promise((resolve, reject)=>{
                if (this.thenResolve && !this.done) {
                    this.pendingDone.push({
                        resolve,
                        reject
                    });
                    return;
                }
                if (this.done) {
                    this.pendingDone.push({
                        resolve,
                        reject
                    });
                    this.pendingRow.length = 0;
                    this.drainDone();
                } else {
                    this.pendingDone.push({
                        resolve,
                        reject
                    });
                    this.pendingRow.length = 0;
                    this.aborted = true;
                    this.abortQuery(this.handle);
                }
            });
        };
        this.handleThrow = (err)=>{
            return new Promise((_, reject)=>{
                if (this.thenResolve && !this.done) {
                    this.pendingDone.push({
                        resolve: ()=>reject(err),
                        reject
                    });
                    return;
                }
                if (this.done) {
                    this.pendingRow.length = 0;
                    this.pendingDone.push({
                        resolve: ()=>reject(err),
                        reject
                    });
                    this.drainDone();
                } else {
                    this.pendingDone.push({
                        resolve: ()=>reject(err),
                        reject
                    });
                    this.aborted = true;
                    this.pendingRow.length = 0;
                    this.abortQuery(this.handle);
                }
            });
        };
        this.handleThen = (resolve, reject)=>{
            if (typeof resolve !== 'function' || typeof reject !== 'function') {
                throw new Error('invalid arguments to then()');
            }
            if (this.thenResolve) {
                this.pendingDone.push({
                    resolve: ()=>resolve([]),
                    reject
                });
                return;
            } else if (this.done) {
                if (this.error) {
                    reject(new Error(this.error));
                } else {
                    const rows = this.pendingRow;
                    this.pendingRow = [];
                    try {
                        resolve(rows);
                    } catch (e) {}
                }
                return;
            }
            this.thenResolve = resolve;
            this.thenReject = reject;
            if (this.stepMutex.spinP()) {
                this.stepQuery(this.handle);
            }
        };
        this.notifyDone = ()=>{
            this.done = true;
            this.stepMutex.v(Infinity);
            this.schedule(()=>{
                this.drainDone();
            });
        };
        this.notifyError = (err)=>{
            this.done = true;
            this.error = err;
            this.stepMutex.v(Infinity);
            this.schedule(()=>{
                this.drainDone();
            });
        };
        this.notifyRows = (columns, rows)=>{
            if (this.done || this.aborted) {
                return;
            }
            for (const row of rows){
                const value = {};
                for(let i = 0; i < columns.length; ++i){
                    if (row[i].type === 'bytes') {
                        value[columns[i]] = new Uint8Array(row[i].data);
                    } else if (row[i].type === 'null') {
                        value[columns[i]] = null;
                    } else if (row[i].type === 'date') {
                        value[columns[i]] = new Date(row[i].data);
                    } else {
                        value[columns[i]] = row[i].data;
                    }
                }
                if (this.thenResolve || this.pendingNext.length === 0) {
                    this.pendingRow.push(value);
                } else {
                    const p = this.pendingNext.shift();
                    if (p) {
                        this.schedule(()=>{
                            p.resolve({
                                done: false,
                                value
                            });
                        });
                    }
                }
            }
            if (this.thenResolve) {
                this.stepQuery(this.handle);
            } else {
                this.stepMutex.v(1);
            }
        };
        this.stepQuery = spec.step;
        this.abortQuery = spec.abort;
        this.schedule = spec.schedule;
        this.query = new GameQueryResult(this.handleNext, this.handleReturn, this.handleThrow, this.handleThen);
    }
}