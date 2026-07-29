export class EventSignal {
  #records = new Set();
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

  next() {
    return new Promise(resolve => this.once(resolve));
  }

  emit(event, onError = error => { throw error; }) {
    for (const record of [...this.#records]) {
      if (!record.active) continue;
      try {
        record.handler(event);
      } catch (error) {
        onError(error);
      }
    }
  }

  clear() {
    this.#destroyed = true;
    for (const record of this.#records) record.active = false;
    this.#records.clear();
  }
}
