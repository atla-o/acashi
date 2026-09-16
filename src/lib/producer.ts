export { PRODUCER_COOKIE, PRODUCER_SESSION_DAYS } from "./producer-auth";

export function producerDefaults() {
  return {
    agentName: (process.env.ACASHI_AGENT_NAME || "Devo").trim(),
    agentNpn: (process.env.ACASHI_AGENT_NPN || "").trim(),
  };
}

export function clientIp(request: Request) {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first.slice(0, 128);
  }
  const real =
    request.headers.get("x-real-ip")?.trim() ||
    request.headers.get("cf-connecting-ip")?.trim() ||
    "";
  return real.slice(0, 128);
}
