import type { Metadata } from "next";
import { BrandSettingsProvider } from "@/components/brand/brand-settings-provider";
import { ThemeProvider } from "@/components/theme/theme-provider";
import { ThemeScript } from "@/components/theme/theme-script";
import { getPublicSiteSettings } from "@/lib/site-settings";
import { geistMono, inter, spaceGrotesk } from "./fonts";
import "./globals.css";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getPublicSiteSettings();
  return {
    title: {
      default: "Mr.Software",
      template: "%s | Mr.Software",
    },
    description:
      "AI-assisted startup building with full developer control — design, draft, deploy anywhere, and monetize in an open builder ecosystem.",
    icons: {
      icon: [{ url: settings.logoUrl }],
      apple: settings.logoUrl,
    },
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const siteSettings = await getPublicSiteSettings();

  return (
    <html
      lang="en"
      data-theme="light"
      suppressHydrationWarning
      className={`${inter.variable} ${spaceGrotesk.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <ThemeScript />
      </head>
      <body className="flex min-h-dvh flex-col bg-[var(--background)] font-sans text-[var(--foreground)]">
        <ThemeProvider>
          <BrandSettingsProvider logoUrl={siteSettings.logoUrl}>
            {children}
          </BrandSettingsProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
