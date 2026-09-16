import assert from "node:assert/strict";
import { test } from "node:test";
import {
  decryptSsn,
  encryptSsn,
  isValidSsn,
  maskSsn,
  normalizeSsn,
  ssnLast4,
} from "./ssn.ts";

test("normalizes and validates SSN", () => {
  assert.equal(normalizeSsn("536-90-1111"), "536901111");
  assert.equal(isValidSsn("536-90-1111"), true);
  assert.equal(isValidSsn("000-00-0000"), false);
  assert.equal(isValidSsn("123-45-678"), false);
  assert.equal(ssnLast4("536901111"), "1111");
  assert.equal(maskSsn("536901111"), "•••-••-1111");
});

test("encrypts SSN and decrypts without logging plaintext", () => {
  const cipher = encryptSsn("536-90-1111");
  assert.match(cipher, /^v1\./);
  assert.equal(cipher.includes("536901111"), false);
  assert.equal(decryptSsn(cipher), "536901111");
  assert.equal(decryptSsn("not-a-cipher"), null);
});
