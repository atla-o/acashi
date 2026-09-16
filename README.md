# Acashi

Acashi is **Affordable Care Act Marketplace coverage** under **Devo** (lateral health), focused on **Washington Healthplanfinder** (WAHBE). It is an interest portal: browse public plan landscape data, file an application (name, DOB, address, income, SSN, household), track status, and an **Admin** producer desk.

It is **not Healthplanfinder**, **not WAHBE**, **not HealthCare.gov**, and not an EDE/web-broker. Washington is a **state-based Marketplace**. Consumers enroll on [Healthplanfinder](https://www.wahealthplanfinder.org). Plan selection on this site is interest only. Acashi does not quote a personalized APTC, bind a plan, or complete enrollment.

**Producer path:** Founder licensing is **Washington OIC**. Devo uses the existing legal entity; agent name and NPN live on each application (env defaults, editable on Admin). Export is for licensed-producer handoff to Healthplanfinder — not FFM RCL / HealthCare.gov as the primary path.

Parent brand: Devo. Siblings: Phenomatch, Antiporn, Lessfret, Lightround. Public family: [devoutshaman.com](https://devoutshaman.com). The **o** mark on this site links there.

**Public host:** [https://acashi.devoutshaman.com](https://acashi.devoutshaman.com) on Cloud Run service **`acashi-web`** (GCP project `devo-holding`, region `us-west1`). Cloudflare is DNS-only — no Workers. Mapping that host is an ops step, not part of this app repo.

Publisher identity: **Devo / atla-o**. Public GitHub: [github.com/atla-o/acashi](https://github.com/atla-o/acashi).

## Surfaces

| Path | Purpose |
| --- | --- |
| `/` | Marketplace: pick a Washington ZIP or county, scroll PY2026 medical plans |
| `/apply` | Application: name, DOB, address, income, SSN, household, consent |
| `/enrollment` | What enrollment is, APTC at a high level, Healthplanfinder path |
| `/account` | Consumer account / status monitor (application id + email). `/status` redirects here |
| `/admin/login` | Password or magic-link gate for the Admin / producer desk |
| `/admin` | Pipeline list (new / in progress / ready to submit / submitted / effectuated / closed) |
| `/admin/[id]` | Application file, status changes, SSN (producer), JSON/CSV export |
| `/producer/*` | Redirects to the matching `/admin` route |
| `POST /api/applications` | Create a draft (`submit: false`) or start a file |
| `PATCH /api/applications` | Save progress or submit (`submit: true`) by `id` |
| `GET /api/applications?id=&email=` | Public status for that id + email (SSN masked) |
| `POST /api/producer/login` | Set the Admin session cookie |
| `POST /api/producer/logout` | Clear the session |
| `GET /api/producer/applications` | Pipeline list (session required) |
| `GET` / `PATCH /api/producer/applications/[id]` | File + status (session required) |
| `GET /api/producer/applications/[id]/export?format=json\|csv` | Handoff download (session required; includes SSN for the producer) |

## Three-step flow

1. **Browse** — ZIP or county. Scroll metal, issuer, age-40 landscape premium, and individual deductible from CMS Washington SBE QHP PUF PY2026 (cached in `src/data/`). Premiums are public list rates, not a personalized APTC quote. “Save interest” is not enrollment.
2. **Apply** — name, date of birth, street address, income, SSN, household (already started), coverage, and agent-assistance consent. SSN is encrypted at rest (`ssnCiphertext`), never written to `localStorage` or URLs, and masked on the consumer account page.
3. **Account + Admin** — consumer status on `/account`. **Admin** is the producer desk: login, pipeline, open file, status, export.

Consent is a checkbox. On submit, Acashi stores the authorization text, a timestamp, and the requesting IP. That is retainable authorization for a licensed producer to assist on Healthplanfinder. It is not enrollment.

Progress is written to `acashi_applications`. Incomplete files are **in progress**. A complete submit with both checkboxes becomes **new** on the Admin pipeline.

## Plan data

Washington is not in the federal QHP Landscape files (those cover FFM / SBE-FP states). The in-repo cache is built from the [CMS Washington SBE QHP PUF, plan year 2026](https://www.cms.gov/marketplace/resources/data/state-based-public-use-files) (`washingtonsbepuf2026.zip`): on-Exchange individual medical standard variants, county service areas, and age-40 individual rates by geographic rating area. ZIP→county uses public postal crosswalk data.

Do not invent plans. Label premiums as landscape/public data. Acashi is not the official Exchange.

## Admin workflow

Target volume: ~20 applications per month.

1. Sign in at `/admin/login` with `ACASHI_PRODUCER_PASSWORD`, or open `/admin/login?token=…` when `ACASHI_PRODUCER_MAGIC` is set.
2. Open the pipeline. Filter by status.
3. Open a file. Confirm household, income, address, DOB, SSN, plan interest, and the consent audit.
4. Confirm **writing producer name and NPN** on the file. Defaults come from `ACASHI_AGENT_NAME` / `ACASHI_AGENT_NPN`. Devo uses the **existing legal entity**.
5. Move status: **new → in progress → ready to submit**.
6. Export **JSON** (primary) or **CSV** for Healthplanfinder handoff.
7. After handoff, mark **submitted**. When coverage starts, **effectuated**. Otherwise **closed** (not a coverage denial).

Do not enroll from this UI. Do not treat ready-to-submit as an Exchange determination.

## Run locally

```bash
npm ci
ACASHI_STORE=memory \
ACASHI_PRODUCER_PASSWORD=dev-password \
ACASHI_AGENT_NAME=Devo \
ACASHI_AGENT_NPN= \
ACASHI_SSN_KEY= \
npm run dev
```

Use `npm ci` (requires the committed `package-lock.json`). `npm install` is fine only when changing dependencies.

The app listens on [http://127.0.0.1:43218](http://127.0.0.1:43218) (also `localhost`). `next.config.ts` allows `127.0.0.1` as a Next.js 16 dev origin so `/_next` assets load on that host.

Without GCP credentials, persist in process memory (`ACASHI_STORE=memory`). Admin login still needs a password or magic token.

```bash
npm run lint
npm run test
npm run build
```

App data lives in GCP project `devo-holding` (Firestore), reached by the Cloud Run app API. Do not use the Firebase client SDK or Firebase Hosting.

## Environment

| Variable | Where | Purpose |
| --- | --- | --- |
| `GCP_PROJECT` / `GOOGLE_CLOUD_PROJECT` | Cloud Run (set by deploy) | Must be `devo-holding` |
| `FIRESTORE_DATABASE` | Optional | Defaults to `(default)` |
| `ACASHI_STORE` | Local / tests only | Set to `memory` to skip Firestore |
| `ACASHI_PRODUCER_PASSWORD` | Cloud Run / local | Shared Admin desk password |
| `ACASHI_PRODUCER_MAGIC` | Optional | Magic-link token for `/admin/login?token=` |
| `ACASHI_PRODUCER_SECRET` | Optional | Session HMAC secret (defaults to the password or magic token) |
| `ACASHI_SSN_KEY` | Cloud Run / local | AES-256-GCM key material for SSN at rest (falls back to producer secret, then a local-dev string) |
| `ACASHI_AGENT_NAME` | Optional | Default producer name on new files and exports (default `Devo`) |
| `ACASHI_AGENT_NPN` | Optional | Default National Producer Number stamped on files |
| `PORT` | Cloud Run | Default `8080` in the image |

GitHub Actions deploy uses repository **variables** (not secrets) for Workload Identity Federation, same pattern as [atla-o/devo](https://github.com/atla-o/devo) `deploy.yml` (Settings → Secrets and variables → Actions → Variables):

| Variable | Value |
| --- | --- |
| `GCP_WORKLOAD_IDENTITY_PROVIDER` | Full WIF provider resource name |
| `GCP_SERVICE_ACCOUNT` | Deploy service-account email in `devo-holding` |

The workflow preflight fails clearly if either variable is unset. `id-token: write` is required so `google-github-actions/auth` can mint the GitHub OIDC token.

Producer password, magic token, session secret, SSN key, and NPN are **Cloud Run service environment** (or Secret Manager), not GitHub Actions variables. This repo does not deploy those secrets. Set them on `acashi-web` in `devo-holding` when a human is ready.

## Deploy (Cloud Run)

Push to `main` deploys the Next.js production image to `acashi-web` via [`.github/workflows/deploy-acashi-web.yml`](./.github/workflows/deploy-acashi-web.yml). Agents must not run that deploy unless a human asks.

The image is [`Dockerfile`](./Dockerfile): Next.js `output: "standalone"`, listening on `0.0.0.0:$PORT` (Cloud Run default **8080**).

```bash
gcloud run deploy acashi-web \
  --source . \
  --project=devo-holding \
  --region=us-west1 \
  --no-invoker-iam-check
```

**Never `--allow-unauthenticated`.** Org policy blocks `allUsers` on `roles/run.invoker`. Public traffic uses invoker IAM disabled (`--no-invoker-iam-check`, annotation `run.googleapis.com/invoker-iam-disabled`). `cloudbuild.yaml` is optional for a later Cloud Build trigger; GitHub Actions is the primary path.

One-time cutover (ops, not this repo): map `acashi.devoutshaman.com` on Cloud Run **`acashi-web`**, and keep the Cloudflare CNAME DNS-only (not proxied) to `ghs.googlehosted.com`. Do not put this app on Cloudflare Workers, Firebase, or Vercel.

## Firestore (devo-holding)

Collection: **`acashi_applications`**.

Wizard sections, encrypted SSN (`ssnCiphertext`, `ssnLast4`), selected plan interest, consent audit (`agentAssistanceConsentAt`, `agentAssistanceConsentIp`, `agentAssistanceConsentText`, `consentVersion`), and `statusHistory` live on the same documents. Older interest-form rows still read: legacy statuses `received` / `in_review` / `needs_info` / `ready_for_marketplace` map onto the current pipeline.

One-time, if the Native Firestore database is not already there:

```bash
gcloud services enable firestore.googleapis.com --project=devo-holding
gcloud firestore databases create \
  --project=devo-holding \
  --location=us-west1 \
  --type=firestore-native
```

Grant the Cloud Run runtime service account `roles/datastore.user` on `devo-holding` so `acashi-web` can read and write `acashi_applications`. The GitHub Actions deploy sets `GCP_PROJECT=devo-holding`. Do not deploy from an agent unless a human asks.

## What the UI includes

- Marketplace browse of cached Washington PY2026 medical plans (metal, issuer, landscape premium, deductible)
- Landing copy that states Washington Healthplanfinder / WAHBE (not HealthCare.gov FFM)
- Enrollment information: what enrollment is, APTC at a high level, licensed producer, path to Healthplanfinder
- Application for name, DOB, address, income, SSN, and household
- Explicit agent-assistance consent (checkbox + stored timestamp + IP)
- Consumer account monitor with masked SSN
- Admin desk: gated list, detail (full SSN for the producer), status changes, NPN/agent name, JSON/CSV export
- Persistent footer disclaimer

There are no fake eligibility results, personalized APTC quotes, carrier recommendations, or enrollment completions.
