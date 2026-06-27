"use client";

import { BrandAssetImage } from "@/components/brand/brand-asset-image";
import { useBrandSettings } from "@/components/brand/brand-settings-provider";

const DIM = { sm: 32, md: 36, lg: 44 } as const;

export type LogoMarkSize = keyof typeof DIM;

type Props = {
  size?: LogoMarkSize;
  className?: string;
  priority?: boolean;
  rounded?: "lg" | "xl" | "2xl";
  src?: string;
};

const roundedCls = { lg: "rounded-lg", xl: "rounded-xl", "2xl": "rounded-2xl" } as const;

export function LogoMark({
  size = "sm",
  className,
  priority = false,
  rounded = "lg",
  src,
}: Props) {
  const { logoUrl } = useBrandSettings();
  const dim = DIM[size];
  const resolvedSrc = src ?? logoUrl;
  return (
    <span
      className={`relative inline-flex shrink-0 overflow-hidden bg-transparent ring-1 ring-inset ring-black/[0.08] dark:ring-white/[0.12] ${roundedCls[rounded]} ${className ?? ""}`}
      style={{ width: dim, height: dim }}
    >
      <BrandAssetImage
        src={resolvedSrc}
        alt="Mr.Software"
        width={dim}
        height={dim}
        priority={priority}
        className="object-contain p-[2px]"
        sizes={`${dim}px`}
      />
    </span>
  );
}
