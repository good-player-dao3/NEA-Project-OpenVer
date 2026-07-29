type Listener<T = any> = (payload: T) => void

export class EventBus {
  private listeners: Map<string, Set<Listener>> = new Map()

  on<T>(event: string, listener: Listener<T>) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set())
    }
    this.listeners.get(event)!.add(listener)
  }

  off<T>(event: string, listener: Listener<T>) {
    this.listeners.get(event)?.delete(listener)
  }

  emit<T>(event: string, payload: T) {
    this.listeners.get(event)?.forEach(fn => fn(payload))
  }
}