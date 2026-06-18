import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SoftwareDetailView } from "@/components/software/software-detail-view";
import { getSoftwareById, getSoftwareDetailBundle, recordSoftwareView } from "@/lib/data/software";
import { userHasDownloadEntitlement } from "@/lib/monetization/entitlement";
import { isStripeConfigured } from "@/lib/monetization/stripe-server";
import { isChapaConfigured, isTelebirrEnabled } from "@/lib/payments/chapa";
import { getSession } from "@/lib/auth/session";

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const item = await getSoftwareById(id);
  if (!item) return { title: "Not found" };
  return {
    title: item.name,
    description: item.shortDescription,
    openGraph: {
      images: [{ url: item.thumbnailUrl, width: 1200, height: 675, alt: item.name }],
    },
  };
}

export default async function SoftwareDetailPage({ params }: Props) {
  const { id } = await params;
  const bundle = await getSoftwareDetailBundle(id);
  if (!bundle) notFound();

  const { item: rawItem, software } = bundle;
  const session = await getSession();

  const isOwner = session?.id === software.developerId;
  let item = rawItem;
  if (!isOwner) {
    await recordSoftwareView(id, session?.id);
    item = { ...rawItem, viewCount: (rawItem.viewCount ?? 0) + 1 };
  }

  const entitled = await userHasDownloadEntitlement({
    user: session ? { id: session.id, status: session.status } : null,
    software,
  });

  const developerVerified = software.developer.storefront?.verified ?? false;

  const stripeConfigured = isStripeConfigured();
  const chapaConfigured = isChapaConfigured();
  const telebirrEnabled = isTelebirrEnabled();
  const devCheckoutEnabled =
    process.env.NODE_ENV === "development" &&
    process.env.ENABLE_DEV_CHECKOUT === "true";

  return (
    <SoftwareDetailView
      item={item}
      developerVerified={developerVerified}
      entitled={entitled}
      hasSession={!!session}
      isOwner={isOwner}
      stripeConfigured={stripeConfigured}
      chapaConfigured={chapaConfigured}
      telebirrEnabled={telebirrEnabled}
      devCheckoutEnabled={devCheckoutEnabled}
    />
  );
}
