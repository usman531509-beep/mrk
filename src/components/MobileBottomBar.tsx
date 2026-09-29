"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { Bike, LayoutGrid, Search, ShoppingBag, UserRound } from "lucide-react";

import { useOverlays } from "@/lib/overlays-store";
import { useCart } from "@/lib/cart-store";
import { cn } from "@/lib/utils";

// Mobile bottom navigation (hidden from lg up) in the MRK style: a floating,
// frosted pill inset from the screen edges. Five quick actions — search ·
// menu · finder · account · basket. The bike finder is the primary action and
// sits inside the bar as a solid navy pill; the item for the open sheet or
// current route is highlighted in navy with a small dot.

type Icon = React.ComponentType<{ className?: string; strokeWidth?: number }>;

export function MobileBottomBar() {
  const { data: session } = useSession();
  const pathname = usePathname() ?? "";
  const cartCount = useCart((s) => s.items.reduce((n, i) => n + i.quantity, 0));

  const { searchOpen, menuOpen, finderOpen, cartOpen, openSearch, openMenu, openFinder, openCart } =
    useOverlays();

  const role = session?.user?.role;
  const isStaff = role === "ADMIN" || role === "MANAGER" || role === "STAFF";
  const accountHref = session?.user ? (isStaff ? "/admin" : "/account") : "/login";
  const accountActive =
    pathname.startsWith("/account") || pathname.startsWith("/login") || pathname.startsWith("/register");

  return (
    <nav
      aria-label="Mobile navigation"
      className="fixed inset-x-3 z-40 lg:hidden"
      style={{ bottom: "calc(10px + env(safe-area-inset-bottom, 0px))" }}
    >
      <div
        className={cn(
          "flex h-[62px] items-stretch gap-1 rounded-[20px] border border-[#e1e9f0] p-1.5",
          "bg-white/90 backdrop-blur-xl backdrop-saturate-150",
          "shadow-[0_18px_40px_-18px_rgba(0,17,40,0.45),0_2px_8px_-2px_rgba(0,17,40,0.08)]",
        )}
      >
        <BarButton label="Search" icon={Search} onClick={openSearch} active={searchOpen} />
        <BarButton label="Menu" icon={LayoutGrid} onClick={openMenu} active={menuOpen} />
        <BarButton label="Finder" icon={Bike} onClick={openFinder} active={finderOpen} primary />
        <BarLink
          label={isStaff ? "Admin" : "Account"}
          icon={UserRound}
          href={accountHref}
          active={accountActive}
        />
        <BarButton
          label="Basket"
          icon={ShoppingBag}
          onClick={openCart}
          active={cartOpen || pathname.startsWith("/cart")}
          badge={cartCount}
        />
      </div>
    </nav>
  );
}

const itemBase =
  "group relative flex min-w-0 flex-1 flex-col items-center justify-center gap-[3px] rounded-[14px] " +
  "text-[11px] font-semibold leading-none transition-colors duration-150 " +
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#4084b4]";

function ItemInner({
  label,
  icon: IconCmp,
  active,
  primary,
  badge,
}: {
  label: string;
  icon: Icon;
  active?: boolean;
  primary?: boolean;
  badge?: number;
}) {
  return (
    <>
      <span className="relative">
        <IconCmp
          className="h-[21px] w-[21px] transition-transform duration-150 group-active:scale-90"
          strokeWidth={primary ? 1.9 : 1.7}
        />
        {!!badge && badge > 0 && (
          <span className="absolute -right-2.5 -top-1.5 inline-flex h-[17px] min-w-[17px] items-center justify-center rounded-full bg-[#071f36] px-1 text-[9.5px] font-bold text-white ring-2 ring-white">
            {badge > 99 ? "99+" : badge}
          </span>
        )}
      </span>
      <span className="truncate">{label}</span>
      {active && !primary && (
        <span aria-hidden="true" className="absolute bottom-[3px] h-1 w-1 rounded-full bg-[#071f36]" />
      )}
    </>
  );
}

function itemClass(active?: boolean, primary?: boolean) {
  if (primary) {
    return cn(
      itemBase,
      "bg-[#071f36] text-white shadow-[0_8px_18px_-10px_rgba(7,31,54,0.9)] active:bg-[#173b58]",
      active && "bg-[#173b58]",
    );
  }
  return cn(itemBase, active ? "bg-[#eef5fb] text-[#001128]" : "text-[#4f6479] active:bg-[#f2f6fa]");
}

function BarButton({
  label,
  icon,
  onClick,
  active,
  primary,
  badge,
}: {
  label: string;
  icon: Icon;
  onClick: () => void;
  active?: boolean;
  primary?: boolean;
  badge?: number;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={itemClass(active, primary)}
      aria-label={badge ? `${label}, ${badge} ${badge === 1 ? "item" : "items"}` : label}
      aria-expanded={active}
    >
      <ItemInner label={label} icon={icon} active={active} primary={primary} badge={badge} />
    </button>
  );
}

function BarLink({
  label,
  icon,
  href,
  active,
}: {
  label: string;
  icon: Icon;
  href: string;
  active?: boolean;
}) {
  return (
    <Link
      href={href}
      className={itemClass(active)}
      aria-label={label}
      aria-current={active ? "page" : undefined}
    >
      <ItemInner label={label} icon={icon} active={active} />
    </Link>
  );
}
