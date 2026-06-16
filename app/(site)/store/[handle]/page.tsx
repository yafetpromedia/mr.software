import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { StorefrontView } from "@/components/storefront/storefront-view";
import { getSession } from "@/lib/auth/session";
import { getStorefrontByHandle, getDeveloperHandle, recordStorefrontView } from "@/lib/storefront/storefront";

type Props = {
  params: Promise<{ handle: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { handle } = await params;
  const store = await getStorefrontByHandle(handle);
  if (!store) return { title: "Store not found" };
  return {
    title: `${store.name} (@${store.handle})`,
    description:
      store.tagline ??
      `Products and software by ${store.name} on Mr.Software.`,
  };
}

export default async function DeveloperStorefrontPage({ params }: Props) {
  const { handle } = await params;
  const session = await getSession();
  await recordStorefrontView(handle);
  const store = await getStorefrontByHandle(handle, session?.id);
  if (!store) notFound();

  const myHandle = session ? await getDeveloperHandle(session.id) : null;
  const isStoreOwner = myHandle === store.handle;

  return <StorefrontView store={store} isStoreOwner={isStoreOwner} />;
}
