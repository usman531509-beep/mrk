import { cn } from "@/lib/utils";

// Text logo shared by the storefront, auth pages and portals — same
// "MRK / SPARE" mark as the landing page header. `compact` renders just "MRK"
// for tight spots such as the collapsed portal sidebar.
export function Wordmark({ className, compact = false }: { className?: string; compact?: boolean }) {
  return (
    <span
      className={cn(
        "inline-block whitespace-nowrap font-extrabold leading-none tracking-[-0.03em] text-ink [font-family:var(--font-archivo),Arial,sans-serif]",
        className,
      )}
    >
      MRK
      {!compact && (
        <>
          {" "}
          <span className="px-[3px] font-normal">/</span> SPARE
        </>
      )}
    </span>
  );
}
