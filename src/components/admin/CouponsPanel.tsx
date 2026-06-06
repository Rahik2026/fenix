"use client";

import { useEffect, useState } from "react";
import { useToast } from "@/components/ui/Toast";
import { isFirebaseConfigured } from "@/lib/firebase";
import { subscribeCoupons, saveCoupon, deleteCoupon } from "@/lib/db";
import { genId, formatCurrency } from "@/lib/utils";
import type { Coupon } from "@/types";

const empty = (): Coupon => ({
  id: genId("coupon"),
  code: "",
  type: "percent",
  value: 10,
  minOrder: 0,
  enabled: true,
});

export default function CouponsPanel() {
  const { toast } = useToast();
  const [items, setItems] = useState<Coupon[]>([]);
  const [editing, setEditing] = useState<Coupon | null>(null);

  useEffect(() => {
    if (isFirebaseConfigured) return subscribeCoupons(setItems, true);
  }, []);

  const save = async (c: Coupon) => {
    if (!c.code.trim()) return toast("Coupon code required", "error");
    await saveCoupon({ ...c, code: c.code.trim().toUpperCase() });
    toast("Coupon saved", "success");
    setEditing(null);
  };

  return (
    <div className="grid gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="serif-title text-2xl">Coupons</h2>
          <p className="text-muted text-sm">{items.length} coupons</p>
        </div>
        <button onClick={() => setEditing(empty())} className="btn">+ New coupon</button>
      </div>

      <div className="grid gap-2">
        {items.map((c) => (
          <div key={c.id} className="card p-3 flex items-center gap-3">
            <div className="flex-1">
              <p className="font-bold font-mono">{c.code}</p>
              <p className="text-xs text-muted">
                {c.type === "percent" ? `${c.value}% off` : `${formatCurrency(c.value)} off`} · min {formatCurrency(c.minOrder)}
              </p>
            </div>
            {!c.enabled && <span className="pill status-cancelled text-[10px]">Off</span>}
            <button onClick={() => setEditing(c)} className="btn-ghost text-sm py-1.5 px-3">Edit</button>
            <button onClick={() => { if (confirm("Delete coupon?")) deleteCoupon(c.id); }} className="text-danger text-sm font-semibold">Delete</button>
          </div>
        ))}
      </div>

      {editing && (
        <div className="fixed inset-0 z-[1100] bg-black/50 grid place-items-center p-3">
          <div className="bg-white rounded-xl2 w-full max-w-md p-6 grid gap-4">
            <h3 className="serif-title text-xl">{editing.code ? "Edit coupon" : "New coupon"}</h3>
            <div><label className="label">Code</label><input className="input font-mono" value={editing.code} onChange={(e) => setEditing({ ...editing, code: e.target.value.toUpperCase() })} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="label">Type</label><select className="input" value={editing.type} onChange={(e) => setEditing({ ...editing, type: e.target.value as any })}><option value="percent">Percent</option><option value="fixed">Fixed</option></select></div>
              <div><label className="label">Value</label><input className="input" type="number" value={editing.value} onChange={(e) => setEditing({ ...editing, value: Number(e.target.value) })} /></div>
            </div>
            <div><label className="label">Minimum order</label><input className="input" type="number" value={editing.minOrder} onChange={(e) => setEditing({ ...editing, minOrder: Number(e.target.value) })} /></div>
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" className="w-auto" checked={editing.enabled} onChange={(e) => setEditing({ ...editing, enabled: e.target.checked })} /> Enabled</label>
            <div className="flex gap-2 justify-end">
              <button onClick={() => setEditing(null)} className="btn-ghost">Cancel</button>
              <button onClick={() => save(editing)} className="btn">Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
