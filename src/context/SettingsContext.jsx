/* eslint-disable react-refresh/only-export-components -- context + hook + helpers intentionally live together in one file for easy handoff */
import { createContext, useContext, useEffect, useState } from "react";

/**
 * Site-wide settings (year, dates, copy, recap photos) fetched once from the
 * backend and shared with every page. Edit these in the admin dashboard's
 * "Settings" tab — no code changes needed to roll the site over to a new year.
 *
 * The DEFAULTS below are a safety net: if the API is ever unreachable, the site
 * still renders sensible content instead of blank spots.
 */

export const DEFAULT_SETTINGS = {
  eventName: "Research Forum",
  year: 2026,
  university: "Northeast Ohio Medical University",
  eventDate: "February 25, 2026",
  eventTime: "4:00 PM",
  contactEmail: "sbadat@neomed.edu",
  submissionsOpen: true,
  submissionDeadlineText: "January 12, 2026",
  keyDates: [
    { date: "Dec 15, 2025", title: "Submissions Open", status: "complete" },
    { date: "Jan 12, 2026", title: "Submission Deadline", status: "complete" },
    { date: "Jan 28, 2026", title: "Acceptance Notification", status: "complete" },
    { date: "Feb 21, 2026", title: "Final Presentation Due", status: "complete" },
    { date: "Feb 25, 2026", title: "Research Forum Day", status: "current" },
  ],
  confirmByText: "Friday, February 6, 2026 at 11:59 PM",
  confirmDeadlineDisplay: "Thursday, February 5, 2026",
  presentationDueText: "Saturday, February 21, 2026 at 11:59 PM",
  reviewPeriodText: "January 13 – 28, 2026",
  decisionNotificationText: "January 28, 2026",
  recapPhotos: [
    { url: "/recap/recap-1.jpg", caption: "" },
    { url: "/recap/recap-2.jpg", caption: "" },
    { url: "/recap/recap-3.jpg", caption: "" },
    { url: "/recap/recap-4.jpg", caption: "" },
    { url: "/recap/recap-5.jpg", caption: "" },
    { url: "/recap/recap-6.jpg", caption: "" },
    { url: "/recap/recap-7.jpg", caption: "" },
    { url: "/recap/recap-8.jpg", caption: "" },
    { url: "/recap/recap-9.jpg", caption: "" },
  ],
};

// Convenience: full event name with year, e.g. "Research Forum 2026".
export const eventTitle = (s) => `${s.eventName} ${s.year}`;

const SettingsContext = createContext({
  settings: DEFAULT_SETTINGS,
  loading: true,
  refresh: () => {},
});

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);

  const fetchSettings = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/settings`);
      const data = await res.json();
      if (data.success && data.data) {
        // Merge over defaults so any new field always has a value.
        setSettings({ ...DEFAULT_SETTINGS, ...data.data });
      }
    } catch (e) {
      console.error("Error fetching settings (using defaults):", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  return (
    <SettingsContext.Provider
      value={{ settings, loading, refresh: fetchSettings }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

// Hook used by pages: `const { settings } = useSettings();`
export function useSettings() {
  return useContext(SettingsContext);
}
