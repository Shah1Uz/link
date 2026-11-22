"use client";

import React, { useState, useEffect } from "react";
import { DashboardHeader } from "@/components/layout/dashboard-header";
import { useDashboard } from "@/context/dashboard-context";
import { useI18n } from "@/components/i18n-provider";
import {
  Calendar as CalendarIcon,
  Clock,
  Video,
  DollarSign,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Edit,
  Trash2,
  ExternalLink,
  RefreshCw,
  Globe,
  Settings,
  ChevronRight,
  User,
  Mail,
  Phone,
  ShieldCheck,
  CalendarCheck,
  CalendarX,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
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
  isActive: boolean;
  _count?: { bookings: number };
}

interface Booking {
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string | null;
  customerNotes?: string | null;
  startTime: string;
  endTime: string;
  status: "CONFIRMED" | "CANCELLED" | "RESCHEDULED" | "COMPLETED";
  meetingUrl?: string | null;
  locationType: string;
  price: number;
  currency: string;
  isPaid: boolean;
  cancelToken: string;
  rescheduleToken: string;
  cancellationReason?: string | null;
  appointmentType: {
    id: string;
    title: string;
    category: string;
    duration: number;
  };
}

interface AvailabilityRule {
  id?: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isEnabled: boolean;
}

const DAY_NAMES = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

export default function BookingsDashboardPage() {
  const { t } = useI18n();
  const { profile } = useDashboard();
  const [activeTab, setActiveTab] = useState<"schedule" | "types" | "availability" | "settings">("schedule");

  // Schedule & Bookings state
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loadingBookings, setLoadingBookings] = useState(true);
  const [filter, setFilter] = useState<"ALL" | "UPCOMING" | "COMPLETED" | "CANCELLED">("ALL");
  const [search, setSearch] = useState("");
  const [metrics, setMetrics] = useState({
    totalBookings: 0,
    upcomingCount: 0,
    completedCount: 0,
    cancelledCount: 0,
    totalRevenue: 0,
  });

  // Appointment Types state
  const [types, setTypes] = useState<AppointmentType[]>([]);
  const [loadingTypes, setLoadingTypes] = useState(true);
  const [typeModalOpen, setTypeModalOpen] = useState(false);
  const [editingType, setEditingType] = useState<AppointmentType | null>(null);

  // Type form fields
  const [typeTitle, setTypeTitle] = useState("");
  const [typeDesc, setTypeDesc] = useState("");
  const [typeCategory, setTypeCategory] = useState("CONSULTATION");
  const [typeDuration, setTypeDuration] = useState(30);
  const [typeBuffer, setTypeBuffer] = useState(10);
  const [typePrice, setTypePrice] = useState(0);
  const [typeCurrency, setTypeCurrency] = useState("USD");
  const [typeLocationType, setTypeLocationType] = useState("GOOGLE_MEET");
  const [typeLocationUrl, setTypeLocationUrl] = useState("");
  const [typeIsActive, setTypeIsActive] = useState(true);

  // Availability state
  const [timezone, setTimezone] = useState("UTC");
  const [weeklyRules, setWeeklyRules] = useState<AvailabilityRule[]>([]);
  const [savingAvailability, setSavingAvailability] = useState(false);

  // Settings state
  const [bookingEnabled, setBookingEnabled] = useState(true);
  const [bookingTitle, setBookingTitle] = useState("Book an Appointment");
  const [bookingDescription, setBookingDescription] = useState("");
  const [savingSettings, setSavingSettings] = useState(false);

  // Booking actions modal state
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [selectedBookingForCancel, setSelectedBookingForCancel] = useState<Booking | null>(null);
  const [cancelReason, setCancelReason] = useState("");
  const [cancelling, setCancelling] = useState(false);

  const [rescheduleModalOpen, setRescheduleModalOpen] = useState(false);
  const [selectedBookingForReschedule, setSelectedBookingForReschedule] = useState<Booking | null>(null);
  const [rescheduleDate, setRescheduleDate] = useState("");
  const [rescheduleTime, setRescheduleTime] = useState("");
  const [rescheduling, setRescheduling] = useState(false);

  // Load Bookings
  const loadBookings = async () => {
    try {
      setLoadingBookings(true);
      const res = await fetch(`/api/bookings?filter=${filter}&search=${encodeURIComponent(search)}`);
      const data = await res.json();
      if (res.ok) {
        setBookings(data.bookings || []);
        if (data.metrics) {
          setMetrics(data.metrics);
        }
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to load bookings");
    } finally {
      setLoadingBookings(false);
    }
  };

  // Load Types
  const loadTypes = async () => {
    try {
      setLoadingTypes(true);
      const res = await fetch("/api/bookings/types");
      const data = await res.json();
      if (res.ok) {
        setTypes(data.appointmentTypes || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingTypes(false);
    }
  };

  // Load Availability
  const loadAvailability = async () => {
    try {
      const res = await fetch("/api/bookings/availability");
      const data = await res.json();
      if (res.ok) {
        setTimezone(data.timezone || "UTC");
        setWeeklyRules(data.rules || []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Load Settings
  const loadSettings = async () => {
    try {
      const res = await fetch("/api/bookings/settings");
      const data = await res.json();
      if (res.ok && data.settings) {
        setBookingEnabled(data.settings.bookingEnabled ?? true);
        setBookingTitle(data.settings.bookingTitle || "Book an Appointment");
        setBookingDescription(data.settings.bookingDescription || "");
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadBookings();
  }, [filter, search]);

  useEffect(() => {
    loadTypes();
    loadAvailability();
    loadSettings();
  }, []);

  const openTypeModal = (typeToEdit?: AppointmentType) => {
    if (typeToEdit) {
      setEditingType(typeToEdit);
      setTypeTitle(typeToEdit.title);
      setTypeDesc(typeToEdit.description || "");
      setTypeCategory(typeToEdit.category);
      setTypeDuration(typeToEdit.duration);
      setTypeBuffer(typeToEdit.bufferTime);
      setTypePrice(typeToEdit.price);
      setTypeCurrency(typeToEdit.currency);
      setTypeLocationType(typeToEdit.locationType);
      setTypeLocationUrl(typeToEdit.locationUrl || "");
      setTypeIsActive(typeToEdit.isActive);
    } else {
      setEditingType(null);
      setTypeTitle("");
      setTypeDesc("");
      setTypeCategory("CONSULTATION");
      setTypeDuration(30);
      setTypeBuffer(10);
      setTypePrice(0);
      setTypeCurrency("USD");
      setTypeLocationType("GOOGLE_MEET");
      setTypeLocationUrl("");
      setTypeIsActive(true);
    }
    setTypeModalOpen(true);
  };

  const handleSaveType = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!typeTitle.trim()) {
      toast.error("Please enter a title for the appointment type");
      return;
    }

    try {
      const payload = {
        title: typeTitle.trim(),
        description: typeDesc.trim() || null,
        category: typeCategory,
        duration: Number(typeDuration),
        bufferTime: Number(typeBuffer),
        price: Number(typePrice),
        currency: typeCurrency,
        locationType: typeLocationType,
        locationUrl: typeLocationUrl.trim() || null,
        isActive: typeIsActive,
      };

      let res;
      if (editingType) {
        res = await fetch("/api/bookings/types", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: editingType.id, ...payload }),
        });
      } else {
        res = await fetch("/api/bookings/types", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to save appointment type");
      }

      toast.success(editingType ? "Appointment type updated" : "Appointment type created");
      setTypeModalOpen(false);
      loadTypes();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleDeleteType = async (id: string) => {
    if (!confirm("Are you sure you want to remove this appointment type?")) return;
    try {
      const res = await fetch(`/api/bookings/types?id=${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success(data.message || "Appointment type removed");
      loadTypes();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleSaveAvailability = async () => {
    try {
      setSavingAvailability(true);
      const res = await fetch("/api/bookings/availability", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          timezone,
          rules: weeklyRules.map((r) => ({
            dayOfWeek: r.dayOfWeek,
            startTime: r.startTime,
            endTime: r.endTime,
            isEnabled: r.isEnabled,
          })),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update availability");

      toast.success("Weekly availability saved successfully");
      loadAvailability();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSavingAvailability(false);
    }
  };

  const handleSaveSettings = async () => {
    try {
      setSavingSettings(true);
      const res = await fetch("/api/bookings/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookingEnabled,
          bookingTitle,
          bookingDescription,
          bookingTimezone: timezone,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save settings");
      toast.success("Booking settings updated");
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSavingSettings(false);
    }
  };

  const handleCancelBooking = async () => {
    if (!selectedBookingForCancel) return;
    try {
      setCancelling(true);
      const res = await fetch("/api/bookings/cancel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookingId: selectedBookingForCancel.id,
          reason: cancelReason || "Cancelled by host",
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to cancel");

      toast.success("Booking cancelled");
      setCancelModalOpen(false);
      loadBookings();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setCancelling(false);
    }
  };

  const handleRescheduleBooking = async () => {
    if (!selectedBookingForReschedule || !rescheduleDate || !rescheduleTime) {
      toast.error("Please pick a valid date and time");
      return;
    }

    try {
      setRescheduling(true);
      const newDateTimeStr = `${rescheduleDate}T${rescheduleTime}:00.000Z`;

      const res = await fetch("/api/bookings/reschedule", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookingId: selectedBookingForReschedule.id,
          newStartTime: newDateTimeStr,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to reschedule");

      toast.success("Booking rescheduled");
      setRescheduleModalOpen(false);
      loadBookings();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setRescheduling(false);
    }
  };

  return (
    <div className="pb-12">
      {/* Header */}
      <DashboardHeader
        title={t.bookingsStudio.title}
        description={t.bookingsStudio.description}
        action={
          <div className="flex items-center gap-2">
            <Button
              onClick={() => openTypeModal()}
              className="bg-violet-600 hover:bg-violet-700 text-white font-medium text-xs sm:text-sm h-9 px-3 gap-1.5 shadow-sm"
            >
              <Plus className="w-4 h-4" />
              New Appointment Type
            </Button>
          </div>
        }
      />

      <div className="mx-auto w-full max-w-6xl space-y-6 px-4 pb-10 pt-6 sm:px-6 lg:px-8">

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 gap-3 sm:gap-4">
        {/* Net Revenue */}
        <Card className="card-lift border border-border/80 bg-card shadow-soft">
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] sm:text-xs font-semibold text-zinc-500 dark:text-zinc-400 truncate">
                Booking Revenue
              </span>
              <div className="w-6 h-6 rounded-md bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                <DollarSign className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-900 dark:text-white truncate">
              ${metrics.totalRevenue.toFixed(2)}
            </div>
            <p className="text-[10px] sm:text-[11px] text-zinc-500 mt-1 truncate">Paid appointments</p>
          </CardContent>
        </Card>

        {/* Upcoming */}
        <Card className="card-lift border border-border/80 bg-card shadow-soft">
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] sm:text-xs font-semibold text-zinc-500 dark:text-zinc-400 truncate">
                Upcoming
              </span>
              <div className="w-6 h-6 rounded-md bg-violet-50 dark:bg-violet-950/60 text-violet-600 dark:text-violet-400 flex items-center justify-center shrink-0">
                <CalendarCheck className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">
              {metrics.upcomingCount}
            </div>
            <p className="text-[10px] sm:text-[11px] text-zinc-500 mt-1 truncate">Confirmed sessions</p>
          </CardContent>
        </Card>

        {/* Completed */}
        <Card className="card-lift border border-border/80 bg-card shadow-soft">
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] sm:text-xs font-semibold text-zinc-500 dark:text-zinc-400 truncate">
                Completed
              </span>
              <div className="w-6 h-6 rounded-md bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">
              {metrics.completedCount}
            </div>
            <p className="text-[10px] sm:text-[11px] text-zinc-500 mt-1 truncate">Past appointments</p>
          </CardContent>
        </Card>

        {/* Cancelled */}
        <Card className="card-lift border border-border/80 bg-card shadow-soft">
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] sm:text-xs font-semibold text-zinc-500 dark:text-zinc-400 truncate">
                Cancelled
              </span>
              <div className="w-6 h-6 rounded-md bg-red-50 dark:bg-red-950/60 text-red-600 dark:text-red-400 flex items-center justify-center shrink-0">
                <CalendarX className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">
              {metrics.cancelledCount}
            </div>
            <p className="text-[10px] sm:text-[11px] text-zinc-500 mt-1 truncate">Declined / cancelled</p>
          </CardContent>
        </Card>

        {/* Total Bookings */}
        <Card className="border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 shadow-sm col-span-2 sm:col-span-1">
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] sm:text-xs font-semibold text-zinc-500 dark:text-zinc-400 truncate">
                Total Bookings
              </span>
              <div className="w-6 h-6 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 flex items-center justify-center shrink-0">
                <CalendarIcon className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">
              {metrics.totalBookings}
            </div>
            <p className="text-[10px] sm:text-[11px] text-zinc-500 mt-1 truncate">All-time appointments</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs Navigation */}
      <div className="flex overflow-x-auto scrollbar-none border-b border-border/70 gap-6">
        <button
          onClick={() => setActiveTab("schedule")}
          className={`pb-3 text-sm font-semibold transition-colors border-b-2 flex items-center gap-2 ${
            activeTab === "schedule"
              ? "border-violet-600 text-violet-600 dark:text-violet-400"
              : "border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300"
          }`}
        >
          <CalendarIcon className="w-4 h-4" />
          Schedule & Bookings
        </button>

        <button
          onClick={() => setActiveTab("types")}
          className={`pb-3 text-sm font-semibold transition-colors border-b-2 flex items-center gap-2 ${
            activeTab === "types"
              ? "border-violet-600 text-violet-600 dark:text-violet-400"
              : "border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300"
          }`}
        >
          <Clock className="w-4 h-4" />
          Appointment Types ({types.length})
        </button>

        <button
          onClick={() => setActiveTab("availability")}
          className={`pb-3 text-sm font-semibold transition-colors border-b-2 flex items-center gap-2 ${
            activeTab === "availability"
              ? "border-violet-600 text-violet-600 dark:text-violet-400"
              : "border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300"
          }`}
        >
          <Globe className="w-4 h-4" />
          Working Hours & Timezone
        </button>

        <button
          onClick={() => setActiveTab("settings")}
          className={`pb-3 text-sm font-semibold transition-colors border-b-2 flex items-center gap-2 ${
            activeTab === "settings"
              ? "border-violet-600 text-violet-600 dark:text-violet-400"
              : "border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300"
          }`}
        >
          <Settings className="w-4 h-4" />
          Settings
        </button>
      </div>

      {/* TAB 1: SCHEDULE & BOOKINGS */}
      {activeTab === "schedule" && (
        <div className="space-y-4">
          {/* Controls: Search and Status Filters */}
          <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              {(["ALL", "UPCOMING", "COMPLETED", "CANCELLED"] as const).map((status) => (
                <button
                  key={status}
                  onClick={() => setFilter(status)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors shrink-0 ${
                    filter === status
                      ? "bg-violet-600 text-white"
                      : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700"
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-zinc-400" />
              <Input
                placeholder="Search attendees or title..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8 h-9 text-xs"
              />
            </div>
          </div>

          {/* Bookings List */}
          {loadingBookings ? (
            <div className="py-12 text-center text-sm text-zinc-500 animate-pulse">
              Loading appointments...
            </div>
          ) : bookings.length === 0 ? (
            <div className="p-8 rounded-2xl border border-dashed border-border/80 bg-surface/30 text-center space-y-2">
              <CalendarIcon className="w-8 h-8 text-zinc-400 mx-auto" />
              <h3 className="font-semibold text-zinc-900 dark:text-white text-sm">No bookings found</h3>
              <p className="text-xs text-zinc-500 max-w-sm mx-auto">
                {filter !== "ALL"
                  ? `No bookings with status "${filter}". Try selecting "ALL" or updating search.`
                  : "Share your bio link with clients and audience to start receiving bookings."}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {bookings.map((b) => (
                <div
                  key={b.id}
                  className="card-lift p-4 rounded-2xl border border-border/80 bg-card shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-zinc-900 dark:text-white">
                        {b.appointmentType.title}
                      </span>
                      <Badge
                        variant={
                          b.status === "CONFIRMED"
                            ? "default"
                            : b.status === "RESCHEDULED"
                            ? "secondary"
                            : b.status === "COMPLETED"
                            ? "outline"
                            : "destructive"
                        }
                        className="text-[10px] font-bold"
                      >
                        {b.status}
                      </Badge>
                      {b.price > 0 && (
                        <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full border border-emerald-500/20">
                          {b.price} {b.currency} {b.isPaid && "✓"}
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-zinc-500 dark:text-zinc-400">
                      <span className="flex items-center gap-1 font-medium text-zinc-800 dark:text-zinc-200">
                        <Clock className="w-3.5 h-3.5 text-violet-500" />
                        {new Date(b.startTime).toLocaleString("en-US", {
                          dateStyle: "medium",
                          timeStyle: "short",
                        })}
                      </span>

                      <span className="flex items-center gap-1">
                        <User className="w-3.5 h-3.5 text-zinc-400" />
                        {b.customerName} ({b.customerEmail})
                      </span>

                      {b.customerPhone && (
                        <span className="flex items-center gap-1">
                          <Phone className="w-3.5 h-3.5 text-zinc-400" />
                          {b.customerPhone}
                        </span>
                      )}
                    </div>

                    {b.customerNotes && (
                      <p className="text-xs text-zinc-600 dark:text-zinc-400 italic bg-zinc-50 dark:bg-zinc-800/40 p-2 rounded-lg border border-zinc-100 dark:border-zinc-800">
                        "{b.customerNotes}"
                      </p>
                    )}

                    {b.status === "CANCELLED" && b.cancellationReason && (
                      <p className="text-xs text-red-500 dark:text-red-400">
                        Cancellation reason: {b.cancellationReason}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                    {b.meetingUrl && b.status !== "CANCELLED" && (
                      <a
                        href={b.meetingUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="h-8 px-3 rounded-lg bg-violet-50 dark:bg-violet-950/40 text-violet-600 dark:text-violet-400 hover:bg-violet-100 dark:hover:bg-violet-900/60 font-semibold text-xs flex items-center gap-1.5 transition-colors border border-violet-500/20"
                      >
                        <Video className="w-3.5 h-3.5" />
                        Join Meeting
                      </a>
                    )}

                    {b.status !== "CANCELLED" && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 text-xs text-zinc-600 dark:text-zinc-300"
                          onClick={() => {
                            setSelectedBookingForReschedule(b);
                            setRescheduleModalOpen(true);
                          }}
                        >
                          Reschedule
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 text-xs text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40"
                          onClick={() => {
                            setSelectedBookingForCancel(b);
                            setCancelModalOpen(true);
                          }}
                        >
                          Cancel
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: APPOINTMENT TYPES */}
      {activeTab === "types" && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-sm font-semibold text-zinc-900 dark:text-white">Active Services & Meeting Types</h3>
              <p className="text-xs text-zinc-500">Configure consultation durations, pricing, and video meeting providers.</p>
            </div>
            <Button
              onClick={() => openTypeModal()}
              size="sm"
              className="bg-violet-600 hover:bg-violet-700 text-white text-xs h-8 gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Type
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {types.map((type) => (
              <div
                key={type.id}
                className="card-lift p-4 rounded-2xl border border-border/80 bg-card shadow-xs flex flex-col justify-between space-y-3"
              >
                <div>
                  <div className="flex justify-between items-start gap-2 mb-1.5">
                    <h4 className="font-bold text-sm text-zinc-900 dark:text-white leading-tight">
                      {type.title}
                    </h4>
                    <span
                      className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                        type.isActive
                          ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-500/20"
                          : "bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400"
                      }`}
                    >
                      {type.isActive ? "Active" : "Hidden"}
                    </span>
                  </div>

                  {type.description && (
                    <p className="text-xs text-zinc-500 line-clamp-2 mb-2">{type.description}</p>
                  )}

                  <div className="flex flex-wrap gap-2 text-xs text-zinc-600 dark:text-zinc-400 pt-1 border-t border-zinc-100 dark:border-zinc-800">
                    <span className="flex items-center gap-1 font-semibold text-zinc-800 dark:text-zinc-200">
                      <Clock className="w-3.5 h-3.5 text-violet-500" />
                      {type.duration} mins
                    </span>
                    <span className="flex items-center gap-1">
                      <Video className="w-3.5 h-3.5 text-zinc-400" />
                      {type.locationType.replace("_", " ")}
                    </span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400 ml-auto">
                      {type.price > 0 ? `${type.price} ${type.currency}` : "Free"}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-zinc-100 dark:border-zinc-800">
                  <span className="text-[11px] text-zinc-400">
                    {type._count?.bookings || 0} total bookings
                  </span>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 w-7 p-0 text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
                      onClick={() => openTypeModal(type)}
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 w-7 p-0 text-red-500 hover:text-red-700"
                      onClick={() => handleDeleteType(type.id)}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: WORKING HOURS & AVAILABILITY */}
      {activeTab === "availability" && (
        <Card className="card-lift border border-border/80 bg-card shadow-soft">
          <CardHeader>
            <CardTitle className="text-base font-bold text-zinc-900 dark:text-white">
              Weekly Recurring Schedule
            </CardTitle>
            <CardDescription className="text-xs">
              Set standard days and hours when visitors can book appointments with you.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Timezone picker */}
            <div className="max-w-xs">
              <Label className="text-xs font-semibold">Your Timezone</Label>
              <select
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                className="w-full mt-1 h-9 px-3 text-xs rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white"
              >
                <option value="UTC">UTC (Coordinated Universal Time)</option>
                <option value="America/New_York">Eastern Time (US & Canada)</option>
                <option value="America/Chicago">Central Time (US & Canada)</option>
                <option value="America/Denver">Mountain Time (US & Canada)</option>
                <option value="America/Los_Angeles">Pacific Time (US & Canada)</option>
                <option value="Europe/London">London (GMT/BST)</option>
                <option value="Europe/Paris">Paris, Berlin, Rome (CET)</option>
                <option value="Asia/Tashkent">Tashkent (UZT +5:00)</option>
                <option value="Asia/Dubai">Dubai (GST +4:00)</option>
                <option value="Asia/Tokyo">Tokyo, Seoul (JST +9:00)</option>
                <option value="Australia/Sydney">Sydney (AEST +10:00)</option>
              </select>
            </div>

            {/* Days list */}
            <div className="space-y-2 pt-2 border-t border-zinc-200 dark:border-zinc-800">
              {DAY_NAMES.map((name, dayIndex) => {
                const rule = weeklyRules.find((r) => r.dayOfWeek === dayIndex) || {
                  dayOfWeek: dayIndex,
                  startTime: "09:00",
                  endTime: "17:00",
                  isEnabled: dayIndex >= 1 && dayIndex <= 5,
                };

                return (
                  <div
                    key={dayIndex}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-xl border border-zinc-100 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-900/30 gap-2"
                  >
                    <div className="flex items-center gap-3 w-36">
                      <input
                        type="checkbox"
                        checked={rule.isEnabled}
                        onChange={(e) => {
                          const updated = [...weeklyRules];
                          const idx = updated.findIndex((r) => r.dayOfWeek === dayIndex);
                          if (idx >= 0) {
                            updated[idx].isEnabled = e.target.checked;
                          } else {
                            updated.push({ ...rule, isEnabled: e.target.checked });
                          }
                          setWeeklyRules(updated);
                        }}
                        className="w-4 h-4 rounded text-violet-600 focus:ring-violet-500"
                      />
                      <span className={`text-xs font-semibold ${rule.isEnabled ? "text-zinc-900 dark:text-white" : "text-zinc-400"}`}>
                        {name}
                      </span>
                    </div>

                    {rule.isEnabled ? (
                      <div className="flex items-center gap-2">
                        <Input
                          type="time"
                          value={rule.startTime}
                          onChange={(e) => {
                            const updated = [...weeklyRules];
                            const idx = updated.findIndex((r) => r.dayOfWeek === dayIndex);
                            if (idx >= 0) updated[idx].startTime = e.target.value;
                            else updated.push({ ...rule, startTime: e.target.value });
                            setWeeklyRules(updated);
                          }}
                          className="h-8 w-28 text-xs"
                        />
                        <span className="text-xs text-zinc-400">to</span>
                        <Input
                          type="time"
                          value={rule.endTime}
                          onChange={(e) => {
                            const updated = [...weeklyRules];
                            const idx = updated.findIndex((r) => r.dayOfWeek === dayIndex);
                            if (idx >= 0) updated[idx].endTime = e.target.value;
                            else updated.push({ ...rule, endTime: e.target.value });
                            setWeeklyRules(updated);
                          }}
                          className="h-8 w-28 text-xs"
                        />
                      </div>
                    ) : (
                      <span className="text-xs text-zinc-400 italic">Unavailable</span>
                    )}
                  </div>
                );
              })}
            </div>

            <Button
              onClick={handleSaveAvailability}
              disabled={savingAvailability}
              className="bg-violet-600 hover:bg-violet-700 text-white font-semibold text-xs h-9 px-4 mt-2"
            >
              {savingAvailability ? "Saving..." : "Save Availability"}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* TAB 4: SETTINGS */}
      {activeTab === "settings" && (
        <Card className="border border-border/80 bg-card shadow-soft max-w-xl">
          <CardHeader>
            <CardTitle className="text-base font-bold text-zinc-900 dark:text-white">
              Public Profile Booking Section
            </CardTitle>
            <CardDescription className="text-xs">
              Customize how appointment bookings appear on your public bio page.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-xl border border-zinc-200 dark:border-zinc-800">
              <div>
                <Label className="text-xs font-bold text-zinc-900 dark:text-white">
                  Enable Bookings on Profile
                </Label>
                <p className="text-[11px] text-zinc-500">Allow visitors to book slots directly from your bio link.</p>
              </div>
              <input
                type="checkbox"
                checked={bookingEnabled}
                onChange={(e) => setBookingEnabled(e.target.checked)}
                className="w-5 h-5 rounded text-violet-600 focus:ring-violet-500"
              />
            </div>

            <div>
              <Label className="text-xs font-semibold">Section Title</Label>
              <Input
                value={bookingTitle}
                onChange={(e) => setBookingTitle(e.target.value)}
                className="mt-1 h-9 text-xs"
                placeholder="Book an Appointment"
              />
            </div>

            <div>
              <Label className="text-xs font-semibold">Section Subtitle / Description</Label>
              <Input
                value={bookingDescription}
                onChange={(e) => setBookingDescription(e.target.value)}
                className="mt-1 h-9 text-xs"
                placeholder="Schedule a 1-on-1 consultation or video call..."
              />
            </div>

            <Button
              onClick={handleSaveSettings}
              disabled={savingSettings}
              className="bg-violet-600 hover:bg-violet-700 text-white font-semibold text-xs h-9 px-4"
            >
              {savingSettings ? "Saving..." : "Save Settings"}
            </Button>
          </CardContent>
        </Card>
      )}

      </div>

      {/* MODAL: CREATE / EDIT APPOINTMENT TYPE */}
      <Modal
        isOpen={typeModalOpen}
        onClose={() => setTypeModalOpen(false)}
        title={editingType ? "Edit Appointment Type" : "Create Appointment Type"}
      >
        <form onSubmit={handleSaveType} className="space-y-4 text-xs">
          <div>
            <Label className="text-xs font-semibold">Title *</Label>
            <Input
              required
              placeholder="e.g. 30 Min Discovery Call"
              value={typeTitle}
              onChange={(e) => setTypeTitle(e.target.value)}
              className="mt-1 h-9 text-xs"
            />
          </div>

          <div>
            <Label className="text-xs font-semibold">Category</Label>
            <select
              value={typeCategory}
              onChange={(e) => setTypeCategory(e.target.value)}
              className="w-full mt-1 h-9 px-3 text-xs rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900"
            >
              <option value="CONSULTATION">Consultation</option>
              <option value="MEETING">Online Meeting</option>
              <option value="COACHING">Coaching Session</option>
              <option value="PERSONAL">Personal Appointment</option>
              <option value="SERVICE">Paid Service</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label className="text-xs font-semibold">Duration (Minutes)</Label>
              <select
                value={typeDuration}
                onChange={(e) => setTypeDuration(Number(e.target.value))}
                className="w-full mt-1 h-9 px-3 text-xs rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900"
              >
                <option value={15}>15 Minutes</option>
                <option value={30}>30 Minutes</option>
                <option value={45}>45 Minutes</option>
                <option value={60}>60 Minutes (1h)</option>
                <option value={90}>90 Minutes (1.5h)</option>
                <option value={120}>120 Minutes (2h)</option>
              </select>
            </div>
            <div>
              <Label className="text-xs font-semibold">Buffer Time (Minutes)</Label>
              <select
                value={typeBuffer}
                onChange={(e) => setTypeBuffer(Number(e.target.value))}
                className="w-full mt-1 h-9 px-3 text-xs rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900"
              >
                <option value={0}>0 min</option>
                <option value={5}>5 min</option>
                <option value={10}>10 min</option>
                <option value={15}>15 min</option>
                <option value={30}>30 min</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label className="text-xs font-semibold">Price (0 for Free)</Label>
              <Input
                type="number"
                min={0}
                step={0.01}
                value={typePrice}
                onChange={(e) => setTypePrice(Number(e.target.value))}
                className="mt-1 h-9 text-xs"
              />
            </div>
            <div>
              <Label className="text-xs font-semibold">Currency</Label>
              <Input
                value={typeCurrency}
                onChange={(e) => setTypeCurrency(e.target.value.toUpperCase())}
                className="mt-1 h-9 text-xs uppercase"
                maxLength={3}
              />
            </div>
          </div>

          <div>
            <Label className="text-xs font-semibold">Location / Video Platform</Label>
            <select
              value={typeLocationType}
              onChange={(e) => setTypeLocationType(e.target.value)}
              className="w-full mt-1 h-9 px-3 text-xs rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900"
            >
              <option value="GOOGLE_MEET">Google Meet (Auto-generated)</option>
              <option value="ZOOM">Zoom</option>
              <option value="CUSTOM_URL">Custom Meeting Link</option>
              <option value="PHONE">Phone Call</option>
              <option value="IN_PERSON">In Person</option>
            </select>
          </div>

          {typeLocationType !== "GOOGLE_MEET" && (
            <div>
              <Label className="text-xs font-semibold">Meeting URL or Address</Label>
              <Input
                placeholder="https://zoom.us/j/... or Office Address"
                value={typeLocationUrl}
                onChange={(e) => setTypeLocationUrl(e.target.value)}
                className="mt-1 h-9 text-xs"
              />
            </div>
          )}

          <div>
            <Label className="text-xs font-semibold">Description (Optional)</Label>
            <Input
              placeholder="What to expect in this meeting..."
              value={typeDesc}
              onChange={(e) => setTypeDesc(e.target.value)}
              className="mt-1 h-9 text-xs"
            />
          </div>

          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="typeActive"
              checked={typeIsActive}
              onChange={(e) => setTypeIsActive(e.target.checked)}
              className="w-4 h-4 rounded text-violet-600"
            />
            <Label htmlFor="typeActive" className="text-xs font-medium cursor-pointer">
              Active and bookable on public profile
            </Label>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-zinc-200 dark:border-zinc-800">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setTypeModalOpen(false)}
              className="h-8 text-xs"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              className="h-8 text-xs bg-violet-600 hover:bg-violet-700 text-white"
            >
              {editingType ? "Save Changes" : "Create Type"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* MODAL: CANCEL BOOKING */}
      <Modal
        isOpen={cancelModalOpen}
        onClose={() => setCancelModalOpen(false)}
        title="Cancel Appointment"
      >
        <div className="space-y-3 text-xs">
          <p className="text-zinc-600 dark:text-zinc-300">
            Are you sure you want to cancel the booking for{" "}
            <span className="font-bold text-zinc-900 dark:text-white">
              {selectedBookingForCancel?.customerName}
            </span>{" "}
            ({selectedBookingForCancel?.appointmentType.title})?
          </p>

          <div>
            <Label className="text-xs font-semibold">Cancellation Reason (Optional)</Label>
            <Input
              placeholder="Reason sent to attendee..."
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              className="mt-1 h-9 text-xs"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-zinc-200 dark:border-zinc-800">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setCancelModalOpen(false)}
              className="h-8 text-xs"
            >
              Keep Booking
            </Button>
            <Button
              type="button"
              size="sm"
              disabled={cancelling}
              onClick={handleCancelBooking}
              className="h-8 text-xs bg-red-600 hover:bg-red-700 text-white"
            >
              {cancelling ? "Cancelling..." : "Confirm Cancellation"}
            </Button>
          </div>
        </div>
      </Modal>

      {/* MODAL: RESCHEDULE BOOKING */}
      <Modal
        isOpen={rescheduleModalOpen}
        onClose={() => setRescheduleModalOpen(false)}
        title="Reschedule Appointment"
      >
        <div className="space-y-3 text-xs">
          <p className="text-zinc-600 dark:text-zinc-300">
            Rescheduling session for{" "}
            <span className="font-bold text-zinc-900 dark:text-white">
              {selectedBookingForReschedule?.customerName}
            </span>
          </p>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label className="text-xs font-semibold">New Date</Label>
              <Input
                type="date"
                value={rescheduleDate}
                onChange={(e) => setRescheduleDate(e.target.value)}
                className="mt-1 h-9 text-xs"
              />
            </div>
            <div>
              <Label className="text-xs font-semibold">New Time (UTC)</Label>
              <Input
                type="time"
                value={rescheduleTime}
                onChange={(e) => setRescheduleTime(e.target.value)}
                className="mt-1 h-9 text-xs"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-zinc-200 dark:border-zinc-800">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setRescheduleModalOpen(false)}
              className="h-8 text-xs"
            >
              Back
            </Button>
            <Button
              type="button"
              size="sm"
              disabled={rescheduling}
              onClick={handleRescheduleBooking}
              className="h-8 text-xs bg-violet-600 hover:bg-violet-700 text-white"
            >
              {rescheduling ? "Rescheduling..." : "Save & Notify Attendee"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
