"use client";

import { useEffect } from "react";

// Scroll-reveal for the landing page: section headings, then their cards one
// after another, rise into place as they scroll into view. One observer for
// the whole page; only opacity + transform animate (GPU-cheap).
//
// Elements are tagged at runtime and only if they start *below* the fold, so
// the hero/finder never flash hidden, and the page stays fully visible
// without JS or with prefers-reduced-motion.

// Headings and standalone blocks — revealed as a unit.
const BLOCKS = [
  "#main-content > section:not(.mrk-hero) > .mrk-eyebrow",
  "#main-content > section:not(.mrk-hero) > .mrk-section-heading",
  ".mrk-demand-copy",
  ".mrk-trade",
  ".mrk-catalogue-message",
  ".mrk-footer-main > *",
].join(",");

// Grids whose children cascade in one after another.
const GROUPS = [
  ".mrk-category-grid",
  ".mrk-bike-grid",
  ".mrk-product-grid",
  ".mrk-rail",
  ".mrk-demand-grid",
  ".mrk-catindex",
  ".mrk-process",
].join(",");

const STAGGER_MS = 80;
const MAX_STAGGER_MS = 480;

export function LandingReveal() {
  useEffect(() => {
    if (typeof IntersectionObserver === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const fold = window.innerHeight;
    const belowFold = (el: Element) => el.getBoundingClientRect().top > fold;
    const targets: HTMLElement[] = [];

    document.querySelectorAll<HTMLElement>(BLOCKS).forEach((el) => {
      if (belowFold(el)) targets.push(el);
    });
    document.querySelectorAll<HTMLElement>(GROUPS).forEach((group) => {
      Array.from(group.children).forEach((child, i) => {
        if (!(child instanceof HTMLElement) || !belowFold(child)) return;
        // Stagger by position within the row so each row cascades left→right.
        child.style.setProperty("--mrk-reveal-delay", `${Math.min(i * STAGGER_MS, MAX_STAGGER_MS)}ms`);
        targets.push(child);
      });
    });
    if (!targets.length) return;

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const el = entry.target as HTMLElement;
          el.classList.add("is-revealed");
          io.unobserve(el);
          // Hand the element back to its own styles once it has settled, so
          // card hover lifts/transitions aren't overridden by the reveal.
          const done = (e: TransitionEvent) => {
            if (e.target !== el || e.propertyName !== "transform") return;
            el.removeEventListener("transitionend", done);
            el.classList.remove("mrk-reveal", "is-revealed");
            el.style.removeProperty("--mrk-reveal-delay");
          };
          el.addEventListener("transitionend", done);
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -6% 0px" },
    );
    for (const el of targets) {
      el.classList.add("mrk-reveal");
      io.observe(el);
    }
    return () => io.disconnect();
  }, []);

  return null;
}
