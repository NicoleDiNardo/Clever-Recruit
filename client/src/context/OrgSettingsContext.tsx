import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';

const STORAGE_KEY = 'cr-org-settings-v1';

export interface OrgSettings {
  name: string;
  logoUrl: string;
}

const DEFAULT_SETTINGS: OrgSettings = {
  name: 'Clever Recruit',
  logoUrl: '',
};

function loadSettings(): OrgSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return { ...DEFAULT_SETTINGS, ...(JSON.parse(raw) as Partial<OrgSettings>) };
  } catch {
    /* ignore */
  }
  return DEFAULT_SETTINGS;
}

interface OrgSettingsContextType {
  settings: OrgSettings;
  updateSettings: (next: OrgSettings) => void;
}

const OrgSettingsContext = createContext<OrgSettingsContextType | null>(null);

/**
 * Minimal organisation settings — name and logo, per the product definition's
 * reduced admin scope (full org-settings/audit-log surfaces are [Future
 * scope]). Same Context + localStorage shape as OrgUsersContext, since there
 * is no deployed backend for either to persist against.
 */
export function OrgSettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<OrgSettings>(loadSettings);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => setHydrated(true), []);
  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  }, [settings, hydrated]);

  const updateSettings = useCallback((next: OrgSettings) => setSettings(next), []);

  return (
    <OrgSettingsContext.Provider value={{ settings, updateSettings }}>
      {children}
    </OrgSettingsContext.Provider>
  );
}

export function useOrgSettings() {
  const ctx = useContext(OrgSettingsContext);
  if (!ctx) throw new Error('useOrgSettings must be used within OrgSettingsProvider');
  return ctx;
}
