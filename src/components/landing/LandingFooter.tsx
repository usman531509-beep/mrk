import Link from "next/link";
import { ArrowUp, Clock, Lock, Mail, MapPin, Phone } from "lucide-react";
import {
  SITE_ADDRESS, SITE_EMAIL, SITE_HOURS, SITE_PHONE, SITE_PHONE_TEL, SITE_SUPPORT_EMAIL,
} from "@/lib/site";

type FooterLink = { name: string; href: string };

// Landing footer: brand + contact column, and link columns fed
// by the live catalogue (top categories, bike brands). Only links to pages
// that exist in the app — no placeholder "#" or missing info pages.
export function LandingFooter({
  categories = [],
  bikes = [],
}: {
  categories?: FooterLink[];
  bikes?: FooterLink[];
}) {
  const year = new Date().getFullYear();
  const account: FooterLink[] = [
    { name: "Sign in", href: "/login" },
    { name: "Create an account", href: "/register" },
    { name: "My orders", href: "/account/orders" },
    { name: "Basket", href: "/cart" },
  ];
  const help: FooterLink[] = [
    { name: "Track your order", href: "/track" },
    { name: "Trade accounts", href: "/trade-account" },
    { name: "Reset your password", href: "/forgot-password" },
  ];

  return (
    <footer className="mrk-footer">
      <div className="mrk-container mrk-footer-main">
        <div className="mrk-footer-brand">
          <Link href="/" className="mrk-footer-logo" aria-label="MRK Spare home">
            MRK <span>/</span> SPARE
          </Link>
          <p>
            Genuine and aftermarket parts for scooters, mopeds and motorcycles matched to your
            make, model and year, and backed by a parts team that knows bikes.
          </p>
          <ul className="mrk-footer-contact">
            <li>
              <Phone aria-hidden="true" />
              <a href={`tel:${SITE_PHONE_TEL}`}>{SITE_PHONE}</a>
            </li>
            <li>
              <Mail aria-hidden="true" />
              <a href={`mailto:${SITE_EMAIL}`}>{SITE_EMAIL}</a>
            </li>
            <li>
              <Clock aria-hidden="true" />
              <span>{SITE_HOURS}</span>
            </li>
            <li>
              <MapPin aria-hidden="true" />
              <span>{SITE_ADDRESS}</span>
            </li>
          </ul>
        </div>

        <nav className="mrk-footer-col" aria-label="Shop">
          <h2>Shop</h2>
          <ul>
            {categories.map((c) => (
              <li key={c.href}>
                <Link href={c.href}>{c.name}</Link>
              </li>
            ))}
            <li>
              <Link href="/products">All products</Link>
            </li>
          </ul>
        </nav>

        {bikes.length > 0 && (
          <nav className="mrk-footer-col" aria-label="Shop by bike">
            <h2>Shop by bike</h2>
            <ul>
              {bikes.map((b) => (
                <li key={b.href}>
                  <Link href={b.href}>{b.name}</Link>
                </li>
              ))}
              <li>
                <Link href="/#bike-finder">Find my bike</Link>
              </li>
            </ul>
          </nav>
        )}

        <nav className="mrk-footer-col" aria-label="Account">
          <h2>Account</h2>
          <ul>
            {account.map((l) => (
              <li key={l.href}>
                <Link href={l.href}>{l.name}</Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav className="mrk-footer-col" aria-label="Help">
          <h2>Help</h2>
          <ul>
            {help.map((l) => (
              <li key={l.href}>
                <Link href={l.href}>{l.name}</Link>
              </li>
            ))}
            <li>
              <a href={`mailto:${SITE_SUPPORT_EMAIL}`}>Email support</a>
            </li>
          </ul>
        </nav>
      </div>

      <div className="mrk-footer-bottom">
        <div className="mrk-container mrk-footer-bottom-in">
          <span>© {year} MRK Spare Ltd. All rights reserved.</span>
          <span className="mrk-footer-secure">
            <Lock aria-hidden="true" /> Secure checkout powered by Stripe
          </span>
          <a href="#" className="mrk-footer-top">
            Back to top <ArrowUp aria-hidden="true" />
          </a>
        </div>
      </div>
    </footer>
  );
}
