import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getNavData, NAV_CACHE_TAG, type NavCategoryNode } from "@/lib/nav-cache";
import type { NavNode } from "@/components/landing/NavMenu";

// Menu trees for the MRK header (LandingHeader) — shared by the home page and
// the root layout so every storefront page gets the same mega menus.
// The extra lookups (per-brand part counts, top-category images) are cached
// under the nav tag, so admin edits that bust the nav cache refresh these too.

const getMenuExtras = unstable_cache(
  async () => {
    const live = { active: true, deletedAt: null } as const;
    const [brandCounts, categoryImages] = await Promise.all([
      prisma.brand.findMany({
        select: { id: true, _count: { select: { compatProducts: { where: live } } } },
      }),
      prisma.category.findMany({
        where: { depth: 0, deletedAt: null },
        select: { id: true, imageUrl: true },
      }),
    ]);
    return {
      partsByBrand: brandCounts.map((b) => [b.id, b._count.compatProducts] as const),
      imageByCategory: categoryImages.map((c) => [c.id, c.imageUrl] as const),
    };
  },
  ["landing-menu-extras-v1"],
  { revalidate: 300, tags: [NAV_CACHE_TAG] },
);

export type LandingNav = {
  categories: NavNode[];
  accessories: NavNode[];
  bikes: NavNode[];
  brands: NavNode[];
};

const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? "" : "s"}`;

export async function getLandingNav(): Promise<LandingNav> {
  const [{ brands, productBrands, models, tree }, extras] = await Promise.all([
    getNavData(),
    getMenuExtras(),
  ]);
  const partsByBrand = new Map(extras.partsByBrand);
  const imageById = new Map(extras.imageByCategory);

  // Full category tree (every level, including categories without
  // sub-categories); counts show only where parts exist.
  const toCatNode = (c: NavCategoryNode): NavNode => {
    const kids = c.children.map(toCatNode);
    return {
      id: c.id,
      name: c.name,
      href: `/products?category=${encodeURIComponent(c.path)}`,
      meta: c.productCount > 0 ? plural(c.productCount, "part") : undefined,
      image: c.depth === 0 ? (imageById.get(c.id) ?? null) : null,
      children: kids.length ? kids : undefined,
    };
  };
  const accessoriesNode = tree.find((c) => c.slug.startsWith("accessor"));

  // By Bike: each make opens its models (model + year range link straight to
  // the fitment-filtered catalogue).
  const bikes: NavNode[] = brands.map((b) => {
    const count = partsByBrand.get(b.id) ?? 0;
    const brandModels = models
      .filter((m) => m.brandId === b.id)
      .map((m) => ({
        id: m.id,
        name: m.name,
        href: `/products?brand=${encodeURIComponent(b.slug)}&model=${encodeURIComponent(m.id)}`,
        meta: `${m.yearStart}–${m.yearEnd}`,
      }));
    return {
      id: b.id,
      name: b.name,
      href: `/products?brand=${encodeURIComponent(b.slug)}`,
      meta: count > 0 ? plural(count, "part") : undefined,
      children: brandModels.length ? brandModels : undefined,
    };
  });

  return {
    categories: tree.map(toCatNode),
    accessories: (accessoriesNode?.children ?? []).map(toCatNode),
    bikes,
    brands: productBrands.map((b) => ({
      id: b.id,
      name: b.name,
      href: `/products?productBrand=${encodeURIComponent(b.slug)}`,
    })),
  };
}
