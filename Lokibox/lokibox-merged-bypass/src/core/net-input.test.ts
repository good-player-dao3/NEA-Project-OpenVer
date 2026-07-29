import { describe, expect, it, vi } from 'vitest';
import type { GameCore, NetInputArg } from './game-core';
import { NetInputInterceptor } from './net-input';

function createInterceptor() {
  const send = vi.fn<(arg: NetInputArg) => void>();
  const gameCore = {
    game: {
      net: {
        _protocol: {
          server: {
            message: {
              input: send,
            },
          },
        },
      },
    },
  } as unknown as GameCore;

  return {
    interceptor: new NetInputInterceptor(gameCore),
    gameCore,
    send,
  };
}

describe('NetInputInterceptor', () => {
  it('prevents two bypass features from owning the input queue', () => {
    const { interceptor } = createInterceptor();

    expect(interceptor.setActive(true, 'blink')).toBe(true);
    expect(interceptor.activeOwner).toBe('blink');
    expect(interceptor.setActive(true, 'fake-lag')).toBe(false);
    expect(interceptor.setActive(false, 'fake-lag')).toBe(false);
    expect(interceptor.activeOwner).toBe('blink');
  });

  it('flushes buffered inputs in order when the owner releases them', () => {
    const { interceptor, gameCore, send } = createInterceptor();
    const first = { sequence: 1 } as unknown as NetInputArg;
    const second = { sequence: 2 } as unknown as NetInputArg;

    interceptor.setActive(true, 'blink');
    gameCore.game.net._protocol.server.message.input(first);
    gameCore.game.net._protocol.server.message.input(second);

    expect(interceptor.queued).toBe(2);
    expect(interceptor.setActive(false, 'blink')).toBe(true);
    expect(send.mock.calls).toEqual([[first], [second]]);
    expect(interceptor.activeOwner).toBeNull();
  });

  it('caps the buffer to avoid an unbounded release burst', () => {
    const { interceptor, gameCore, send } = createInterceptor();

    interceptor.setActive(true, 'blink');
    for (let sequence = 0; sequence < 650; sequence += 1) {
      gameCore.game.net._protocol.server.message.input({
        sequence,
      } as unknown as NetInputArg);
    }

    expect(interceptor.queued).toBe(600);
    interceptor.setActive(false, 'blink');
    expect(send).toHaveBeenCalledTimes(600);
    expect(send.mock.calls[0][0]).toEqual({ sequence: 50 });
  });
});
