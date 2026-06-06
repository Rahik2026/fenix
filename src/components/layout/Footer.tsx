"use client";

import Link from "next/link";
import Brand from "@/components/ui/Brand";
import { useSettings } from "@/context/SettingsContext";

export default function Footer() {
  const settings = useSettings();
  const year = new Date().getFullYear();

  return (
    <footer
      className="relative overflow-hidden mt-10 text-white"
      style={{
        background:
          "linear-gradient(135deg, rgba(14,41,61,0.88), rgba(5,10,18,0.93)), url('/assets/footerbg.jpg') center/cover no-repeat",
      }}
    >
      <div className="container-x relative z-10 grid gap-7 md:grid-cols-[1.4fr_1fr_0.9fr_0.9fr] pt-8 pb-5">
        <div className="max-w-sm">
          <Brand dark size="sm" />
          <p className="mt-3 text-white/80 leading-relaxed text-sm">
            {settings.footerNote}
          </p>
        </div>
        <div>
          <h3 className="serif-title text-lg mb-3">Shop</h3>
          <ul className="grid gap-2 text-sm text-white/85">
            <li><Link href="/shop" className="hover:text-white">All products</Link></li>
            <li><Link href="/shop?sort=featured" className="hover:text-white">Featured</Link></li>
            <li><Link href="/shop?sort=new" className="hover:text-white">New arrivals</Link></li>
            <li><Link href="/cart" className="hover:text-white">Cart</Link></li>
          </ul>
        </div>
        <div>
          <h3 className="serif-title text-lg mb-3">Company</h3>
          <ul className="grid gap-2 text-sm text-white/85">
            <li><Link href="/about" className="hover:text-white">About</Link></li>
            <li><Link href="/contact" className="hover:text-white">Contact</Link></li>
            <li><Link href="/policies" className="hover:text-white">Policies</Link></li>
            <li><Link href="/auth" className="hover:text-white">Sign in</Link></li>
          </ul>
        </div>
        <div>
          <h3 className="serif-title text-lg mb-3">Support</h3>
          <p className="text-sm text-white/85 leading-relaxed">
            <strong>Email:</strong> {settings.supportEmail}
            <br />
            <strong>Phone:</strong> {settings.supportPhone}
          </p>
          <div className="flex gap-2 mt-3">
            {["F", "I"].map((s) => (
              <span
                key={s}
                className="w-9 h-9 grid place-items-center rounded-full border border-white/16 bg-white/8 text-sm"
              >
                {s}
              </span>
            ))}
          </div>
        </div>
      </div>
      <div className="container-x relative z-10 border-t border-white/12 py-4 text-white/75 text-sm">
        © {year} {settings.storeName}. Built with Next.js, Firebase &amp; Supabase.
      </div>
    </footer>
  );
}
