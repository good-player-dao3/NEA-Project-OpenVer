// 鈿狅笍 瀹夊叏璀﹀憡
// 姝ゆ枃浠朵腑鐨?BootstrapKey 鏄鎴风纭紪鐮佺殑棰勫叡浜瘑閽ワ紙PSK锛夛紝
// 鍦ㄥ鎴风鎵撳寘鍚庝换浣曚汉閮藉彲浠ユ彁鍙栥€傛澶勪粎浣滀负鍒濆浼氳瘽瀵嗛挜锛?
// 鏈嶅姟绔湪鎻℃墜鍚庡簲涓嬪彂 sessionKey 鏇挎崲涔嬨€?
// 涓嶈鍦ㄦ瀛樻斁楂樹环鍊兼満瀵嗐€?

const BOOTSTRAP_KEY_B64 =
  '105DTeoxSkrA76RQSMtyP56CXlzraLK41A1avgw+FnY=';

// 鈹€鈹€鈹€ Bootstrap Key 鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€

const bsKeyBytes = Uint8Array.from(atob(BOOTSTRAP_KEY_B64), c =>
  c.charCodeAt(0)
);
let bsKeyPromise: Promise<CryptoKey> | undefined;

export function getBootstrapKey(): Promise<CryptoKey> {
  bsKeyPromise ??= crypto.subtle.importKey(
    'raw',
    bsKeyBytes,
    'AES-GCM',
    false,
    ['encrypt', 'decrypt']
  );
  return bsKeyPromise;
}

// 鈹€鈹€鈹€ 鍔犺В瀵?鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€

export async function encryptPayload(
  payload: object,
  key?: CryptoKey
) {
  const activeKey = key ?? (await getBootstrapKey());
  const encoder = new TextEncoder();

  // 闅忔満 IV锛?2瀛楄妭鎺ㄨ崘锛?
  const iv = crypto.getRandomValues(new Uint8Array(12));

  // payload -> string
  const plaintext = encoder.encode(JSON.stringify(payload));

  // 鍔犲瘑
  const encrypted = await crypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv,
    },
    activeKey,
    plaintext
  );

  // 杞?base64
  const toBase64 = (buf: ArrayBuffer | Uint8Array) =>
    btoa(String.fromCharCode(...new Uint8Array(buf)));

  return {
    iv: toBase64(iv),
    data: toBase64(encrypted),
  };
}

export async function decryptPayload(
  ciphertextB64: string,
  ivB64: string,
  key?: CryptoKey
) {
  const activeKey = key ?? (await getBootstrapKey());
  const iv = Uint8Array.from(atob(ivB64), c => c.charCodeAt(0));

  const ciphertext = Uint8Array.from(atob(ciphertextB64), c =>
    c.charCodeAt(0)
  );

  const decrypted = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv },
    activeKey,
    ciphertext.buffer
  );

  const text = new TextDecoder().decode(decrypted);
  return JSON.parse(text);
}

// 鈹€鈹€鈹€ 鎸囩汗 鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€

export async function getFingerprint() {
  const raw = [
    navigator.userAgent,
    navigator.platform,
    screen.width,
    screen.height,
    Intl.DateTimeFormat().resolvedOptions().timeZone,
  ].join('|');

  const data = new TextEncoder().encode(raw);

  const hashBuffer = await crypto.subtle.digest('SHA-256', data);

  return toBase64(hashBuffer);
}

function toBase64(buffer: ArrayBuffer) {
  const bytes = new Uint8Array(buffer);
  let binary = '';

  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }

  return btoa(binary);
}
