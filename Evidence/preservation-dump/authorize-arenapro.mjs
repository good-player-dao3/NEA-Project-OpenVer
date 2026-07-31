import { constants, createPrivateKey, createPublicKey, privateDecrypt, publicEncrypt, randomInt } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { spawn } from "node:child_process";
import http from "node:http";

const PRIVATE_KEY = `-----BEGIN PRIVATE KEY-----
MIICdgIBADANBgkqhkiG9w0BAQEFAASCAmAwggJcAgEAAoGBAL+H9qrHvV6w1tee
vzvfqpyXI/F+9F2tX+IYKe5zNkS/H7UK50L8NocajK/rGIgXw4gFqDi9qmMmK/Dn
oRhzxHByF4cNUbMqQX79QuIrEtREMX1wO0wxsPzdCo/8wcOCuyPb61/sWlAyxfwX
VIahLo4qT5EI2q8PYXhu2wuFEoVTAgMBAAECgYAVhuyciVKpf+rF1VvdGOiOLRan
IAPLO59ZRCoCWQSyeWDQ8mbHyp0+VieV5jCdqz4Y3bnolri96B5sNzyOCQT9BKaD
BeSGoz+65BsJRsgIxsRVudIJsqEYgkkeLwcloNPfGa2OJRG31rPessW4Hd1gphr5
yFrVCP9sux0zTe9C0QJBAOW2R/W2RBtAvuQLwNnLbbVPoeZbU3iZxh1Wz/ktt+lu
HNdmtQH529bfgCs+VMK/zDf07digDYTiGUtGmI6MsMcCQQDVcx8armQnUXHoNt+j
ZHh2p5efkdxXICQSkb56zwkHJExDiio7xquIvlQ14+jCpZT+HTIfCf8JMhZqEF5H
jNMVAkALecG6irJ4UhG3PscRmlIOvr2tzl4rJjN5f77ACgKoDLIwKJdeU+chouS6
RFDjscU3/mpragOC4fC1i/9PD8Q9AkBTT/fYBjF5V0TKioCH2fNa/NclpV0HdLgf
t1tNu/meHADYa9lIM6dIXGGqFycGsnKRLPwfOVueTzqIc5MZAlJxAkEAnqyvJoAe
xwbxPk13TrRDAN8qMmlAw1n0UFGva2MF13bW893Dhm2B4jov7gSHd8W/ZnF9qSOp
OskVmbVl2Bxn6Q==
-----END PRIVATE KEY-----`;

const options = parseArguments(process.argv.slice(2));

if (options.selfTest) {
  selfTest();
} else {
  await authorize();
}

async function authorize() {
  const state = String(randomInt(1_000_000, 10_000_000));
  const redirectUri = `http://localhost:${options.port}/auth/callback`;
  const oauthUrl = new URL("https://dao3.fun/oauth2.0");
  oauthUrl.searchParams.set("response_type", "code");
  oauthUrl.searchParams.set("client_id", "arenapro");
  oauthUrl.searchParams.set("scope", "user:all");
  oauthUrl.searchParams.set("state", state);
  oauthUrl.searchParams.set("redirect_uri", redirectUri);

  const result = await new Promise((resolveAuthorization, rejectAuthorization) => {
    const timeout = setTimeout(() => {
      server.close();
      rejectAuthorization(new Error("ArenaPro authorization timed out."));
    }, options.timeoutMs);

    const server = http.createServer(async (request, response) => {
      const requestUrl = new URL(request.url ?? "/", redirectUri);
      if (requestUrl.pathname !== "/auth/callback") {
        response.writeHead(200, { "Content-Type": "text/plain; charset=utf-8" });
        response.end("ArenaPro authorization helper is waiting for the OAuth callback.");
        return;
      }

      try {
        const parameterNames = [...new Set(requestUrl.searchParams.keys())].sort();
        const parameterLengths = Object.fromEntries(parameterNames.map(name => [name, requestUrl.searchParams.get(name)?.length ?? 0]));
        if (request.method === "HEAD" || parameterNames.length === 0) {
          console.log(`[NEA auth] Ignored an empty callback probe (${request.method ?? "GET"}).`);
          response.writeHead(204, { "Cache-Control": "no-store" });
          response.end();
          return;
        }

        console.log(`[NEA auth] Callback parameters: ${JSON.stringify(parameterLengths)}`);
        if (requestUrl.searchParams.get("error")) throw new Error(requestUrl.searchParams.get("error"));
        const encryptedToken = requestUrl.searchParams.get("access_token") ?? requestUrl.searchParams.get("accessToken");
        if (!encryptedToken) {
          console.log("[NEA auth] Ignored a callback without access_token and kept waiting for the final redirect.");
          response.writeHead(202, { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store" });
          response.end("<!doctype html><meta charset=utf-8><title>????</title><p>???????????????????????</p>");
          return;
        }
        const decrypted = decryptAccessToken(encryptedToken);
        if (!decrypted.token || !decrypted.userAgent) throw new Error("OAuth payload did not include token and userAgent.");
        if (String(decrypted.state) !== state) throw new Error("OAuth state mismatch.");
        const callbackState = requestUrl.searchParams.get("state");
        if (callbackState && callbackState !== state) throw new Error("OAuth callback state mismatch.");

        response.writeHead(200, { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store" });
        response.end("<!doctype html><meta charset=utf-8><title>????</title><body style='font-family:sans-serif;background:#171717;color:#eee;padding:40px'><h1>????</h1><p>?????????? NEA-Project?</p></body>");
        clearTimeout(timeout);
        server.close();
        resolveAuthorization({ authToken: decrypted.token, userAgent: decrypted.userAgent });
      } catch (error) {
        response.writeHead(400, { "Content-Type": "text/plain; charset=utf-8" });
        response.end(`Authorization failed: ${error instanceof Error ? error.message : String(error)}`);
        clearTimeout(timeout);
        server.close();
        rejectAuthorization(error);
      }
    });

    server.on("error", rejectAuthorization);
    server.listen(options.port, "127.0.0.1", () => {
      console.log(`[NEA auth] Waiting on ${redirectUri}`);
      console.log("[NEA auth] Complete the ArenaPro authorization in the browser window.");
      if (options.openBrowser) openBrowser(oauthUrl.toString());
      else console.log(`[NEA auth] Open this URL manually: ${oauthUrl}`);
    });
  });

  await mkdir(dirname(options.output), { recursive: true });
  await writeFile(options.output, `${JSON.stringify({
    format: "nea-arenapro-auth",
    version: 1,
    authorizedAt: new Date().toISOString(),
    oauthClient: "arenapro",
    scope: "user:all",
    ...result,
  }, null, 2)}\n`, { encoding: "utf8", mode: 0o600 });
  console.log(`[NEA auth] Authorization saved privately: ${options.output}`);
}

function decryptAccessToken(encryptedToken) {
  const normalized = encryptedToken.replace(/ /g, "+").replace(/-/g, "+").replace(/_/g, "/");
  const encrypted = Buffer.from(normalized, "base64");
  const privateKey = createPrivateKey(PRIVATE_KEY);
  const blockSize = Math.ceil((privateKey.asymmetricKeyDetails?.modulusLength ?? 1024) / 8);
  if (encrypted.length === 0 || encrypted.length % blockSize !== 0) {
    throw new Error(`Invalid ArenaPro RSA ciphertext length ${encrypted.length}; expected a multiple of ${blockSize}.`);
  }
  const clearBlocks = [];
  for (let offset = 0; offset < encrypted.length; offset += blockSize) {
    clearBlocks.push(privateDecrypt({
      key: privateKey,
      padding: constants.RSA_PKCS1_OAEP_PADDING,
      oaepHash: "sha1",
    }, encrypted.subarray(offset, offset + blockSize)));
  }
  return JSON.parse(Buffer.concat(clearBlocks).toString("utf8"));
}

function openBrowser(url) {
  if (process.platform === "win32") {
    const escaped = url.replace(/"/g, '""');
    spawn("cmd.exe", ["/d", "/s", "/c", `start "" "${escaped}"`], { detached: true, stdio: "ignore", windowsHide: true }).unref();
    return;
  }
  const command = process.platform === "darwin" ? "open" : "xdg-open";
  spawn(command, [url], { detached: true, stdio: "ignore" }).unref();
}

function parseArguments(argumentsList) {
  const values = {};
  for (let index = 0; index < argumentsList.length; index += 1) {
    const argument = argumentsList[index];
    if (argument === "--self-test") values.selfTest = true;
    else if (argument === "--no-open") values.openBrowser = false;
    else if (argument.startsWith("--")) values[argument.slice(2)] = argumentsList[++index];
  }
  return {
    selfTest: values.selfTest === true,
    openBrowser: values.openBrowser !== false,
    port: Number(values.port ?? 25320),
    timeoutMs: Number(values["timeout-ms"] ?? 10 * 60 * 1000),
    output: resolve(values.output ?? "dump/private/arena-auth.json"),
  };
}

function selfTest() {
  const payload = JSON.stringify({ token: "test-token-".repeat(80), userAgent: "test-agent-".repeat(20), state: "1234567" });
  const publicKey = createPublicKey(PRIVATE_KEY);
  const modulusBytes = Math.ceil((publicKey.asymmetricKeyDetails?.modulusLength ?? 1024) / 8);
  const maxPlaintextBlock = modulusBytes - 2 * 20 - 2;
  const plaintext = Buffer.from(payload);
  const encryptedBlocks = [];
  for (let offset = 0; offset < plaintext.length; offset += maxPlaintextBlock) {
    encryptedBlocks.push(publicEncrypt({
      key: publicKey,
      padding: constants.RSA_PKCS1_OAEP_PADDING,
      oaepHash: "sha1",
    }, plaintext.subarray(offset, offset + maxPlaintextBlock)));
  }
  const decrypted = decryptAccessToken(Buffer.concat(encryptedBlocks).toString("base64"));
  if (decrypted.token !== "test-token-".repeat(80) || decrypted.userAgent !== "test-agent-".repeat(20)) throw new Error("OAuth chunked decrypt self-test failed.");
  console.log("authorize-arenapro self-test passed");
}
