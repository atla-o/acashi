export const homeLicenseState = "WA" as const;
export const homeLicenseRegulator =
  "Washington Office of the Insurance Commissioner (OIC)";

export const washingtonCounties = [
  "Adams",
  "Asotin",
  "Benton",
  "Chelan",
  "Clallam",
  "Clark",
  "Columbia",
  "Cowlitz",
  "Douglas",
  "Ferry",
  "Franklin",
  "Garfield",
  "Grant",
  "Grays Harbor",
  "Island",
  "Jefferson",
  "King",
  "Kitsap",
  "Kittitas",
  "Klickitat",
  "Lewis",
  "Lincoln",
  "Mason",
  "Okanogan",
  "Pacific",
  "Pend Oreille",
  "Pierce",
  "San Juan",
  "Skagit",
  "Skamania",
  "Snohomish",
  "Spokane",
  "Stevens",
  "Thurston",
  "Wahkiakum",
  "Walla Walla",
  "Whatcom",
  "Whitman",
  "Yakima",
] as const;

export type WashingtonCounty = (typeof washingtonCounties)[number];

export function normalizeWashingtonCounty(value: string) {
  const stripped = value.replace(/\s+county$/i, "").trim();
  const match = washingtonCounties.find(
    (county) => county.toLowerCase() === stripped.toLowerCase()
  );
  return match ?? stripped;
}

export function isWashingtonCounty(value: string): value is WashingtonCounty {
  return washingtonCounties.some(
    (county) => county === normalizeWashingtonCounty(value)
  );
}

export function isWashingtonZip(value: string) {
  const five = value.slice(0, 5);
  if (!/^\d{5}$/.test(five)) return false;
  const n = Number.parseInt(five, 10);
  return n >= 98001 && n <= 99403;
}
