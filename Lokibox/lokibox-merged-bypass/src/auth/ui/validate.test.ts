import { describe, it, expect } from 'vitest';
import {
  validateUsername,
  validatePassword,
  validateName,
} from './validate';

describe('validateUsername', () => {
  it('rejects usernames shorter than 3 characters', () => {
    expect(validateUsername('')).toContain('至少 3 个字符');
    expect(validateUsername('a')).toContain('至少 3 个字符');
    expect(validateUsername('ab')).toContain('至少 3 个字符');
  });

  it('accepts usernames of exactly 3 characters', () => {
    expect(validateUsername('abc')).toBeNull();
    expect(validateUsername('a1_')).toBeNull();
  });

  it('rejects usernames longer than 20 characters', () => {
    expect(validateUsername('a'.repeat(21))).toContain('最多 20 个字符');
  });

  it('accepts usernames of exactly 20 characters', () => {
    expect(validateUsername('a'.repeat(20))).toBeNull();
  });

  it('accepts valid characters: letters, digits, _, -', () => {
    expect(validateUsername('hello_world')).toBeNull();
    expect(validateUsername('user-123')).toBeNull();
    expect(validateUsername('TestUser')).toBeNull();
    expect(validateUsername('test')).toBeNull();
  });

  it('rejects usernames with spaces', () => {
    expect(validateUsername('hello world')).toContain('只能包含');
  });

  it('rejects usernames with Chinese characters', () => {
    expect(validateUsername('用户名')).toContain('只能包含');
  });

  it('rejects usernames with special characters', () => {
    expect(validateUsername('user@name')).toContain('只能包含');
    expect(validateUsername('user.name')).toContain('只能包含');
    expect(validateUsername('user#name')).toContain('只能包含');
  });
});

describe('validatePassword', () => {
  it('rejects passwords shorter than 8 characters', () => {
    expect(validatePassword('')).toContain('至少 8 个字符');
    expect(validatePassword('1234567')).toContain('至少 8 个字符');
  });

  it('accepts passwords of exactly 8 characters', () => {
    expect(validatePassword('12345678')).toBeNull();
    expect(validatePassword('abcdefgh')).toBeNull();
  });

  it('rejects passwords longer than 72 characters', () => {
    expect(validatePassword('a'.repeat(73))).toContain('最多 72 个字符');
  });

  it('accepts passwords of exactly 72 characters', () => {
    expect(validatePassword('a'.repeat(72))).toBeNull();
  });

  it('accepts passwords with any characters (no character restrictions)', () => {
    expect(validatePassword('密码密码密码密码')).toBeNull();
    expect(validatePassword('!@#$%^&*()_+')).toBeNull();
    expect(validatePassword('hello world !')).toBeNull();
  });

  it('accepts reasonable passwords', () => {
    expect(validatePassword('mySecurePass123')).toBeNull();
    expect(validatePassword('correct horse battery staple')).toBeNull();
  });
});

describe('validateName', () => {
  it('rejects empty names', () => {
    expect(validateName('')).toContain('最少 1 个字符');
  });

  it('accepts single character names', () => {
    expect(validateName('A')).toBeNull();
    expect(validateName('我')).toBeNull();
  });

  it('rejects names longer than 20 characters', () => {
    expect(validateName('a'.repeat(21))).toContain('最多 20 个字符');
  });

  it('accepts names of exactly 20 characters', () => {
    expect(validateName('a'.repeat(20))).toBeNull();
  });

  it('accepts names with any characters (no restrictions)', () => {
    expect(validateName('Test User')).toBeNull();
    expect(validateName('用户名')).toBeNull();
    expect(validateName('user@name!')).toBeNull();
  });
});
