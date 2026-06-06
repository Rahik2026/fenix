"use client";

import { useEffect, useState } from "react";
import { isFirebaseConfigured } from "@/lib/firebase";
import { subscribeProducts, subscribeCategories } from "@/lib/db";
import { SEED_PRODUCTS, SEED_CATEGORIES } from "@/lib/seed";
import type { Product, Category } from "@/types";

export function useProducts(includeDisabled = false) {
  const [products, setProducts] = useState<Product[]>(
    isFirebaseConfigured ? [] : SEED_PRODUCTS
  );
  const [loading, setLoading] = useState(isFirebaseConfigured);

  useEffect(() => {
    if (!isFirebaseConfigured) {
      setProducts(
        includeDisabled
          ? SEED_PRODUCTS
          : SEED_PRODUCTS.filter((p) => p.enabled !== false)
      );
      return;
    }
    const unsub = subscribeProducts((items) => {
      setProducts(items);
      setLoading(false);
    }, includeDisabled);
    return () => unsub();
  }, [includeDisabled]);

  return { products, loading };
}

export function useCategories(includeDisabled = false) {
  const [categories, setCategories] = useState<Category[]>(
    isFirebaseConfigured ? [] : SEED_CATEGORIES
  );

  useEffect(() => {
    if (!isFirebaseConfigured) {
      setCategories(
        includeDisabled
          ? SEED_CATEGORIES
          : SEED_CATEGORIES.filter((c) => c.enabled !== false)
      );
      return;
    }
    const unsub = subscribeCategories(setCategories, includeDisabled);
    return () => unsub();
  }, [includeDisabled]);

  return { categories };
}
