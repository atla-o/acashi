# Acashi — Devo agent guide

## Standing objective (Devo UI-first)

Cursor cloud work for this product: **one promptable environment / one cloud workspace**, kept current.

Priority order for every task unless Devo says otherwise:
1. **Complete functional UI** — usable end-to-end (persist data, real submit paths, loading/empty/error/success). No blocking coming-soon for core flows.
2. Black text on **white** backgrounds always — never follow system dark mode / white-on-black.
3. Ship via merge to `main` (Cloud Run Actions). Do not deploy from the agent unless Devo explicitly says push/ship/merge and deploy.

## Live UI preview

Whenever a UI change is **not yet on `main`** (feature branch, local/dev server, draft or unmerged PR — anything that is not production):

- Run the app (Next.js on **port 43218**).
- Give Devo a **clickable live preview URL** he can open inside Cursor: the Cloud Agent forwarded port, tunnel, or preview URL Cursor exposes for that running app.
- Paste the **full URL** in the reply (for this app, usually `http://127.0.0.1:43218` plus any tunnel/preview URL). Screenshots and recordings are extra. They do not replace the live link.

Do this on every turn while UI is in flux. Do not wait until the PR is merged.

Parent: Devo (lateral health). Publisher: atla-o. GCP app data: project `devo-holding`. Public hosts on `*.devoutshaman.com` (Cloudflare DNS-only → Cloud Run).

Siblings: Phenomatch, Antiporn, Lessfret, Lightround, Acashi. Holding lander: atla-o/devo → devoutshaman.com.

## This product

WA Healthplanfinder producer portal — browse plans → apply (income/SSN/DOB/address) → account + admin; OIC Disability license path; **not** HealthCare.gov.

Acashi is Affordable Care Act Marketplace coverage under Devo, focused on Washington Healthplanfinder (WAHBE). Interest portal only: not Healthplanfinder, not WAHBE, not HealthCare.gov, and not an EDE/web-broker. Washington is a state-based Marketplace; consumers enroll on Healthplanfinder. Acashi does not quote personalized APTC, bind a plan, or complete enrollment.

Producer path: Washington OIC licensing. Devo uses the existing legal entity; agent name and NPN on each application. Export is for licensed-producer handoff to Healthplanfinder — not FFM RCL / HealthCare.gov as the primary path.

Public GitHub: [github.com/atla-o/acashi](https://github.com/atla-o/acashi). Public host: https://acashi.devoutshaman.com on Cloud Run `acashi-web` (`devo-holding`, `us-west1`). Cloudflare DNS-only, no Workers.

## Hybrid Cursor process

Use **cloud agents** for web app work, GCP, GitHub, and documentation. Do not default to local Mac for Next.js, copy, intake, Admin desk, or docs.

## Data and hosting

- Production app data: **GCP** project `devo-holding`. **Do not use Firebase.**
- Do not deploy from a cloud agent unless Devo explicitly asks. Push/merge to `main` auto-deploys via GitHub Actions (`.github/workflows/deploy-acashi-web.yml`).
- Org policy blocks `allUsers`. Never `--allow-unauthenticated`. Public access is invoker-iam-disabled.
- Production image: `Dockerfile` with Next.js standalone. Listens on `0.0.0.0:$PORT`.

## Surfaces (core)

- `/` Marketplace browse (ZIP/county, PY2026 plans)
- `/apply` Application (name, DOB, address, income, SSN, household, consent)
- `/account` Consumer status; `/admin` producer desk + export

Consent on submit is retainable authorization for a licensed producer to assist on Healthplanfinder — not enrollment. SSN encrypted at rest; never in `localStorage` or URLs.

## Stack notes

- Next.js App Router, TypeScript, Tailwind, shadcn/ui
- `npm ci` needs `package-lock.json`; prefer that over `npm install` for clean builds
- Keep black text on white; spare Devo aesthetic
