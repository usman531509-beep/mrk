import type { Config } from "tailwindcss";
import animatePlugin from "tailwindcss-animate";

export default {
  darkMode: "class",
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // shadcn semantic tokens (driven by CSS vars in globals.css)
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },

        // Storefront brand tokens — MRK landing palette (navy). The `red` name is
        // kept so existing classes (text-red, bg-red-soft, btn-red…) keep working.
        red: {
          DEFAULT: "#071f36",
          600: "#173b58",
          700: "#001128",
          400: "#4084b4",
          soft: "#dcedf8",
        },
        ink: {
          DEFAULT: "#001128",
          900: "#04172e",
          800: "#071f36",
          700: "#173b58",
          600: "#2a4a66",
        },
        brand: {
          DEFAULT: "#071f36",
          dark: "#001128",
          light: "rgba(7,31,54,0.08)",
        },
        line: "#e7e7ea",
        soft: "#f7f7f8",
        gold: "#b8860b",
        ok: "#0a8a3a",
        // Errors, cancellations, out-of-stock and deletes stay red.
        danger: { DEFAULT: "#c62828", soft: "#fdecea" },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      fontFamily: {
        head: ["var(--font-head)", "ui-sans-serif", "system-ui", "sans-serif"],
        body: ["var(--font-body)", "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ["var(--font-mono-ui)", "ui-monospace", "monospace"],
      },
      maxWidth: { site: "1320px" },
      keyframes: {
        "accordion-down": { from: { height: "0" }, to: { height: "var(--radix-accordion-content-height)" } },
        "accordion-up": { from: { height: "var(--radix-accordion-content-height)" }, to: { height: "0" } },
      },
      animation: {
        "accordion-down": "accordion-down 0.18s ease-out",
        "accordion-up": "accordion-up 0.18s ease-out",
      },
    },
  },
  plugins: [animatePlugin],
} satisfies Config;
