import { GM_getValue, GM_setValue } from '$';
import { EventBus } from 'src/utils/event-bus';

const event = new EventBus();

interface AuthConfig {
  token: string;
}

const DEFAULT: AuthConfig = {
  token: '',
};

function getAuth(): AuthConfig {
  return GM_getValue('auth', DEFAULT);
}

function setAuth(cfg: AuthConfig) {
  GM_setValue('auth', cfg);
}

function patchAuth(patch: Partial<AuthConfig>) {
  const patched = Object.assign(getAuth(), patch);
  setAuth(patched);
}

export function setToken(token: string) {
  patchAuth({ token });
}

export function getToken(): string {
  return getAuth().token;
}

export function setSelfUsername(username: string) {
  patchAuth({ username } as any);
}

export function getSelfUsername(): string {
  return (getAuth() as any).username ?? '';
}

export function setSelfNickname(nickname: string) {
  patchAuth({ nickname } as any);
}

export function getSelfNickname(): string {
  return (getAuth() as any).nickname ?? '';
}

export function setSelfAvatar(url: string) {
  patchAuth({ avatar_url: url } as any);
}

export function getSelfAvatar(): string {
  return (getAuth() as any).avatar_url ?? '';
}

export function onAuthorized(fn: () => void) {
  event.on('authorized', fn);
}

export function emitAuthorized() {
  event.emit('authorized', undefined);
}
