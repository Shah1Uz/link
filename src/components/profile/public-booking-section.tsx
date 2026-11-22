"use client";

import React, { useState, useEffect } from "react";
import {
  Calendar,
  Clock,
  Video,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Check,
  MapPin,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { resolveThemeSurface, withAlpha } from "./theme-surface";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface AppointmentType {
  id: string;
  title: string;
  description?: string | null;
  category: string;
  duration: number;
  bufferTime: number;
  price: number;
  currency: string;
  locationType: string;
  locationUrl?: string | null;
  color?: string | null;
}

interface TimeSlot {
  startTime: string;
  endTime: string;
  formattedTime: string;
  duration: number;
}

interface PublicBookingSectionProps {
  profile: {
    id: string;
    username: string;
    displayName?: string | null;
    bookingEnabled?: boolean;
    bookingTitle?: string | null;
    bookingDescription?: string | null;
    bookingTimezone?: string | null;
  };
  theme?: any;
}

export function PublicBookingSection({ profile, theme }: PublicBookingSectionProps) {
  const [types, setTypes] = useState<AppointmentType[]>([]);
  const [, setLoadingTypes] = useState(true);
  const [selectedType, setSelectedType] = useState<AppointmentType | null>(null);

  // Date selection
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);

  // Form inputs
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerNotes, setCustomerNotes] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingResult, setBookingResult] = useState<any | null>(null);

  // If bookings disabled on profile
  if (!profile.bookingEnabled) {
    return null;
  }

  // Generate the next 14 bookable dates (excluding past)
  const bookableDates: { dateStr: string; label: string; dayName: string }[] = [];
  const today = new Date();
  for (let i = 0; i < 14; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    const dateStr = d.toISOString().split("T")[0];
    const dayName = d.toLocaleDateString("en-US", { weekday: "short" });
    const label = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    bookableDates.push({ dateStr, label, dayName });
  }

  // Fetch appointment types on mount
  useEffect(() => {
    async function loadTypes() {
      try {
        setLoadingTypes(true);
        const res = await fetch(`/api/bookings/types?profileId=${profile.id}`);
        const data = await res.json();
        if (data.appointmentTypes && data.appointmentTypes.length > 0) {
          setTypes(data.appointmentTypes);
          setSelectedType(data.appointmentTypes[0]);
          setSelectedDate(bookableDates[0]?.dateStr || "");
        }
      } catch (err) {
        console.error("Failed to load appointment types", err);
      } finally {
        setLoadingTypes(false);
      }
    }
    loadTypes();
  }, [profile.id]);

  // Fetch slots whenever selectedType or selectedDate changes
  useEffect(() => {
    if (!selectedType || !selectedDate) return;

    async function loadSlots() {
      try {
        setLoadingSlots(true);
        setSelectedSlot(null);
        const res = await fetch(
          `/api/bookings/slots?profileId=${profile.id}&appointmentTypeId=${selectedType!.id}&date=${selectedDate}`
        );
        const data = await res.json();
        if (data.slots) {
          setAvailableSlots(data.slots);
        } else {
          setAvailableSlots([]);
        }
      } catch (err) {
        console.error("Failed to load time slots", err);
        setAvailableSlots([]);
      } finally {
        setLoadingSlots(false);
      }
    }

    loadSlots();
  }, [selectedType, selectedDate, profile.id]);

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedType || !selectedSlot) {
      toast.error("Please select a date and time slot.");
      return;
    }
    if (!customerName.trim() || !customerEmail.trim()) {
      toast.error("Please enter your name and email.");
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          profileId: profile.id,
          appointmentTypeId: selectedType.id,
          customerName: customerName.trim(),
          customerEmail: customerEmail.trim(),
          customerPhone: customerPhone.trim() || undefined,
          customerNotes: customerNotes.trim() || undefined,
          startTime: selectedSlot.startTime,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to confirm booking");
      }

      setBookingResult(data.booking);
      toast.success("Appointment successfully confirmed!");
    } catch (err: any) {
      toast.error(err.message || "Booking failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  const title = profile.bookingTitle || "Book an Appointment";
  const description =
    profile.bookingDescription || "Schedule a 1-on-1 consultation or online meeting with me.";

  // If no appointment types configured, do not show any card or placeholder
  if (types.length === 0) {
    return null;
  }

  // Theme-aware platform surface (never overrides creator theme values).
  const ts = resolveThemeSurface(theme);
  const accentInk = ts.accentInk;
  const accentText = ts.accentText;

  const microLabelClass = "text-[10px] font-bold uppercase tracking-[0.16em]";
  const inputClassName =
    "!h-10 !rounded-xl !border-[var(--ts-border)] !bg-[var(--ts-surface-strong)] !text-xs !text-[var(--ts-text)] !shadow-none placeholder:!text-[var(--ts-subtle)] focus-visible:!border-[var(--ts-accent-border)] focus-visible:!ring-[color:var(--ts-accent-soft)]";

  const submitButtonStyle: React.CSSProperties = {
    backgroundColor: ts.accent,
    color: accentText,
    borderColor: "transparent",
    boxShadow: `0 14px 32px -18px ${withAlpha(ts.accent, 0.9)}`,
  };

  const receiptRow = (label: string, value: React.ReactNode) => (
    <div className="flex items-start justify-between gap-4 py-2">
      <span className="text-[11px] font-medium" style={{ color: ts.muted }}>
        {label}
      </span>
      <span className="text-right text-[11px] font-semibold" style={{ color: ts.text }}>
        {value}
      </span>
    </div>
  );

  return (
    <section className="my-6 w-full transition-all duration-300" style={ts.vars}>
      <div
        className="relative overflow-hidden rounded-3xl border p-5 text-left backdrop-blur-xl shadow-xl sm:p-6"
        style={{
          ...ts.vars,
          backgroundColor: ts.surface,
          borderColor: ts.border,
          color: ts.text,
          boxShadow: `0 22px 50px -34px ${withAlpha(ts.text, 0.65)}`,
        }}
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-8 top-0 h-px"
          style={{
            background: `linear-gradient(90deg, transparent, ${ts.accentBorder}, transparent)`,
          }}
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-12 -top-16 h-40 w-40 rounded-full opacity-50 blur-3xl"
          style={{ backgroundColor: ts.accentSoft }}
        />

        {/* Header */}
        <div className="relative mb-5 flex items-start gap-3">
          <span
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border"
            style={{
              backgroundColor: ts.accentSoft,
              borderColor: ts.accentBorder,
              color: accentInk,
            }}
          >
            <Calendar className="h-5 w-5" />
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-base font-extrabold leading-tight tracking-[-0.02em] sm:text-lg">
                {title}
              </h3>
              <span
                className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[9px] font-black uppercase tracking-[0.14em]"
                style={{ backgroundColor: ts.accentSoft, color: accentInk }}
              >
                <Sparkles className="h-2.5 w-2.5" />
                Book now
              </span>
            </div>
            <p className="mt-1 text-[11px] leading-relaxed sm:text-xs" style={{ color: ts.muted }}>
              {description}
            </p>
          </div>
        </div>

        {/* If booking was just completed, show confirmation receipt */}
        {bookingResult ? (
          <div
            className="relative overflow-hidden rounded-2xl border p-5 animate-in fade-in zoom-in-95 duration-300"
            style={{ backgroundColor: ts.accentSoft, borderColor: ts.accentBorder }}
          >
            <div className="flex flex-col items-center text-center">
              <span
                className="flex h-12 w-12 items-center justify-center rounded-full"
                style={{
                  backgroundColor: ts.accent,
                  color: accentText,
                  boxShadow: `0 0 0 6px ${withAlpha(ts.accent, 0.1)}`,
                }}
              >
                <CheckCircle2 className="h-6 w-6" />
              </span>
              <h4 className="mt-3 text-base font-extrabold tracking-tight">Booking confirmed!</h4>
              <p className="mt-1 text-[11px] leading-relaxed" style={{ color: ts.muted }}>
                Calendar invites and details have been sent to{" "}
                <span className="font-semibold" style={{ color: accentInk }}>
                  {bookingResult.customerEmail}
                </span>
                .
              </p>
            </div>

            <div
              className="mt-4 rounded-xl border px-4 py-1 backdrop-blur-sm"
              style={{
                backgroundColor: ts.surfaceStrong,
                borderColor: ts.border,
                color: ts.text,
              }}
            >
              {receiptRow("Appointment", bookingResult.appointmentType?.title)}
              {receiptRow(
                "Time",
                new Date(bookingResult.startTime).toLocaleString("en-US", {
                  dateStyle: "medium",
                  timeStyle: "short",
                })
              )}
              {bookingResult.meetingUrl &&
                receiptRow(
                  "Meeting link",
                  <a
                    href={bookingResult.meetingUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="max-w-[170px] truncate underline decoration-dotted underline-offset-2 hover:opacity-80"
                    style={{ color: accentInk }}
                  >
                    {bookingResult.meetingUrl}
                  </a>
                )}
            </div>

            <Button
              type="button"
              variant="outline"
              size="sm"
              className="mt-4 w-full rounded-xl border-0 text-xs font-bold hover:brightness-110 active:scale-[0.98]"
              style={{
                backgroundColor: "transparent",
                color: accentInk,
                borderColor: ts.accentBorder,
                boxShadow: "none",
              }}
              onClick={() => {
                setBookingResult(null);
                setSelectedSlot(null);
              }}
            >
              Book another session
            </Button>
          </div>
        ) : (
          <form onSubmit={handleBookingSubmit} className="relative space-y-5">
            {/* Step 1: Appointment Type Selector */}
            {types.length > 1 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className={microLabelClass} style={{ color: ts.muted }}>
                    Select service
                  </span>
                  <span className="text-[10px] font-semibold" style={{ color: ts.subtle }}>
                    {types.length} options
                  </span>
                </div>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {types.map((t) => {
                    const isSelected = selectedType?.id === t.id;
                    return (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => setSelectedType(t)}
                        aria-pressed={isSelected}
                        className={cn(
                          "group rounded-2xl border p-3.5 text-left transition-all duration-200",
                          isSelected
                            ? ""
                            : "bg-[var(--ts-faint)] hover:-translate-y-0.5 hover:bg-[var(--ts-hover)]"
                        )}
                        style={
                          isSelected
                            ? {
                                backgroundColor: ts.accentSoft,
                                borderColor: ts.accentBorder,
                                color: ts.text,
                              }
                            : { borderColor: ts.border, color: ts.text }
                        }
                      >
                        <div className="flex items-start justify-between gap-2">
                          <span className="text-[13px] font-bold leading-tight">{t.title}</span>
                          <span className="flex items-center gap-1.5">
                            <span
                              className="whitespace-nowrap rounded-md px-1.5 py-0.5 text-[10px] font-bold"
                              style={{
                                backgroundColor: isSelected ? ts.accentSoft : ts.faint,
                                color: isSelected ? accentInk : ts.muted,
                              }}
                            >
                              {t.price > 0 ? `${t.price} ${t.currency}` : "Free"}
                            </span>
                            {isSelected && (
                              <span
                                className="flex h-4 w-4 items-center justify-center rounded-full"
                                style={{ backgroundColor: ts.accent, color: accentText }}
                              >
                                <Check className="h-2.5 w-2.5" strokeWidth={3.5} />
                              </span>
                            )}
                          </span>
                        </div>
                        <div
                          className="mt-1.5 flex items-center gap-3 text-[11px]"
                          style={{ color: ts.muted }}
                        >
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {t.duration}m
                          </span>
                          <span className="flex items-center gap-1">
                            <Video className="h-3 w-3" />
                            {t.locationType.replace("_", " ")}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Step 2: Date Selector (Horizontal Scroll) */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className={microLabelClass} style={{ color: ts.muted }}>
                  Select date
                </span>
                <span
                  className="flex items-center gap-1 text-[10px] font-semibold"
                  style={{ color: ts.subtle }}
                >
                  <MapPin className="h-2.5 w-2.5" />
                  {profile.bookingTimezone || "UTC"}
                </span>
              </div>
              <div className="scrollbar-none -mx-0.5 flex gap-2 overflow-x-auto px-0.5 pb-1.5">
                {bookableDates.map((d) => {
                  const isSelected = selectedDate === d.dateStr;
                  return (
                    <button
                      key={d.dateStr}
                      type="button"
                      onClick={() => setSelectedDate(d.dateStr)}
                      aria-pressed={isSelected}
                      className={cn(
                        "flex w-14 shrink-0 flex-col items-center justify-center gap-0.5 rounded-2xl border py-2 transition-all duration-200",
                        isSelected
                          ? "scale-[1.03]"
                          : "bg-[var(--ts-faint)] hover:-translate-y-0.5 hover:bg-[var(--ts-hover)]"
                      )}
                      style={
                        isSelected
                          ? {
                              backgroundColor: ts.accent,
                              borderColor: ts.accentBorder,
                              color: accentText,
                              boxShadow: ts.glow,
                            }
                          : { borderColor: ts.border, color: ts.text }
                      }
                    >
                      <span className="text-[9px] font-bold uppercase tracking-[0.12em] opacity-70">
                        {d.dayName}
                      </span>
                      <span className="text-sm font-extrabold leading-none">
                        {d.label.split(" ")[1]}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Step 3: Available Time Slots */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className={microLabelClass} style={{ color: ts.muted }}>
                  Available time
                </span>
                {!loadingSlots && availableSlots.length > 0 && (
                  <span className="text-[10px] font-semibold" style={{ color: ts.subtle }}>
                    {availableSlots.length} slots
                  </span>
                )}
              </div>

              {loadingSlots ? (
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3" aria-hidden="true">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div
                      key={i}
                      className="h-[38px] rounded-xl border shimmer"
                      style={{
                        backgroundColor: ts.faint,
                        borderColor: ts.border,
                        animationDelay: `${i * 90}ms`,
                      }}
                    />
                  ))}
                </div>
              ) : availableSlots.length === 0 ? (
                <div
                  className="flex flex-col items-center gap-1 rounded-xl border border-dashed px-4 py-5 text-center"
                  style={{ borderColor: ts.borderStrong, backgroundColor: ts.faint }}
                >
                  <Calendar className="h-4 w-4" style={{ color: ts.subtle }} />
                  <p className="text-[11px] leading-relaxed" style={{ color: ts.muted }}>
                    No available times for this date. Please pick another date.
                  </p>
                </div>
              ) : (
                <div className="scrollbar-none grid max-h-40 grid-cols-2 gap-2 overflow-y-auto pr-1 sm:grid-cols-3">
                  {availableSlots.map((slot) => {
                    const isSelected = selectedSlot?.startTime === slot.startTime;
                    return (
                      <button
                        key={slot.startTime}
                        type="button"
                        onClick={() => setSelectedSlot(slot)}
                        aria-pressed={isSelected}
                        className={cn(
                          "rounded-xl border py-2.5 text-center text-xs font-bold transition-all duration-200",
                          isSelected
                            ? ""
                            : "bg-[var(--ts-faint)] hover:bg-[var(--ts-hover)] hover:-translate-y-0.5"
                        )}
                        style={
                          isSelected
                            ? {
                                backgroundColor: ts.accent,
                                borderColor: ts.accentBorder,
                                color: accentText,
                                boxShadow: ts.glow,
                              }
                            : { borderColor: ts.border, color: ts.text }
                        }
                      >
                        {slot.formattedTime.split(" - ")[0]}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Step 4: Contact details (shown once slot is selected) */}
            {selectedSlot && (
              <div
                className="space-y-3 border-t pt-4 animate-in fade-in slide-in-from-top duration-300"
                style={{ borderColor: ts.border }}
              >
                <div className="flex items-center justify-between">
                  <span className={microLabelClass} style={{ color: ts.muted }}>
                    Your details
                  </span>
                  <span className="text-[10px] font-semibold" style={{ color: ts.subtle }}>
                    Confirm
                  </span>
                </div>

                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  <div>
                    <label
                      className="mb-1 block text-[11px] font-semibold"
                      style={{ color: ts.muted }}
                    >
                      Your Name *
                    </label>
                    <Input
                      type="text"
                      required
                      placeholder="Jane Doe"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className={inputClassName}
                    />
                  </div>
                  <div>
                    <label
                      className="mb-1 block text-[11px] font-semibold"
                      style={{ color: ts.muted }}
                    >
                      Your Email *
                    </label>
                    <Input
                      type="email"
                      required
                      placeholder="jane@example.com"
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      className={inputClassName}
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-1 block text-[11px] font-semibold" style={{ color: ts.muted }}>
                    Phone Number (Optional)
                  </label>
                  <Input
                    type="tel"
                    placeholder="+1 555-0199"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className={inputClassName}
                  />
                </div>

                <div>
                  <label className="mb-1 block text-[11px] font-semibold" style={{ color: ts.muted }}>
                    Notes or Agenda (Optional)
                  </label>
                  <Input
                    type="text"
                    placeholder="Brief description of what you'd like to discuss..."
                    value={customerNotes}
                    onChange={(e) => setCustomerNotes(e.target.value)}
                    className={inputClassName}
                  />
                </div>

                <Button
                  type="submit"
                  variant="outline"
                  disabled={isSubmitting}
                  className="mt-1 flex h-11 w-full items-center justify-center gap-2 rounded-xl border-0 text-xs font-bold hover:brightness-110 active:scale-[0.99]"
                  style={submitButtonStyle}
                >
                  {isSubmitting ? (
                    "Confirming Booking..."
                  ) : (
                    <>
                      Confirm Booking{" "}
                      {selectedType && selectedType.price > 0 && `• ${selectedType.price} ${selectedType.currency}`}
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </Button>
              </div>
            )}
          </form>
        )}
      </div>
    </section>
  );
}
