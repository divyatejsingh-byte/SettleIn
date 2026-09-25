import { CircleCheckBig, CircleX, Scale, type LucideIcon } from "lucide-react";
import type { Tier } from "@/lib/types";

export interface TierStyle {
  badge: string;
  icon: LucideIcon;
  card: string;
  box: string;
  boxTitle: string;
  filterLabel: string;
  filterActive: string;
}

export const TIER_STYLES: Record<Tier, TierStyle> = {
  green: {
    badge: "Unanimous Contender (3/3)",
    icon: CircleCheckBig,
    card: "border-emerald-300 shadow-emerald-100/70",
    box: "bg-emerald-50 text-emerald-900 ring-emerald-200",
    boxTitle: "text-emerald-700",
    filterLabel: "Unanimous (Green)",
    filterActive: "bg-emerald-600 text-white ring-emerald-600",
  },
  orange: {
    badge: "Viable with Trade-off (2/3)",
    icon: Scale,
    card: "border-amber-300 shadow-amber-100/70",
    box: "bg-amber-50 text-amber-950 ring-amber-200",
    boxTitle: "text-amber-700",
    filterLabel: "Trade-offs (Orange)",
    filterActive: "bg-amber-500 text-white ring-amber-500",
  },
  red: {
    badge: "Not Viable",
    icon: CircleX,
    card: "border-rose-300 shadow-rose-100/70",
    box: "bg-rose-50 text-rose-950 ring-rose-200",
    boxTitle: "text-rose-700",
    filterLabel: "Disqualified (Red)",
    filterActive: "bg-rose-500 text-white ring-rose-500",
  },
};

export const BADGE_CLASSES: Record<Tier, string> = {
  green: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  orange: "bg-amber-50 text-amber-700 ring-amber-200",
  red: "bg-rose-50 text-rose-700 ring-rose-200",
};
