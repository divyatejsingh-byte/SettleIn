"use client";

import { X } from "lucide-react";
import { useEffect, useId, useRef, type ReactNode } from "react";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  icon?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  size?: "md" | "lg";
}

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

export default function Modal({ open, onClose, title, description, icon, children, footer, size = "md" }: ModalProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const onCloseRef = useRef(onClose);
  const titleId = useId();
  const descId = useId();

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!open) return;
    const panel = panelRef.current;
    const previouslyFocused = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const first = panel?.querySelector<HTMLElement>("[data-autofocus]") ?? panel;
    first?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onCloseRef.current();
        return;
      }
      if (event.key !== "Tab" || !panel) return;
      const focusable = Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE));
      if (focusable.length === 0) return;
      const firstEl = focusable[0];
      const lastEl = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === firstEl) {
        event.preventDefault();
        lastEl.focus();
      } else if (!event.shiftKey && document.activeElement === lastEl) {
        event.preventDefault();
        firstEl.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
      previouslyFocused?.focus();
    };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-6">
      <div
        className="absolute inset-0 animate-fade-in bg-stone-900/30 backdrop-blur-[2px]"
        aria-hidden="true"
        onClick={() => onCloseRef.current()}
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descId : undefined}
        tabIndex={-1}
        className={`relative flex max-h-[92dvh] w-full animate-pop-in flex-col rounded-t-3xl bg-white shadow-2xl shadow-stone-900/10 outline-none sm:rounded-3xl ${
          size === "lg" ? "sm:max-w-2xl" : "sm:max-w-lg"
        }`}
      >
        <div className="flex items-start gap-3 border-b border-stone-100 px-5 pb-4 pt-5 sm:px-6">
          {icon && (
            <div className="mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-2xl bg-rose-50 text-rose-500">
              {icon}
            </div>
          )}
          <div className="min-w-0 flex-1">
            <h2 id={titleId} className="text-lg font-bold text-stone-900">
              {title}
            </h2>
            {description && (
              <p id={descId} className="mt-0.5 text-sm text-stone-500">
                {description}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={() => onCloseRef.current()}
            className="-mr-1 rounded-full p-2 text-stone-400 transition hover:bg-stone-100 hover:text-stone-700 focus-visible:outline-2 focus-visible:outline-rose-300"
            aria-label="Close"
          >
            <X className="size-5" />
          </button>
        </div>
        <div className="overflow-y-auto px-5 py-5 sm:px-6">{children}</div>
        {footer && (
          <div className="border-t border-stone-100 px-5 py-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:px-6">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
