"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import ProductCard from "@/components/ui/ProductCard";
import { useProducts, useCategories } from "@/lib/useData";
import { cx } from "@/lib/utils";

export default function ShopGrid() {
  const params = useSearchParams();
  const { products, loading } = useProducts();
  const { categories } = useCategories();

  const initialCat = params.get("category") || "all";
  const initialSort = params.get("sort") || "featured";
  const initialQuery = params.get("q") || "";

  const [search, setSearch] = useState(initialQuery);
  const [category, setCategory] = useState(initialCat);
  const [sort, setSort] = useState(initialSort);

  const filtered = useMemo(() => {
    let list = [...products];
    if (category !== "all") {
      list = list.filter(
        (p) =>
          p.categoryId === category ||
          categories.find((c) => c.slug === category)?.id === p.categoryId
      );
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q)
      );
    }
    switch (sort) {
      case "price-low":
        list.sort((a, b) => a.offerPrice - b.offerPrice);
        break;
      case "price-high":
        list.sort((a, b) => b.offerPrice - a.offerPrice);
        break;
      case "new":
        list.sort((a, b) => Number(b.newArrival) - Number(a.newArrival));
        break;
      default:
        list.sort((a, b) => Number(b.featured) - Number(a.featured));
    }
    return list;
  }, [products, categories, category, search, sort]);

  return (
    <div className="container-x py-8 md:py-10">
      <div className="grid gap-2 mb-6">
        <span className="kicker">Shop</span>
        <h1 className="serif-title text-[30px] md:text-[44px] text-[#122033]">
          All products
        </h1>
        <p className="text-muted text-sm md:text-base">
          {loading ? "Loading…" : `${filtered.length} products available`}
        </p>
      </div>

      <div className="grid gap-3 md:grid-cols-[1.4fr_auto_auto] mb-6">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search jerseys, tees, bottoms…"
          className="input"
        />
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="input md:w-48"
        >
          <option value="all">All categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.slug}>
              {c.name}
            </option>
          ))}
        </select>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          className="input md:w-48"
        >
          <option value="featured">Featured</option>
          <option value="new">New arrivals</option>
          <option value="price-low">Price: low to high</option>
          <option value="price-high">Price: high to low</option>
        </select>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="aspect-[3/4] rounded-xl2 bg-line/50 animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="card p-10 text-center text-muted">
          No products match your filters.
          <button
            className="block mx-auto mt-4 btn-ghost"
            onClick={() => {
              setSearch("");
              setCategory("all");
              setSort("featured");
            }}
          >
            Clear filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
          {filtered.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}
