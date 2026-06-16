import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

export default function SiteLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <SiteHeader />
      <main className="flex-1 [&_h1]:font-display [&_h1]:tracking-tight [&_h2]:font-display [&_h2]:tracking-tight [&_h3]:font-display [&_h3]:tracking-tight">
        {children}
      </main>
      <SiteFooter />
    </>
  );
}
