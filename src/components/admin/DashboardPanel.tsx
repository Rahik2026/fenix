"use client";

import { useEffect, useState } from "react";
import { isFirebaseConfigured } from "@/lib/firebase";
import { subscribeOrders, subscribeProducts } from "@/lib/db";
import { formatCurrency, timeAgo } from "@/lib/utils";
import StatusBadge from "@/components/ui/StatusBadge";
import type { Order, Product } from "@/types";

export default function DashboardPanel({ onTab }: { onTab: (t: string) => void }) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    if (!isFirebaseConfigured) return;
    const u1 = subscribeOrders(setOrders);
    const u2 = subscribeProducts(setProducts, true);
    return () => { u1(); u2(); };
  }, []);

  const revenue = orders
    .filter((o) => ["Verified", "Processing", "Shipped", "Delivered"].includes(o.status))
    .reduce((s, o) => s + o.total, 0);
  const pending = orders.filter((o) => o.status === "Payment Submitted").length;
  const lowStock = products.filter((p) => p.stock <= 5).length;

  const stats = [
    ["Total orders", String(orders.length), "orders"],
    ["Verified revenue", formatCurrency(revenue), "orders"],
    ["Awaiting verification", String(pending), "orders"],
    ["Low / no stock", String(lowStock), "products"],
  ];

  return (
    <div className="grid gap-5">
      <div>
        <h2 className="serif-title text-2xl">Dashboard</h2>
        <p className="text-muted text-sm">Store overview</p>
      </div>

      {!isFirebaseConfigured && (
        <div className="rounded-xl border border-gold/40 bg-gold/10 px-4 py-3 text-sm text-[#7a5a10]">
          Firebase is not configured. Add keys to <code>.env.local</code> and run
          <strong> Initialize Database</strong> to start. See SETUP.md.
        </div>
      )}

      <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
        {stats.map(([label, value, tab]) => (
          <button key={label} onClick={() => onTab(tab)} className="card p-4 text-left hover:shadow-lift transition-shadow">
            <p className="text-xs uppercase tracking-wide text-muted">{label}</p>
            <p className="serif-title text-2xl mt-1">{value}</p>
          </button>
        ))}
      </div>

      <div className="card p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold">Recent orders</h3>
          <button onClick={() => onTab("orders")} className="text-sm text-primary-2 font-semibold">View all →</button>
        </div>
        <div className="grid gap-2">
          {orders.slice(0, 6).map((o) => (
            <div key={o.id} className="flex items-center justify-between gap-3 text-sm py-2 border-b border-line last:border-0">
              <div>
                <p className="font-semibold">{o.id}</p>
                <p className="text-xs text-muted">{o.customerName} · {timeAgo(o.createdAt)}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-bold">{formatCurrency(o.total)}</span>
                <StatusBadge status={o.status} />
              </div>
            </div>
          ))}
          {orders.length === 0 && <p className="text-muted text-sm">No orders yet.</p>}
        </div>
      </div>
    </div>
  );
}
