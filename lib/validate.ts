import { DEFAULT_SETTINGS } from "./roommates";
import type { Listing, ListingInput, RoommateId, Settings } from "./types";

// Shared by the browser store and the API route, so both sides accept exactly the same data.

const ROOMMATE_IDS: readonly RoommateId[] = ["riya", "meera", "kavita"];
export const MAX_TITLE_LENGTH = 80;
export const MAX_LISTINGS = 200;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function numberIn(value: unknown, min: number, max: number): number | null {
  return typeof value === "number" && Number.isFinite(value) && value >= min && value <= max ? value : null;
}

function intIn(value: unknown, min: number, max: number): number | null {
  const n = numberIn(value, min, max);
  return n !== null && Number.isInteger(n) ? n : null;
}

function isRoommateId(value: unknown): value is RoommateId {
  return typeof value === "string" && (ROOMMATE_IDS as readonly string[]).includes(value);
}

/** Validates the user-editable part of a listing. Returns null if anything is off. */
export function parseListingInput(value: unknown): ListingInput | null {
  if (!isRecord(value)) return null;
  const title = typeof value.title === "string" ? value.title.trim().slice(0, MAX_TITLE_LENGTH) : "";
  // Whole numbers only: they map onto integer columns in the database.
  const totalRent = intIn(value.totalRent, 1, 10_000_000);
  const deposit = intIn(value.deposit, 0, 100_000_000);
  const floor = intIn(value.floor, 0, 200);
  const bathrooms = intIn(value.bathrooms, 1, 20);
  const hinjewadiCommute = intIn(value.hinjewadiCommute, 0, 600);
  const gymCommute = intIn(value.gymCommute, 0, 600);

  if (
    title === "" ||
    totalRent === null ||
    deposit === null ||
    floor === null ||
    bathrooms === null ||
    hinjewadiCommute === null ||
    gymCommute === null ||
    typeof value.hasLift !== "boolean" ||
    typeof value.hasParking !== "boolean" ||
    typeof value.petFriendly !== "boolean" ||
    !isRoommateId(value.addedBy)
  ) {
    return null;
  }

  return {
    title,
    totalRent,
    deposit,
    floor,
    bathrooms,
    hinjewadiCommute,
    gymCommute,
    hasLift: value.hasLift,
    hasParking: value.hasParking,
    petFriendly: value.petFriendly,
    addedBy: value.addedBy,
  };
}

export function parseListing(value: unknown): Listing | null {
  if (!isRecord(value) || typeof value.id !== "string" || value.id === "") return null;
  const createdAt = numberIn(value.createdAt, 0, Number.MAX_SAFE_INTEGER);
  const input = parseListingInput(value);
  if (!input || createdAt === null) return null;
  return { ...input, id: value.id, createdAt };
}

export function parseListings(value: unknown): Listing[] | null {
  if (!Array.isArray(value)) return null;
  return value.map(parseListing).filter((l): l is Listing => l !== null);
}

/** Lenient: any missing or invalid field falls back to its default. */
export function parseSettings(value: unknown): Settings {
  if (!isRecord(value)) return DEFAULT_SETTINGS;
  const budgets = isRecord(value.budgets) ? value.budgets : {};
  const pick = (v: unknown, max: number, fallback: number) => numberIn(v, 0, max) ?? fallback;
  return {
    budgets: {
      riya: pick(budgets.riya, 10_000_000, DEFAULT_SETTINGS.budgets.riya),
      meera: pick(budgets.meera, 10_000_000, DEFAULT_SETTINGS.budgets.meera),
      kavita: pick(budgets.kavita, 10_000_000, DEFAULT_SETTINGS.budgets.kavita),
    },
    kavitaMaxCommute: pick(value.kavitaMaxCommute, 600, DEFAULT_SETTINGS.kavitaMaxCommute),
    riyaMaxGymCommute: pick(value.riyaMaxGymCommute, 600, DEFAULT_SETTINGS.riyaMaxGymCommute),
  };
}
