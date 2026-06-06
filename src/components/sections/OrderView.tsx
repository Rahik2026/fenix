"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import SmartImage from "@/components/ui/SmartImage";
import StatusBadge from "@/components/ui/StatusBadge";
import { useSettings } from "@/context/SettingsContext";
import { useToast } from "@/components/ui/Toast";
import { isFirebaseConfigured, db } from "@/lib/firebase";
import { submitPayment } from "@/lib/db";
import { doc, onSnapshot } from "firebase/firestore";
import { formatCurrency, isValidPhoneBD } from "@/lib/utils";
import { ORDER_STATUS_FLOW, type Order } from "@/types";
import { CheckIcon } from "@/components/ui/icons";

const TIMELINE = ORDER_STATUS_FLOW.filter((s) => s !== "Cancelled");

export default function OrderView({ id }: { id: string }) {
  const settings = useSettings();
  const { toast } = useToast();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [txn, setTxn] = useState("");
  const [sender, setSender] = useState("");
  const [amount, setAmount] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!isFirebaseConfigured || !db) {
      setLoading(false);
      return;
    }
    const unsub = onSnapshot(doc(db, "orders", id), (snap) => {
      setOrder(snap.exists() ? (snap.data() as Order) : null);
      setLoading(false);
    });
    return () => unsub();
  }, [id]);

  useEffect(() => {
    if (order && !amount) setAmount(String(order.total));
  }, [order]); // eslint-disable-line

  if (!isFirebaseConfigured) {
    return (
      <div className="container-x py-16 text-center">
        <h1 className="serif-title text-3xl mb-3">Order tracking</h1>
        <p className="text-muted">Order tracking requires Firebase keys in <code>.env.local</code>.</p>
      </div>
    );
  }
  if (loading) return <div className="container-x py-20 text-center text-muted">Loading order…</div>;
  if (!order) {
    return (
      <div className="container-x py-16 text-center">
        <h1 className="serif-title text-3xl mb-3">Order not found</h1>
        <Link href="/shop" className="btn">Back to shop</Link>
      </div>
    );
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (txn.trim().length < 4) return toast("Enter a valid transaction ID", "error");
    if (!isValidPhoneBD(sender)) return toast("Enter the bKash sender number", "error");
    const amt = Number(amount);
    if (!amt || amt <= 0) return toast("Enter the amount paid", "error");
    setBusy(true);
    try {
      await submitPayment(order.id, {
        transactionId: txn.trim().toUpperCase(),
        senderNumber: sender.replace(/\s|-/g, ""),
        amount: amt,
        submittedAt: new Date().toISOString(),
      });
      toast("Payment submitted — awaiting verification", "success");
    } catch (err: any) {
      toast(err?.message || "Failed to submit payment", "error");
    } finally {
      setBusy(false);
    }
  };

  const currentIdx = TIMELINE.indexOf(order.status as any);
  const canSubmitPayment = order.status === "Awaiting Payment";
  const isCancelled = order.status === "Cancelled";

  return (
    <div className="container-x py-8 md:py-12">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <span className="kicker">Order</span>
          <h1 className="serif-title text-2xl md:text-4xl text-[#122033]">{order.id}</h1>
          <p className="text-muted text-sm mt-1">
            Placed {new Date(order.createdAt).toLocaleString()}
          </p>
        </div>
        <StatusBadge status={order.status} />
      </div>

      {/* Timeline */}
      {!isCancelled && (
        <div className="card p-5 mb-6 overflow-x-auto scroll-thin">
          <div className="flex items-center gap-2 min-w-[560px]">
            {TIMELINE.map((step, i) => {
              const done = i <= currentIdx;
              return (
                <div key={step} className="flex items-center gap-2 flex-1">
                  <div className="flex flex-col items-center gap-1.5 flex-1">
                    <span className={`w-8 h-8 rounded-full grid place-items-center text-xs font-bold ${done ? "bg-primary text-white" : "bg-line text-muted"}`}>
                      {done ? <CheckIcon className="w-4 h-4" /> : i + 1}
                    </span>
                    <span className={`text-[11px] text-center leading-tight ${done ? "text-ink font-semibold" : "text-muted"}`}>{step}</span>
                  </div>
                  {i < TIMELINE.length - 1 && (
                    <span className={`h-0.5 flex-1 ${i < currentIdx ? "bg-primary" : "bg-line"}`} />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr] items-start">
        {/* Payment box */}
        <div className="card p-5 md:p-6 grid gap-4">
          <h2 className="serif-title text-xl">bKash payment</h2>
          <div className="rounded-xl border border-primary-2/20 bg-primary-2/5 p-4 grid gap-1.5">
            <p className="text-sm text-muted">Send exactly</p>
            <p className="serif-title text-3xl text-primary">{formatCurrency(order.total, settings.currency)}</p>
            <p className="text-sm">to bKash (Send Money):</p>
            <p className="font-mono font-bold text-lg text-primary">{settings.bkashNumber}</p>
          </div>

          {order.payment ? (
            <div className="rounded-xl border border-line p-4 grid gap-1.5 text-sm">
              <p className="font-bold text-success">Payment details submitted</p>
              <p><span className="text-muted">Transaction ID:</span> {order.payment.transactionId}</p>
              <p><span className="text-muted">Sender:</span> {order.payment.senderNumber}</p>
              <p><span className="text-muted">Amount:</span> {formatCurrency(order.payment.amount, settings.currency)}</p>
              <p className="text-xs text-muted mt-1">
                {order.status === "Payment Submitted"
                  ? "Our team will verify this payment shortly."
                  : "Payment verified. Your order is being processed."}
              </p>
            </div>
          ) : canSubmitPayment ? (
            <form onSubmit={submit} className="grid gap-3">
              <p className="text-sm text-muted">{settings.paymentInstructions}</p>
              <div>
                <label className="label">Transaction ID</label>
                <input className="input" value={txn} onChange={(e) => setTxn(e.target.value)} placeholder="e.g. 9AB1CD23EF" />
              </div>
              <div>
                <label className="label">Sender bKash number</label>
                <input className="input" value={sender} onChange={(e) => setSender(e.target.value)} placeholder="01XXXXXXXXX" />
              </div>
              <div>
                <label className="label">Amount paid</label>
                <input className="input" type="number" value={amount} onChange={(e) => setAmount(e.target.value)} />
              </div>
              <button type="submit" disabled={busy} className="btn disabled:opacity-60">
                {busy ? "Submitting…" : "I have paid — submit details"}
              </button>
            </form>
          ) : (
            <p className="text-sm text-muted">
              {isCancelled
                ? "This order was cancelled."
                : "Payment is being processed by our team."}
            </p>
          )}
          <p className="text-xs text-muted">
            Save this page link to return and check your status anytime.
          </p>
        </div>

        {/* Order details */}
        <div className="grid gap-4">
          <div className="card p-5 grid gap-3">
            <h2 className="serif-title text-xl">Items</h2>
            {order.items.map((i, idx) => (
              <div key={idx} className="grid grid-cols-[56px_1fr_auto] gap-3 items-center">
                <div className="relative w-14 h-14 rounded-lg overflow-hidden bg-[#eef5fb]">
                  <SmartImage src={i.image} alt={i.productName} fill sizes="56px" className="object-cover" />
                </div>
                <div className="text-sm">
                  <p className="font-medium leading-tight">{i.productName}</p>
                  <p className="text-xs text-muted">Size {i.size} · Qty {i.quantity}</p>
                </div>
                <span className="text-sm font-bold">{formatCurrency(i.unitPrice * i.quantity, settings.currency)}</span>
              </div>
            ))}
            <div className="grid gap-1.5 pt-3 border-t border-line text-sm">
              <div className="flex justify-between"><span className="text-muted">Subtotal</span><span>{formatCurrency(order.subtotal, settings.currency)}</span></div>
              <div className="flex justify-between"><span className="text-muted">Delivery</span><span>{formatCurrency(order.deliveryFee, settings.currency)}</span></div>
              {order.discountTotal > 0 && <div className="flex justify-between text-success"><span>Discount {order.couponCode && `(${order.couponCode})`}</span><span>-{formatCurrency(order.discountTotal, settings.currency)}</span></div>}
              <div className="flex justify-between font-bold pt-2 border-t border-line"><span>Total</span><span>{formatCurrency(order.total, settings.currency)}</span></div>
            </div>
          </div>
          <div className="card p-5 grid gap-1.5 text-sm">
            <h2 className="serif-title text-xl mb-1">Delivery</h2>
            <p className="font-medium">{order.customerName}</p>
            <p className="text-muted">{order.phone}</p>
            <p className="text-muted">{order.address}</p>
            <p className="text-muted">{order.district}, {order.division}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
