"use client";

import { useState } from "react";
import { notFound } from "next/navigation";
import SmartImage from "@/components/ui/SmartImage";
import ProductCard from "@/components/ui/ProductCard";
import { useProducts } from "@/lib/useData";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { useSettings } from "@/context/SettingsContext";
import { useToast } from "@/components/ui/Toast";
import { HeartIcon, PlusIcon, MinusIcon, CheckIcon } from "@/components/ui/icons";
import { formatCurrency, discountPercent, cx } from "@/lib/utils";

export default function ProductDetail({ id }: { id: string }) {
  const { products, loading } = useProducts();
  const { addItem, setDrawerOpen } = useCart();
  const { profile, user, toggleWishlist } = useAuth();
  const settings = useSettings();
  const { toast } = useToast();

  const product = products.find((p) => p.id === id);
  const [activeImg, setActiveImg] = useState(0);
  const [size, setSize] = useState("");
  const [qty, setQty] = useState(1);

  if (loading) {
    return (
      <div className="container-x py-16">
        <div className="grid md:grid-cols-2 gap-8">
          <div className="aspect-[4/3] rounded-xl3 bg-line/50 animate-pulse" />
          <div className="grid gap-4">
            <div className="h-8 bg-line/50 rounded animate-pulse" />
            <div className="h-24 bg-line/50 rounded animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) return notFound();

  const gallery = [product.mainImage, ...(product.detailImages || [])].filter(Boolean);
  const off = discountPercent(product.originalPrice, product.offerPrice);
  const wished = profile?.wishlist?.includes(product.id);
  const outOfStock = product.stock <= 0;
  const lowStock = product.stock > 0 && product.stock <= settings.lowStockThreshold;
  const related = products
    .filter((p) => p.categoryId === product.categoryId && p.id !== product.id)
    .slice(0, 4);

  const handleAdd = () => {
    if (outOfStock) return;
    const chosen = size || product.sizeOptions[0] || "M";
    addItem({
      productId: product.id,
      name: product.name,
      image: product.mainImage,
      size: chosen,
      quantity: qty,
      unitPrice: product.offerPrice,
      stock: product.stock,
    });
    toast("Added to cart", "success");
    setDrawerOpen(true);
  };

  return (
    <div className="container-x py-8 md:py-12">
      <nav className="text-xs text-muted mb-5">
        <a href="/" className="hover:text-ink">Home</a> / {" "}
        <a href="/shop" className="hover:text-ink">Shop</a> / {" "}
        <span className="text-ink">{product.name}</span>
      </nav>

      <div className="grid gap-6 lg:grid-cols-[1.02fr_0.98fr] items-start">
        {/* Gallery */}
        <div className="grid gap-3 lg:grid-cols-[88px_1fr]">
          <div className="order-2 lg:order-1 grid grid-cols-4 lg:grid-cols-1 gap-2.5">
            {gallery.map((img, i) => (
              <button
                key={i}
                onClick={() => setActiveImg(i)}
                className={cx(
                  "relative aspect-square rounded-2xl overflow-hidden border bg-white",
                  activeImg === i
                    ? "border-primary-2 ring-2 ring-primary-2/15"
                    : "border-line"
                )}
                aria-label={`View image ${i + 1}`}
              >
                <SmartImage src={img} alt="" fill sizes="88px" className="object-cover" />
              </button>
            ))}
          </div>
          <div className="order-1 lg:order-2 relative aspect-[4/3] rounded-xl3 overflow-hidden border border-line shadow-lift bg-gradient-to-b from-[#eef5fb] to-[#f9fbff]">
            <SmartImage
              src={gallery[activeImg]}
              alt={product.name}
              fill
              priority
              sizes="(max-width:1024px) 100vw, 50vw"
              className="object-cover"
            />
            {off > 0 && (
              <span className="absolute top-3 left-3 pill-gold">-{off}% OFF</span>
            )}
          </div>
        </div>

        {/* Info */}
        <div className="grid gap-4">
          <div className="grid gap-2">
            <div className="flex flex-wrap gap-2">
              <span className="pill">{product.category}</span>
              {outOfStock ? (
                <span className="pill status-cancelled">Sold out</span>
              ) : lowStock ? (
                <span className="pill status-submitted">
                  Low stock · {product.stock} left
                </span>
              ) : (
                <span className="pill status-delivered">In stock</span>
              )}
            </div>
            <h1 className="serif-title text-3xl md:text-4xl text-[#122033]">
              {product.name}
            </h1>
            <p className="text-muted text-sm md:text-base leading-relaxed">
              {product.description}
            </p>
          </div>

          <div className="flex items-end gap-3">
            <strong className="serif-title text-3xl">
              {formatCurrency(product.offerPrice, settings.currency)}
            </strong>
            {off > 0 && (
              <span className="text-muted line-through text-lg">
                {formatCurrency(product.originalPrice, settings.currency)}
              </span>
            )}
          </div>

          {/* Sizes */}
          <div className="grid gap-2">
            <span className="label mb-0">Select size</span>
            <div className="flex flex-wrap gap-2">
              {product.sizeOptions.map((s) => (
                <button
                  key={s}
                  onClick={() => setSize(s)}
                  className={cx(
                    "min-w-[52px] min-h-[42px] px-3 rounded-full border font-bold transition-colors",
                    (size || product.sizeOptions[0]) === s
                      ? "text-white border-transparent"
                      : "bg-white border-line text-ink hover:border-primary-2"
                  )}
                  style={
                    (size || product.sizeOptions[0]) === s
                      ? { background: "linear-gradient(180deg,#2a648d,#183954)" }
                      : undefined
                  }
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Quantity + actions */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="inline-flex items-center gap-3 p-1.5 rounded-full border border-line bg-[#f5f8fc]">
              <button
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                className="w-9 h-9 grid place-items-center rounded-full border border-line bg-white"
                aria-label="Decrease quantity"
              >
                <MinusIcon className="w-4 h-4" />
              </button>
              <span className="w-6 text-center font-bold">{qty}</span>
              <button
                onClick={() => setQty((q) => Math.min(product.stock || 99, q + 1))}
                className="w-9 h-9 grid place-items-center rounded-full border border-line bg-white"
                aria-label="Increase quantity"
              >
                <PlusIcon className="w-4 h-4" />
              </button>
            </div>
            <button onClick={handleAdd} disabled={outOfStock} className="btn flex-1 min-w-[160px] disabled:opacity-60">
              {outOfStock ? "Out of stock" : "Add to cart"}
            </button>
            {user && (
              <button
                onClick={() => {
                  toggleWishlist(product.id);
                  toast(wished ? "Removed from wishlist" : "Saved to wishlist");
                }}
                className={cx("btn-ghost", wished && "border-danger text-danger")}
                aria-label="Wishlist"
              >
                <HeartIcon className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Details */}
          <div className="card p-5 grid gap-3">
            <h2 className="serif-title text-xl">Product details</h2>
            <p className="text-muted text-sm leading-relaxed">{product.details}</p>
            <ul className="grid gap-1.5 text-sm text-muted">
              {product.specifications?.map((s, i) => (
                <li key={i} className="flex items-start gap-2">
                  <CheckIcon className="w-4 h-4 text-success mt-0.5 shrink-0" />
                  {s}
                </li>
              ))}
            </ul>
            <p className="text-xs text-muted">SKU: {product.sku}</p>
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <section className="mt-12">
          <h2 className="serif-title text-2xl md:text-3xl mb-5 text-[#122033]">
            You may also like
          </h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
