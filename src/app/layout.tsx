import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import "./theme.css";
import { SessionProvider } from "next-auth/react";
import { auth } from "@/auth";
import { getNavData } from "@/lib/nav-cache";
import { LandingHeader } from "@/components/landing/LandingHeader";
import { getLandingNav } from "@/lib/landing-nav";
import "@/components/landing/landing.css";
import { Footer } from "@/components/Footer";
import { GlobalOverlays } from "@/components/GlobalOverlays";
import { MobileBottomBar } from "@/components/MobileBottomBar";
import { SiteChrome } from "@/components/SiteChrome";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { CartScope } from "@/components/CartScope";
import { WishlistScope } from "@/components/WishlistScope";
import { ForcePasswordChange } from "@/components/ForcePasswordChange";

// MRK fonts: Inter for body/UI text, Archivo Narrow (bold only, so every
// weight renders bold like the old single-weight display face) for the
// condensed display headings, and Archivo for the landing page headlines.
// --font-mono-ui also maps to Inter (no separate mono face; tables rely on
// tabular-nums).
// Self-hosted (src/fonts, latin variable woff2 from Fontsource, OFL) so the
// build never depends on fetching from Google Fonts.
const body = localFont({
  src: "../fonts/inter-latin-wght-normal.woff2",
  weight: "400 900",
  variable: "--font-body",
  display: "swap",
});
const head = localFont({
  src: "../fonts/archivo-narrow-latin-wght-normal.woff2",
  weight: "700",
  variable: "--font-head",
  display: "swap",
});
const display = localFont({
  src: "../fonts/archivo-latin-wght-normal.woff2",
  weight: "500 900",
  variable: "--font-archivo",
  display: "swap",
});
const monoUi = localFont({
  src: "../fonts/inter-latin-wght-normal.woff2",
  weight: "500 700",
  variable: "--font-mono-ui",
  display: "swap",
});

export const metadata: Metadata = {
  title: { default: "MRK Spare — Motorbike Spares & Accessories", template: "%s · MRK Spare" },
  description:
    "Genuine and aftermarket motorbike spare parts. Filter by your bike model and year only see what fits.",
  keywords: ["motorbike parts", "spare parts", "motorcycle", "bike accessories"],
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const [session, nav, landingNav] = await Promise.all([auth(), getNavData(), getLandingNav()]);
  const { brands, productBrands, models, tree } = nav;

  return (
    <html lang="en" className={`${body.variable} ${head.variable} ${display.variable} ${monoUi.variable}`}>
      <body className="min-h-screen flex flex-col pb-[84px] lg:pb-0">
        <SessionProvider session={session}>
          <CartScope />
          <WishlistScope />
          <ForcePasswordChange />
          {/* Promise-based replacement for window.confirm() — shared by every
              delete button across the app. */}
          <ConfirmDialog />
          {/* MRK header on every storefront page. The home page renders its own
              transparent-over-hero copy, so SiteChrome skips "/" here; the
              spacer wrapper reserves the fixed header's height. */}
          <SiteChrome>
            <div className="mrk-landing mrk-site-header">
              <LandingHeader {...landingNav} solid />
            </div>
          </SiteChrome>
          <main className="flex-1">{children}</main>
          <SiteChrome hideOnPortals>
            <Footer tree={tree} />
          </SiteChrome>
          <SiteChrome slot="bottom">
            <GlobalOverlays brands={brands} productBrands={productBrands} models={models} tree={tree} />
            <MobileBottomBar />
          </SiteChrome>
        </SessionProvider>
      </body>
    </html>
  );
}
