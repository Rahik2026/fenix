"use client";

import ProductCard from "@/components/ui/ProductCard";
import { useProducts } from "@/lib/useData";
import { useSettings } from "@/context/SettingsContext";

export default function FeaturedProducts() {
  const { products, loading } = useProducts();
  const settings = useSettings();
  const featured = products.filter((p) => p.featured).slice(0, 8);
  const list = featured.length ? featured : products.slice(0, 8);

  return (
    <section id="featured" className="py-10 md:py-12">
      <div className="container-x">
        <div className="grid gap-2 mb-6">
          <span className="kicker">{settings.featuredKicker}</span>
          <h2 className="serif-title text-[28px] md:text-[44px] text-[#122033]">
            {settings.featuredTitle}
          </h2>
          <p className="text-muted leading-relaxed max-w-2xl text-sm md:text-base">
            {settings.featuredCopy}
          </p>
        </div>
        {loading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="aspect-[3/4] rounded-xl2 bg-line/50 animate-pulse"
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
            {list.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
