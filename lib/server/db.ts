import { Redis } from "@upstash/redis";
import { DEMO_LISTINGS } from "../demo-listings";
import { DEFAULT_SETTINGS } from "../roommates";
import type { Listing, Settings } from "../types";
import { parseListing, parseSettings } from "../validate";

// Vercel's Upstash integration injects either the UPSTASH_* or the legacy KV_* names.
const url = process.env.UPSTASH_REDIS_REST_URL ?? process.env.KV_REST_API_URL;
const token = process.env.UPSTASH_REDIS_REST_TOKEN ?? process.env.KV_REST_API_TOKEN;

const redis = url && token ? new Redis({ url, token, automaticDeserialization: false }) : null;

const KEYS = {
  listings: "settlein:listings", // hash: listing id -> listing JSON
  settings: "settlein:settings", // string: settings JSON
  seeded: "settlein:seeded",
} as const;

export interface SharedState {
  listings: Listing[];
  settings: Settings;
}

export class StorageNotConfiguredError extends Error {
  constructor() {
    super("Shared storage is not configured");
  }
}

function db(): Redis {
  if (!redis) throw new StorageNotConfiguredError();
  return redis;
}

function safeJson(raw: unknown): unknown {
  if (typeof raw !== "string") return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function listingEntries(listings: readonly Listing[]): Record<string, string> {
  return Object.fromEntries(listings.map((l) => [l.id, JSON.stringify(l)]));
}

/** Puts the demo flats and default settings in place the very first time the database is used. */
async function ensureSeeded(): Promise<void> {
  const first = await db().set(KEYS.seeded, "1", { nx: true });
  if (first !== "OK") return;
  await Promise.all([
    db().hset(KEYS.listings, listingEntries(DEMO_LISTINGS)),
    db().set(KEYS.settings, JSON.stringify(DEFAULT_SETTINGS)),
  ]);
}

export async function readState(): Promise<SharedState> {
  await ensureSeeded();
  const [rawListings, rawSettings] = await Promise.all([
    db().hgetall<Record<string, string>>(KEYS.listings),
    db().get<string>(KEYS.settings),
  ]);
  const listings = Object.values(rawListings ?? {})
    .map((raw) => parseListing(safeJson(raw)))
    .filter((l): l is Listing => l !== null);
  return { listings, settings: parseSettings(safeJson(rawSettings)) };
}

export async function countListings(): Promise<number> {
  return db().hlen(KEYS.listings);
}

export async function putListing(listing: Listing): Promise<void> {
  await db().hset(KEYS.listings, { [listing.id]: JSON.stringify(listing) });
}

export async function deleteListing(id: string): Promise<void> {
  await db().hdel(KEYS.listings, id);
}

export async function restoreDemoListings(): Promise<void> {
  await db().hset(KEYS.listings, listingEntries(DEMO_LISTINGS));
}

export async function writeSettings(settings: Settings): Promise<void> {
  await db().set(KEYS.settings, JSON.stringify(settings));
}
