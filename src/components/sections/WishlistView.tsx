"use client";

import Link from "next/link";
import ProductCard from "@/components/ui/ProductCard";
import { useProducts } from "@/lib/useData";
import { useAuth } from "@/context/AuthContext";

export default function WishlistView() {
  const { products } = useProducts();
  const { user, profile, loading } = useAuth();

  if (loading) {
    return <div className="container-x py-20 text-center text-muted">Loading…</div>;
  }

  if (!user) {
    return (
      <div className="container-x py-16 text-center">
        <h1 className="serif-title text-3xl md:text-4xl mb-3 text-[#122033]">Your wishlist</h1>
        <p className="text-muted mb-6">Sign in to save products to your wishlist.</p>
        <Link href="/auth" className="btn">Sign in</Link>
      </div>
    );
  }

  const items = products.filter((p) => profile?.wishlist?.includes(p.id));

  return (
    <div className="container-x py-8 md:py-12">
      <h1 className="serif-title text-[30px] md:text-[44px] text-[#122033] mb-6">Your wishlist</h1>
      {items.length === 0 ? (
        <div className="card p-10 text-center text-muted">
          No saved items yet.
          <Link href="/shop" className="block mx-auto mt-4 btn w-fit">Browse products</Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
          {items.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}
