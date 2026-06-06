"use client";

import Link from "next/link";
import SmartImage from "@/components/ui/SmartImage";
import { useCart } from "@/context/CartContext";
import { useSettings } from "@/context/SettingsContext";
import { PlusIcon, MinusIcon, TrashIcon } from "@/components/ui/icons";
import { formatCurrency } from "@/lib/utils";

export default function CartView() {
  const { items, subtotal, updateQty, removeItem } = useCart();
  const settings = useSettings();
  const shipping = subtotal > 0 ? settings.shippingDhaka : 0;

  if (items.length === 0) {
    return (
      <div className="container-x py-16 text-center">
        <h1 className="serif-title text-3xl md:text-4xl mb-3 text-[#122033]">
          Your cart is empty
        </h1>
        <p className="text-muted mb-6">Add some premium pieces to get started.</p>
        <Link href="/shop" className="btn">Browse products</Link>
      </div>
    );
  }

  return (
    <div className="container-x py-8 md:py-12">
      <h1 className="serif-title text-[30px] md:text-[44px] text-[#122033] mb-6">
        Your cart
      </h1>
      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr] items-start">
        <div className="grid gap-3">
          {items.map((item) => (
            <div
              key={`${item.productId}-${item.size}`}
              className="card p-4 grid grid-cols-[88px_1fr] md:grid-cols-[120px_1fr_auto] gap-4 items-center"
            >
              <div className="relative w-[88px] md:w-[120px] aspect-square rounded-2xl overflow-hidden bg-[#eef5fb]">
                <SmartImage src={item.image} alt={item.name} fill sizes="120px" className="object-cover" />
              </div>
              <div className="grid gap-2">
                <Link href={`/product/${item.productId}`} className="font-semibold hover:text-primary-2">
                  {item.name}
                </Link>
                <span className="text-sm text-muted">Size {item.size}</span>
                <div className="inline-flex w-fit items-center gap-3 p-1.5 rounded-full bg-[#f5f8fc] border border-line">
                  <button onClick={() => updateQty(item.productId, item.size, item.quantity - 1)} className="w-8 h-8 grid place-items-center rounded-full border border-line bg-white" aria-label="Decrease"><MinusIcon className="w-3.5 h-3.5" /></button>
                  <span className="w-5 text-center font-bold text-sm">{item.quantity}</span>
                  <button onClick={() => updateQty(item.productId, item.size, item.quantity + 1)} className="w-8 h-8 grid place-items-center rounded-full border border-line bg-white" aria-label="Increase"><PlusIcon className="w-3.5 h-3.5" /></button>
                </div>
              </div>
              <div className="col-span-2 md:col-span-1 flex md:flex-col items-center md:items-end justify-between gap-2">
                <strong>{formatCurrency(item.unitPrice * item.quantity, settings.currency)}</strong>
                <button onClick={() => removeItem(item.productId, item.size)} className="text-muted hover:text-danger inline-flex items-center gap-1 text-sm" aria-label="Remove">
                  <TrashIcon className="w-4 h-4" /> Remove
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="card p-5 grid gap-4 lg:sticky lg:top-[120px]">
          <h2 className="serif-title text-xl">Order summary</h2>
          <div className="grid gap-3">
            <div className="flex justify-between text-sm"><span className="text-muted">Subtotal</span><span>{formatCurrency(subtotal, settings.currency)}</span></div>
            <div className="flex justify-between text-sm"><span className="text-muted">Delivery (est.)</span><span>{formatCurrency(shipping, settings.currency)}</span></div>
            <div className="flex justify-between font-bold pt-3 border-t border-line"><span>Total</span><span>{formatCurrency(subtotal + shipping, settings.currency)}</span></div>
          </div>
          <Link href="/checkout" className="btn">Proceed to checkout</Link>
          <Link href="/shop" className="btn-ghost">Continue shopping</Link>
          <p className="text-xs text-muted">Final delivery fee is calculated at checkout based on your district.</p>
        </div>
      </div>
    </div>
  );
}
