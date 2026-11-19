"use client";

import { useEffect } from "react";
import gsap from "gsap";

/**
 * Scroll reveal for every `[data-reveal]` element on the page.
 *
 * IntersectionObserver drives the animation, with two guards around it,
 * because an element that is never *seen* must never be left at opacity 0:
 *
 *  1. Anything already at or above the fold on first run — a deep link, or a
 *     reload with restored scroll — is shown immediately.
 *  2. A rAF-throttled scroll sweep catches elements that passed the viewport
 *     without the observer firing. IntersectionObserver only reports
 *     *threshold crossings*: if the main thread stalls (frame decoding, a
 *     slow device) several scroll steps can coalesce into one rendering
 *     update, carrying a small element from below the fold to above it
 *     between samples. It was never intersecting before or after, so no
 *     callback is delivered and the content would stay invisible.
 *
 * The sweep detaches itself as soon as nothing is pending, so the steady
 * state is zero scroll listeners.
 */
export default function ScrollReveal() {
  useEffect(() => {
    const els = gsap.utils.toArray<HTMLElement>("[data-reveal]");
    if (!els.length) return;

    const show = (targets: Element[], animate: boolean) => {
      if (!targets.length) return;
      if (!animate) {
        gsap.set(targets, { opacity: 1, y: 0, willChange: "auto" });
        return;
      }
      gsap.to(targets, {
        opacity: 1,
        y: 0,
        duration: 0.75,
        ease: "power2.out",
        stagger: 0.08,
        overwrite: true,
        onComplete: () => gsap.set(targets, { willChange: "auto" }),
      });
    };

    const reduced =
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reduced || typeof IntersectionObserver === "undefined") {
      show(els, false);
      return;
    }

    const fold = window.innerHeight * 0.9;
    const waiting = new Set<HTMLElement>();
    const settled: HTMLElement[] = [];
    els.forEach((el) => {
      if (el.getBoundingClientRect().top < fold) settled.push(el);
      else waiting.add(el);
    });
    show(settled, false);
    if (!waiting.size) return;

    let raf = 0;

    const release = (el: Element) => {
      waiting.delete(el as HTMLElement);
      observer.unobserve(el);
    };

    const detach = () => {
      window.removeEventListener("scroll", onScroll);
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
    };

    const observer = new IntersectionObserver(
      (entries) => {
        const entering: Element[] = [];
        const passed: Element[] = [];

        for (const entry of entries) {
          if (entry.isIntersecting) entering.push(entry.target);
          else if (entry.boundingClientRect.top < 0) passed.push(entry.target);
          else continue;
          release(entry.target);
        }

        show(passed, false);
        show(entering, true);
        if (!waiting.size) detach();
      },
      { rootMargin: "0px 0px -10% 0px", threshold: 0.01 },
    );

    const sweep = () => {
      raf = 0;
      const passed: Element[] = [];
      waiting.forEach((el) => {
        // Entirely above the viewport: the reader has gone past it, so put it
        // in place with no animation rather than animating something behind
        // them if they scroll back up.
        if (el.getBoundingClientRect().bottom < 0) passed.push(el);
      });
      if (passed.length) {
        passed.forEach(release);
        show(passed, false);
      }
      if (!waiting.size) detach();
    };

    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(sweep);
    };

    waiting.forEach((el) => observer.observe(el));
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      detach();
      observer.disconnect();
    };
  }, []);

  return null;
}
