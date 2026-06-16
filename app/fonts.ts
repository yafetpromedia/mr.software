import { Geist_Mono, Inter, Space_Grotesk } from "next/font/google";

/** Body / UI: readable, product-grade (Stripe/Vercel style). */
export const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

/**
 * Headings & display: modern, technical, not playful.
 * Pair with `font-display` in Tailwind.
 */
export const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space",
  display: "swap",
  weight: ["400", "500", "600", "700"],
  adjustFontFallback: true,
});

/** Code, terminals, mono labels. */
export const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono-family",
  display: "swap",
});
