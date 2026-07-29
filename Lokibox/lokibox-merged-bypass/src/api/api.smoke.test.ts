/**
 * 真实 API 冒烟测试。
 *
 * 调用 https://api.lokibox.xyz/session 建立加密会话，
 * 验证端到端加密握手可正常工作。
 *
 * 此测试标记为 skip，需要时用：
 *   pnpm test -- -t 'api smoke'
 *
 * 或在 CI 中设置 LOKIBOX_SMOKE=true 时自动启用。
 */

import { describe, it, expect } from 'vitest';
import { LokiAPI } from './api';
import { getFingerprint, encryptPayload, decryptPayload } from './security';

const RUN_SMOKE =
  process.env.LOKIBOX_SMOKE === 'true' ||
  process.env.CI === 'true';

describe.skipIf(!RUN_SMOKE)('LokiAPI real endpoint smoke', () => {
  it('GET /session returns encrypted session id + key', async () => {
    const api = LokiAPI.getInstance();

    await api.getSession();

    expect(api.sessionId).toBeTruthy();
    expect(api.sessionKey).toBeTruthy();

    console.log('Session ID:', api.sessionId);
  });

  it('can encrypt-then-decrypt with bootstrap key (integration)', async () => {
    // Verify that the boot key round-trip works against the real encryptPayload
    const payload = { test: 'hello-smoke', ts: Date.now() };
    const encrypted = await encryptPayload(payload);
    const decrypted = await decryptPayload(encrypted.data, encrypted.iv);
    expect(decrypted).toEqual(payload);
  });

  it('fingerprint is deterministic across calls', async () => {
    const fp1 = await getFingerprint();
    const fp2 = await getFingerprint();
    expect(fp1).toBe(fp2);
    expect(fp1.length).toBe(44); // SHA-256 base64
  });
});
