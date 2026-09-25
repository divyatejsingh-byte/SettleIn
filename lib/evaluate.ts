import { MEERA_LIFT_FROM_FLOOR, ROOMMATES, type Roommate } from "./roommates";
import type {
  Evaluation,
  Listing,
  ListingInput,
  PersonResult,
  PreferenceResult,
  Settings,
  Tier,
  UnmetCondition,
} from "./types";

export function formatINR(amount: number): string {
  return `₹${Math.round(amount).toLocaleString("en-IN")}`;
}

export function rentShare(totalRent: number): number {
  return totalRent / ROOMMATES.length;
}

function plural(n: number, word: string): string {
  return `${n} ${word}${n === 1 ? "" : "s"}`;
}

function dealbreakersFor(roommate: Roommate, listing: ListingInput, settings: Settings): UnmetCondition[] {
  const unmet: UnmetCondition[] = [];
  const { id, name } = roommate;

  if (id === "meera" && listing.floor >= MEERA_LIFT_FROM_FLOOR && !listing.hasLift) {
    unmet.push({
      roommate: id,
      kind: "lift",
      message: `${name}'s condition unmet: ${name} would have to walk up ${plural(listing.floor, "flight")} of stairs every day because there is no operational lift.`,
    });
  }

  if (id === "kavita" && listing.hinjewadiCommute > settings.kavitaMaxCommute) {
    const over = listing.hinjewadiCommute - settings.kavitaMaxCommute;
    unmet.push({
      roommate: id,
      kind: "commute",
      message: `${name}'s condition unmet: Commute to Hinjewadi is ${listing.hinjewadiCommute} mins (${over} mins over her threshold).`,
    });
  }

  if (id === "riya" && !listing.hasParking) {
    unmet.push({
      roommate: id,
      kind: "parking",
      message: `${name}'s condition unmet: No dedicated parking spot available.`,
    });
  }

  const share = rentShare(listing.totalRent);
  const budget = settings.budgets[id];
  if (share > budget) {
    unmet.push({
      roommate: id,
      kind: "rent",
      message: `${name}'s condition unmet: Monthly share of ${formatINR(share)} exceeds budget by ${formatINR(Math.ceil(share - budget))}.`,
    });
  }

  return unmet;
}

function preferenceFor(roommate: Roommate, listing: ListingInput, settings: Settings): PreferenceResult {
  switch (roommate.id) {
    case "meera":
      return { label: "Pet-friendly", met: listing.petFriendly };
    case "kavita":
      return { label: "2+ bathrooms", met: listing.bathrooms >= 2 };
    case "riya":
      return {
        label: `Gym within ${settings.riyaMaxGymCommute} mins`,
        met: listing.gymCommute <= settings.riyaMaxGymCommute,
      };
  }
}

function tierFor(happyCount: number): Tier {
  if (happyCount === ROOMMATES.length) return "green";
  if (happyCount === ROOMMATES.length - 1) return "orange";
  return "red";
}

export function evaluateListing(listing: ListingInput | Listing, settings: Settings): Evaluation {
  const people: PersonResult[] = ROOMMATES.map((roommate) => {
    const unmet = dealbreakersFor(roommate, listing, settings);
    return {
      roommate: roommate.id,
      happy: unmet.length === 0,
      unmet,
      preference: preferenceFor(roommate, listing, settings),
    };
  });

  const happyCount = people.filter((p) => p.happy).length;

  return {
    tier: tierFor(happyCount),
    happyCount,
    share: rentShare(listing.totalRent),
    people,
    unmet: people.flatMap((p) => p.unmet),
  };
}
