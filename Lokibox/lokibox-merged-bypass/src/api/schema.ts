export enum ErrorCode {
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  EXPIRED_TOKEN = 'EXPIRED_TOKEN',
  INVALID_SESSION = 'INVALID_SESSION',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',
  TARGET_NOT_FOUND = 'TARGET_NOT_FOUND',
  FRIEND_REQUEST_EXISTS = 'FRIEND_REQUEST_EXISTS',
  ALREADY_FRIENDS = 'ALREADY_FRIENDS',
  NOT_FOUND = 'NOT_FOUND',
  TOO_MANY_REQUESTS = 'TOO_MANY_REQUESTS',
  INVALID_ENCRYPTION = 'INVALID_ENCRYPTION',
  INTEGRITY_ERROR = 'IntegrityError',
}

export interface SuccessResponse<T> {
  code: 'OK';
  message: string;
  data: T;
  trace_id: string;
}

export interface ErrorResponse {
  code: ErrorCode;
  message: string;
  details: any;
  trace_id: string;
}

export type ApiResponse<T> = SuccessResponse<T> | ErrorResponse;

/** /auth/user 响应 data */
export interface UserAuthData {
  username: string;
  nickname: string;
  avatar_url: string | null;
}

/** /user/details 响应 data */
export interface UserDetailsData {
  username: string;
  nickname: string;
}

// ─── 错误类型 ─────────────────────────────────────────────

export abstract class AuthError extends Error {
  abstract type: 'business' | 'network' | 'bridge' | 'decrypt';
}

export class BusinessError extends AuthError {
  type = 'business' as const;
  constructor(
    public code: ErrorCode,
    message: string,
    public traceId: string
  ) {
    super(message);
    this.name = 'BusinessError';
  }
}

export class NetworkError extends AuthError {
  type = 'network' as const;
  constructor(message: string) {
    super(message);
    this.name = 'NetworkError';
  }
}

export class BridgeError extends AuthError {
  type = 'bridge' as const;
  constructor(message: string = 'Please log in to Box3 first') {
    super(message);
    this.name = 'BridgeError';
  }
}

export class DecryptError extends AuthError {
  type = 'decrypt' as const;
  constructor(message: string = 'Decryption failed, please refresh') {
    super(message);
    this.name = 'DecryptError';
  }
}

// ─── Presence ─────────────────────────────────────────────

export interface PresencePlayer {
  username: string;
  nickname: string;
  player_id: number | null;
}

export interface HeartbeatData {
  players: PresencePlayer[];
}

// ─── Friends ─────────────────────────────────────────────

export interface FriendInfo {
  username: string;
  nickname: string;
  created_at: number;
}

export interface FriendRequest {
  username: string;
  nickname: string;
  created_at: number;
}

export interface FriendListData {
  friends: FriendInfo[];
}

export interface FriendRequestListData {
  requests: FriendRequest[];
}

// ─── User Search ──────────────────────────────────────────

export interface UserSearchResult {
  username: string;
  nickname: string;
}

export interface UserSearchData {
  users: UserSearchResult[];
}
