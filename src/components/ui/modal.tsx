"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}

export function Modal({
  isOpen,
  onClose,
  title,
  description,
  children,
  className,
}: ModalProps) {
  const [mounted, setMounted] = React.useState(false);
  const titleId = React.useId();
  const panelRef = React.useRef<HTMLDivElement>(null);
  const onCloseRef = React.useRef(onClose);
  onCloseRef.current = onClose;
  const wasOpenRef = React.useRef(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  React.useEffect(() => {
    if (!isOpen) {
      wasOpenRef.current = false;
      document.body.style.overflow = "unset";
      return;
    }

    document.body.style.overflow = "hidden";

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCloseRef.current?.();
    };
    window.addEventListener("keydown", handleKeyDown);

    // Only move focus into the dialog on initial open, never on parent re-renders/typing
    if (!wasOpenRef.current) {
      wasOpenRef.current = true;
      const raf = window.requestAnimationFrame(() => {
        if (panelRef.current && !panelRef.current.contains(document.activeElement)) {
          panelRef.current.focus();
        }
      });
      return () => {
        document.body.style.overflow = "unset";
        window.removeEventListener("keydown", handleKeyDown);
        window.cancelAnimationFrame(raf);
      };
    }

    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  if (!isOpen || !mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 font-sans antialiased">
      {/* Deep Backdrop to prevent background element bleed-through */}
      <div
        className="fixed inset-0 bg-black/85 backdrop-blur-2xl transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Dialog Content */}
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        tabIndex={-1}
        className={cn(
          "relative z-10 max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-3xl border border-zinc-200/80 bg-white/95 p-6 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.8),0_40px_90px_-40px_rgba(9,11,17,0.6)] backdrop-blur-xl outline-none animate-in zoom-in-95 duration-200 dark:border-white/10 dark:bg-[#0d0f15]/95 dark:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06),0_40px_90px_-30px_rgba(0,0,0,0.85)]",
          className
        )}
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent"
        />
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-lg p-1.5 text-zinc-400 transition-colors hover:bg-zinc-900/[0.05] hover:text-zinc-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/40 dark:hover:bg-white/[0.06] dark:hover:text-zinc-200"
          aria-label="Close dialog"
        >
          <X className="h-5 w-5" />
        </button>

        {title && (
          <div className="mb-5 pr-8">
            <h2 id={titleId} className="text-xl font-bold tracking-tight text-foreground">
              {title}
            </h2>
            {description && (
              <p className="mt-1.5 text-sm leading-relaxed text-text-secondary">
                {description}
              </p>
            )}
          </div>
        )}

        <div>{children}</div>
      </div>
    </div>,
    document.body
  );
}
