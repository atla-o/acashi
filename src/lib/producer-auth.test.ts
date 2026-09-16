import assert from "node:assert/strict";
import { test } from "node:test";
import {
  createProducerSessionToken,
  producerAuthConfigured,
  producerCredentialsMatch,
  verifyProducerSessionToken,
} from "./producer-auth.ts";

test("producer auth is configured only when password or magic is set", () => {
  const previousPassword = process.env.ACASHI_PRODUCER_PASSWORD;
  const previousMagic = process.env.ACASHI_PRODUCER_MAGIC;
  delete process.env.ACASHI_PRODUCER_PASSWORD;
  delete process.env.ACASHI_PRODUCER_MAGIC;
  assert.equal(producerAuthConfigured(), false);
  process.env.ACASHI_PRODUCER_PASSWORD = "test-password";
  assert.equal(producerAuthConfigured(), true);
  if (previousPassword === undefined) delete process.env.ACASHI_PRODUCER_PASSWORD;
  else process.env.ACASHI_PRODUCER_PASSWORD = previousPassword;
  if (previousMagic === undefined) delete process.env.ACASHI_PRODUCER_MAGIC;
  else process.env.ACASHI_PRODUCER_MAGIC = previousMagic;
});

test("session tokens verify until they expire", () => {
  const secret = "session-secret";
  const now = 1_000_000;
  const token = createProducerSessionToken(secret, now, 60_000);
  assert.equal(verifyProducerSessionToken(token, secret, now + 1_000), true);
  assert.equal(verifyProducerSessionToken(token, secret, now + 90_000), false);
  assert.equal(verifyProducerSessionToken(token, "other", now + 1_000), false);
  assert.equal(verifyProducerSessionToken("nonsig", secret, now), false);
});

test("password and magic token match with timing-safe compare", () => {
  const previousPassword = process.env.ACASHI_PRODUCER_PASSWORD;
  const previousMagic = process.env.ACASHI_PRODUCER_MAGIC;
  process.env.ACASHI_PRODUCER_PASSWORD = "gate";
  process.env.ACASHI_PRODUCER_MAGIC = "link-token";
  assert.equal(producerCredentialsMatch({ password: "gate" }), true);
  assert.equal(producerCredentialsMatch({ password: "nope" }), false);
  assert.equal(producerCredentialsMatch({ token: "link-token" }), true);
  assert.equal(producerCredentialsMatch({ token: "other" }), false);
  if (previousPassword === undefined) delete process.env.ACASHI_PRODUCER_PASSWORD;
  else process.env.ACASHI_PRODUCER_PASSWORD = previousPassword;
  if (previousMagic === undefined) delete process.env.ACASHI_PRODUCER_MAGIC;
  else process.env.ACASHI_PRODUCER_MAGIC = previousMagic;
});
