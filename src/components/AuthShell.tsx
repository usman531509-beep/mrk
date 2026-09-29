import Link from "next/link";
import { Wordmark } from "@/components/Wordmark";
import { ArrowLeft, BadgeCheck, ShieldCheck, Truck } from "lucide-react";

// Full-screen shell for the auth / utility pages (login, register, track,
// forgot/reset password): a blue gradient page with one centred card. The
// card's left half is a navy/blue welcome panel with decorative circles; the
// right half holds the page's own form (children). The site chrome
// (header/footer) is hidden on these routes via SiteChrome.

export function AuthShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="h-auth2">
      <Link href="/" className="h-auth2-back">
        <ArrowLeft aria-hidden="true" /> Back to shop
      </Link>

      <div className="h-auth2-card">
        <aside className="h-auth2-welcome">
          <span className="h-auth2-orb h-auth2-orb-a" aria-hidden="true" />
          <span className="h-auth2-orb h-auth2-orb-b" aria-hidden="true" />
          <span className="h-auth2-orb h-auth2-orb-c" aria-hidden="true" />

          <div className="h-auth2-welcome-in">
            <Link href="/" aria-label="MRK Spare home" className="h-auth2-logo">
              <Wordmark className="text-[22px] !text-white" />
            </Link>
            <h2>Welcome</h2>
            <p className="h-auth2-tag">Your bike. Only better.</p>
            <p className="h-auth2-copy">
              Genuine and aftermarket parts for scooters, mopeds and motorcycles
              matched to your make, model and year.
            </p>
            <ul className="h-auth2-points">
              <li><BadgeCheck aria-hidden="true" /> Genuine brands</li>
              <li><Truck aria-hidden="true" /> Fast delivery</li>
              <li><ShieldCheck aria-hidden="true" /> Expert support</li>
            </ul>
          </div>
        </aside>

        <main className="h-auth2-form">
          <span className="h-auth2-orb h-auth2-orb-d" aria-hidden="true" />
          <div className="h-auth2-form-in">{children}</div>
        </main>
      </div>
    </div>
  );
}
