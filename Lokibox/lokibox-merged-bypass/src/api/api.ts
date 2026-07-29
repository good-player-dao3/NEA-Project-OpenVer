import { Logger } from 'src/utils/logger';
import {
  encryptPayload,
  decryptPayload,
  getBootstrapKey,
  getFingerprint,
} from './security';
import {
  getToken,
  setToken,
  getSelfUsername,
  setSelfUsername,
} from '../auth/auth';
import { getAuthorization } from 'src/bridge/iframe';
import {
  type ApiResponse,
  type UserAuthData,
  type UserDetailsData,
  type HeartbeatData,
  type FriendListData,
  type FriendRequestListData,
  type UserSearchData,
  BusinessError,
  NetworkError,
  BridgeError,
  DecryptError,
  ErrorCode,
} from './schema';

const logger = new Logger('api');

const baseUrl = 'https://api.lokibox.xyz';

export class LokiAPI {
  private static instance: LokiAPI;
  static getInstance() {
    if (!this.instance) {
      this.instance = new LokiAPI();
    }
    return this.instance;
  }

  auth = getToken();

  sessionId: string | null = null;
  sessionKey: CryptoKey | null = null;

  /** 褰撳墠鐧诲綍鐢ㄦ埛鍚嶏紙鎸佷箙鍖栵紝鐢ㄤ簬鍒ゆ柇鑷繁锛?*/
  get selfUsername(): string {
    return getSelfUsername();
  }

  async register(username: string, password: string) {
    const boxAuth = await getAuthorization();

    if (!boxAuth) {
      throw new BridgeError();
    }

    const resp = await this.fetchEncrypted<string>('/auth/register', 'POST', {
      username,
      password,
      auth: boxAuth,
      fingerprint: await getFingerprint(),
    });

    if (resp.code !== 'OK') {
      throw new BusinessError(resp.code, resp.message, resp.trace_id);
    }

    this.auth = resp.data;
    setToken(resp.data);
    setSelfUsername(username);
  }

  async login(username: string, password: string) {
    const resp = await this.fetchEncrypted<string>('/auth/login', 'POST', {
      username,
      password,
      fingerprint: await getFingerprint(),
    });

    if (resp.code !== 'OK') {
      throw new BusinessError(resp.code, resp.message, resp.trace_id);
    }

    this.auth = resp.data;
    setToken(resp.data);
    setSelfUsername(username);
  }

  async logout() {
    const resp = await this.fetchEncrypted<null>(
      '/auth/logout',
      'POST'
    );

    if (resp.code !== 'OK') {
      throw new BusinessError(resp.code, resp.message, resp.trace_id);
    }

    this.auth = '';
    setToken('');
  }

  async getSession() {
    const resp = await this.fetchEncrypted<{ id: string; key: string }>(
      '/session',
      'GET'
    );

    if (resp.code === 'OK') {
      const keyBytes = Uint8Array.from(atob(resp.data.key), c =>
        c.charCodeAt(0)
      );

      this.sessionId = resp.data.id;
      this.sessionKey = await crypto.subtle.importKey(
        'raw',
        keyBytes,
        'AES-GCM',
        false,
        ['encrypt', 'decrypt']
      );

      logger.i('session id', resp.data.id);
      logger.i('session key', resp.data.key);
    }
  }

  async userAuth() {
    const resp = await this.fetchEncrypted<UserAuthData>('/auth/user', 'GET');
    if (
      resp.code === ErrorCode.UNAUTHORIZED ||
      resp.code === ErrorCode.EXPIRED_TOKEN ||
      resp.code === ErrorCode.VALIDATION_ERROR
    ) {
      this.auth = '';
      setToken('');
    }
    return resp;
  }

  async getDetails() {
    return this.fetchEncrypted<UserDetailsData>('/user/details', 'GET');
  }

  async updateNickname(nickname: string) {
    const resp = await this.fetchEncrypted<null>('/user/nickname', 'POST', {
      nickname,
    });

    if (resp.code !== 'OK') {
      throw new BusinessError(resp.code, resp.message, resp.trace_id);
    }
  }

  async updateAvatar(avatarUrl: string) {
    const resp = await this.fetchEncrypted<null>('/user/avatar', 'POST', {
      avatar_url: avatarUrl,
    });

    if (resp.code !== 'OK') {
      throw new BusinessError(resp.code, resp.message, resp.trace_id);
    }
  }

  /** 涓婁紶鍥剧墖鍒?CDN锛圥OST https://static.dao3.fun/block锛夛紝杩斿洖鍥剧墖 URL */
  async uploadImage(file: File): Promise<string> {
    const resp = await fetch('https://static.dao3.fun/block', {
      method: 'POST',
      body: file,
    });

    if (!resp.ok) {
      throw new Error(`Upload failed: ${resp.status}`);
    }

    const json = await resp.json() as { Key?: string };
    if (!json.Key) {
      throw new Error('Upload response missing Key');
    }
    return `https://static.dao3.fun/block/${json.Key}`;
  }

  async sendHeartbeat(mapId: string, playerId?: number) {
    return this.fetchEncrypted<HeartbeatData>('/presence/heartbeat', 'POST', {
      map_id: mapId,
      player_id: playerId,
    });
  }

  async requestFriend(targetUsername: string) {
    return this.fetchEncrypted<{ username: string }>(
      '/friends/request',
      'POST',
      { target_username: targetUsername }
    );
  }

  async acceptFriend(requesterUsername: string) {
    return this.fetchEncrypted<{ username: string }>(
      '/friends/accept',
      'POST',
      { requester_username: requesterUsername }
    );
  }

  async rejectFriend(targetUsername: string) {
    return this.fetchEncrypted<{ username: string }>(
      '/friends/reject',
      'POST',
      { target_username: targetUsername }
    );
  }

  async deleteFriend(targetUsername: string) {
    return this.fetchEncrypted<{ username: string }>(
      '/friends/delete',
      'POST',
      { target_username: targetUsername }
    );
  }

  async getFriends() {
    return this.fetchEncrypted<FriendListData>('/friends', 'GET');
  }

  async getFriendRequests() {
    return this.fetchEncrypted<FriendRequestListData>('/friends/requests', 'GET');
  }

  async searchUsers(keyword: string) {
    return this.fetchEncrypted<UserSearchData>('/users/search', 'POST', {
      keyword,
    });
  }

  async getMapPlayers(mapId: string) {
    return this.fetchEncrypted<HeartbeatData>(`/presence/map/${mapId}`, 'GET');
  }

  nonce() {
    const arr = crypto.getRandomValues(new Uint8Array(12));

    return btoa(String.fromCharCode(...arr));
  }

  async fetchEncrypted<T>(
    url: string,
    method: string,
    data?: object
  ): Promise<ApiResponse<T>> {
    const timestamp = Date.now();
    const payload =
      data && (await encryptPayload(data, this.sessionKey ?? (await getBootstrapKey())));

    const headers: Record<string, string> = {
      'X-Nonce': this.nonce(),
      'X-TimeStamp': timestamp.toString(),
    };

    if (payload) {
      headers['X-IV'] = payload.iv;
    }

    if (this.sessionKey && this.sessionId) {
      headers['X-Session-Id'] = this.sessionId;
    }

    if (this.auth) {
      headers['Authorization'] = normalizeBearerToken(this.auth);
    }

    let resp: Response;
    try {
      resp = await fetch(`${baseUrl}${url}`, {
        method,
        body: payload && payload.data,
        headers,
        mode: 'cors',
        credentials: 'include',
      });
    } catch (e) {
      throw new NetworkError(
        `Network request failed: ${e instanceof Error ? e.message : String(e)}`
      );
    }

    const ivB64 = resp.headers.get('X-Iv');
    const ciphertextB64 = await resp.text();

    if (!ivB64) {
      throw new DecryptError('Server did not return X-IV header');
    }

    try {
      return await decryptPayload(
        ciphertextB64,
        ivB64,
        this.sessionKey ?? undefined
      );
    } catch (e) {
      throw new DecryptError(
        `Decryption failed: ${e instanceof Error ? e.message : 'Unknown error'}`
      );
    }
  }
}

export function normalizeBearerToken(token: string): string {
  const normalized = token.trim().replace(/^Bearer\s+/i, '');
  return `Bearer ${normalized}`;
}
