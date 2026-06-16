"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { DEFAULT_LOGO_URL } from "@/lib/branding/constants";

type BrandSettings = {
  logoUrl: string;
};

const BrandSettingsContext = createContext<BrandSettings>({
  logoUrl: DEFAULT_LOGO_URL,
});

export function BrandSettingsProvider({
  logoUrl,
  children,
}: {
  logoUrl: string;
  children: ReactNode;
}) {
  const [overrideLogoUrl, setOverrideLogoUrl] = useState<string | null>(null);

  useEffect(() => {
    function onLogoUpdated(event: Event) {
      const customEvent = event as CustomEvent<{ logoUrl?: string }>;
      const nextLogo = customEvent.detail?.logoUrl?.trim();
      if (nextLogo) {
        setOverrideLogoUrl(nextLogo);
      }
    }
    window.addEventListener("mr:brand-logo-updated", onLogoUpdated as EventListener);
    return () => {
      window.removeEventListener("mr:brand-logo-updated", onLogoUpdated as EventListener);
    };
  }, []);

  const resolvedLogoUrl = overrideLogoUrl ?? logoUrl;

  return (
    <BrandSettingsContext.Provider value={{ logoUrl: resolvedLogoUrl }}>
      {children}
    </BrandSettingsContext.Provider>
  );
}

export function useBrandSettings() {
  return useContext(BrandSettingsContext);
}
