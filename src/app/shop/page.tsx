import { Suspense } from "react";
import SiteShell from "@/components/layout/SiteShell";
import ShopGrid from "@/components/sections/ShopGrid";

export default function ShopPage() {
  return (
    <SiteShell>
      <Suspense fallback={<div className="container-x py-20 text-center text-muted">Loading…</div>}>
        <ShopGrid />
      </Suspense>
    </SiteShell>
  );
}
