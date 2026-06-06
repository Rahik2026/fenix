"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import DashboardPanel from "@/components/admin/DashboardPanel";
import ProductsPanel from "@/components/admin/ProductsPanel";
import OrdersPanel from "@/components/admin/OrdersPanel";
import CmsPanel from "@/components/admin/CmsPanel";
import CategoriesPanel from "@/components/admin/CategoriesPanel";
import CouponsPanel from "@/components/admin/CouponsPanel";
import DatabasePanel from "@/components/admin/DatabasePanel";

const TABS = [
  { id: "dashboard", label: "Dashboard" },
  { id: "products", label: "Products" },
  { id: "orders", label: "Orders" },
  { id: "cms", label: "Website CMS" },
  { id: "categories", label: "Categories & Banners" },
  { id: "coupons", label: "Coupons" },
  { id: "database", label: "Database" },
];

export default function AdminShell() {
  const { user, signOut } = useAuth();
  const [tab, setTab] = useState("dashboard");

  return (
    <div className="min-h-screen bg-[#f1f5fa]">
      {/* Top bar */}
      <header className="sticky top-0 z-40 bg-[#0a2337] text-white">
        <div className="px-4 md:px-6 h-14 flex items-center justify-between">
          <Link href="/" className="serif-title text-xl">FENIX <span className="text-white/60 text-sm font-sans">Admin</span></Link>
          <div className="flex items-center gap-3 text-sm">
            <Link href="/" className="text-white/80 hover:text-white hidden sm:block">View store</Link>
            <span className="text-white/60 hidden md:block">{user?.email}</span>
            <button onClick={() => signOut()} className="bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg">Sign out</button>
          </div>
        </div>
        {/* Tabs */}
        <nav className="px-2 md:px-4 flex gap-1 overflow-x-auto scroll-thin">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`whitespace-nowrap px-3.5 py-2.5 text-sm rounded-t-lg transition-colors ${
                tab === t.id ? "bg-[#f1f5fa] text-ink font-semibold" : "text-white/75 hover:text-white"
              }`}
            >
              {t.label}
            </button>
          ))}
        </nav>
      </header>

      <main className="p-4 md:p-6 max-w-5xl mx-auto">
        {tab === "dashboard" && <DashboardPanel onTab={setTab} />}
        {tab === "products" && <ProductsPanel />}
        {tab === "orders" && <OrdersPanel />}
        {tab === "cms" && <CmsPanel />}
        {tab === "categories" && <CategoriesPanel />}
        {tab === "coupons" && <CouponsPanel />}
        {tab === "database" && <DatabasePanel />}
      </main>
    </div>
  );
}
