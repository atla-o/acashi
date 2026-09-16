"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Field, fieldClass } from "@/components/field";
import { Button } from "@/components/ui/button";

export function ProducerLoginForm({
  configured,
  magicToken,
  error,
}: {
  configured: boolean;
  magicToken: string;
  error: string;
}) {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [submitError, setSubmitError] = useState(error || null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!magicToken || !configured) return;
    void login({ token: magicToken });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- one-shot magic link
  }, [magicToken, configured]);

  async function login(body: { password?: string; token?: string }) {
    setSubmitting(true);
    setSubmitError(null);
    try {
      const response = await fetch("/api/producer/login", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body),
      });
      const payload = (await response.json().catch(() => null)) as
        | { ok: true }
        | { ok: false; error?: string }
        | null;
      if (!response.ok || !payload || !payload.ok) {
        setSubmitError(
          payload && "error" in payload && payload.error
            ? payload.error
            : "Sign-in failed."
        );
        return;
      }
      router.replace("/admin");
      router.refresh();
    } catch {
      setSubmitError("Acashi could not be reached. Try again.");
    } finally {
      setSubmitting(false);
    }
  }

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void login({ password });
  }

  if (!configured) {
    return (
      <p
        role="status"
        className="border border-foreground/12 px-4 py-3 text-sm leading-7"
      >
        Set <span className="font-mono">ACASHI_PRODUCER_PASSWORD</span> or{" "}
        <span className="font-mono">ACASHI_PRODUCER_MAGIC</span> on the Cloud
        Run service. Optional:{" "}
        <span className="font-mono">ACASHI_PRODUCER_SECRET</span>,{" "}
        <span className="font-mono">ACASHI_AGENT_NAME</span>,{" "}
        <span className="font-mono">ACASHI_AGENT_NPN</span>. See the README.
      </p>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6" noValidate>
      {submitError ? (
        <p
          role="alert"
          className="border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm leading-6 text-destructive"
        >
          {submitError}
        </p>
      ) : null}
      {submitting && magicToken ? (
        <p role="status" className="text-sm text-muted-foreground">
          Checking magic link…
        </p>
      ) : null}
      <Field
        label="Password"
        htmlFor="producerPassword"
        hint="Shared Admin password. Magic links use ACASHI_PRODUCER_MAGIC as /admin/login?token=…"
      >
        <input
          id="producerPassword"
          name="password"
          type="password"
          autoComplete="current-password"
          value={password}
          className={fieldClass()}
          onChange={(event) => {
            setPassword(event.target.value);
            setSubmitError(null);
          }}
        />
      </Field>
      <Button type="submit" disabled={submitting} className="h-10 rounded-sm px-4">
        {submitting ? "Signing in…" : "Sign in"}
      </Button>
    </form>
  );
}
