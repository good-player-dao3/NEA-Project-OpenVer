export class ReadonlyHook<T, K extends keyof T> {
  descriptor: PropertyDescriptor;
  constructor(
    public parent: T,
    public key: K,
    public value: T[K]
  ) {
    this.descriptor = Object.getOwnPropertyDescriptor(parent, key)!;
    Object.defineProperty(parent, key, {
      get() {
        return value;
      },
      set() {},
      configurable: true,
    });
  }

  get unhook() {
    return () => {
      Object.defineProperty(this.parent, this.key, this.descriptor);
    };
  }
}
