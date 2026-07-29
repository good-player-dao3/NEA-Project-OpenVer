export const config = {
  wsUrl: Bun.env.BOX3_WS_URL ?? "wss://6525aa75.chat.box3.ink:33815",
  sessionId: Bun.env.BOX3_SESSION ?? "",
  proxyPort: Number(Bun.env.BOX3_PROXY_PORT ?? 8080),
  realServerUrl: Bun.env.BOX3_REAL_SERVER_URL ?? "wss://743e6b8d.chat.box3.ink:35981",
}

export function withSession(url: string): string {
  if (!config.sessionId) return url
  const parsed = new URL(url)
  parsed.searchParams.set("sid", config.sessionId)
  return parsed.toString()
}
