"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Brand from "@/components/ui/Brand";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import {
  SearchIcon,
  CartIcon,
  HeartIcon,
  UserIcon,
  MenuIcon,
  CloseIcon,
} from "@/components/ui/icons";
import { cx } from "@/lib/utils";

const NAV = [
  { label: "Home", href: "/" },
  { label: "Shop", href: "/shop" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { count, setDrawerOpen } = useCart();
  const { user, isAdmin } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.classList.toggle("no-scroll", menuOpen);
    return () => document.body.classList.remove("no-scroll");
  }, [menuOpen]);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <header className="fixed top-0 inset-x-0 z-[1000]">
      <div className="py-2.5">
        <div className="container-x">
          <nav
            aria-label="Primary"
            className="flex items-center gap-3 min-h-[58px] md:min-h-[66px] px-3 md:px-4 rounded-[20px] border border-white/30"
            style={{
              background: "rgba(248,250,253,0.7)",
              backdropFilter: "blur(16px)",
              WebkitBackdropFilter: "blur(16px)",
              boxShadow:
                "0 16px 40px rgba(5,14,25,0.14), inset 0 1px 0 rgba(255,255,255,0.45)",
            }}
          >
            <Brand size="sm" />

            <button
              type="button"
              className="md:hidden ml-auto grid place-items-center w-10 h-10 rounded-full text-ink hover:bg-ink/10"
              aria-label="Open menu"
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((o) => !o)}
            >
              {menuOpen ? (
                <CloseIcon className="w-5 h-5" />
              ) : (
                <MenuIcon className="w-5 h-5" />
              )}
            </button>

            {/* Desktop links */}
            <div className="hidden md:flex items-center flex-1">
              <div className="flex items-center gap-6 ml-auto">
                {NAV.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cx(
                      "text-sm uppercase tracking-wide transition-colors",
                      isActive(item.href)
                        ? "text-primary-2 font-semibold"
                        : "text-ink hover:text-primary-2"
                    )}
                  >
                    {item.label}
                  </Link>
                ))}
                {isAdmin && (
                  <Link
                    href="/admin"
                    className="text-sm uppercase tracking-wide text-gold font-semibold"
                  >
                    Admin
                  </Link>
                )}
              </div>
              <NavActions
                count={count}
                openCart={() => setDrawerOpen(true)}
                onSearch={() => router.push("/search")}
                loggedIn={!!user}
              />
            </div>
          </nav>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden container-x">
          <div className="mt-2 card p-4 animate-fadeUp">
            <div className="flex flex-col gap-1">
              {NAV.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cx(
                    "px-3 py-3 rounded-xl text-sm uppercase tracking-wide",
                    isActive(item.href)
                      ? "bg-primary-2/10 text-primary-2 font-semibold"
                      : "text-ink hover:bg-ink/5"
                  )}
                >
                  {item.label}
                </Link>
              ))}
              <Link
                href="/wishlist"
                className="px-3 py-3 rounded-xl text-sm uppercase tracking-wide text-ink hover:bg-ink/5"
              >
                Wishlist
              </Link>
              <Link
                href={user ? "/account" : "/auth"}
                className="px-3 py-3 rounded-xl text-sm uppercase tracking-wide text-ink hover:bg-ink/5"
              >
                {user ? "My Account" : "Sign In"}
              </Link>
              {isAdmin && (
                <Link
                  href="/admin"
                  className="px-3 py-3 rounded-xl text-sm uppercase tracking-wide text-gold font-semibold"
                >
                  Admin Panel
                </Link>
              )}
            </div>
            <div className="mt-3 flex gap-2">
              <Link href="/search" className="btn-ghost flex-1">
                <SearchIcon className="w-4 h-4" /> Search
              </Link>
              <button
                className="btn flex-1"
                onClick={() => {
                  setMenuOpen(false);
                  setDrawerOpen(true);
                }}
              >
                <CartIcon className="w-4 h-4" /> Cart ({count})
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

function NavActions({
  count,
  openCart,
  onSearch,
  loggedIn,
}: {
  count: number;
  openCart: () => void;
  onSearch: () => void;
  loggedIn: boolean;
}) {
  return (
    <div className="flex items-center gap-1 ml-5">
      <button
        onClick={onSearch}
        aria-label="Search"
        className="grid place-items-center w-10 h-10 rounded-full text-ink hover:bg-ink/10"
      >
        <SearchIcon className="w-5 h-5" />
      </button>
      <Link
        href="/wishlist"
        aria-label="Wishlist"
        className="grid place-items-center w-10 h-10 rounded-full text-ink hover:bg-ink/10"
      >
        <HeartIcon className="w-5 h-5" />
      </Link>
      <Link
        href={loggedIn ? "/account" : "/auth"}
        aria-label="Account"
        className="grid place-items-center w-10 h-10 rounded-full text-ink hover:bg-ink/10"
      >
        <UserIcon className="w-5 h-5" />
      </Link>
      <button
        onClick={openCart}
        aria-label="Open cart"
        className="relative grid place-items-center w-10 h-10 rounded-full text-ink hover:bg-ink/10"
      >
        <CartIcon className="w-5 h-5" />
        {count > 0 && (
          <span className="absolute top-1 right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-primary-3 text-white text-[10px] font-bold grid place-items-center">
            {count}
          </span>
        )}
      </button>
    </div>
  );
}
