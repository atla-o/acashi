# Acashi

Acashi is **Affordable Care Act Marketplace coverage** under **Devo** (lateral health), focused on **Washington FFM / HealthCare.gov**. It is a producer **application portal**: a multi-step consumer wizard, retainable agent-assistance consent, status tracking, and export for handoff.

It is **not HealthCare.gov**, **not Covered California**, not a state-based marketplace, and not an FFM/EDE web-broker. Washington consumers enroll on HealthCare.gov. Eligibility, plan selection, and enrollment happen there or with a licensed agent. Acashi does not quote plans, recommend carriers, or guarantee a subsidy.

**Producer path:** Founder licensing is **Washington OIC**. Devo uses the existing legal entity; agent name and NPN live on each application (env defaults, editable on the producer desk). FFM assist waits on PY2027 registration/certification listing (RCL). Until then the portal captures a complete application plus consent and supports JSON/CSV export for HealthSherpa or manual enrollment.

Parent brand: Devo. Siblings: Phenomatch, Antiporn, Lessfret, Lightround. Public family: [devoutshaman.com](https://devoutshaman.com). The **o** mark on this site links there.

**Public host:** [https://acashi.devoutshaman.com](https://acashi.devoutshaman.com) on Cloud Run service **`acashi-web`** (GCP project `devo-holding`, region `us-west1`). Cloudflare is DNS-only — no Workers. Mapping that host is an ops step, not part of this app repo.

Publisher identity: **Devo / atla-o**. Public GitHub: [github.com/atla-o/acashi](https://github.com/atla-o/acashi).

## Surfaces

| Path | Purpose |
| --- | --- |
| `/` | Product copy + consumer application wizard (Washington default) |
| `/enrollment` | What enrollment is, APTC at a high level, HealthCare.gov path |
| `/status` | Status monitor (application id + email) |
| `/producer/login` | Password or magic-link gate for the producer desk |
| `/producer` | Pipeline list (new / in progress / ready to submit / submitted / effectuated / closed) |
| `/producer/[id]` | Application file, status changes, JSON/CSV export |
| `POST /api/applications` | Create a draft (`submit: false`) or start a file |
| `PATCH /api/applications` | Save progress or submit (`submit: true`) by `id` |
| `GET /api/applications?id=&email=` | Public status for that id + email |
| `POST /api/producer/login` | Set the producer session cookie |
| `POST /api/producer/logout` | Clear the session |
| `GET /api/producer/applications` | Pipeline list (session required) |
| `GET` / `PATCH /api/producer/applications/[id]` | File + status (session required) |
| `GET /api/producer/applications/[id]/export?format=json\|csv` | Handoff download (session required) |

## Consumer wizard

Six steps, mobile-width, save on each continue:

1. Contact (name, email, phone, preferred contact)
2. Location (defaults to Washington; ZIP 98001–99403; Washington county list)
3. Household (people, ages, relationships, tobacco if 18+)
4. Income and employment (band or exact amount, work status)
5. Existing coverage (high level; not a medical or SEP determination)
6. Review, portal disclaimer, **agent-assistance consent**

Consent is a checkbox. On submit, Acashi stores the canonical CMS-style authorization text, a timestamp, and the requesting IP on the Firestore document. That is retainable authorization for a licensed agent/broker to assist with Marketplace enrollment. It is not enrollment.

Progress is written to `acashi_applications` and also kept in this browser (`acashi.application.v1` + `acashi.application.draft.v2`). Incomplete files are **in progress**. A complete submit with both checkboxes becomes **new** on the producer pipeline.

## Producer workflow

Target volume: ~20 applications per month.

1. Sign in at `/producer/login` with `ACASHI_PRODUCER_PASSWORD`, or open `/producer/login?token=…` when `ACASHI_PRODUCER_MAGIC` is set.
2. Open the pipeline. Filter by status.
3. Open a file. Confirm household, income, coverage, and the consent audit (timestamp + IP).
4. Confirm **writing producer name and NPN** on the file (the licensed agent who writes it — e.g. an SC NPN). Defaults come from `ACASHI_AGENT_NAME` / `ACASHI_AGENT_NPN`. Devo uses the **existing legal entity**; there is no entity-setup UI. Add producer notes.
5. Move status: **new → in progress → ready to submit**.
6. Export **JSON** (primary) or **CSV** for HealthSherpa or a manual Marketplace session. The export header states this is not an FFM/EDE submission.
7. After handoff, mark **submitted**. When coverage starts, **effectuated**. Otherwise **closed** (not a coverage denial).

Do not enroll from this UI. Do not treat ready-to-submit as an exchange determination. There is no Covered California flow. When PY2027 RCL is open and the producer is listed, FFM assist can replace the export/handoff step — this app does not implement that yet.

## Run locally

```bash
npm ci
ACASHI_STORE=memory \
ACASHI_PRODUCER_PASSWORD=dev-password \
ACASHI_AGENT_NAME=Devo \
ACASHI_AGENT_NPN= \
npm run dev
```

Use `npm ci` (requires the committed `package-lock.json`). `npm install` is fine only when changing dependencies.

The app listens on [http://127.0.0.1:43218](http://127.0.0.1:43218) (also `localhost`). `next.config.ts` allows `127.0.0.1` as a Next.js 16 dev origin so `/_next` assets load on that host.

Without GCP credentials, persist in process memory (`ACASHI_STORE=memory`). Producer login still needs a password or magic token.

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
| `ACASHI_PRODUCER_PASSWORD` | Cloud Run / local | Shared producer desk password |
| `ACASHI_PRODUCER_MAGIC` | Optional | Magic-link token for `/producer/login?token=` |
| `ACASHI_PRODUCER_SECRET` | Optional | Session HMAC secret (defaults to the password or magic token) |
| `ACASHI_AGENT_NAME` | Optional | Default producer name on new files and exports (default `Devo`) |
| `ACASHI_AGENT_NPN` | Optional | Default National Producer Number stamped on files |
| `PORT` | Cloud Run | Default `8080` in the image |

GitHub Actions deploy uses repository **variables** (not secrets) for Workload Identity Federation, same pattern as [atla-o/devo](https://github.com/atla-o/devo) `deploy.yml` (Settings → Secrets and variables → Actions → Variables):

| Variable | Value |
| --- | --- |
| `GCP_WORKLOAD_IDENTITY_PROVIDER` | Full WIF provider resource name |
| `GCP_SERVICE_ACCOUNT` | Deploy service-account email in `devo-holding` |

The workflow preflight fails clearly if either variable is unset. `id-token: write` is required so `google-github-actions/auth` can mint the GitHub OIDC token.

Producer password, magic token, session secret, and NPN are **Cloud Run service environment** (or Secret Manager), not GitHub Actions variables. This repo does not deploy those secrets. Set them on `acashi-web` in `devo-holding` when a human is ready.

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

Wizard sections, consent audit (`agentAssistanceConsentAt`, `agentAssistanceConsentIp`, `agentAssistanceConsentText`, `consentVersion`), and `statusHistory` live on the same documents. Older interest-form rows still read: legacy statuses `received` / `in_review` / `needs_info` / `ready_for_marketplace` map onto the current pipeline.

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

- Landing copy that states Washington FFM / HealthCare.gov (not Covered California) and the PY2027 wait
- Enrollment information: what enrollment is, APTC at a high level, licensed producer, path to HealthCare.gov
- A six-step wizard defaulting to Washington with county/ZIP for this state
- Explicit agent-assistance consent (checkbox + stored timestamp + IP)
- Status monitor for the current pipeline
- Producer desk: gated list, detail, status changes, NPN/agent name, JSON/CSV export
- Persistent footer disclaimer

There are no fake eligibility results, quotes, carrier recommendations, or enrollment completions.
