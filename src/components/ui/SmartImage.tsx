"use client";

import Image, { type ImageProps } from "next/image";
import { useState } from "react";

const FALLBACK = "/assets/products/product-1-main.jpg";

type Props = Omit<ImageProps, "src" | "alt"> & {
  src?: string | null;
  alt: string;
};

/**
 * Wraps next/image. Local (/assets) and Supabase remote URLs both work.
 * Falls back to a local placeholder on error so previews never break.
 */
export default function SmartImage({ src, alt, ...rest }: Props) {
  const [errored, setErrored] = useState(false);
  const finalSrc = errored || !src ? FALLBACK : src;
  return (
    <Image
      src={finalSrc}
      alt={alt}
      onError={() => setErrored(true)}
      {...rest}
    />
  );
}
