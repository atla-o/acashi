import { createHmac, timingSafeEqual } from "node:crypto";

export const PRODUCER_COOKIE = "acashi_producer";
export const PRODUCER_SESSION_DAYS = 7;

export function producerAuthConfigured() {
  return Boolean(
    process.env.ACASHI_PRODUCER_PASSWORD || process.env.ACASHI_PRODUCER_MAGIC
  );
}

export function producerSessionSecret() {
  return (
    process.env.ACASHI_PRODUCER_SECRET ||
    process.env.ACASHI_PRODUCER_PASSWORD ||
    process.env.ACASHI_PRODUCER_MAGIC ||
    ""
  );
}

function hmac(value: string, secret: string) {
  return createHmac("sha256", secret).update(value).digest("base64url");
}

function hashedEqual(left: string, right: string) {
  const a = hmac(left, "acashi-compare");
  const b = hmac(right, "acashi-compare");
  return (
    a.length === b.length &&
    timingSafeEqual(Buffer.from(a), Buffer.from(b))
  );
}

export function createProducerSessionToken(
  secret = producerSessionSecret(),
  now = Date.now(),
  ttlMs = PRODUCER_SESSION_DAYS * 24 * 60 * 60 * 1000
) {
  if (!secret) return "";
  const exp = String(now + ttlMs);
  return `${exp}.${hmac(exp, secret)}`;
}

export function verifyProducerSessionToken(
  token: string,
  secret = producerSessionSecret(),
  now = Date.now()
) {
  if (!token || !secret) return false;
  const dot = token.indexOf(".");
  if (dot <= 0) return false;
  const exp = token.slice(0, dot);
  const sig = token.slice(dot + 1);
  if (!exp || !sig) return false;
  const expected = hmac(exp, secret);
  if (expected.length !== sig.length) return false;
  if (!timingSafeEqual(Buffer.from(expected), Buffer.from(sig))) return false;
  const expiresAt = Number(exp);
  return Number.isFinite(expiresAt) && now < expiresAt;
}

export function producerCredentialsMatch(input: {
  password?: string;
  token?: string;
}) {
  const password = process.env.ACASHI_PRODUCER_PASSWORD || "";
  const magic = process.env.ACASHI_PRODUCER_MAGIC || "";
  if (input.password && password && hashedEqual(input.password, password)) {
    return true;
  }
  if (input.token && magic && hashedEqual(input.token, magic)) {
    return true;
  }
  return false;
}

export function producerCookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: PRODUCER_SESSION_DAYS * 24 * 60 * 60,
  };
}
