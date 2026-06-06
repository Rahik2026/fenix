"use client";

import { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import ProductCard from "@/components/ui/ProductCard";
import { useProducts } from "@/lib/useData";
import { SearchIcon } from "@/components/ui/icons";

export default function SearchView() {
  const params = useSearchParams();
  const { products } = useProducts();
  const [q, setQ] = useState(params.get("q") || "");

  useEffect(() => {
    const el = document.getElementById("search-input");
    el?.focus();
  }, []);

  const results = useMemo(() => {
    if (!q.trim()) return [];
    const term = q.toLowerCase();
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(term) ||
        p.description.toLowerCase().includes(term) ||
        p.category.toLowerCase().includes(term)
    );
  }, [q, products]);

  return (
    <div className="container-x py-8 md:py-12">
      <h1 className="serif-title text-[30px] md:text-[44px] text-[#122033] mb-5">
        Search products
      </h1>
      <div className="relative max-w-2xl mb-8">
        <SearchIcon className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
        <input
          id="search-input"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Type to search jerseys, tees, bottoms…"
          className="input pl-12"
        />
      </div>

      {q.trim() === "" ? (
        <p className="text-muted">Start typing to find products.</p>
      ) : results.length === 0 ? (
        <p className="text-muted">No products found for “{q}”.</p>
      ) : (
        <>
          <p className="text-muted mb-5">{results.length} result(s)</p>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
            {results.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
