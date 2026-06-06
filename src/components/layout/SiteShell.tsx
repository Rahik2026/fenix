"use client";

import type { ReactNode } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import CartDrawer from "@/components/layout/CartDrawer";
import { isFirebaseConfigured } from "@/lib/firebase";

export default function SiteShell({ children }: { children: ReactNode }) {
  return (
    <>
      <Navbar />
      {!isFirebaseConfigured && (
        <div className="pt-[var(--header-space)]">
          <div className="container-x">
            <div className="rounded-xl border border-gold/40 bg-gold/10 px-4 py-2.5 text-sm text-[#7a5a10]">
              <strong>Demo mode:</strong> Firebase keys not set — showing built-in
              seed data. Add credentials in <code>.env.local</code> (see SETUP.md)
              to enable live data, auth &amp; checkout.
            </div>
          </div>
        </div>
      )}
      <main className={isFirebaseConfigured ? "pt-[var(--header-space)]" : ""}>
        {children}
      </main>
      <Footer />
      <CartDrawer />
    </>
  );
}
