/** GCP project that holds Acashi app data. Spell carefully. */
export const GCP_PROJECT_ID = "devo-holding";

export const gcp = {
  projectId:
    process.env.GCP_PROJECT ||
    process.env.GOOGLE_CLOUD_PROJECT ||
    GCP_PROJECT_ID,
  organization: "atla-o.com",
  folder: "Devo",
  region: process.env.GCP_REGION || "us-west1",
  firestoreDatabase: process.env.FIRESTORE_DATABASE || "(default)",
  cloudRunService: process.env.CLOUD_RUN_SERVICE || "acashi-web",
  collections: {
    applications: "acashi_applications",
  },
} as const;
