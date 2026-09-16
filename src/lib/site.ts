export const site = {
  name: "Acashi",
  tagline:
    "Affordable Care Act subsidized health insurance. Bare-bones application and status tracking.",
  parent: "Devo",
  publisher: "Devo / atla-o",
  familyDomain: "devoutshaman.com",
  familyUrl: "https://devoutshaman.com",
  publicHost: "https://acashi.devoutshaman.com",
  github: "https://github.com/atla-o/acashi",
  description:
    "Acashi collects ACA marketplace interest and tracks application status. Not a licensed broker. Enrollment is on HealthCare.gov or a state exchange.",
} as const;

export const nav = [
  { href: "/", label: "Apply" },
  { href: "/status", label: "Status" },
] as const;

export const APPLICATION_STORAGE_KEY = "acashi.application.v1";
