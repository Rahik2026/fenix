import type { OrderStatus } from "@/types";

const CLASS: Record<OrderStatus, string> = {
  "Awaiting Payment": "status-awaiting",
  "Payment Submitted": "status-submitted",
  Verified: "status-verified",
  Processing: "status-processing",
  Shipped: "status-shipped",
  Delivered: "status-delivered",
  Cancelled: "status-cancelled",
};

export default function StatusBadge({ status }: { status: OrderStatus }) {
  return (
    <span className={`pill ${CLASS[status] || "status-cancelled"}`}>{status}</span>
  );
}
