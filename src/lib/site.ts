export const site = {
  name: "Acashi",
  tagline:
    "Affordable Care Act Marketplace application portal. Complete file, consent, and producer handoff — not HealthCare.gov.",
  parent: "Devo",
  publisher: "Devo / atla-o",
  familyDomain: "devoutshaman.com",
  familyUrl: "https://devoutshaman.com",
  publicHost: "https://acashi.devoutshaman.com",
  github: "https://github.com/atla-o/acashi",
  description:
    "Acashi captures ACA Marketplace application data and agent-assistance consent, then tracks status for producer handoff. Not HealthCare.gov. Enrollment is on the official exchange or with a licensed agent.",
} as const;

export const nav = [
  { href: "/", label: "Apply" },
  { href: "/status", label: "Status" },
] as const;

export const APPLICATION_STORAGE_KEY = "acashi.application.v1";
export const APPLICATION_DRAFT_STORAGE_KEY = "acashi.application.draft.v2";
