"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

type Props = {
  children: ReactNode;
  /** Reserved height so mounting never shifts the page. */
  minHeight: string;
  /** How early to mount, as a root margin. */
  rootMargin?: string;
  className?: string;
  /** Rendered in the reserved space before the real component mounts. */
  placeholder?: ReactNode;
};

/**
 * Mounts its children only once they are close to the viewport.
 *
 * The heavy below-the-fold pieces (the Three.js footer especially) are behind
 * `next/dynamic`, so their chunks are not in the initial bundle — but a
 * dynamic import still fires as soon as the component renders. Gating that
 * render on an IntersectionObserver means the chunk is not even requested
 * while the reader is still in the hero, which is what keeps the canvas
 * scrub clear of competing work.
 *
 * The box reserves its height up front, so mounting costs no layout shift.
 */
export default function LazyOnView({
  children,
  minHeight,
  rootMargin = "600px 0px",
  className,
  placeholder,
}: Props) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [show, setShow] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") {
      // Defensive path for a browser without IntersectionObserver: show
      // everything. Scheduled rather than set inline so it stays a normal
      // update after paint, and so the server and client first render agree.
      const t = setTimeout(() => setShow(true), 0);
      return () => clearTimeout(t);
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setShow(true);
          io.disconnect();
        }
      },
      { rootMargin },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [rootMargin]);

  return (
    <div ref={ref} className={className} style={{ minHeight }}>
      {show ? children : placeholder}
    </div>
  );
}
