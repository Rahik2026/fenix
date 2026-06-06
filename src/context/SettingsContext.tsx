"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { isFirebaseConfigured } from "@/lib/firebase";
import { subscribeSettings } from "@/lib/db";
import { SEED_SETTINGS } from "@/lib/seed";
import type { SiteSettings } from "@/types";

const SettingsContext = createContext<SiteSettings>(SEED_SETTINGS);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<SiteSettings>(SEED_SETTINGS);

  useEffect(() => {
    if (!isFirebaseConfigured) return;
    const unsub = subscribeSettings((s) =>
      setSettings({ ...SEED_SETTINGS, ...s })
    );
    return () => unsub();
  }, []);

  return (
    <SettingsContext.Provider value={settings}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  return useContext(SettingsContext);
}
