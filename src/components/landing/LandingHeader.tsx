"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import {
  Heart, LayoutDashboard, LogOut, Menu, ShoppingCart, Truck, UserRound, X,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { NavSearch } from "@/components/NavSearch";
import { NavMenu, type NavNode } from "@/components/landing/NavMenu";
import { useCart } from "@/lib/cart-store";
import { useWishlist } from "@/lib/wishlist-store";
import { useOverlays } from "@/lib/overlays-store";

// Landing-page header. Same behaviour as the storefront Header — live search
// (/api/search via NavSearch), wishlist + basket sheets from the shared
// overlay store, and the role-aware account menu — in the landing layout.

function CountBadge({ count }: { count: number }) {
  if (count <= 0) return null;
  return (
    <span className="mrk-cart-count" aria-hidden="true">
      {count > 99 ? "99+" : count}
    </span>
  );
}

export function LandingHeader({
  categories,
  accessories,
  bikes,
  brands,
  solid = false,
}: {
  categories: NavNode[];
  accessories: NavNode[];
  bikes: NavNode[];
  brands: NavNode[];
  /** Always frosted (inner pages have no hero to sit transparently over). */
  solid?: boolean;
}) {
  const { data: session } = useSession();
  const pathname = usePathname();
  const cartCount = useCart((s) => s.items.reduce((n, i) => n + i.quantity, 0));
  const wishlistCount = useWishlist((s) => s.items.length);
  const openCart = useOverlays((s) => s.openCart);
  const openWishlist = useOverlays((s) => s.openWishlist);
  const [mobileOpen, setMobileOpen] = useState(false);
  // Transparent over the hero; frosted once the page has scrolled.
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  const close = () => setMobileOpen(false);

  const role = session?.user?.role;
  const hasAdminPanel = role === "ADMIN" || role === "MANAGER" || role === "STAFF";
  const displayName = session?.user?.name || session?.user?.email || "Account";

  return (
    <header className={`mrk-header ${solid || scrolled || mobileOpen ? "is-solid" : ""}`}>
      <div className="mrk-container mrk-header-inner">
        <button
          className="mrk-icon-button mrk-menu-toggle"
          aria-label={mobileOpen ? "Close navigation" : "Open navigation"}
          aria-expanded={mobileOpen}
          aria-controls="landing-navigation"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <X /> : <Menu />}
        </button>
        <Link href="/" className="mrk-wordmark" aria-label="MRK Spare home">
          MRK <span>/</span> SPARE
        </Link>
        <nav
          id="landing-navigation"
          className={`mrk-navigation ${mobileOpen ? "is-open" : ""}`}
          aria-label="Main navigation"
        >
          <Link href="/" onClick={close} aria-current={pathname === "/" ? "page" : undefined}>
            Home
          </Link>
          <NavMenu label="Shop" heading="Shop by category" items={categories} thumbs onNavigate={close} />
          <NavMenu label="By Bike" heading="Shop by bike" items={bikes} allHref="/#bike-finder" onNavigate={close} />
          <NavMenu label="Brands" heading="Part brands" items={brands} onNavigate={close} />
          <NavMenu label="Accessories" heading="Accessories" items={accessories} onNavigate={close} />
          <Link href="/products" onClick={close}>
            All products
          </Link>
          <Link href="/track" onClick={close} className="mrk-nav-track">
            <Truck size={16} aria-hidden="true" />
            Track order
          </Link>
        </nav>
        <NavSearch variant="landing" />
        <div className="mrk-header-actions">
          <button
            type="button"
            onClick={openWishlist}
            className="mrk-icon-button mrk-cart-button mrk-wishlist-button"
            aria-label={`Wishlist, ${wishlistCount} ${wishlistCount === 1 ? "item" : "items"}`}
          >
            <Heart />
            <CountBadge count={wishlistCount} />
          </button>
          <button
            type="button"
            onClick={openCart}
            className="mrk-icon-button mrk-cart-button"
            aria-label={`Basket, ${cartCount} ${cartCount === 1 ? "item" : "items"}`}
          >
            <ShoppingCart />
            <CountBadge count={cartCount} />
          </button>
          {session?.user ? (
            <DropdownMenu>
              <DropdownMenuTrigger className="mrk-icon-button" aria-label="Account menu">
                <UserRound />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-60">
                <DropdownMenuLabel className="flex flex-col">
                  <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                    {hasAdminPanel ? `Signed in as ${role!.toLowerCase()}` : "Signed in"}
                  </span>
                  <span className="truncate text-sm font-medium normal-case">{displayName}</span>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href={hasAdminPanel ? "/admin" : "/account"} className="cursor-pointer">
                    <LayoutDashboard className="h-4 w-4" /> Go to dashboard
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => void signOut({ callbackUrl: "/" })}
                  className="cursor-pointer text-destructive focus:text-destructive"
                >
                  <LogOut className="h-4 w-4" /> Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            // Signed out: straight to the login page (it links to sign-up).
            <Link href="/login" className="mrk-icon-button" aria-label="Sign in">
              <UserRound />
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
