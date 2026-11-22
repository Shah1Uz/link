"use client";

import React, { useEffect, useState } from "react";
import InteractiveTourModal from "@/components/dashboard/interactive-tour-modal";

export function DashboardTourWrapper() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return <InteractiveTourModal />;
}
