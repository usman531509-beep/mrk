import { ImageResponse } from "next/og";

// iOS home-screen icon: the favicon mark (src/app/icon.svg) on a full-bleed
// navy square — iOS applies its own rounded mask.
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", background: "#071f36" }}>
        <svg width="180" height="180" viewBox="0 0 64 64">
          <path d="M9 46V18h6.8L25 33l9.2-15H41v28h-6.6V30.2L25 44.6l-9.4-14.4V46z" fill="#ffffff" />
          <path d="M46 48 55 16" stroke="#4084b4" strokeWidth="4.5" strokeLinecap="round" />
        </svg>
      </div>
    ),
    size,
  );
}
