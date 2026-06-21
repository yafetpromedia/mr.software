import { getSoftwareDetailBundle, recordSoftwareView } from "@/lib/data/software";
import { userHasDownloadEntitlement } from "@/lib/monetization/entitlement";
import { getAppOpenUrlForSoftware } from "@/lib/portal/resolve-app-open-url";
import { isStripeConfigured } from "@/lib/monetization/stripe-server";
import { isChapaConfigured, isTelebirrEnabled } from "@/lib/payments/chapa";
import type { AuthSession } from "@/lib/auth/session";

export async function buildSoftwareDetailViewProps(
  id: string,
  session: AuthSession | null,
) {
  const bundle = await getSoftwareDetailBundle(id);
  if (!bundle) return null;

  const { item: rawItem, software } = bundle;
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

  const hostedAppUrl =
    software.distributionType === "HOSTED" ? await getAppOpenUrlForSoftware(id) : null;

  return {
    item,
    developerVerified: software.developer.storefront?.verified ?? false,
    entitled,
    hostedAppUrl,
    hasSession: Boolean(session),
    isOwner,
    stripeConfigured: isStripeConfigured(),
    chapaConfigured: isChapaConfigured(),
    telebirrEnabled: isTelebirrEnabled(),
    devCheckoutEnabled:
      process.env.NODE_ENV === "development" &&
      process.env.ENABLE_DEV_CHECKOUT === "true",
  };
}
