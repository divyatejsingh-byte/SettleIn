import type { RoommateId, Settings } from "./types";

export interface RoommateTheme {
  soft: string;
  ring: string;
  text: string;
  dot: string;
}

export interface Roommate {
  id: RoommateId;
  name: string;
  avatar: string;
  theme: RoommateTheme;
}

export const ROOMMATES: readonly Roommate[] = [
  {
    id: "riya",
    name: "Riya",
    avatar: "https://api.dicebear.com/7.x/lorelei/svg?seed=Riya",
    theme: { soft: "bg-violet-50", ring: "ring-violet-200", text: "text-violet-700", dot: "bg-violet-400" },
  },
  {
    id: "meera",
    name: "Meera",
    avatar: "https://api.dicebear.com/7.x/lorelei/svg?seed=Meera",
    theme: { soft: "bg-pink-50", ring: "ring-pink-200", text: "text-pink-700", dot: "bg-pink-400" },
  },
  {
    id: "kavita",
    name: "Kavita",
    avatar: "https://api.dicebear.com/7.x/lorelei/svg?seed=Kavita",
    theme: { soft: "bg-sky-50", ring: "ring-sky-200", text: "text-sky-700", dot: "bg-sky-400" },
  },
];

export const ROOMMATE_BY_ID: Record<RoommateId, Roommate> = {
  riya: ROOMMATES[0],
  meera: ROOMMATES[1],
  kavita: ROOMMATES[2],
};

/** Meera needs a working lift on this floor and above (knee condition). */
export const MEERA_LIFT_FROM_FLOOR = 2;

export const DEFAULT_SETTINGS: Settings = {
  budgets: { meera: 14000, kavita: 16000, riya: 15000 },
  kavitaMaxCommute: 35,
  riyaMaxGymCommute: 20,
};
