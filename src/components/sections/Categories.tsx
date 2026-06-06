"use client";

import Link from "next/link";
import SmartImage from "@/components/ui/SmartImage";
import { useCategories } from "@/lib/useData";
import { useSettings } from "@/context/SettingsContext";

export default function Categories() {
  const { categories } = useCategories();
  const settings = useSettings();

  return (
    <section className="py-10 md:py-12 bg-white/55">
      <div className="container-x">
        <div className="grid gap-2 mb-6">
          <span className="kicker">{settings.categoriesKicker}</span>
          <h2 className="serif-title text-[28px] md:text-[44px] text-[#122033]">
            {settings.categoriesTitle}
          </h2>
          <p className="text-muted leading-relaxed max-w-2xl text-sm md:text-base">
            {settings.categoriesCopy}
          </p>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/shop?category=${cat.slug}`}
              className="group relative rounded-xl2 overflow-hidden border border-line shadow-soft"
            >
              <div className="relative aspect-[4/3] md:aspect-[16/9]">
                <SmartImage
                  src={cat.image}
                  alt={cat.name}
                  fill
                  sizes="(max-width:768px) 50vw, 25vw"
                  className="object-cover transition-transform duration-200 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
              </div>
              <div className="absolute bottom-0 inset-x-0 p-3 text-white">
                <h3 className="serif-title text-lg leading-tight">{cat.name}</h3>
                <p className="text-white/80 text-xs line-clamp-1">
                  {cat.description}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
