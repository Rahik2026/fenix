"use client";

import Link from "next/link";
import SmartImage from "@/components/ui/SmartImage";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { useSettings } from "@/context/SettingsContext";
import { useToast } from "@/components/ui/Toast";
import { HeartIcon, CartIcon } from "@/components/ui/icons";
import { formatCurrency, discountPercent, cx } from "@/lib/utils";
import type { Product } from "@/types";

export default function ProductCard({ product }: { product: Product }) {
  const { addItem, setDrawerOpen } = useCart();
  const { profile, toggleWishlist, user } = useAuth();
  const settings = useSettings();
  const { toast } = useToast();

  const off = discountPercent(product.originalPrice, product.offerPrice);
  const wished = profile?.wishlist?.includes(product.id);
  const lowStock = product.stock > 0 && product.stock <= settings.lowStockThreshold;
  const outOfStock = product.stock <= 0;

  const quickAdd = () => {
    if (outOfStock) return;
    addItem({
      productId: product.id,
      name: product.name,
      image: product.mainImage,
      size: product.sizeOptions[0] || "M",
      quantity: 1,
      unitPrice: product.offerPrice,
      stock: product.stock,
    });
    toast("Added to cart", "success");
    setDrawerOpen(true);
  };

  return (
    <article className="group relative flex flex-col rounded-xl2 border border-line bg-white shadow-soft overflow-hidden transition-transform duration-150 hover:-translate-y-1 hover:shadow-lift">
      <div className="relative mx-3 mt-3 rounded-2xl overflow-hidden bg-gradient-to-b from-[#eff5fb] to-[#f9fbff] aspect-square">
        <Link href={`/product/${product.id}`} className="absolute inset-0 z-[2]" aria-label={product.name} />
        <SmartImage
          src={product.mainImage}
          alt={product.name}
          fill
          sizes="(max-width:768px) 50vw, 25vw"
          className="object-cover transition-transform duration-200 group-hover:scale-[1.04]"
        />
        {off > 0 && (
          <span className="absolute top-2 left-2 pill-gold z-[3]">-{off}%</span>
        )}
        {user && (
          <button
            onClick={() => {
              toggleWishlist(product.id);
              toast(wished ? "Removed from wishlist" : "Added to wishlist");
            }}
            className={cx(
              "absolute top-2 right-2 z-[3] w-9 h-9 grid place-items-center rounded-full backdrop-blur transition-colors",
              wished ? "bg-danger text-white" : "bg-white/85 text-ink hover:bg-white"
            )}
            aria-label="Wishlist"
          >
            <HeartIcon className="w-4.5 h-4.5" />
          </button>
        )}
      </div>
      <div className="relative z-[1] grid gap-2 p-3 pt-3">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="pill text-[10px] px-2 py-1">{product.category}</span>
          {outOfStock ? (
            <span className="pill text-[10px] px-2 py-1 status-cancelled">Sold out</span>
          ) : lowStock ? (
            <span className="pill text-[10px] px-2 py-1 status-submitted">Low stock</span>
          ) : null}
        </div>
        <h3 className="serif-title text-base md:text-lg leading-tight text-[#122033] line-clamp-2">
          {product.name}
        </h3>
        <div className="flex items-end gap-2">
          <span className="font-bold text-lg">
            {formatCurrency(product.offerPrice, settings.currency)}
          </span>
          {off > 0 && (
            <span className="text-muted line-through text-sm">
              {formatCurrency(product.originalPrice, settings.currency)}
            </span>
          )}
        </div>
        <button
          onClick={quickAdd}
          disabled={outOfStock}
          className={cx(
            "relative z-[3] mt-1 inline-flex items-center justify-center gap-2 min-h-[40px] rounded-xl font-bold text-sm transition-all",
            outOfStock
              ? "bg-line text-muted cursor-not-allowed"
              : "text-white hover:-translate-y-0.5"
          )}
          style={
            outOfStock
              ? undefined
              : { background: "linear-gradient(180deg,#2a648d,#183954)" }
          }
        >
          <CartIcon className="w-4 h-4" />
          {outOfStock ? "Out of stock" : "Add to cart"}
        </button>
      </div>
    </article>
  );
}
