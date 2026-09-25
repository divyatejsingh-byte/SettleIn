export type RoommateId = "riya" | "meera" | "kavita";

export type Tier = "green" | "orange" | "red";

export type TierFilter = "all" | Tier;

export type ConditionKind = "rent" | "lift" | "commute" | "parking";

export interface Listing {
  id: string;
  title: string;
  totalRent: number;
  deposit: number;
  floor: number;
  hasLift: boolean;
  hasParking: boolean;
  petFriendly: boolean;
  bathrooms: number;
  /** One-way commute to Hinjewadi, in minutes. */
  hinjewadiCommute: number;
  /** One-way commute to Riya's gym, in minutes. */
  gymCommute: number;
  addedBy: RoommateId;
  createdAt: number;
}

export type ListingInput = Omit<Listing, "id" | "createdAt">;

/** The numbers each roommate can tune. The rules themselves are fixed. */
export interface Settings {
  budgets: Record<RoommateId, number>;
  kavitaMaxCommute: number;
  riyaMaxGymCommute: number;
}

export interface UnmetCondition {
  roommate: RoommateId;
  kind: ConditionKind;
  message: string;
}

export interface PreferenceResult {
  label: string;
  met: boolean;
}

export interface PersonResult {
  roommate: RoommateId;
  happy: boolean;
  unmet: UnmetCondition[];
  preference: PreferenceResult;
}

export interface Evaluation {
  tier: Tier;
  happyCount: number;
  share: number;
  people: PersonResult[];
  unmet: UnmetCondition[];
}
