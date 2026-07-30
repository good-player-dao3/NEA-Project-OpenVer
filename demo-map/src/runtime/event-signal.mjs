export class EventSignal {
  #records = new Set();
  #futures = new Set();
  #destroyed = false;

  on(handler) {
    if (typeof handler !== "function") throw new TypeError("Event handler must be a function");
    const record = { handler, active: !this.#destroyed };
    if (record.active) this.#records.add(record);
    return Object.freeze({
      cancel: () => {
        record.active = false;
        this.#records.delete(record);
      },
      resume: () => {
        if (this.#destroyed || record.active) return;
        record.active = true;
        this.#records.add(record);
      },
      active: () => record.active,
    });
  }

  once(handler) {
    const token = this.on(event => {
      token.cancel();
      handler(event);
    });
    return token;
  }

  next(filter) {
    if (this.#destroyed) return Promise.reject(new Error("dispatcher destroyed"));
    return new Promise((resolve, reject) => {
      if (this.#destroyed) {
        reject(new Error("dispatcher destroyed"));
        return;
      }
      this.#futures.add({ filter, resolve, reject });
    });
  }

  emit(event, onError = error => { throw error; }) {
    for (const record of [...this.#records]) {
      if (!record.active) continue;
      try {
        Promise.resolve(record.handler(event)).catch(onError);
      } catch (error) {
        onError(error);
      }
    }
    for (const future of [...this.#futures]) {
      if (!this.#futures.has(future)) continue;
      if (future.filter) {
        try {
          if (!future.filter.call(null, event)) continue;
        } catch (error) {
          onError(error);
        }
      }
      this.#futures.delete(future);
      future.resolve(event);
    }
  }

  clear(reason = "dispatcher destroyed") {
    this.#destroyed = true;
    for (const record of this.#records) record.active = false;
    this.#records.clear();
    const error = new Error(String(reason));
    for (const future of this.#futures) future.reject(error);
    this.#futures.clear();
  }
}
