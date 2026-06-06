"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import StatusBadge from "@/components/ui/StatusBadge";
import { useAuth } from "@/context/AuthContext";
import { useSettings } from "@/context/SettingsContext";
import { isFirebaseConfigured } from "@/lib/firebase";
import { fetchUserOrders } from "@/lib/db";
import { formatCurrency, timeAgo } from "@/lib/utils";
import type { Order } from "@/types";

export default function AccountView() {
  const { user, loading, signOut } = useAuth();
  const settings = useSettings();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [busy, setBusy] = useState(true);

  useEffect(() => {
    if (!loading && !user) router.push("/auth");
  }, [loading, user, router]);

  useEffect(() => {
    if (user && isFirebaseConfigured) {
      fetchUserOrders(user.uid)
        .then(setOrders)
        .finally(() => setBusy(false));
    } else {
      setBusy(false);
    }
  }, [user]);

  if (loading || !user) {
    return <div className="container-x py-20 text-center text-muted">Loading…</div>;
  }

  return (
    <div className="container-x py-8 md:py-12">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <span className="kicker">My account</span>
          <h1 className="serif-title text-2xl md:text-4xl text-[#122033]">
            Welcome{user.displayName ? `, ${user.displayName}` : ""}
          </h1>
          <p className="text-muted text-sm mt-1">{user.email}</p>
        </div>
        <button onClick={() => { signOut(); router.push("/"); }} className="btn-ghost">
          Sign out
        </button>
      </div>

      <h2 className="serif-title text-xl mb-4">Your orders</h2>
      {busy ? (
        <p className="text-muted">Loading orders…</p>
      ) : orders.length === 0 ? (
        <div className="card p-8 text-center text-muted">
          No orders yet.
          <Link href="/shop" className="block mx-auto mt-4 btn w-fit">Start shopping</Link>
        </div>
      ) : (
        <div className="grid gap-3">
          {orders.map((o) => (
            <Link key={o.id} href={`/order/${o.id}`} className="card p-4 flex flex-wrap items-center justify-between gap-3 hover:shadow-lift transition-shadow">
              <div>
                <p className="font-bold">{o.id}</p>
                <p className="text-xs text-muted">{o.items.length} item(s) · {timeAgo(o.createdAt)}</p>
              </div>
              <div className="flex items-center gap-4">
                <span className="font-bold">{formatCurrency(o.total, settings.currency)}</span>
                <StatusBadge status={o.status} />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
