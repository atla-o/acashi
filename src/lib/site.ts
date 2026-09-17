export const site = {
  name: "Acashi",
  tagline:
    "Washington Healthplanfinder interest portal. Browse public plans, apply, and finish on the state Marketplace.",
  parent: "Devo",
  publisher: "Devo / atla-o",
  familyDomain: "devoutshaman.com",
  familyUrl: "https://devoutshaman.com",
  publicHost: "https://acashi.devoutshaman.com",
  github: "https://github.com/atla-o/acashi",
  description:
    "Acashi helps Washington households browse CMS public QHP landscape data, save an interest application (including SSN) for a licensed producer, and finish enrollment on Washington Healthplanfinder. Not the official Exchange.",
} as const;

export const nav = [
  { href: "/", label: "Marketplace" },
  { href: "/apply", label: "Apply" },
  { href: "/account", label: "Account" },
] as const;

export const APPLICATION_STORAGE_KEY = "acashi.application.v1";
export const APPLICATION_DRAFT_STORAGE_KEY = "acashi.application.draft.v3";
export const SELECTED_PLAN_STORAGE_KEY = "acashi.plan.v1";
export const FINDER_PREFS_STORAGE_KEY = "acashi.finder.v1";
