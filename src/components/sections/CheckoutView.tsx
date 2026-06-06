"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import SmartImage from "@/components/ui/SmartImage";
import { useCart } from "@/context/CartContext";
import { useSettings } from "@/context/SettingsContext";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/components/ui/Toast";
import { isFirebaseConfigured } from "@/lib/firebase";
import { createOrder, fetchCouponByCode } from "@/lib/db";
import {
  formatCurrency,
  genOrderId,
  applyCoupon,
  isValidPhoneBD,
  DIVISION_DISTRICTS,
} from "@/lib/utils";
import type { Coupon, Order } from "@/types";

export default function CheckoutView() {
  const { items, subtotal, clear } = useCart();
  const settings = useSettings();
  const { user } = useAuth();
  const { toast } = useToast();
  const router = useRouter();

  const [form, setForm] = useState({
    customerName: user?.displayName || "",
    email: user?.email || "",
    phone: "",
    address: "",
    division: "Dhaka",
    district: "Dhaka",
  });
  const [couponCode, setCouponCode] = useState("");
  const [coupon, setCoupon] = useState<Coupon | null>(null);
  const [busy, setBusy] = useState(false);

  const deliveryFee =
    form.division === "Dhaka" ? settings.shippingDhaka : settings.shippingOther;
  const discountTotal = useMemo(
    () => applyCoupon(subtotal, coupon),
    [subtotal, coupon]
  );
  const total = subtotal + deliveryFee - discountTotal;

  if (items.length === 0) {
    return (
      <div className="container-x py-16 text-center">
        <h1 className="serif-title text-3xl mb-3">Nothing to checkout</h1>
        <Link href="/shop" className="btn">Browse products</Link>
      </div>
    );
  }

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const applyCouponCode = async () => {
    if (!couponCode.trim()) return;
    if (!isFirebaseConfigured) {
      toast("Coupons require Firebase configuration", "error");
      return;
    }
    const c = await fetchCouponByCode(couponCode.trim());
    if (!c) return toast("Invalid or expired coupon", "error");
    if (subtotal < c.minOrder)
      return toast(
        `Coupon needs a minimum order of ${formatCurrency(c.minOrder, settings.currency)}`,
        "error"
      );
    setCoupon(c);
    toast("Coupon applied", "success");
  };

  const placeOrder = async () => {
    if (form.customerName.trim().length < 2) return toast("Enter your name", "error");
    if (!isValidPhoneBD(form.phone)) return toast("Enter a valid BD phone number", "error");
    if (form.address.trim().length < 6) return toast("Enter a full address", "error");
    if (!isFirebaseConfigured)
      return toast("Checkout requires Firebase keys in .env.local (see SETUP.md)", "error");

    setBusy(true);
    const order: Order = {
      id: genOrderId(),
      createdAt: new Date().toISOString(),
      userId: user?.uid || null,
      customerName: form.customerName.trim(),
      email: form.email.trim(),
      phone: form.phone.replace(/\s|-/g, ""),
      address: form.address.trim(),
      division: form.division,
      district: form.district,
      items: items.map((i) => ({
        productId: i.productId,
        productName: i.name,
        image: i.image,
        size: i.size,
        quantity: i.quantity,
        unitPrice: i.unitPrice,
      })),
      subtotal,
      deliveryFee,
      discountTotal,
      total,
      couponCode: coupon?.code || "",
      status: "Awaiting Payment",
      payment: null,
      adminNotes: "",
    };
    try {
      await createOrder(order);
      clear();
      toast("Order placed! Complete your bKash payment.", "success");
      router.push(`/order/${order.id}`);
    } catch (err: any) {
      toast(err?.message || "Failed to place order", "error");
      setBusy(false);
    }
  };

  return (
    <div className="container-x py-8 md:py-12">
      <h1 className="serif-title text-[30px] md:text-[44px] text-[#122033] mb-6">Checkout</h1>
      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr] items-start">
        {/* Form */}
        <div className="card p-5 md:p-6 grid gap-4">
          <h2 className="serif-title text-xl">Delivery details</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="label">Full name</label>
              <input className="input" value={form.customerName} onChange={(e) => set("customerName", e.target.value)} />
            </div>
            <div>
              <label className="label">Phone (bKash-capable)</label>
              <input className="input" value={form.phone} onChange={(e) => set("phone", e.target.value)} placeholder="01XXXXXXXXX" />
            </div>
            <div>
              <label className="label">Email (optional)</label>
              <input className="input" type="email" value={form.email} onChange={(e) => set("email", e.target.value)} />
            </div>
            <div>
              <label className="label">Division</label>
              <select className="input" value={form.division} onChange={(e) => { set("division", e.target.value); set("district", DIVISION_DISTRICTS[e.target.value][0]); }}>
                {Object.keys(DIVISION_DISTRICTS).map((d) => (<option key={d}>{d}</option>))}
              </select>
            </div>
            <div>
              <label className="label">District</label>
              <select className="input" value={form.district} onChange={(e) => set("district", e.target.value)}>
                {DIVISION_DISTRICTS[form.division].map((d) => (<option key={d}>{d}</option>))}
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="label">Full address</label>
              <textarea className="input min-h-[90px]" value={form.address} onChange={(e) => set("address", e.target.value)} placeholder="House, road, area" />
            </div>
          </div>

          <div className="rounded-xl border border-primary-2/20 bg-primary-2/5 p-4 grid gap-2">
            <h3 className="font-bold text-sm">How payment works</h3>
            <p className="text-sm text-muted leading-relaxed">{settings.paymentInstructions}</p>
            <p className="text-sm">
              <strong>bKash (Send Money):</strong>{" "}
              <span className="font-mono font-bold text-primary">{settings.bkashNumber}</span>
            </p>
            <p className="text-xs text-muted">After placing this order you'll get an order page to submit your transaction ID once you've paid.</p>
          </div>
        </div>

        {/* Summary */}
        <div className="card p-5 grid gap-4 lg:sticky lg:top-[120px]">
          <h2 className="serif-title text-xl">Order summary</h2>
          <div className="grid gap-3 max-h-64 overflow-auto scroll-thin">
            {items.map((i) => (
              <div key={`${i.productId}-${i.size}`} className="grid grid-cols-[48px_1fr_auto] gap-3 items-center">
                <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-[#eef5fb]">
                  <SmartImage src={i.image} alt={i.name} fill sizes="48px" className="object-cover" />
                </div>
                <div className="text-sm">
                  <p className="font-medium leading-tight line-clamp-1">{i.name}</p>
                  <p className="text-xs text-muted">{i.size} × {i.quantity}</p>
                </div>
                <span className="text-sm font-bold">{formatCurrency(i.unitPrice * i.quantity, settings.currency)}</span>
              </div>
            ))}
          </div>

          <div className="grid gap-2">
            <div className="flex gap-2">
              <input className="input" placeholder="Coupon code" value={couponCode} onChange={(e) => setCouponCode(e.target.value.toUpperCase())} />
              <button onClick={applyCouponCode} className="btn-ghost shrink-0">Apply</button>
            </div>
            {coupon && <p className="text-xs text-success">Coupon {coupon.code} applied.</p>}
          </div>

          <div className="grid gap-2 pt-3 border-t border-line text-sm">
            <div className="flex justify-between"><span className="text-muted">Subtotal</span><span>{formatCurrency(subtotal, settings.currency)}</span></div>
            <div className="flex justify-between"><span className="text-muted">Delivery</span><span>{formatCurrency(deliveryFee, settings.currency)}</span></div>
            {discountTotal > 0 && <div className="flex justify-between text-success"><span>Discount</span><span>-{formatCurrency(discountTotal, settings.currency)}</span></div>}
            <div className="flex justify-between font-bold pt-2 border-t border-line text-base"><span>Total</span><span>{formatCurrency(total, settings.currency)}</span></div>
          </div>

          <button onClick={placeOrder} disabled={busy} className="btn disabled:opacity-60">
            {busy ? "Placing order…" : "Place order"}
          </button>
        </div>
      </div>
    </div>
  );
}
