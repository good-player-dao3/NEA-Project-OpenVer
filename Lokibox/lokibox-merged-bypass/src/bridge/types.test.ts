import { describe, it, expect } from 'vitest';
import {
  BridgeMessageType,
  TRUSTED_ORIGINS,
} from './types';
import type { BridgeMessage } from './types';

describe('BridgeMessageType', () => {
  it('has Chat, GetAuth and ReturnAuth constants', () => {
    expect(BridgeMessageType.Chat).toBe('chat');
    expect(BridgeMessageType.GetAuth).toBe('get-auth');
    expect(BridgeMessageType.ReturnAuth).toBe('return-auth');
  });

  it('all message types are unique', () => {
    const values = Object.values(BridgeMessageType);
    expect(new Set(values).size).toBe(values.length);
  });
});

describe('TRUSTED_ORIGINS', () => {
  it('includes dao3.fun and view.dao3.fun', () => {
    expect(TRUSTED_ORIGINS).toContain('https://dao3.fun');
    expect(TRUSTED_ORIGINS).toContain('https://view.dao3.fun');
  });

  it('does not include http origins (must be https)', () => {
    expect(TRUSTED_ORIGINS).not.toContain('http://dao3.fun');
    expect(TRUSTED_ORIGINS).not.toContain('http://view.dao3.fun');
  });
});

describe('BridgeMessage type matching', () => {
  it('ChatMessage conforms to BridgeMessage type', () => {
    const msg: BridgeMessage = {
      type: BridgeMessageType.Chat,
      content: 'hello world',
    };
    expect(msg.type).toBe('chat');
    expect(msg.content).toBe('hello world');
  });

  it('GetAuthMessage conforms to BridgeMessage type', () => {
    const msg: BridgeMessage = {
      type: BridgeMessageType.GetAuth,
    };
    expect(msg.type).toBe('get-auth');
  });

  it('ReturnAuthMessage with null auth conforms to BridgeMessage type', () => {
    const msg: BridgeMessage = {
      type: BridgeMessageType.ReturnAuth,
      auth: null,
    };
    expect(msg.type).toBe('return-auth');
    expect(msg.auth).toBeNull();
  });

  it('ReturnAuthMessage with string auth conforms to BridgeMessage type', () => {
    const msg: BridgeMessage = {
      type: BridgeMessageType.ReturnAuth,
      auth: 'Bearer token123',
    };
    expect(msg.type).toBe('return-auth');
    expect(msg.auth).toBe('Bearer token123');
  });
});
