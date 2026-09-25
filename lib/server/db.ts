import { createClient, type PostgrestError, type SupabaseClient } from "@supabase/supabase-js";
import { DEMO_LISTINGS } from "../demo-listings";
import type { Listing, Settings } from "../types";
import { parseListing, parseSettings } from "../validate";

// Accept the names used by Supabase's Vercel integration as well as manually added ones.
// The secret (service-role) key bypasses row-level security, so it must only ever be read here, on the server.
const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
const secretKey = process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase: SupabaseClient | null =
  url && secretKey ? createClient(url, secretKey, { auth: { persistSession: false, autoRefreshToken: false } }) : null;

export interface SharedState {
  listings: Listing[];
  settings: Settings;
}

export class StorageNotConfiguredError extends Error {
  constructor() {
    super("Shared storage is not configured");
  }
}

function db(): SupabaseClient {
  if (!supabase) throw new StorageNotConfiguredError();
  return supabase;
}

interface ListingRow {
  id: string;
  title: string;
  total_rent: number;
  deposit: number;
  floor: number;
  has_lift: boolean;
  has_parking: boolean;
  pet_friendly: boolean;
  bathrooms: number;
  hinjewadi_commute: number;
  gym_commute: number;
  added_by: string;
  created_at: number | string; // Postgres bigint may arrive as a string
}

function toRow(l: Listing): ListingRow {
  return {
    id: l.id,
    title: l.title,
    total_rent: l.totalRent,
    deposit: l.deposit,
    floor: l.floor,
    has_lift: l.hasLift,
    has_parking: l.hasParking,
    pet_friendly: l.petFriendly,
    bathrooms: l.bathrooms,
    hinjewadi_commute: l.hinjewadiCommute,
    gym_commute: l.gymCommute,
    added_by: l.addedBy,
    created_at: l.createdAt,
  };
}

function fromRow(r: ListingRow): Listing | null {
  return parseListing({
    id: r.id,
    title: r.title,
    totalRent: r.total_rent,
    deposit: r.deposit,
    floor: r.floor,
    hasLift: r.has_lift,
    hasParking: r.has_parking,
    petFriendly: r.pet_friendly,
    bathrooms: r.bathrooms,
    hinjewadiCommute: r.hinjewadi_commute,
    gymCommute: r.gym_commute,
    addedBy: r.added_by,
    createdAt: Number(r.created_at),
  });
}

function check(error: PostgrestError | null): void {
  if (!error) return;
  // PGRST205 / 42P01: the tables don't exist yet.
  if (error.code === "PGRST205" || error.code === "42P01") {
    throw new Error("SettleIn tables are missing. Run supabase/schema.sql in the Supabase SQL Editor.");
  }
  throw new Error(`Supabase error ${error.code}: ${error.message}`);
}

export async function readState(): Promise<SharedState> {
  const [listingsRes, settingsRes] = await Promise.all([
    db().from("listings").select("*"),
    db().from("app_settings").select("data").eq("id", "default").maybeSingle(),
  ]);
  check(listingsRes.error);
  check(settingsRes.error);
  const listings = ((listingsRes.data ?? []) as ListingRow[])
    .map(fromRow)
    .filter((l): l is Listing => l !== null);
  return { listings, settings: parseSettings(settingsRes.data?.data) };
}

export async function countListings(): Promise<number> {
  const { count, error } = await db().from("listings").select("id", { count: "exact", head: true });
  check(error);
  return count ?? 0;
}

export async function putListing(listing: Listing): Promise<void> {
  const { error } = await db().from("listings").upsert(toRow(listing));
  check(error);
}

export async function deleteListing(id: string): Promise<void> {
  const { error } = await db().from("listings").delete().eq("id", id);
  check(error);
}

export async function restoreDemoListings(): Promise<void> {
  const { error } = await db().from("listings").upsert(DEMO_LISTINGS.map(toRow));
  check(error);
}

export async function writeSettings(settings: Settings): Promise<void> {
  const { error } = await db()
    .from("app_settings")
    .upsert({ id: "default", data: settings, updated_at: new Date().toISOString() });
  check(error);
}
