import { describe, it, expect } from 'vitest';
import {
  AuthError,
  BusinessError,
  NetworkError,
  BridgeError,
  DecryptError,
  ErrorCode,
} from './schema';

describe('AuthError hierarchy', () => {
  it('BusinessError carries code and traceId', () => {
    const err = new BusinessError(
      ErrorCode.INVALID_CREDENTIALS,
      '密码错误',
      'trace-123',
    );
    expect(err).toBeInstanceOf(AuthError);
    expect(err).toBeInstanceOf(Error);
    expect(err.type).toBe('business');
    expect(err.name).toBe('BusinessError');
    expect(err.code).toBe(ErrorCode.INVALID_CREDENTIALS);
    expect(err.message).toBe('密码错误');
    expect(err.traceId).toBe('trace-123');
  });

  it('NetworkError has type network', () => {
    const err = new NetworkError('fetch failed');
    expect(err).toBeInstanceOf(AuthError);
    expect(err.type).toBe('network');
    expect(err.name).toBe('NetworkError');
    expect(err.message).toBe('fetch failed');
  });

  it('BridgeError has type bridge and default message', () => {
    const err = new BridgeError();
    expect(err).toBeInstanceOf(AuthError);
    expect(err.type).toBe('bridge');
    expect(err.name).toBe('BridgeError');
    expect(err.message).toBe('请先登录神岛账号');
  });

  it('BridgeError accepts custom message', () => {
    const err = new BridgeError('custom auth error');
    expect(err.message).toBe('custom auth error');
  });

  it('DecryptError has type decrypt and default message', () => {
    const err = new DecryptError();
    expect(err).toBeInstanceOf(AuthError);
    expect(err.type).toBe('decrypt');
    expect(err.name).toBe('DecryptError');
    expect(err.message).toBe('数据解密失败，请刷新重试');
  });

  it('DecryptError accepts custom message', () => {
    const err = new DecryptError('bad data');
    expect(err.message).toBe('bad data');
  });
});

describe('ErrorCode enum', () => {
  it('has expected values', () => {
    expect(ErrorCode.UNAUTHORIZED).toBe('UNAUTHORIZED');
    expect(ErrorCode.FORBIDDEN).toBe('FORBIDDEN');
    expect(ErrorCode.EXPIRED_TOKEN).toBe('EXPIRED_TOKEN');
    expect(ErrorCode.INVALID_SESSION).toBe('INVALID_SESSION');
    expect(ErrorCode.VALIDATION_ERROR).toBe('VALIDATION_ERROR');
    expect(ErrorCode.INVALID_CREDENTIALS).toBe('INVALID_CREDENTIALS');
  });
});

describe('type narrowing', () => {
  it('can narrow errors by type field', () => {
    const errors: AuthError[] = [
      new BusinessError(ErrorCode.FORBIDDEN, 'no', 't1'),
      new NetworkError('net down'),
      new BridgeError(),
      new DecryptError(),
    ];

    const types = errors.map(e => e.type);
    expect(types).toEqual(['business', 'network', 'bridge', 'decrypt']);

    // Narrowing by type should be usable in a switch
    for (const e of errors) {
      switch (e.type) {
        case 'business':
          expect((e as BusinessError).code).toBeDefined();
          break;
        case 'network':
          expect(e.message).toBe('net down');
          break;
        case 'bridge':
          expect(e.message).toBe('请先登录神岛账号');
          break;
        case 'decrypt':
          expect(e.message).toBe('数据解密失败，请刷新重试');
          break;
      }
    }
  });
});
