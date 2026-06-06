"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useCart } from "@/context/CartContext";
import { useSettings } from "@/context/SettingsContext";
import SmartImage from "@/components/ui/SmartImage";
import { CloseIcon, PlusIcon, MinusIcon, TrashIcon } from "@/components/ui/icons";
import { formatCurrency } from "@/lib/utils";

export default function CartDrawer() {
  const { items, subtotal, drawerOpen, setDrawerOpen, updateQty, removeItem } =
    useCart();
  const settings = useSettings();

  useEffect(() => {
    document.body.classList.toggle("no-scroll", drawerOpen);
    return () => document.body.classList.remove("no-scroll");
  }, [drawerOpen]);

  return (
    <>
      <div
        onClick={() => setDrawerOpen(false)}
        className={`fixed inset-0 z-[1008] bg-[rgba(5,14,24,0.48)] transition-opacity duration-200 ${
          drawerOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      />
      <aside
        className={`fixed top-0 right-0 z-[1009] h-[100dvh] w-[min(420px,100%)] grid grid-rows-[auto_1fr_auto] bg-[rgba(250,252,255,0.97)] border-l border-line transition-transform duration-200 ${
          drawerOpen ? "translate-x-0" : "translate-x-full"
        }`}
        style={{ backdropFilter: "blur(18px)" }}
        aria-hidden={!drawerOpen}
      >
        <div className="flex items-center justify-between p-4 border-b border-line">
          <h2 className="serif-title text-xl">Your cart</h2>
          <button
            onClick={() => setDrawerOpen(false)}
            aria-label="Close cart"
            className="grid place-items-center w-9 h-9 rounded-full hover:bg-ink/10"
          >
            <CloseIcon className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 overflow-auto">
          {items.length === 0 ? (
            <div className="text-center py-16 text-muted">
              <p className="mb-4">Your cart is empty.</p>
              <Link href="/shop" className="btn" onClick={() => setDrawerOpen(false)}>
                Browse products
              </Link>
            </div>
          ) : (
            items.map((item) => (
              <div
                key={`${item.productId}-${item.size}`}
                className="grid grid-cols-[72px_1fr_auto] gap-3 items-center mb-4"
              >
                <div className="w-[72px] h-[72px] rounded-2xl overflow-hidden bg-[#eef5fb] relative">
                  <SmartImage
                    src={item.image}
                    alt={item.name}
                    fill
                    sizes="72px"
                    className="object-cover"
                  />
                </div>
                <div>
                  <p className="font-semibold text-sm leading-tight">{item.name}</p>
                  <p className="text-xs text-muted">Size {item.size}</p>
                  <div className="inline-flex items-center gap-2 mt-1 p-1 rounded-full bg-[#f5f8fc] border border-line">
                    <button
                      onClick={() =>
                        updateQty(item.productId, item.size, item.quantity - 1)
                      }
                      className="w-7 h-7 grid place-items-center rounded-full border border-line bg-white"
                      aria-label="Decrease"
                    >
                      <MinusIcon className="w-3.5 h-3.5" />
                    </button>
                    <span className="text-sm font-bold w-4 text-center">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() =>
                        updateQty(item.productId, item.size, item.quantity + 1)
                      }
                      className="w-7 h-7 grid place-items-center rounded-full border border-line bg-white"
                      aria-label="Increase"
                    >
                      <PlusIcon className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-sm">
                    {formatCurrency(item.unitPrice * item.quantity, settings.currency)}
                  </p>
                  <button
                    onClick={() => removeItem(item.productId, item.size)}
                    className="mt-2 text-muted hover:text-danger"
                    aria-label="Remove"
                  >
                    <TrashIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {items.length > 0 && (
          <div className="p-4 border-t border-line grid gap-3">
            <div className="flex justify-between font-bold">
              <span>Subtotal</span>
              <span>{formatCurrency(subtotal, settings.currency)}</span>
            </div>
            <Link href="/cart" className="btn-ghost" onClick={() => setDrawerOpen(false)}>
              View cart
            </Link>
            <Link href="/checkout" className="btn" onClick={() => setDrawerOpen(false)}>
              Checkout
            </Link>
          </div>
        )}
      </aside>
    </>
  );
}
