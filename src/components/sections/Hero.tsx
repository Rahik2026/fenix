"use client";

import Link from "next/link";
import SmartImage from "@/components/ui/SmartImage";
import { useSettings } from "@/context/SettingsContext";

export default function Hero() {
  const { heroBanner: hero } = useSettings();

  return (
    <section
      className="relative overflow-hidden text-white"
      style={{
        background: `linear-gradient(95deg, rgba(10,26,40,0.78) 0%, rgba(6,14,24,0.6) 42%, rgba(3,7,12,0.85) 100%), url('${hero.image}') center/cover no-repeat`,
      }}
    >
      {/* 16:9 cinematic framing */}
      <div className="container-x relative z-10 grid items-center gap-4 py-7 md:py-10 md:grid-cols-[1.02fr_0.98fr] md:min-h-[min(560px,56.25vw)]">
        <div className="grid gap-3 md:gap-4 animate-fadeUp">
          <span className="w-fit inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-white/15 bg-white/10 text-[10px] md:text-xs tracking-[0.14em] uppercase">
            {hero.eyebrow}
          </span>
          <h1 className="serif-title text-white text-[30px] leading-[0.98] md:text-[clamp(44px,6.5vw,72px)]">
            {hero.title}
          </h1>
          <p className="text-white/85 text-sm md:text-base leading-relaxed max-w-xl">
            {hero.copy}
          </p>
          <div className="flex flex-wrap gap-2 md:gap-3 mt-1">
            <Link href={hero.primaryLink} className="btn">
              {hero.primaryLabel}
            </Link>
            <Link href={hero.secondaryLink} className="btn-outline">
              {hero.secondaryLabel}
            </Link>
          </div>
          <div className="grid grid-cols-3 gap-2 mt-3 max-w-lg">
            {[
              ["100%", "Premium finish"],
              ["2-4d", "Fast nationwide delivery"],
              ["7d", "Easy returns"],
            ].map(([n, l]) => (
              <div
                key={l}
                className="rounded-2xl border border-white/12 bg-[rgba(6,18,31,0.4)] backdrop-blur px-2.5 py-2.5"
              >
                <strong className="block text-base md:text-lg">{n}</strong>
                <span className="text-white/65 text-[10px] md:text-xs leading-tight">
                  {l}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-center md:justify-end items-center">
          <div className="relative w-[160px] h-[200px] md:w-[380px] md:h-[440px]">
            <SmartImage
              src={hero.productImage}
              alt="Featured FENIX product"
              fill
              priority
              sizes="(max-width:768px) 160px, 380px"
              className="object-contain animate-floatHero drop-shadow-[0_22px_42px_rgba(0,0,0,0.4)]"
            />
          </div>
        </div>
      </div>

      <div
        className="border-y border-white/10"
        style={{
          background: "linear-gradient(90deg,#09111f 0%,#17415d 100%)",
        }}
      >
        <div className="container-x flex flex-wrap gap-x-4 gap-y-1.5 py-2.5 text-white/95 text-xs md:text-sm">
          <span>✓ Premium sportswear finish</span>
          <span>✓ Mobile-first shopping</span>
          <span>✓ Manual bKash verification</span>
          <span>✓ Real-time CMS updates</span>
        </div>
      </div>
    </section>
  );
}
