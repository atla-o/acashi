# Acashi

Acashi is **Affordable Care Act subsidized health insurance** under **Devo** (lateral health). It collects a bare-bones marketplace interest form and tracks application status. It is not a licensed insurance broker, not insurance advice, and not enrollment.

Final plan selection happens on [HealthCare.gov](https://www.healthcare.gov) or a state-based marketplace. Acashi stores the interest file and a status (received → in review → needs info → ready for marketplace / closed).

Parent brand: Devo. Siblings: Phenomatch, Antiporn, Lessfret, Lightround. Public family: [devoutshaman.com](https://devoutshaman.com). The **o** mark on this site links there.

**Public host:** [https://acashi.devoutshaman.com](https://acashi.devoutshaman.com) on Cloud Run service **`acashi-web`** (GCP project `devo-holding`, region `us-west1`). Cloudflare is DNS-only — no Workers. Mapping that host is an ops step, not part of this app repo.

Publisher identity: **Devo / atla-o**. Public GitHub: [github.com/atla-o/acashi](https://github.com/atla-o/acashi).

## Surfaces

| Path | Purpose |
| --- | --- |
| `/` | Product copy + public application form |
| `/status` | Status monitor (application id + email) |
| `POST /api/applications` | Create an application in Firestore |
| `GET /api/applications?id=&email=` | Read status for that id + email |

## Run locally

```bash
npm ci
npm run dev
```

Use `npm ci` (requires the committed `package-lock.json`). `npm install` is fine only when changing dependencies.

The app listens on [http://127.0.0.1:43218](http://127.0.0.1:43218).

Without GCP credentials, persist in process memory:

```bash
ACASHI_STORE=memory npm run dev
```

```bash
npm run lint
npm run test
npm run build
```

App data lives in GCP project `devo-holding` (Firestore), reached by the Cloud Run app API. Do not use the Firebase client SDK or Firebase Hosting. After submit, the browser stores the application id in `localStorage` under `acashi.application.v1`.

## Environment

| Variable | Where | Purpose |
| --- | --- | --- |
| `GCP_PROJECT` / `GOOGLE_CLOUD_PROJECT` | Cloud Run (set by deploy) | Must be `devo-holding` |
| `FIRESTORE_DATABASE` | Optional | Defaults to `(default)` |
| `ACASHI_STORE` | Local / tests only | Set to `memory` to skip Firestore |
| `PORT` | Cloud Run | Default `8080` in the image |

GitHub Actions deploy secrets (same pattern as Lessfret):

| Secret | Value |
| --- | --- |
| `GCP_WORKLOAD_IDENTITY_PROVIDER` | Full WIF provider resource name |
| `GCP_SERVICE_ACCOUNT` | Deploy service-account email in `devo-holding` |

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

- Landing copy that states what Acashi is and is not
- A public form: full name, email, phone, state, ZIP, household size, income band (optional exact amount), preferred contact method, optional notes, disclaimer
- Client-side validation plus the same checks on `POST /api/applications`
- Status monitor with loading, empty, error, and success states
- Persistent footer disclaimer

There are no fake eligibility results, quotes, or enrollment completions.
