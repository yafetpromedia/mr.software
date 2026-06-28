import { isRuntimeBrandUpload } from "@/lib/branding/upload-path";
import Image from "next/image";

type Props = {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  fill?: boolean;
  sizes?: string;
  priority?: boolean;
};

/** Renders admin-uploaded brand assets with a plain img (always works). Built-ins use next/image. */
export function BrandAssetImage({
  src,
  alt,
  className,
  width,
  height,
  fill,
  sizes,
  priority,
}: Props) {
  if (isRuntimeBrandUpload(src)) {
    if (fill) {
      return (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={alt}
          className={`absolute inset-0 h-full w-full ${className ?? ""}`}
        />
      );
    }
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={src} alt={alt} width={width} height={height} className={className} />
    );
  }

  if (fill) {
    return <Image src={src} alt={alt} fill className={className} sizes={sizes} priority={priority} />;
  }

  return (
    <Image
      src={src}
      alt={alt}
      width={width ?? 48}
      height={height ?? 48}
      className={className}
      sizes={sizes}
      priority={priority}
    />
  );
}
