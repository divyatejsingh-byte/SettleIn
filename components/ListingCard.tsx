"use client";

import {
  Bath,
  Building2,
  Car,
  Check,
  Dumbbell,
  Heart,
  MapPin,
  PawPrint,
  Train,
  Trash2,
  X,
  type LucideIcon,
} from "lucide-react";
import { formatINR } from "@/lib/evaluate";
import { ROOMMATE_BY_ID } from "@/lib/roommates";
import type { Evaluation, Listing } from "@/lib/types";
import Avatar from "./Avatar";
import { BADGE_CLASSES, TIER_STYLES } from "./tiers";

interface ListingCardProps {
  listing: Listing;
  evaluation: Evaluation;
  onRemove: (listing: Listing) => void;
}

function floorLabel(floor: number): string {
  if (floor === 0) return "Ground floor";
  const suffix = floor % 100 >= 11 && floor % 100 <= 13 ? "th" : (["th", "st", "nd", "rd"][floor % 10] ?? "th");
  return `${floor}${suffix} floor`;
}

function Fact({ icon: Icon, label, good }: { icon: LucideIcon; label: string; good?: boolean }) {
  const tone = good === undefined ? "text-stone-600" : good ? "text-stone-700" : "text-stone-400 line-through decoration-stone-300";
  return (
    <li className={`flex items-center gap-2 text-sm ${tone}`}>
      <Icon className="size-4 shrink-0 text-stone-400" aria-hidden="true" />
      <span>{label}</span>
    </li>
  );
}

export function TierBadge({ evaluation }: { evaluation: Evaluation }) {
  const style = TIER_STYLES[evaluation.tier];
  const Icon = style.icon;
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ring-1 ${BADGE_CLASSES[evaluation.tier]}`}
    >
      <Icon className="size-3.5" aria-hidden="true" />
      {style.badge}
    </span>
  );
}

export function TradeOffBox({ evaluation }: { evaluation: Evaluation }) {
  const style = TIER_STYLES[evaluation.tier];

  if (evaluation.tier === "green") {
    const perks = evaluation.people.filter((p) => p.preference.met);
    return (
      <div className={`rounded-2xl p-4 text-sm ring-1 ${style.box}`}>
        <p className={`font-bold ${style.boxTitle}`}>Nobody makes a painful compromise</p>
        <p className="mt-1 leading-relaxed">
          Every dealbreaker and budget is cleared for all three of you. This is one to visit together.
        </p>
        {perks.length > 0 && (
          <p className="mt-2 flex flex-wrap items-center gap-1.5 text-xs">
            <Heart className="size-3.5 text-emerald-600" aria-hidden="true" />
            Bonus:{" "}
            {perks.map((p) => `${ROOMMATE_BY_ID[p.roommate].name} gets “${p.preference.label.toLowerCase()}”`).join(" · ")}
          </p>
        )}
      </div>
    );
  }

  const title =
    evaluation.tier === "orange"
      ? `One person would be compromising (${evaluation.happyCount}/3 happy)`
      : `Fails too many dealbreakers (${evaluation.happyCount}/3 happy)`;

  return (
    <div className={`rounded-2xl p-4 text-sm ring-1 ${style.box}`}>
      <p className={`font-bold ${style.boxTitle}`}>{title}</p>
      <ul className="mt-2 space-y-2">
        {evaluation.unmet.map((condition) => (
          <li key={`${condition.roommate}-${condition.kind}`} className="flex gap-2 leading-relaxed">
            <span
              className={`mt-1.5 size-2 shrink-0 rounded-full ${ROOMMATE_BY_ID[condition.roommate].theme.dot}`}
              aria-hidden="true"
            />
            <span>{condition.message}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function PersonPills({ evaluation }: { evaluation: Evaluation }) {
  return (
    <ul className="flex flex-wrap gap-2" aria-label="How each roommate fares">
      {evaluation.people.map((person) => {
        const roommate = ROOMMATE_BY_ID[person.roommate];
        const reason = person.happy
          ? `${roommate.name} is happy`
          : person.unmet.map((u) => u.message).join(" ");
        return (
          <li
            key={person.roommate}
            title={reason}
            className={`flex items-center gap-1.5 rounded-full py-1 pl-1 pr-2.5 text-xs font-semibold ring-1 ${
              person.happy ? "bg-emerald-50 text-emerald-800 ring-emerald-200" : "bg-rose-50 text-rose-800 ring-rose-200"
            }`}
          >
            <Avatar roommate={roommate} size={24} className="size-6" bare />
            {roommate.name}
            {person.happy ? (
              <Check className="size-3.5 text-emerald-600" aria-label="happy" />
            ) : (
              <X className="size-3.5 text-rose-500" aria-label="condition unmet" />
            )}
          </li>
        );
      })}
    </ul>
  );
}

export default function ListingCard({ listing, evaluation, onRemove }: ListingCardProps) {
  const style = TIER_STYLES[evaluation.tier];
  const spotter = ROOMMATE_BY_ID[listing.addedBy];

  return (
    <article className={`flex flex-col gap-4 rounded-3xl border-2 bg-white p-5 shadow-lg ${style.card}`}>
      <header className="flex items-start justify-between gap-3">
        <div className="min-w-0 space-y-2">
          <TierBadge evaluation={evaluation} />
          <h3 className="flex items-start gap-1.5 text-lg font-bold leading-snug text-stone-900">
            <MapPin className="mt-1 size-4 shrink-0 text-rose-400" aria-hidden="true" />
            <span className="break-words">{listing.title}</span>
          </h3>
          <p className="text-xs text-stone-500">Spotted by {spotter.name}</p>
        </div>
        <button
          type="button"
          onClick={() => onRemove(listing)}
          className="rounded-full p-2 text-stone-300 transition hover:bg-rose-50 hover:text-rose-500 focus-visible:outline-2 focus-visible:outline-rose-300"
          aria-label={`Remove ${listing.title}`}
        >
          <Trash2 className="size-4" />
        </button>
      </header>

      <div className="grid grid-cols-2 gap-3 rounded-2xl bg-stone-50 p-3">
        <div>
          <p className="text-xs text-stone-500">Total rent</p>
          <p className="text-lg font-extrabold text-stone-900">
            {formatINR(listing.totalRent)}
            <span className="text-xs font-medium text-stone-400">/mo</span>
          </p>
          <p className="text-xs text-stone-500">Deposit {formatINR(listing.deposit)}</p>
        </div>
        <div>
          <p className="text-xs text-stone-500">Each person pays</p>
          <p className="text-lg font-extrabold text-stone-900">
            {formatINR(evaluation.share)}
            <span className="text-xs font-medium text-stone-400">/mo</span>
          </p>
        </div>
      </div>

      <ul className="grid grid-cols-1 gap-x-4 gap-y-2 min-[380px]:grid-cols-2">
        <Fact
          icon={Building2}
          label={`${floorLabel(listing.floor)} · ${listing.hasLift ? "lift" : "no lift"}`}
        />
        <Fact icon={Car} label={listing.hasParking ? "Dedicated parking" : "No parking"} good={listing.hasParking} />
        <Fact icon={Train} label={`${listing.hinjewadiCommute} mins to Hinjewadi`} />
        <Fact icon={Dumbbell} label={`${listing.gymCommute} mins to gym`} />
        <Fact icon={Bath} label={`${listing.bathrooms} bathroom${listing.bathrooms === 1 ? "" : "s"}`} />
        <Fact icon={PawPrint} label={listing.petFriendly ? "Pet friendly" : "No pets"} good={listing.petFriendly} />
      </ul>

      <TradeOffBox evaluation={evaluation} />

      <div className="mt-auto">
        <PersonPills evaluation={evaluation} />
      </div>
    </article>
  );
}
