export const TOUR_STORAGE_KEY = "biospace_tour_dismissed_v1";

/**
 * Dispatch a custom event to open the interactive platform tour from anywhere
 */
export function openPlatformTour() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("open-biospace-tour"));
  }
}
