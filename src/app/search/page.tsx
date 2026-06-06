import { Suspense } from "react";
import SiteShell from "@/components/layout/SiteShell";
import SearchView from "@/components/sections/SearchView";

export default function SearchPage() {
  return (
    <SiteShell>
      <Suspense fallback={<div className="container-x py-20 text-center text-muted">Loading…</div>}>
        <SearchView />
      </Suspense>
    </SiteShell>
  );
}
