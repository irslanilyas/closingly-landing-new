"use client";

import { useEffect } from "react";
import { noteArrival } from "@/lib/arrival";
import { clarity } from "@/lib/analytics";

/**
 * Notes where the visit came from on its first page, before any navigation
 * inside the site. A visit from an in-app browser is tagged in Clarity, whose
 * own referrer report would show it as direct.
 */
export function Arrival() {
  useEffect(() => {
    const { inApp } = noteArrival();
    if (inApp) clarity("set", "in_app", inApp);
  }, []);
  return null;
}
