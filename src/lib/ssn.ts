import { createCipheriv, createDecipheriv, createHash, randomBytes } from "node:crypto";

const SSN_PREFIX = "v1";

function ssnKey() {
  const material =
    process.env.ACASHI_SSN_KEY ||
    process.env.ACASHI_PRODUCER_SECRET ||
    process.env.ACASHI_PRODUCER_PASSWORD ||
    "acashi-dev-ssn-not-for-production";
  return createHash("sha256").update(material).digest();
}

export function digitsOnly(value: string) {
  return value.replace(/\D/g, "");
}

export function normalizeSsn(value: unknown) {
  if (typeof value !== "string") return "";
  return digitsOnly(value).slice(0, 9);
}

export function isValidSsn(value: string) {
  const digits = normalizeSsn(value);
  if (digits.length !== 9) return false;
  if (digits === "000000000" || digits === "123456789") return false;
  if (digits.startsWith("000") || digits.startsWith("666") || digits.startsWith("9")) {
    return false;
  }
  if (digits.slice(3, 5) === "00" || digits.slice(5) === "0000") return false;
  return true;
}

export function ssnLast4(value: string) {
  const digits = normalizeSsn(value);
  return digits.length === 9 ? digits.slice(-4) : "";
}

export function maskSsn(value: string) {
  const last4 = ssnLast4(value);
  if (!last4) return "•••-••-••••";
  return `•••-••-${last4}`;
}

export function encryptSsn(value: string) {
  const digits = normalizeSsn(value);
  if (digits.length !== 9) {
    throw new Error("SSN is not 9 digits.");
  }
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", ssnKey(), iv);
  const encrypted = Buffer.concat([cipher.update(digits, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return [
    SSN_PREFIX,
    iv.toString("base64url"),
    encrypted.toString("base64url"),
    tag.toString("base64url"),
  ].join(".");
}

export function decryptSsn(ciphertext: string) {
  if (!ciphertext || typeof ciphertext !== "string") return null;
  const parts = ciphertext.split(".");
  if (parts.length !== 4 || parts[0] !== SSN_PREFIX) return null;
  try {
    const iv = Buffer.from(parts[1], "base64url");
    const encrypted = Buffer.from(parts[2], "base64url");
    const tag = Buffer.from(parts[3], "base64url");
    const decipher = createDecipheriv("aes-256-gcm", ssnKey(), iv);
    decipher.setAuthTag(tag);
    const digits = Buffer.concat([decipher.update(encrypted), decipher.final()]).toString(
      "utf8"
    );
    return isValidSsn(digits) ? digits : null;
  } catch {
    return null;
  }
}

export function formatSsn(value: string) {
  const digits = normalizeSsn(value);
  if (digits.length !== 9) return maskSsn(value);
  return `${digits.slice(0, 3)}-${digits.slice(3, 5)}-${digits.slice(5)}`;
}
