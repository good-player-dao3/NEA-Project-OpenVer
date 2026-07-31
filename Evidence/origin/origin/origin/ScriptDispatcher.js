class ScriptDispatcher {
    _commonDestroy() {
        DISPATCHER_DESTROY_COUNT++;
        this.destroyed = true;
        const handlers = this.handlers;
        for(let i = 0; i < handlers.length; ++i){
            const h = handlers[i];
            h.finished = true;
            h.inQueue = false;
        }
        DISPATCHER_HANDLER_COUNT -= handlers.length;
        handlers.length = 0;
    }
    destroy(reason, scheduler) {
        this._commonDestroy();
        const promises = this.promise;
        promises.forEach((p)=>{
            if (!p.finished) {
                scheduler.scheduleAt(()=>{
                    p.reject(new Error(reason));
                    return true;
                }, scheduler.currentMS());
            }
            p.finished = true;
        });
        DISPATCHER_PROMISE_COUNT -= promises.length;
        promises.length = 0;
    }
    notify(ev, handleException) {
        let dispatched = false;
        const handlers = this.handlers;
        for(let i = 0; i < handlers.length; ++i){
            if (this.destroyed) {
                break;
            }
            const h = handlers[i];
            if (h.finished) {
                continue;
            }
            dispatched = true;
            try {
                h.handler.call(null, ev);
            } catch (e) {
                handleException(e);
            }
        }
        const promises = this.promise;
        for(let i = 0; i < promises.length; ++i){
            if (this.destroyed) {
                break;
            }
            const p = promises[i];
            const f = p.filter;
            if (f) {
                try {
                    if (!f.call(null, ev)) {
                        continue;
                    }
                } catch (e) {
                    handleException(e);
                }
            }
            p.finished = true;
            dispatched = true;
            try {
                p.resolve.call(null, ev);
            } catch (e) {
                handleException(e);
            }
        }
        let ptr = 0;
        for(let i = 0; i < promises.length; ++i){
            const p = promises[i];
            if (!p.finished) {
                DISPATCHER_PROMISE_COUNT--;
                promises[ptr++] = p;
            }
        }
        promises.length = ptr;
        ptr = 0;
        for(let i = 0; i < handlers.length; ++i){
            const h = handlers[i];
            if (h.finished) {
                h.inQueue = false;
                DISPATCHER_HANDLER_COUNT--;
            } else {
                handlers[ptr++] = h;
            }
        }
        handlers.length = ptr;
        if (this.oneShot) {
            this._commonDestroy();
            promises.forEach((p)=>{
                if (!p.finished) {
                    Promise.resolve().then(()=>{
                        p.reject(new Error('reason'));
                    }).catch((err)=>{
                        throw err;
                    });
                    dispatched = true;
                }
                p.finished = true;
            });
            DISPATCHER_PROMISE_COUNT -= promises.length;
            promises.length = 0;
        }
        if (dispatched) {
            DISPATCHER_EVENT_COUNT++;
        }
        return dispatched;
    }
    constructor(oneShot){
        this.handlers = [];
        this.promise = [];
        this.destroyed = false;
        this.oneShot = false;
        DISPATCHER_CREATE_COUNT++;
        this.oneShot = !!oneShot;
        this.channel = (handler)=>{
            const record = {
                finished: false,
                inQueue: true,
                handler
            };
            if (!this.destroyed) {
                DISPATCHER_HANDLER_COUNT++;
                this.handlers.push(record);
            }
            return new GameEventHandlerToken(()=>{
                record.finished = true;
            }, ()=>{
                if (this.destroyed) {
                    return;
                }
                record.finished = false;
                if (!record.inQueue) {
                    record.inQueue = true;
                    this.handlers.push(record);
                }
            }, ()=>!record.finished);
        };
        this.future = (filter)=>{
            if (this.destroyed) {
                return Promise.reject(new Error('dispatcher destroyed'));
            }
            return new Promise((resolve, reject)=>{
                if (this.destroyed) {
                    reject(new Error('dispatcher destroyed'));
                    return;
                }
                DISPATCHER_PROMISE_COUNT++;
                this.promise.push({
                    finished: false,
                    filter,
                    resolve,
                    reject
                });
            });
        };
    }
}