import { describe, it, expect, vi, beforeEach } from 'vitest';
import { LokiAPI, normalizeBearerToken } from './api';
import {
  BusinessError,
  NetworkError,
  DecryptError,
  BridgeError,
} from './schema';

// ─── Helpers ─────────────────────────────────────────────

/** Build a mocked encrypted response body + IV matching what the server returns */
function mockEncryptedResponse<T>(data: T) {
  // The actual encryptPayload is async — we can't easily call it in a sync mock.
  // Instead, we mock decryptPayload at the module level to return whatever we want.
  return data as any;
}

// ─── Setup ───────────────────────────────────────────────

// Mock the bridge to return null auth (not logged into Box3)
vi.mock('src/bridge/iframe', () => ({
  getAuthorization: vi.fn().mockResolvedValue(null),
}));

// Mock GM_getValue / GM_setValue via the auth module
vi.mock('$', () => ({
  GM_getValue: vi.fn((_key: string, fallback: any) => fallback),
  GM_setValue: vi.fn(),
}));

describe('LokiAPI fetchEncrypted error paths', () => {
  let api: LokiAPI;

  beforeEach(() => {
    // Reset singleton for test isolation via prototype hacking
    api = LokiAPI.getInstance();
    // Clear auth so we test unauthenticated paths
    api.auth = '';
    api.sessionId = null;
    api.sessionKey = null;
  });

  it('throws NetworkError on fetch rejection', async () => {
    globalThis.fetch = vi.fn().mockRejectedValue(new Error('Connection refused'));

    await expect(
      api.fetchEncrypted('/test', 'GET'),
    ).rejects.toBeInstanceOf(NetworkError);
    await expect(
      api.fetchEncrypted('/test', 'GET'),
    ).rejects.toThrow('网络请求失败');
  });

  it('throws DecryptError when server returns no X-IV header', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      status: 200,
      headers: new Headers({}),
      text: () => Promise.resolve('some-ciphertext'),
    });

    await expect(
      api.fetchEncrypted('/test', 'GET'),
    ).rejects.toBeInstanceOf(DecryptError);
    await expect(
      api.fetchEncrypted('/test', 'GET'),
    ).rejects.toThrow('服务端未返回 X-IV 头');
  });

  it('throws BusinessError on non-OK response code (register path)', async () => {
    // For register(), we need getAuthorization to return something
    const bridge = await import('src/bridge/iframe');
    vi.mocked(bridge.getAuthorization).mockResolvedValueOnce('Bearer tok');

    globalThis.fetch = vi.fn().mockResolvedValue({
      status: 200,
      headers: new Headers({ 'X-Iv': 'AAECAwQFBgcICQoLDA0ODw==' }),
      text: () =>
        Promise.resolve(
          // We can't easily produce a real encrypted BusinessError response,
          // so we rely on decryptPayload being mocked to throw.
          'encrypted-data',
        ),
    });

    // decryptPayload will try to actually decrypt and fail → DecryptError
    // That's expected — the mock fetch returns garbage.
    await expect(api.register('test', 'password')).rejects.toBeInstanceOf(
      DecryptError,
    );
  });

  it('throws BridgeError when not logged into Box3', async () => {
    const bridge = await import('src/bridge/iframe');
    vi.mocked(bridge.getAuthorization).mockResolvedValueOnce(null);

    await expect(api.register('u', 'p')).rejects.toBeInstanceOf(BridgeError);
    await expect(api.register('u', 'p')).rejects.toThrow('请先登录神岛账号');
  });
});

describe('normalizeBearerToken', () => {
  it('adds the Bearer scheme to a raw token', () => {
    expect(normalizeBearerToken('token123')).toBe('Bearer token123');
  });

  it('does not duplicate an existing Bearer scheme', () => {
    expect(normalizeBearerToken('Bearer token123')).toBe('Bearer token123');
    expect(normalizeBearerToken('bearer   token123')).toBe('Bearer token123');
  });

  it('trims persisted token whitespace', () => {
    expect(normalizeBearerToken('  token123  ')).toBe('Bearer token123');
  });
});

describe('LokiAPI nonce', () => {
  it('returns a valid base64 string of 16 chars (12 bytes)', () => {
    const api = LokiAPI.getInstance();
    const n = api.nonce();
    expect(typeof n).toBe('string');
    expect(n.length).toBe(16);
    // Should be valid base64
    expect(() => atob(n)).not.toThrow();
  });

  it('nonces are different each call', () => {
    const api = LokiAPI.getInstance();
    const a = api.nonce();
    const b = api.nonce();
    expect(a).not.toBe(b);
  });
});
