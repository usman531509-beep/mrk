import Link from "next/link";
import { ArrowRight, BadgeCheck, ShieldCheck, Truck } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getTradeContext, getTradeDiscountRules, tradePrice } from "@/lib/trade-pricing";
import { getNavData, type NavCategoryNode } from "@/lib/nav-cache";
import { Toaster } from "@/components/ui/sonner";
import { LandingHeader } from "@/components/landing/LandingHeader";
import { BikeFinder } from "@/components/landing/BikeFinder";
import { RiderFavourites, type FavouriteProduct } from "@/components/landing/RiderFavourites";
import { LandingFooter } from "@/components/landing/LandingFooter";
import {
  OffersStrip, ShopByBike, InDemand, NewArrivals, CategoryIndex, HowItWorks, TradeBanner,
  type BikeBrandTile, type CategoryTile,
} from "@/components/landing/LandingSections";
import { getActiveOffers } from "@/lib/offers-cache";
import { getLandingNav } from "@/lib/landing-nav";
import "@/components/landing/landing.css";
import { HeroSlideshow } from "@/components/landing/HeroSlideshow";
import { LandingReveal } from "@/components/landing/LandingReveal";

// Per-request render so trade pricing reflects the current viewer.
export const dynamic = "force-dynamic";

export const metadata = {
  title: { absolute: "MRK Spare — Your bike. Only better." },
  description:
    "Find your next upgrade. Shop motorcycle and scooter parts by make, model and year, with trusted brands and expert support from MRK Spare.",
  openGraph: {
    title: "MRK Spare — Your bike. Only better.",
    images: ["/images/landing/hero.jpg"],
  },
};

// Each tile links to the first top-level category whose name/slug matches one
// of its keywords, so the tiles follow whatever the admin has named them.
const categories = [
  {
    name: "Suspension",
    keywords: ["suspension", "shock"],
    image: "suspension",
    copy: (
      <>
        Control.
        <br />
        Confidence.
        <br />
        Every Curve.
      </>
    ),
    link: "Shop suspension",
    alt: "Black and gold motorcycle shock absorbers on blue stone",
  },
  {
    name: "Brakes",
    keywords: ["brake"],
    image: "brakes",
    copy: (
      <>
        Shorter stops.
        <br />
        Greater control.
      </>
    ),
    link: "Shop brakes",
    alt: "Drilled motorcycle brake disc and black brake caliper",
  },
  {
    name: "Engine parts",
    keywords: ["engine"],
    image: "engine",
    copy: (
      <>
        Built for
        <br />
        more miles.
      </>
    ),
    link: "Shop engine parts",
    alt: "Black motorcycle engine cover on a blue stone plinth",
  },
  {
    name: "Lighting",
    keywords: ["light", "lamp", "headlight"],
    image: "lighting",
    copy: (
      <>
        See further.
        <br />
        Ride safer.
      </>
    ),
    link: "Shop lighting",
    alt: "Angular motorcycle LED headlight",
  },
];

const fallbackImages = [
  "/images/landing/rear-shock.jpg",
  "/images/landing/headlight-assembly.jpg",
  "/images/landing/scooter-mudguard.jpg",
];

function findCategory(tree: NavCategoryNode[], keywords: string[]) {
  const all = [...tree, ...tree.flatMap((c) => c.children)];
  return all.find((c) =>
    keywords.some((k) => c.slug.toLowerCase().includes(k) || c.name.toLowerCase().includes(k)),
  );
}

export default async function HomePage() {
  const productInclude = {
    brand: true,
    compatibilities: {
      include: { bikeModel: { include: { brand: true } } },
      take: 1,
    },
  } as const;
  const live = { active: true, deletedAt: null } as const;

  const [
    trade, nav, featuredRows, newestRows, demandRows, brandRows, categoryImages, offers, tradeRules,
  ] = await Promise.all([
    getTradeContext(),
    getNavData(),
    prisma.product.findMany({
      where: { ...live, featured: true },
      include: productInclude,
      orderBy: { createdAt: "desc" },
      take: 3,
    }),
    prisma.product.findMany({
      where: live,
      include: productInclude,
      orderBy: { createdAt: "desc" },
      take: 8,
    }),
    // Admin-curated "in demand" picks.
    prisma.product.findMany({
      where: { ...live, demanding: true },
      include: productInclude,
      orderBy: { updatedAt: "desc" },
      take: 3,
    }),
    // Bike brands with their stocked-part counts (M2M, so multi-brand parts
    // count for every brand — same rule as the /products?brand= filter).
    prisma.brand.findMany({
      orderBy: { name: "asc" },
      select: {
        id: true, name: true, slug: true, logoUrl: true,
        _count: { select: { compatProducts: { where: live } } },
      },
    }),
    prisma.category.findMany({
      where: { depth: 0, deletedAt: null },
      select: { id: true, imageUrl: true },
    }),
    getActiveOffers(),
    getTradeDiscountRules(),
  ]);
  const landingNav = await getLandingNav();

  const { brands, productBrands, models, tree } = nav;

  type Row = (typeof newestRows)[number];
  const toTile = (p: Row, i: number): FavouriteProduct => {
    const tp = tradePrice(Number(p.price), p.categoryId, trade);
    const fit = p.compatibilities[0];
    return {
      id: p.id,
      slug: p.slug,
      name: p.name,
      price: tp.percent > 0 ? tp.discounted : Number(p.price),
      wasPrice: tp.percent > 0 ? Number(p.price) : undefined,
      stock: p.stock,
      image: p.images[0] ?? fallbackImages[i % fallbackImages.length],
      brand: p.brand?.name ?? null,
      fitment: fit
        ? `${fit.bikeModel.brand.name} ${fit.bikeModel.name} · ${fit.yearFrom}–${fit.yearTo}`
        : "",
    };
  };

  // Featured picks first, topped up with the newest parts to fill three cards.
  const picked = [...featuredRows];
  for (const row of newestRows) {
    if (picked.length >= 3) break;
    if (!picked.some((p) => p.id === row.id)) picked.push(row);
  }
  const favourites = picked.map(toTile);
  // Whole rows only on the 4-up desktop grid (a lone 5th card looks broken).
  const newArrivals = newestRows
    .slice(0, newestRows.length >= 4 ? newestRows.length - (newestRows.length % 4) : newestRows.length)
    .map(toTile);
  const inDemand = demandRows.map(toTile);

  const bikeBrands: BikeBrandTile[] = brandRows
    .map((b) => ({ id: b.id, name: b.name, slug: b.slug, logoUrl: b.logoUrl, count: b._count.compatProducts }))
    .filter((b) => b.count > 0)
    .sort((a, b) => b.count - a.count)
    .slice(0, 12);

  const imageById = new Map(categoryImages.map((c) => [c.id, c.imageUrl]));
  const categoryTiles: CategoryTile[] = tree
    .filter((c) => c.productCount > 0)
    .map((c) => ({ id: c.id, name: c.name, path: c.path, imageUrl: imageById.get(c.id) ?? null, count: c.productCount }));

  // Headline trade saving: the best rate any category (or the store-wide
  // baseline) gives an approved trader.
  const maxTradePercent = Math.max(tradeRules.globalPercent, 0, ...tradeRules.discounts.values());

  return (
    <div className="mrk-landing">
      <a className="mrk-skip" href="#main-content">
        Skip to content
      </a>
      <LandingHeader {...landingNav} />
      <div id="main-content">
        <section className="mrk-hero" aria-labelledby="hero-title">
          <div className="mrk-hero-stage">
            <HeroSlideshow />
            <div className="mrk-container mrk-hero-content">
              <p className="mrk-eyebrow">
                Premium motorcycle parts <span />
              </p>
              <h1 id="hero-title">
                Your bike.
                <br />
                Only better.
              </h1>
              <p className="mrk-hero-description">
                High-performance parts. Trusted brands. A smoother,
                <br className="mrk-desktop-break" /> stronger, more thrilling ride every time you
                twist the throttle.
              </p>
              <Link href="/products" className="mrk-button mrk-shop-button">
                Shop parts <ArrowRight aria-hidden="true" />
              </Link>
              <div className="mrk-hero-promises">
                <div>
                  <BadgeCheck />
                  <span>
                    Genuine
                    <br />
                    brands
                  </span>
                </div>
                <div>
                  <Truck />
                  <span>
                    Fast delivery
                    <br />
                    to your door
                  </span>
                </div>
                <div>
                  <ShieldCheck />
                  <span>
                    Expert
                    <br />
                    support
                  </span>
                </div>
              </div>
            </div>
          </div>
          <BikeFinder makes={brands} models={models} />
        </section>
        <OffersStrip offers={offers} />
        <section
          id="categories"
          className="mrk-container mrk-categories"
          aria-labelledby="category-title"
        >
          <p className="mrk-eyebrow">
            Shop by category <span />
          </p>
          <div className="mrk-section-heading">
            <h2 id="category-title">Find your next upgrade.</h2>
            <Link href="/products" className="mrk-text-link">
              View all categories <ArrowRight />
            </Link>
          </div>
          <div className="mrk-category-grid">
            {categories.map((category) => {
              const match = findCategory(tree, category.keywords);
              const href = match
                ? `/products?category=${encodeURIComponent(match.path)}`
                : "/products";
              return (
                <Link
                  key={category.image}
                  href={href}
                  className={`mrk-category mrk-category-${category.image}`}
                >
                  <img
                    src={`/images/landing/${category.image}.jpg`}
                    alt={category.alt}
                    loading="lazy"
                  />
                  <div className="mrk-category-copy">
                    <h3>{category.name}</h3>
                    <p>{category.copy}</p>
                    <span className="mrk-text-link">
                      {category.link} <ArrowRight />
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
        <ShopByBike brands={bikeBrands} />
        <InDemand products={inDemand} />
        <RiderFavourites products={favourites} />
        <NewArrivals products={newArrivals} />
        <CategoryIndex categories={categoryTiles} />
        <HowItWorks />
        <TradeBanner maxPercent={maxTradePercent} isTrader={trade.isTrader} />
      </div>
      <LandingReveal />
      <LandingFooter
        categories={categoryTiles.slice(0, 6).map((c) => ({ name: c.name, href: `/products?category=${encodeURIComponent(c.path)}` }))}
        bikes={bikeBrands.slice(0, 6).map((b) => ({ name: b.name, href: `/products?brand=${encodeURIComponent(b.slug)}` }))}
      />
      <Toaster theme="light" />
    </div>
  );
}
