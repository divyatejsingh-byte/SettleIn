"use client";

import { useSyncExternalStore } from "react";
import { DEMO_LISTINGS } from "./demo-listings";
import { DEFAULT_SETTINGS } from "./roommates";
import type { Listing, ListingInput, Settings } from "./types";
import { parseListings, parseSettings } from "./validate";

/*
 * State lives in two places:
 *  - /api/state (shared database) when the deployment has one connected: the source of truth,
 *    polled every few seconds so each flatmate sees the others' changes.
 *  - localStorage: an instant-paint cache in shared mode, and the only store when the API
 *    reports that no database is configured (e.g. local dev).
 * Edits apply locally at once (optimistic) and are then sent to the API.
 */

const STORAGE_KEY = "settlein:v1";
const API = "/api/state";
const POLL_MS = 8000;
const SETTINGS_DEBOUNCE_MS = 600;

/** connecting: first fetch pending · shared: synced with the database · local: no database, this device only · error: database unreachable */
export type SyncStatus = "connecting" | "shared" | "local" | "error";

export interface AppState {
  listings: Listing[];
  settings: Settings;
  sync: SyncStatus;
}

type Mutation =
  | { type: "add"; id: string; listing: ListingInput }
  | { type: "remove"; id: string }
  | { type: "settings"; settings: Settings }
  | { type: "restoreDemos" };

const INITIAL_STATE: AppState = {
  listings: [...DEMO_LISTINGS],
  settings: DEFAULT_SETTINGS,
  sync: "connecting",
};

let state: AppState | null = null;
let mode: "unknown" | "remote" | "local" = "unknown";
/** Writes that have not reached the server yet. Polls are ignored while any are pending. */
let pending = 0;
let pollTimer: ReturnType<typeof setInterval> | null = null;
let settingsTimer: ReturnType<typeof setTimeout> | null = null;
const listeners = new Set<() => void>();

function loadCache(): AppState {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return INITIAL_STATE;
    const parsed = JSON.parse(raw) as { listings?: unknown; settings?: unknown };
    return {
      listings: parseListings(parsed.listings) ?? INITIAL_STATE.listings,
      settings: parseSettings(parsed.settings),
      sync: mode === "local" ? "local" : "connecting",
    };
  } catch {
    return INITIAL_STATE;
  }
}

function getSnapshot(): AppState {
  if (state === null) state = loadCache();
  return state;
}

function getServerSnapshot(): AppState {
  return INITIAL_STATE;
}

function emit(next: AppState): void {
  state = next;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ listings: next.listings, settings: next.settings }));
  } catch {
    // Storage can be unavailable (private mode, quota). The in-memory state still works.
  }
  listeners.forEach((listener) => listener());
}

function setSync(sync: SyncStatus): void {
  if (getSnapshot().sync !== sync) emit({ ...getSnapshot(), sync });
}

function goLocal(): void {
  mode = "local";
  stopPolling();
  setSync("local");
}

/** Applies a server response. Returns false if the server has no database. */
async function applyResponse(res: Response): Promise<boolean> {
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = (await res.json()) as { configured?: unknown; listings?: unknown; settings?: unknown };
  if (data.configured === false) {
    goLocal();
    return false;
  }
  mode = "remote";
  // A newer local edit is still on its way; its own response will bring fresher data.
  if (pending > 0) return true;
  emit({
    listings: parseListings(data.listings) ?? [],
    settings: parseSettings(data.settings),
    sync: "shared",
  });
  return true;
}

async function refresh(): Promise<void> {
  if (mode === "local" || pending > 0) return;
  try {
    await applyResponse(await fetch(API, { cache: "no-store" }));
  } catch {
    setSync("error");
  }
}

async function send(mutation: Mutation): Promise<void> {
  if (mode === "local") return;
  pending += 1;
  try {
    const res = await fetch(API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(mutation),
    });
    pending -= 1;
    await applyResponse(res);
  } catch {
    pending = Math.max(0, pending - 1);
    setSync("error");
  }
}

function update(updater: (prev: AppState) => AppState, mutation: Mutation): void {
  emit(updater(getSnapshot()));
  void send(mutation);
}

const onVisible = () => {
  if (document.visibilityState === "visible") void refresh();
};

function startPolling(): void {
  if (pollTimer !== null || mode === "local") return;
  void refresh();
  pollTimer = setInterval(() => {
    if (document.visibilityState === "visible") void refresh();
  }, POLL_MS);
  document.addEventListener("visibilitychange", onVisible);
  window.addEventListener("focus", onVisible);
}

function stopPolling(): void {
  if (pollTimer !== null) clearInterval(pollTimer);
  pollTimer = null;
  document.removeEventListener("visibilitychange", onVisible);
  window.removeEventListener("focus", onVisible);
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  startPolling();
  const onStorage = (event: StorageEvent) => {
    // Other tabs on this device. In shared mode the poll covers this.
    if (event.key !== STORAGE_KEY || mode !== "local") return;
    state = loadCache();
    listener();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
    if (listeners.size === 0) stopPolling();
  };
}

function newId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") return crypto.randomUUID();
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

export function useAppState(): AppState {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

function saveSettings(settings: Settings): void {
  emit({ ...getSnapshot(), settings });
  if (mode === "local") return;
  // Budget fields send a change per keystroke; only the last one within the window is sent.
  if (settingsTimer === null) pending += 1;
  else clearTimeout(settingsTimer);
  settingsTimer = setTimeout(() => {
    settingsTimer = null;
    pending -= 1;
    void send({ type: "settings", settings: getSnapshot().settings });
  }, SETTINGS_DEBOUNCE_MS);
}

export const actions = {
  addListing(input: ListingInput) {
    const id = newId();
    const listing: Listing = { ...input, id, createdAt: Date.now() };
    update((prev) => ({ ...prev, listings: [listing, ...prev.listings] }), { type: "add", id, listing: input });
  },
  removeListing(id: string) {
    update((prev) => ({ ...prev, listings: prev.listings.filter((l) => l.id !== id) }), { type: "remove", id });
  },
  restoreDemoListings() {
    update(
      (prev) => {
        const custom = prev.listings.filter((l) => !l.id.startsWith("demo-"));
        return { ...prev, listings: [...custom, ...DEMO_LISTINGS] };
      },
      { type: "restoreDemos" },
    );
  },
  updateSettings(patch: (prev: Settings) => Settings) {
    saveSettings(patch(getSnapshot().settings));
  },
  loadDefaultSettings() {
    saveSettings(DEFAULT_SETTINGS);
  },
  retrySync() {
    void refresh();
  },
};
