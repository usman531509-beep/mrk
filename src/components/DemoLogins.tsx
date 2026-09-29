"use client";

// TEMPORARY — test accounts shown on /login while the store is being tested.
// Remove this file and its <DemoLogins /> usage in src/app/login/page.tsx
// before going live.
const DEMO_ACCOUNTS = [
  { label: "Admin", email: "admin@mrkspare.com", password: "admin123" },
  { label: "User", email: "user@mrkspare.com", password: "user123" },
  { label: "Trader", email: "trader@mrkspare.com", password: "trader123" },
];

export function DemoLogins({ onPick }: { onPick: (email: string, password: string) => void }) {
  return (
    <div className="mt-6 rounded-[10px] border border-dashed border-[#b9c9d8] bg-[#f6f9fc] px-3 py-2.5">
      <div className="mb-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#5b6b7c]">
        Test login — click to fill
      </div>
      <div className="grid grid-cols-3 gap-2">
        {DEMO_ACCOUNTS.map((a) => (
          <button
            key={a.email}
            type="button"
            onClick={() => onPick(a.email, a.password)}
            title={`${a.email} / ${a.password}`}
            className="min-h-[44px] cursor-pointer rounded-[8px] border border-[#d6e2ec] bg-white px-2 py-1.5 text-center transition-colors hover:border-[#1461a4] hover:bg-[#eef5fb] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#1461a4]"
          >
            <span className="block text-[13px] font-semibold text-[#001128]">{a.label}</span>
            <span className="block truncate text-[11px] text-[#5b6b7c]">{a.password}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
