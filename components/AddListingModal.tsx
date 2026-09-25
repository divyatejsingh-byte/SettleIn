"use client";

import { Home, Sparkles } from "lucide-react";
import { useId, useMemo, useState, type FormEvent, type ReactNode } from "react";
import { evaluateListing, formatINR } from "@/lib/evaluate";
import { MEERA_LIFT_FROM_FLOOR, ROOMMATES } from "@/lib/roommates";
import type { ListingInput, RoommateId, Settings } from "@/lib/types";
import { PersonPills, TierBadge, TradeOffBox } from "./ListingCard";
import Modal from "./Modal";

interface AddListingModalProps {
  open: boolean;
  settings: Settings;
  onClose: () => void;
  onSubmit: (listing: ListingInput) => void;
}

interface FormState {
  title: string;
  totalRent: string;
  deposit: string;
  floor: string;
  hasLift: boolean;
  hasParking: boolean;
  petFriendly: boolean;
  bathrooms: string;
  hinjewadiCommute: string;
  gymCommute: string;
  addedBy: RoommateId;
}

type NumericField = "totalRent" | "deposit" | "floor" | "bathrooms" | "hinjewadiCommute" | "gymCommute";
type Errors = Partial<Record<keyof FormState, string>>;

const EMPTY_FORM: FormState = {
  title: "",
  totalRent: "",
  deposit: "",
  floor: "",
  hasLift: false,
  hasParking: false,
  petFriendly: false,
  bathrooms: "2",
  hinjewadiCommute: "",
  gymCommute: "",
  addedBy: "riya",
};

const NUMERIC_RULES: Record<NumericField, { label: string; min: number; integer: boolean }> = {
  totalRent: { label: "Total rent", min: 1, integer: true },
  deposit: { label: "Deposit", min: 0, integer: true },
  floor: { label: "Floor", min: 0, integer: true },
  bathrooms: { label: "Bathrooms", min: 1, integer: true },
  hinjewadiCommute: { label: "Hinjewadi commute", min: 0, integer: true },
  gymCommute: { label: "Gym commute", min: 0, integer: true },
};

function parse(form: FormState): { value: ListingInput | null; errors: Errors } {
  const errors: Errors = {};
  const numbers = {} as Record<NumericField, number>;

  if (form.title.trim().length < 3) errors.title = "Give the flat a name so everyone recognises it.";

  for (const key of Object.keys(NUMERIC_RULES) as NumericField[]) {
    const rule = NUMERIC_RULES[key];
    const raw = form[key].trim();
    const n = Number(raw);
    if (raw === "" || !Number.isFinite(n)) errors[key] = `${rule.label} is required.`;
    else if (n < rule.min) errors[key] = `${rule.label} must be at least ${rule.min}.`;
    else if (rule.integer && !Number.isInteger(n)) errors[key] = `${rule.label} must be a whole number.`;
    else numbers[key] = n;
  }

  if (Object.keys(errors).length > 0) return { value: null, errors };

  return {
    value: {
      title: form.title.trim(),
      hasLift: form.hasLift,
      hasParking: form.hasParking,
      petFriendly: form.petFriendly,
      addedBy: form.addedBy,
      ...numbers,
    },
    errors,
  };
}

function Field({
  label,
  htmlFor,
  error,
  hint,
  children,
}: {
  label: string;
  htmlFor: string;
  error?: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <div className="space-y-1">
      <label htmlFor={htmlFor} className="block text-sm font-semibold text-stone-700">
        {label}
      </label>
      {children}
      {error ? (
        <p id={`${htmlFor}-error`} className="text-xs font-medium text-rose-600">
          {error}
        </p>
      ) : hint ? (
        <p className="text-xs text-stone-400">{hint}</p>
      ) : null}
    </div>
  );
}

function Toggle({
  id,
  label,
  checked,
  onChange,
}: {
  id: string;
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label
      htmlFor={id}
      className={`flex cursor-pointer items-center gap-3 rounded-xl border px-3 py-2.5 text-sm font-medium transition ${
        checked ? "border-emerald-300 bg-emerald-50 text-emerald-900" : "border-stone-200 bg-white text-stone-600"
      } has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-rose-200`}
    >
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="size-4 accent-emerald-600"
      />
      {label}
    </label>
  );
}

const inputClass =
  "w-full rounded-xl border border-stone-200 bg-white px-3 py-2 text-sm text-stone-800 outline-none transition placeholder:text-stone-300 focus:border-rose-300 focus:ring-2 focus:ring-rose-100 aria-[invalid=true]:border-rose-300";

function ListingForm({ settings, onClose, onSubmit }: Omit<AddListingModalProps, "open">) {
  const formId = useId();
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [showErrors, setShowErrors] = useState(false);

  const { value, errors } = useMemo(() => parse(form), [form]);
  const preview = useMemo(() => (value ? evaluateListing(value, settings) : null), [value, settings]);
  const visibleErrors: Errors = showErrors ? errors : {};

  const set = <K extends keyof FormState>(key: K, v: FormState[K]) => setForm((prev) => ({ ...prev, [key]: v }));
  const id = (name: string) => `${formId}-${name}`;

  const numberInput = (key: NumericField, placeholder: string, props: { step?: number; prefix?: string } = {}) => (
    <div className="relative">
      {props.prefix && (
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-stone-400">
          {props.prefix}
        </span>
      )}
      <input
        id={id(key)}
        type="number"
        inputMode="numeric"
        min={NUMERIC_RULES[key].min}
        step={props.step ?? 1}
        placeholder={placeholder}
        value={form[key]}
        onChange={(event) => set(key, event.target.value)}
        aria-invalid={visibleErrors[key] ? true : undefined}
        aria-describedby={visibleErrors[key] ? `${id(key)}-error` : undefined}
        className={`${inputClass} ${props.prefix ? "pl-7" : ""}`}
      />
    </div>
  );

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!value) {
      setShowErrors(true);
      return;
    }
    onSubmit(value);
  };

  const floorNumber = Number(form.floor);
  const liftMatters = form.floor.trim() !== "" && floorNumber >= MEERA_LIFT_FROM_FLOOR;
  const share = Number(form.totalRent) > 0 ? formatINR(Number(form.totalRent) / ROOMMATES.length) : null;

  return (
    <form id={formId} onSubmit={handleSubmit} noValidate className="space-y-5">
      <Field label="Locality / Title" htmlFor={id("title")} error={visibleErrors.title}>
        <input
          id={id("title")}
          data-autofocus
          type="text"
          placeholder="e.g. Aundh 3BHK Garden Estate"
          value={form.title}
          onChange={(event) => set("title", event.target.value)}
          aria-invalid={visibleErrors.title ? true : undefined}
          aria-describedby={visibleErrors.title ? `${id("title")}-error` : undefined}
          className={inputClass}
          maxLength={80}
        />
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field
          label="Total monthly rent"
          htmlFor={id("totalRent")}
          error={visibleErrors.totalRent}
          hint={share ? `${share} each, split three ways` : undefined}
        >
          {numberInput("totalRent", "42000", { step: 500, prefix: "₹" })}
        </Field>
        <Field label="Deposit" htmlFor={id("deposit")} error={visibleErrors.deposit}>
          {numberInput("deposit", "126000", { step: 1000, prefix: "₹" })}
        </Field>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field
          label="Floor number"
          htmlFor={id("floor")}
          error={visibleErrors.floor}
          hint={
            form.floor.trim() === ""
              ? "0 = ground floor"
              : liftMatters
                ? "Meera needs a working lift at this height"
                : "Low enough for Meera without a lift"
          }
        >
          {numberInput("floor", "3")}
        </Field>
        <Field label="Number of bathrooms" htmlFor={id("bathrooms")} error={visibleErrors.bathrooms}>
          {numberInput("bathrooms", "2")}
        </Field>
      </div>

      <fieldset className="grid gap-2 sm:grid-cols-3">
        <legend className="mb-2 text-sm font-semibold text-stone-700">Amenities</legend>
        <Toggle id={id("lift")} label="Working elevator?" checked={form.hasLift} onChange={(v) => set("hasLift", v)} />
        <Toggle
          id={id("parking")}
          label="Dedicated parking?"
          checked={form.hasParking}
          onChange={(v) => set("hasParking", v)}
        />
        <Toggle
          id={id("pets")}
          label="Pet friendly?"
          checked={form.petFriendly}
          onChange={(v) => set("petFriendly", v)}
        />
      </fieldset>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Commute to Hinjewadi" htmlFor={id("hinjewadiCommute")} error={visibleErrors.hinjewadiCommute}>
          {numberInput("hinjewadiCommute", "30 (minutes)")}
        </Field>
        <Field label="Commute to Riya's gym" htmlFor={id("gymCommute")} error={visibleErrors.gymCommute}>
          {numberInput("gymCommute", "15 (minutes)")}
        </Field>
      </div>

      <Field label="Spotted by" htmlFor={id("addedBy")}>
        <select
          id={id("addedBy")}
          value={form.addedBy}
          onChange={(event) => set("addedBy", event.target.value as RoommateId)}
          className={inputClass}
        >
          {ROOMMATES.map((r) => (
            <option key={r.id} value={r.id}>
              {r.name}
            </option>
          ))}
        </select>
      </Field>

      <section aria-live="polite" className="space-y-3 rounded-2xl border border-dashed border-stone-200 p-4">
        <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-stone-400">
          <Sparkles className="size-3.5" aria-hidden="true" /> Live check
        </p>
        {preview ? (
          <>
            <TierBadge evaluation={preview} />
            <TradeOffBox evaluation={preview} />
            <PersonPills evaluation={preview} />
          </>
        ) : (
          <p className="text-sm text-stone-500">Fill in the details and you’ll see the verdict before you save it.</p>
        )}
      </section>

      <div className="flex flex-col-reverse gap-2 pt-1 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={onClose}
          className="rounded-full px-5 py-2.5 text-sm font-semibold text-stone-600 ring-1 ring-stone-200 transition hover:bg-stone-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="rounded-full bg-stone-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-stone-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-400"
        >
          Add to shortlist
        </button>
      </div>
    </form>
  );
}

export default function AddListingModal({ open, settings, onClose, onSubmit }: AddListingModalProps) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      size="lg"
      icon={<Home className="size-5" />}
      title="Add a listing you spotted"
      description="Paste the details from 99acres, NoBroker, or that friend-of-a-friend WhatsApp forward."
    >
      <ListingForm settings={settings} onClose={onClose} onSubmit={onSubmit} />
    </Modal>
  );
}
