"use client";

import { Cloud, CloudOff, HardDrive, LoaderCircle, RefreshCw } from "lucide-react";
import type { SyncStatus } from "@/lib/store";

interface SyncBadgeProps {
  status: SyncStatus;
  onRetry: () => void;
}

const STATUS = {
  connecting: {
    icon: LoaderCircle,
    label: "Connecting…",
    title: "Loading the shared shortlist",
    className: "bg-stone-50 text-stone-500 ring-stone-200",
    iconClass: "motion-safe:animate-spin",
  },
  shared: {
    icon: Cloud,
    label: "Shared · live",
    title: "Saved online. Riya, Meera and Kavita all see this same shortlist, and it refreshes every few seconds.",
    className: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    iconClass: "",
  },
  local: {
    icon: HardDrive,
    label: "This device only",
    title: "No shared database is connected, so changes are saved in this browser only.",
    className: "bg-stone-50 text-stone-600 ring-stone-200",
    iconClass: "",
  },
  error: {
    icon: CloudOff,
    label: "Can't reach the shared list",
    title: "Your recent changes may not be saved for everyone. Check your connection and retry.",
    className: "bg-rose-50 text-rose-700 ring-rose-200",
    iconClass: "",
  },
} as const;

export default function SyncBadge({ status, onRetry }: SyncBadgeProps) {
  const s = STATUS[status];
  const Icon = s.icon;
  return (
    <span
      role="status"
      title={s.title}
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${s.className}`}
    >
      <Icon className={`size-3.5 ${s.iconClass}`} aria-hidden="true" />
      {s.label}
      {status === "error" && (
        <button
          type="button"
          onClick={onRetry}
          className="-mr-1 ml-0.5 rounded-full p-0.5 transition hover:bg-rose-100"
          aria-label="Retry syncing"
        >
          <RefreshCw className="size-3.5" aria-hidden="true" />
        </button>
      )}
    </span>
  );
}
