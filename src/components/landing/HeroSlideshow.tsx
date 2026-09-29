"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import "./hero-slideshow.css";

const slides = [
  { src: "/images/landing/hero.jpg", label: "Exhaust & brakes", alt: "Titanium motorcycle exhaust, brake disc and caliper on pale blue stone plinths" },
  { src: "/images/landing/hero-suspension.webp", label: "Suspension", alt: "Black and gold motorcycle shock absorbers on pale blue stone steps" },
  { src: "/images/landing/hero-engine-lighting.webp", label: "Engine & lighting", alt: "Motorcycle engine cover, piston and LED headlight in a pale blue studio" },
];
const ROTATION_MS = 2000;

/** Only the artwork rotates; the server-rendered headline and finder stay in place. */
export function HeroSlideshow() {
  const [active, setActive] = useState(0);
  const [ready, setReady] = useState<number[]>([]);
  const [reducedMotion, setReducedMotion] = useState(true);
  const [visible, setVisible] = useState(true);
  const [pageVisible, setPageVisible] = useState(true);
  const images = useRef<(HTMLImageElement | null)[]>([]);
  const markReady = useCallback((index: number) => {
    setReady((current) => (current.includes(index) ? current : [...current, index]));
  }, []);
  // No on-screen controls: it runs on its own and pauses when the hero is
  // off-screen, the tab is hidden, or the user prefers reduced motion.
  const playing = !reducedMotion && visible && pageVisible;

  // The slides are server-rendered with eager loading, so the browser often
  // finishes (or serves from cache) before React hydrates — and a load event
  // that fired before hydration never reaches onLoad. Without this check
  // `ready` stayed empty and the slideshow never advanced.
  useEffect(() => {
    images.current.forEach((img, index) => {
      if (img?.complete && img.naturalWidth > 0) {
        void img.decode().catch(() => undefined).then(() => markReady(index));
      }
    });
  }, [markReady]);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updateMotion = () => setReducedMotion(media.matches);
    const updateVisibility = () => setPageVisible(!document.hidden);
    updateMotion();
    updateVisibility();
    media.addEventListener("change", updateMotion);
    document.addEventListener("visibilitychange", updateVisibility);
    const stage = images.current[0]?.closest(".mrk-hero-stage");
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), { threshold: 0.1 });
    if (stage) observer.observe(stage);
    return () => {
      media.removeEventListener("change", updateMotion);
      document.removeEventListener("visibilitychange", updateVisibility);
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    if (!playing || ready.length < 2) return;
    const timer = window.setTimeout(() => {
      // Failed or slow images are skipped; they never replace the visible scene.
      for (let step = 1; step < slides.length; step++) {
        const next = (active + step) % slides.length;
        if (ready.includes(next)) { setActive(next); break; }
      }
    }, ROTATION_MS);
    return () => window.clearTimeout(timer);
  }, [active, playing, ready]);

  return <>
    {slides.map((slide, index) => <img
      key={slide.src}
      ref={(el) => { images.current[index] = el; }}
      className={`mrk-hero-image mrk-hero-slide${index === active ? " is-active" : ""}`}
      src={slide.src}
      alt={slide.alt}
      aria-hidden={index !== active}
      width={1942}
      height={809}
      fetchPriority={index === 0 ? "high" : "low"}
      loading="eager"
      decoding="async"
      style={{ animationPlayState: playing ? "running" : "paused" }}
      onLoad={(event) => {
        const img = event.currentTarget;
        void img.decode().catch(() => undefined).then(() => markReady(index));
      }}
    />)}
  </>;
}
