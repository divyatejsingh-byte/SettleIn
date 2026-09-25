"use client";

import { BookHeart, Bot, ClipboardPaste, Hourglass, Scale, ShieldCheck, type LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import Modal from "./Modal";

interface StoryModalProps {
  open: boolean;
  onClose: () => void;
}

function Point({ icon: Icon, title, children, tone }: { icon: LucideIcon; title: string; children: ReactNode; tone: string }) {
  return (
    <div className="flex gap-3">
      <div className={`flex size-9 shrink-0 items-center justify-center rounded-xl ${tone}`}>
        <Icon className="size-4" aria-hidden="true" />
      </div>
      <div>
        <h4 className="font-semibold text-stone-900">{title}</h4>
        <p className="mt-0.5 text-sm leading-relaxed text-stone-600">{children}</p>
      </div>
    </div>
  );
}

export default function StoryModal({ open, onClose }: StoryModalProps) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      size="lg"
      icon={<BookHeart className="size-5" />}
      title="Our Story & Framework"
      description="Why SettleIn works the way it does."
      footer={
        <button
          type="button"
          onClick={onClose}
          className="w-full rounded-full bg-stone-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-stone-800 sm:w-auto"
        >
          Got it, let’s find a flat
        </button>
      }
    >
      <div className="space-y-6">
        <section className="space-y-2">
          <h3 className="text-xs font-bold uppercase tracking-wide text-rose-500">The story</h3>
          <p className="text-sm leading-relaxed text-stone-700">
            Riya, Meera, and Kavita spent four months in a WhatsApp group trying to find a 3BHK in Pune and ended up
            with zero shortlists. The pattern was always the same. Someone shares a gorgeous flat, someone else gets
            excited, and only then does a dealbreaker surface: no lift for Meera’s knee, an hour to Hinjewadi for
            Kavita, nowhere for Riya to park. Every “no” felt personal, even though none of it was.
          </p>
          <p className="text-sm leading-relaxed text-stone-700">
            SettleIn puts every dealbreaker on the table <em>before</em> anyone falls in love, so the conversation is
            about a flat’s trade-offs, not about who is being difficult.
          </p>
        </section>

        <section className="space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wide text-rose-500">Why we dropped automated scraping</h3>
          <Point icon={Bot} title="Anti-bot blockers made it unreliable" tone="bg-violet-50 text-violet-600">
            Listing portals use CAPTCHAs, rate limits, and bot fingerprinting. Scrapers broke every few days and
            silently returned half-empty results, which is worse than no results at all.
          </Point>
          <Point icon={Hourglass} title="Good listings expire fast" tone="bg-amber-50 text-amber-600">
            A good Pune 3BHK is often gone within days. A scraped feed filled up with stale flats that no longer
            existed, and that just caused more arguments.
          </Point>
          <Point icon={ClipboardPaste} title="Humans are the best filter" tone="bg-sky-50 text-sky-600">
            Each of the three already spots listings every day. Pasting the few details that matter takes about 30
            seconds, and the data is always fresh.
          </Point>
        </section>

        <section className="space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wide text-rose-500">The trade-off framework</h3>
          <Point icon={ShieldCheck} title="Dealbreakers vs. preferences" tone="bg-rose-50 text-rose-600">
            Each person has a rent ceiling and one hard dealbreaker. Preferences like pets, bathrooms, and gym
            distance are shown as bonuses but never disqualify a flat.
          </Point>
          <Point icon={Scale} title="Three honest tiers" tone="bg-emerald-50 text-emerald-600">
            <strong className="text-emerald-700">Green (3/3):</strong> nobody compromises.{" "}
            <strong className="text-amber-700">Orange (2/3):</strong> one friend is being asked to sacrifice, and
            we say exactly who and why, so she can say yes or no without pressure.{" "}
            <strong className="text-rose-700">Red (0–1/3):</strong> not worth a site visit.
          </Point>
        </section>

        <p className="rounded-2xl bg-rose-50 p-4 text-sm leading-relaxed text-rose-900 ring-1 ring-rose-100">
          The golden rule: <strong>check the trade-off box before you send the link to the group.</strong> Flats come
          and go. Friendships shouldn’t.
        </p>
      </div>
    </Modal>
  );
}
