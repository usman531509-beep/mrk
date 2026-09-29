import Link from "next/link";
import {
  ArrowRight, BadgeCheck, Bike, FileText, PackageSearch, Percent, ShieldCheck, Truck,
} from "lucide-react";
import { ProductTile, type FavouriteProduct } from "@/components/landing/RiderFavourites";

// Data-driven landing sections. Everything here renders straight from what
// the admin portal manages (offers, brands, categories, product flags, trade
// discounts); each section hides itself when there's nothing to show.

function SectionHeading({
  eyebrow,
  title,
  id,
  link,
  light = false,
}: {
  eyebrow: string;
  title: string;
  id: string;
  link?: { href: string; label: string };
  light?: boolean;
}) {
  return (
    <>
      <p className={`mrk-eyebrow ${light ? "mrk-eyebrow-light" : ""}`}>
        {eyebrow} <span />
      </p>
      <div className="mrk-section-heading">
        <h2 id={id}>{title}</h2>
        {link && (
          <Link href={link.href} className={`mrk-text-link ${light ? "mrk-text-link-light" : ""}`}>
            {link.label} <ArrowRight aria-hidden="true" />
          </Link>
        )}
      </div>
    </>
  );
}

/* ---------- Offers (admin → Marketing → Offers) ---------- */
export function OffersStrip({ offers }: { offers: { id: string; text: string; icon: string | null }[] }) {
  if (!offers.length) return null;
  return (
    <aside className="mrk-offers" aria-label="Current offers">
      <div className="mrk-container mrk-offers-in">
        {offers.map((o) => (
          <p key={o.id}>
            {o.icon && <span aria-hidden="true">{o.icon}</span>}
            {o.text}
          </p>
        ))}
      </div>
    </aside>
  );
}

/* ---------- Shop by bike (admin → Bike Brands) ---------- */
export type BikeBrandTile = { id: string; name: string; slug: string; logoUrl: string | null; count: number };

export function ShopByBike({ brands }: { brands: BikeBrandTile[] }) {
  if (!brands.length) return null;
  return (
    <section className="mrk-container mrk-section" aria-labelledby="bikes-title">
      <SectionHeading
        eyebrow="Shop by bike"
        title="Parts for your ride."
        id="bikes-title"
        link={{ href: "#bike-finder", label: "Find by make, model & year" }}
      />
      <div className="mrk-bike-grid">
        {brands.map((b) => (
          <Link key={b.id} href={`/products?brand=${encodeURIComponent(b.slug)}`} className="mrk-bike">
            <span className="mrk-bike-logo">
              {b.logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={b.logoUrl} alt="" loading="lazy" />
              ) : (
                <span aria-hidden="true">{b.name.charAt(0)}</span>
              )}
            </span>
            <span className="mrk-bike-name">{b.name}</span>
            <span className="mrk-bike-count">
              {b.count} {b.count === 1 ? "part" : "parts"}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}

/* ---------- In demand (products flagged "demanding" in admin) ---------- */
export function InDemand({ products }: { products: FavouriteProduct[] }) {
  if (!products.length) return null;
  return (
    <section className="mrk-container mrk-section" aria-labelledby="demand-title">
      <div className={`mrk-demand mrk-demand-in mrk-demand-in-${Math.min(products.length, 3)}`}>
        <div className="mrk-demand-copy">
          <p className="mrk-eyebrow mrk-eyebrow-light">
            In demand <span />
          </p>
          <h2 id="demand-title">Moving fast right now.</h2>
          <p>
            The parts riders are ordering most this week. Stock on these moves quickly — grab yours
            before it’s gone.
          </p>
          <Link href="/products" className="mrk-button mrk-button-light">
            Shop all parts <ArrowRight aria-hidden="true" />
          </Link>
        </div>
        <div className={`mrk-demand-grid mrk-demand-grid-${Math.min(products.length, 3)}`}>
          {products.map((p) => (
            <ProductTile key={p.id} product={p} badge="In demand" />
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------- New arrivals (latest active products) ---------- */
export function NewArrivals({ products }: { products: FavouriteProduct[] }) {
  if (!products.length) return null;
  return (
    <section className="mrk-container mrk-section" aria-labelledby="new-title">
      <SectionHeading
        eyebrow="New arrivals"
        title="Just landed."
        id="new-title"
        link={{ href: "/products", label: "Shop new parts" }}
      />
      <div className="mrk-rail">
        {products.map((p) => (
          <ProductTile key={p.id} product={p} badge="New" />
        ))}
      </div>
    </section>
  );
}

/* ---------- Category index (admin → Categories) ---------- */
export type CategoryTile = { id: string; name: string; path: string; imageUrl: string | null; count: number };

export function CategoryIndex({ categories }: { categories: CategoryTile[] }) {
  if (!categories.length) return null;
  return (
    <section className="mrk-container mrk-section" aria-labelledby="catindex-title">
      <SectionHeading
        eyebrow="All categories"
        title="Every part, sorted."
        id="catindex-title"
        link={{ href: "/products", label: "Browse the catalogue" }}
      />
      <div className="mrk-catindex">
        {categories.map((c) => (
          <Link
            key={c.id}
            href={`/products?category=${encodeURIComponent(c.path)}`}
            className="mrk-catindex-item"
          >
            <span className="mrk-catindex-thumb">
              {c.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={c.imageUrl} alt="" loading="lazy" />
              ) : (
                <PackageSearch aria-hidden="true" />
              )}
            </span>
            <span className="mrk-catindex-text">
              <span className="mrk-catindex-name">{c.name}</span>
              <span className="mrk-catindex-count">
                {c.count} {c.count === 1 ? "product" : "products"}
              </span>
            </span>
            <ArrowRight className="mrk-catindex-arrow" aria-hidden="true" />
          </Link>
        ))}
      </div>
    </section>
  );
}

/* ---------- How it works ---------- */
export function HowItWorks() {
  const steps = [
    {
      icon: Bike,
      title: "Pick your bike",
      text: "Choose your make, model and year and we’ll only show parts listed for it.",
      link: { href: "#bike-finder", label: "Open the bike finder" },
    },
    {
      icon: ShieldCheck,
      title: "Check the fitment",
      text: "Every part shows the bikes and years it fits, plus OEM and SKU numbers to double-check.",
      link: { href: "/products", label: "Browse parts" },
    },
    {
      icon: Truck,
      title: "Track it to your door",
      text: "Carefully packed and dispatched fast. Follow your parcel with your courier’s tracking number.",
      link: { href: "/track", label: "Track an order" },
    },
  ];
  return (
    <section className="mrk-container mrk-section" aria-labelledby="how-title">
      <SectionHeading eyebrow="How it works" title="The right part, first time." id="how-title" />
      <ol className="mrk-process">
        {steps.map((s, i) => (
          <li key={s.title} className="mrk-process-step">
            <span className="mrk-process-marker" aria-hidden="true">
              <s.icon />
            </span>
            <div className="mrk-process-body">
              <p className="mrk-process-num">Step {String(i + 1).padStart(2, "0")}</p>
              <h3>{s.title}</h3>
              <p className="mrk-process-text">{s.text}</p>
              <Link href={s.link.href} className="mrk-text-link">
                {s.link.label} <ArrowRight aria-hidden="true" />
              </Link>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}

/* ---------- Trade account (admin → Trade discounts) ---------- */
export function TradeBanner({ maxPercent, isTrader }: { maxPercent: number; isTrader: boolean }) {
  const perks = [
    { icon: Percent, text: "Trade prices applied automatically on every product" },
    { icon: FileText, text: "Order history and invoices in your account" },
    { icon: BadgeCheck, text: "Genuine brands, checked fitment" },
  ];
  return (
    <section className="mrk-container mrk-section" aria-labelledby="trade-title">
      <div className="mrk-trade">
        <div className="mrk-trade-copy">
          <p className="mrk-eyebrow">
            For garages & trade <span />
          </p>
          <h2 id="trade-title">
            {isTrader
              ? "Your trade prices are live."
              : maxPercent > 0
                ? `Trade customers save up to ${maxPercent}%.`
                : "Open a trade account."}
          </h2>
          <ul>
            {perks.map((p) => (
              <li key={p.text}>
                <p.icon aria-hidden="true" /> {p.text}
              </li>
            ))}
          </ul>
          <div className="mrk-trade-actions">
            {isTrader ? (
              <Link href="/products" className="mrk-button">
                Shop with trade prices <ArrowRight aria-hidden="true" />
              </Link>
            ) : (
              <>
                <Link href="/trade-account" className="mrk-button">
                  Apply for a trade account <ArrowRight aria-hidden="true" />
                </Link>
                <Link href="/login" className="mrk-text-link">
                  Already approved? Sign in
                </Link>
              </>
            )}
          </div>
        </div>
        {maxPercent > 0 && (
          <div className="mrk-trade-stat" aria-hidden="true">
            <span className="mrk-trade-upto">up to</span>
            <span className="mrk-trade-num">
              {maxPercent}
              <small>%</small>
            </span>
            <span className="mrk-trade-off">off for trade</span>
          </div>
        )}
      </div>
    </section>
  );
}
