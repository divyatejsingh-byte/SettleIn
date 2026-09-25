"use client";

import { useSyncExternalStore } from "react";
import { DEMO_LISTINGS } from "./demo-listings";
import { DEFAULT_SETTINGS } from "./roommates";
import type { Listing, ListingInput, RoommateId, Settings } from "./types";

const STORAGE_KEY = "settlein:v1";

export interface AppState {
  listings: Listing[];
  settings: Settings;
}

const INITIAL_STATE: AppState = {
  listings: [...DEMO_LISTINGS],
  settings: DEFAULT_SETTINGS,
};

let state: AppState | null = null;
const listeners = new Set<() => void>();

function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function isListing(value: unknown): value is Listing {
  if (!value || typeof value !== "object") return false;
  const l = value as Record<string, unknown>;
  return (
    typeof l.id === "string" &&
    typeof l.title === "string" &&
    isFiniteNumber(l.totalRent) &&
    isFiniteNumber(l.deposit) &&
    isFiniteNumber(l.floor) &&
    typeof l.hasLift === "boolean" &&
    typeof l.hasParking === "boolean" &&
    typeof l.petFriendly === "boolean" &&
    isFiniteNumber(l.bathrooms) &&
    isFiniteNumber(l.hinjewadiCommute) &&
    isFiniteNumber(l.gymCommute) &&
    (l.addedBy === "riya" || l.addedBy === "meera" || l.addedBy === "kavita") &&
    isFiniteNumber(l.createdAt)
  );
}

function parseSettings(value: unknown): Settings {
  if (!value || typeof value !== "object") return DEFAULT_SETTINGS;
  const s = value as Partial<Settings>;
  const b = (s.budgets ?? {}) as Partial<Record<RoommateId, unknown>>;
  const pick = (v: unknown, fallback: number) => (isFiniteNumber(v) ? v : fallback);
  return {
    budgets: {
      riya: pick(b.riya, DEFAULT_SETTINGS.budgets.riya),
      meera: pick(b.meera, DEFAULT_SETTINGS.budgets.meera),
      kavita: pick(b.kavita, DEFAULT_SETTINGS.budgets.kavita),
    },
    kavitaMaxCommute: pick(s.kavitaMaxCommute, DEFAULT_SETTINGS.kavitaMaxCommute),
    riyaMaxGymCommute: pick(s.riyaMaxGymCommute, DEFAULT_SETTINGS.riyaMaxGymCommute),
  };
}

function load(): AppState {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return INITIAL_STATE;
    const parsed = JSON.parse(raw) as { listings?: unknown; settings?: unknown };
    const listings = Array.isArray(parsed.listings) ? parsed.listings.filter(isListing) : INITIAL_STATE.listings;
    return { listings, settings: parseSettings(parsed.settings) };
  } catch {
    return INITIAL_STATE;
  }
}

function getSnapshot(): AppState {
  if (state === null) state = load();
  return state;
}

function getServerSnapshot(): AppState {
  return INITIAL_STATE;
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  const onStorage = (event: StorageEvent) => {
    if (event.key !== STORAGE_KEY) return;
    state = load();
    listener();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

function update(updater: (prev: AppState) => AppState): void {
  state = updater(getSnapshot());
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Storage can be unavailable (private mode, quota). The in-memory state still works.
  }
  listeners.forEach((listener) => listener());
}

function newId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") return crypto.randomUUID();
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

export function useAppState(): AppState {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

export const actions = {
  addListing(input: ListingInput) {
    const listing: Listing = { ...input, id: newId(), createdAt: Date.now() };
    update((prev) => ({ ...prev, listings: [listing, ...prev.listings] }));
  },
  removeListing(id: string) {
    update((prev) => ({ ...prev, listings: prev.listings.filter((l) => l.id !== id) }));
  },
  restoreDemoListings() {
    update((prev) => {
      const custom = prev.listings.filter((l) => !l.id.startsWith("demo-"));
      return { ...prev, listings: [...custom, ...DEMO_LISTINGS] };
    });
  },
  updateSettings(patch: (prev: Settings) => Settings) {
    update((prev) => ({ ...prev, settings: patch(prev.settings) }));
  },
  loadDefaultSettings() {
    update((prev) => ({ ...prev, settings: DEFAULT_SETTINGS }));
  },
};
