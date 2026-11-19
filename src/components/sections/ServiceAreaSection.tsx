import GlyphPortal from "@/components/ui/glyph-portal";
import seo from "@/content/seo.json";
import { contact, heroEntry } from "@/lib/brand";

/**
 * Glyph Portal, used as the local spotlight: the reader scrolls through the
 * word CONROE and comes out inside a finished Sacred room, where the service
 * area copy sits.
 *
 * A heavy grotesque is deliberate — the portal camera flies through a counter
 * in the letterform, so it needs thick strokes. DM Serif Display is far too
 * fine to pass through, so the display face stays on the copy and the portal
 * uses the component's own stack.
 *
 * It is not lazily mounted: its height is a multiple of the viewport, so
 * deferring it would reserve the wrong space and shift the page. It is small
 * and pauses its own work off-screen through an IntersectionObserver.
 */
export default function ServiceAreaSection() {
  const { serviceArea } = seo;

  return (
    <section
      id="areas"
      aria-labelledby="areas-heading"
      className="scroll-mt-20 bg-ink"
    >
      <GlyphPortal
        word="CONROE"
        scrollLength={1.8}
        fontWeight={900}
        enterLabel="Enter the service area"
        style={{
          "--gp-paper": "#0b0b0b",
          "--gp-ink": "rgba(255,255,255,0.72)",
          "--gp-field": "#0b0b0b",
          "--gp-foreground": "#ffffff",
        }}
        background={
          <div
            style={{
              position: "absolute",
              inset: 0,
              transform: "scale(var(--gp-field-scale,1))",
              /* Bound to the brand portrait supplied at public/glyph-image.png.
                 The gradient keeps the caption and the letterforms readable
                 against it. */
              backgroundImage:
                "linear-gradient(to bottom, rgba(11,11,11,0.30), rgba(11,11,11,0.72)), url('/glyph-image.png')",
              backgroundSize: "cover",
              backgroundPosition: "50% 22%",
            }}
          />
        }
        front={
          <div className="pointer-events-none absolute inset-x-0 top-[clamp(5rem,12vh,9rem)] px-6 text-center">
            <p className="font-sans text-[0.6875rem] tracking-[0.26em] text-white/55 uppercase">
              <span className="mr-3 inline-block h-[0.4rem] w-[0.4rem] translate-y-[-0.1rem] bg-sacred" />
              05 — Service area
            </p>
          </div>
        }
      >
        <div className="mx-auto w-full max-w-7xl">
          <h2
            id="areas-heading"
            className="font-display text-[clamp(1.875rem,4.2vw,3.25rem)] leading-[1.06] text-balance text-white"
          >
            {serviceArea.heading}
          </h2>

          <p className="mt-7 max-w-[52rem] font-sans text-base leading-relaxed text-pretty text-white/75 sm:text-lg">
            {serviceArea.body}
          </p>

          <ul className="mt-10 flex flex-wrap gap-3">
            {serviceArea.cities.map((city) => (
              <li
                key={city}
                className="border border-white/20 px-4 py-2.5 font-sans text-sm text-white/85 backdrop-blur-sm"
              >
                {city}
              </li>
            ))}
          </ul>

          <div className="mt-10 flex flex-wrap gap-3">
            <a
              href="#contact"
              className="inline-flex h-12 cursor-pointer items-center bg-sacred px-6 font-sans text-sm font-medium text-white transition-colors duration-200 hover:bg-ember"
            >
              {heroEntry.primaryCta}
            </a>
            <a
              href={contact.phoneHref}
              className="inline-flex h-12 cursor-pointer items-center gap-2.5 border border-white/25 px-6 font-sans text-sm font-medium text-white transition-colors duration-200 hover:border-white/60"
            >
              {heroEntry.phoneCta}
            </a>
          </div>
        </div>
      </GlyphPortal>
    </section>
  );
}
