export const site = {
  name: "Acashi",
  tagline:
    "Washington FFM application portal. Complete HealthCare.gov file, consent, and producer handoff — not Covered California.",
  parent: "Devo",
  publisher: "Devo / atla-o",
  familyDomain: "devoutshaman.com",
  familyUrl: "https://devoutshaman.com",
  publicHost: "https://acashi.devoutshaman.com",
  github: "https://github.com/atla-o/acashi",
  description:
    "Acashi captures Washington ACA Marketplace application data and agent-assistance consent for HealthCare.gov (FFM) handoff. Not Covered California. Not HealthCare.gov.",
} as const;

export const nav = [
  { href: "/", label: "Apply" },
  { href: "/enrollment", label: "Enrollment" },
  { href: "/status", label: "Status" },
] as const;

export const APPLICATION_STORAGE_KEY = "acashi.application.v1";
export const APPLICATION_DRAFT_STORAGE_KEY = "acashi.application.draft.v2";
