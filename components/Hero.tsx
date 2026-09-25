import { BookHeart, HeartHandshake, Plus } from "lucide-react";
import { ROOMMATES } from "@/lib/roommates";
import Avatar from "./Avatar";

interface HeroProps {
  totalListings: number;
  unanimousCount: number;
  onAddListing: () => void;
  onOpenStory: () => void;
}

const FLOAT_DELAYS = ["0s", "-1.6s", "-3.2s"];

export default function Hero({ totalListings, unanimousCount, onAddListing, onOpenStory }: HeroProps) {
  return (
    <section className="relative overflow-hidden rounded-[2rem] border border-rose-100 bg-gradient-to-br from-rose-50 via-violet-50 to-sky-50 px-5 py-8 shadow-sm sm:px-10 sm:py-12">
      <div aria-hidden="true" className="pointer-events-none absolute -right-16 -top-20 size-64 rounded-full bg-pink-200/40 blur-3xl" />
      <div aria-hidden="true" className="pointer-events-none absolute -bottom-24 -left-10 size-72 rounded-full bg-sky-200/40 blur-3xl" />

      <div className="relative flex flex-col items-center gap-8 text-center lg:flex-row lg:items-center lg:justify-between lg:text-left">
        <div className="max-w-xl">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/80 px-3 py-1 text-xs font-semibold text-rose-600 ring-1 ring-rose-100">
            <HeartHandshake className="size-3.5" aria-hidden="true" />
            Riya · Meera · Kavita — Pune 3BHK hunt
          </span>
          <h1 className="mt-4 text-4xl font-extrabold tracking-tight text-stone-900 sm:text-5xl">
            Settle<span className="text-rose-500">In</span>
          </h1>
          <p className="mt-3 text-base leading-relaxed text-stone-600 sm:text-lg">
            Ending 4 months of WhatsApp debates. Check every compromise before anyone falls in love with a flat.
          </p>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center lg:justify-start">
            <button
              type="button"
              onClick={onAddListing}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-stone-900 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-stone-900/10 transition hover:bg-stone-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-400"
            >
              <Plus className="size-4" aria-hidden="true" />
              Add a listing
            </button>
            <button
              type="button"
              onClick={onOpenStory}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-white/90 px-5 py-3 text-sm font-semibold text-stone-700 ring-1 ring-stone-200 transition hover:bg-white hover:ring-rose-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-400"
            >
              <BookHeart className="size-4 text-rose-500" aria-hidden="true" />
              Our Story &amp; Framework
            </button>
          </div>
        </div>

        <div className="flex flex-col items-center gap-5">
          <div className="flex items-end justify-center -space-x-3 sm:-space-x-2">
            {ROOMMATES.map((roommate, index) => (
              <figure
                key={roommate.id}
                className="flex flex-col items-center motion-safe:animate-float"
                style={{ animationDelay: FLOAT_DELAYS[index] }}
              >
                <div className="rounded-full bg-white p-1.5 shadow-lg shadow-rose-200/50">
                  <Avatar roommate={roommate} size={96} className="size-20 sm:size-24" />
                </div>
                <figcaption
                  className={`mt-2 rounded-full bg-white/90 px-3 py-0.5 text-xs font-bold ${roommate.theme.text} ring-1 ${roommate.theme.ring}`}
                >
                  {roommate.name}
                </figcaption>
              </figure>
            ))}
          </div>
          <p className="rounded-2xl bg-white/70 px-4 py-2 text-sm text-stone-600 ring-1 ring-white">
            <strong className="text-stone-900">{unanimousCount}</strong> of{" "}
            <strong className="text-stone-900">{totalListings}</strong>{" "}
            {totalListings === 1 ? "flat works" : "flats work"} for all three of you
          </p>
        </div>
      </div>
    </section>
  );
}
