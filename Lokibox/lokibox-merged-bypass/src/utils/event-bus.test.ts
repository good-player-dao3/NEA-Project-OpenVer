import { describe, it, expect, vi } from 'vitest';
import { EventBus } from './event-bus';

describe('EventBus on / emit', () => {
  it('calls registered listener with payload', () => {
    const bus = new EventBus();
    const fn = vi.fn();
    bus.on('test', fn);
    bus.emit('test', { x: 1 });
    expect(fn).toHaveBeenCalledOnce();
    expect(fn).toHaveBeenCalledWith({ x: 1 });
  });

  it('calls multiple listeners for same event', () => {
    const bus = new EventBus();
    const fn1 = vi.fn();
    const fn2 = vi.fn();
    bus.on('e', fn1);
    bus.on('e', fn2);
    bus.emit('e', 'payload');
    expect(fn1).toHaveBeenCalledOnce();
    expect(fn2).toHaveBeenCalledOnce();
  });

  it('does not call listeners for different events', () => {
    const bus = new EventBus();
    const fn = vi.fn();
    bus.on('a', fn);
    bus.emit('b', null);
    expect(fn).not.toHaveBeenCalled();
  });

  it('emit with no listeners does not throw', () => {
    const bus = new EventBus();
    expect(() => bus.emit('nonexistent', 42)).not.toThrow();
  });

  it('calls listener every time emit fires', () => {
    const bus = new EventBus();
    const fn = vi.fn();
    bus.on('e', fn);
    bus.emit('e', 1);
    bus.emit('e', 2);
    bus.emit('e', 3);
    expect(fn).toHaveBeenCalledTimes(3);
  });
});

describe('EventBus off', () => {
  it('removes a specific listener', () => {
    const bus = new EventBus();
    const fn1 = vi.fn();
    const fn2 = vi.fn();
    bus.on('e', fn1);
    bus.on('e', fn2);
    bus.off('e', fn1);
    bus.emit('e', null);
    expect(fn1).not.toHaveBeenCalled();
    expect(fn2).toHaveBeenCalledOnce();
  });

  it('off of non-existent event does not throw', () => {
    const bus = new EventBus();
    expect(() => bus.off('nope', () => {})).not.toThrow();
  });

  it('off of non-existent listener does not throw', () => {
    const bus = new EventBus();
    bus.on('e', () => {});
    expect(() => bus.off('e', () => {})).not.toThrow();
  });

  it('off all listeners still allows emit', () => {
    const bus = new EventBus();
    const fn = vi.fn();
    bus.on('e', fn);
    bus.off('e', fn);
    bus.emit('e', null);
    expect(fn).not.toHaveBeenCalled();
  });
});

describe('EventBus type safety', () => {
  it('supports typed payloads', () => {
    interface Payload { id: string; value: number; }
    const bus = new EventBus();
    const results: Payload[] = [];
    bus.on<Payload>('data', p => results.push(p));
    bus.emit<Payload>('data', { id: 'a', value: 42 });
    expect(results).toEqual([{ id: 'a', value: 42 }]);
  });

  it('supports primitive payloads', () => {
    const bus = new EventBus();
    let val = 0;
    bus.on<number>('n', n => { val = n; });
    bus.emit('n', 99);
    expect(val).toBe(99);
  });
});

describe('EventBus independence', () => {
  it('each instance has independent listeners', () => {
    const a = new EventBus();
    const b = new EventBus();
    const fn = vi.fn();
    a.on('e', fn);
    b.emit('e', null);
    expect(fn).not.toHaveBeenCalled();
  });
});
