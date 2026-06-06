"use client";

import { useEffect, useState } from "react";
import StatusBadge from "@/components/ui/StatusBadge";
import { useToast } from "@/components/ui/Toast";
import { isFirebaseConfigured } from "@/lib/firebase";
import { subscribeOrders, setOrderStatus, updateOrder } from "@/lib/db";
import { formatCurrency, timeAgo } from "@/lib/utils";
import { ORDER_STATUS_FLOW, type Order, type OrderStatus } from "@/types";

export default function OrdersPanel() {
  const { toast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [open, setOpen] = useState<string | null>(null);
  const [filter, setFilter] = useState<OrderStatus | "all">("all");

  useEffect(() => {
    if (!isFirebaseConfigured) return;
    return subscribeOrders(setOrders);
  }, []);

  const changeStatus = async (order: Order, status: OrderStatus, notes?: string) => {
    try {
      await setOrderStatus(order.id, status, notes);
      toast(`Order ${order.id} → ${status}`, "success");
    } catch (err: any) {
      toast(err?.message || "Update failed", "error");
    }
  };

  const filtered = filter === "all" ? orders : orders.filter((o) => o.status === filter);
  const pendingPayments = orders.filter((o) => o.status === "Payment Submitted").length;

  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="serif-title text-2xl">Orders</h2>
          <p className="text-muted text-sm">
            {orders.length} orders · {pendingPayments} awaiting verification
          </p>
        </div>
        <select className="input w-auto" value={filter} onChange={(e) => setFilter(e.target.value as any)}>
          <option value="all">All statuses</option>
          {ORDER_STATUS_FLOW.map((s) => (<option key={s} value={s}>{s}</option>))}
        </select>
      </div>

      <div className="grid gap-2">
        {filtered.map((o) => (
          <div key={o.id} className="card overflow-hidden">
            <button
              onClick={() => setOpen(open === o.id ? null : o.id)}
              className="w-full p-4 flex flex-wrap items-center justify-between gap-3 text-left"
            >
              <div>
                <p className="font-bold">{o.id}</p>
                <p className="text-xs text-muted">{o.customerName} · {o.phone} · {timeAgo(o.createdAt)}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-bold">{formatCurrency(o.total)}</span>
                <StatusBadge status={o.status} />
              </div>
            </button>

            {open === o.id && (
              <OrderDetail order={o} onStatus={changeStatus} onNotes={(notes) => updateOrder(o.id, { adminNotes: notes })} />
            )}
          </div>
        ))}
        {filtered.length === 0 && <p className="text-muted text-sm">No orders found.</p>}
      </div>
    </div>
  );
}

function OrderDetail({
  order,
  onStatus,
  onNotes,
}: {
  order: Order;
  onStatus: (o: Order, s: OrderStatus, notes?: string) => void;
  onNotes: (notes: string) => void;
}) {
  const [status, setStatus] = useState<OrderStatus>(order.status);
  const [notes, setNotes] = useState(order.adminNotes || "");

  return (
    <div className="border-t border-line p-4 grid gap-4 md:grid-cols-2 bg-[#fafcff]">
      <div className="grid gap-2 text-sm">
        <h4 className="font-bold">Items</h4>
        {order.items.map((i, idx) => (
          <p key={idx} className="text-muted">
            {i.productName} · {i.size} × {i.quantity} — {formatCurrency(i.unitPrice * i.quantity)}
          </p>
        ))}
        <div className="pt-2 border-t border-line">
          <p>Subtotal: {formatCurrency(order.subtotal)}</p>
          <p>Delivery: {formatCurrency(order.deliveryFee)}</p>
          {order.discountTotal > 0 && <p>Discount: -{formatCurrency(order.discountTotal)} {order.couponCode && `(${order.couponCode})`}</p>}
          <p className="font-bold">Total: {formatCurrency(order.total)}</p>
        </div>
        <div className="pt-2 border-t border-line">
          <p className="font-bold mb-1">Delivery</p>
          <p className="text-muted">{order.customerName}, {order.phone}</p>
          <p className="text-muted">{order.address}, {order.district}, {order.division}</p>
        </div>
      </div>

      <div className="grid gap-3">
        <div className="rounded-xl border border-line p-3">
          <h4 className="font-bold text-sm mb-2">Payment (bKash)</h4>
          {order.payment ? (
            <div className="text-sm grid gap-1">
              <p><span className="text-muted">Txn ID:</span> <strong>{order.payment.transactionId}</strong></p>
              <p><span className="text-muted">Sender:</span> {order.payment.senderNumber}</p>
              <p><span className="text-muted">Amount:</span> {formatCurrency(order.payment.amount)}</p>
              {order.status === "Payment Submitted" && (
                <div className="flex gap-2 mt-2">
                  <button onClick={() => onStatus(order, "Verified")} className="btn text-sm py-1.5 px-3">Verify payment</button>
                  <button onClick={() => onStatus(order, "Cancelled")} className="btn-ghost text-sm py-1.5 px-3 text-danger border-danger">Reject</button>
                </div>
              )}
            </div>
          ) : (
            <p className="text-sm text-muted">No payment submitted yet.</p>
          )}
        </div>

        <div className="grid gap-2">
          <label className="label mb-0">Update status</label>
          <select className="input" value={status} onChange={(e) => setStatus(e.target.value as OrderStatus)}>
            {ORDER_STATUS_FLOW.map((s) => (<option key={s} value={s}>{s}</option>))}
          </select>
          <label className="label mb-0">Admin notes</label>
          <textarea className="input min-h-[60px]" value={notes} onChange={(e) => setNotes(e.target.value)} />
          <button onClick={() => onStatus(order, status, notes)} className="btn w-fit">Save changes</button>
        </div>
      </div>
    </div>
  );
}
