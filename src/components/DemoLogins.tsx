"use client";

// TEMPORARY — one-click test accounts on /login while the store is being
// tested. Credentials are NOT in the source: they come from the
// NEXT_PUBLIC_DEMO_LOGINS env var (".env", never committed), formatted as
//   Label|email|password;Label|email|password
// Leave it unset (e.g. in production) and this box doesn't render at all.
// Passwords are never displayed — a chip only fills the form.

type DemoAccount = { label: string; email: string; password: string };

function parseDemoLogins(raw: string | undefined): DemoAccount[] {
  if (!raw) return [];
  return raw
    .split(";")
    .map((entry) => entry.split("|").map((part) => part.trim()))
    .filter((parts) => parts.length === 3 && parts.every(Boolean))
    .map(([label, email, password]) => ({ label, email, password }));
}

const DEMO_ACCOUNTS = parseDemoLogins(process.env.NEXT_PUBLIC_DEMO_LOGINS);

export function DemoLogins({ onPick }: { onPick: (email: string, password: string) => void }) {
  if (!DEMO_ACCOUNTS.length) return null;
  return (
    <div className="mb-6 rounded-[10px] border border-dashed border-[#b9c9d8] bg-[#f6f9fc] px-3 py-2.5">
      <div className="mb-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#5b6b7c]">
        Test login — click to fill
      </div>
      <div className="grid grid-cols-3 gap-2">
        {DEMO_ACCOUNTS.map((a) => (
          <button
            key={a.email}
            type="button"
            onClick={() => onPick(a.email, a.password)}
            aria-label={`Fill ${a.label.toLowerCase()} test account`}
            className="min-h-[44px] cursor-pointer rounded-[8px] border border-[#d6e2ec] bg-white px-2 py-1.5 text-center transition-colors hover:border-[#1461a4] hover:bg-[#eef5fb] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#1461a4]"
          >
            <span className="block text-[13px] font-semibold text-[#001128]">{a.label}</span>
            <span className="block truncate text-[11px] text-[#5b6b7c]">Test account</span>
          </button>
        ))}
      </div>
    </div>
  );
}
