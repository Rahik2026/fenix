"use client";

import Link from "next/link";
import { useSettings } from "@/context/SettingsContext";

export default function Brand({
  dark = false,
  size = "md",
}: {
  dark?: boolean;
  size?: "sm" | "md";
}) {
  const settings = useSettings();
  const wordSize = size === "sm" ? "text-3xl md:text-4xl" : "text-3xl md:text-5xl";
  return (
    <Link
      href="/"
      aria-label={`${settings.storeName} home`}
      className={`inline-flex flex-col gap-0.5 leading-none ${
        dark ? "text-white" : "text-[#0a0f16]"
      }`}
    >
      <span className={`serif-title font-normal ${wordSize}`}>
        {settings.storeName}
      </span>
      <span
        className={`h-px w-full ${dark ? "bg-white/80" : "bg-ink/70"}`}
        aria-hidden
      />
      <span className="text-[9px] md:text-[11px] tracking-[0.16em] uppercase">
        {settings.tagline}
      </span>
    </Link>
  );
}
