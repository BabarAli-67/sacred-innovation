import dynamic from "next/dynamic";
import Image from "next/image";
import SectionHeading from "./SectionHeading";
import LazyOnView from "@/components/LazyOnView";
import seo from "@/content/seo.json";

/** One photograph per point, matched to it by subject. See
 *  public/images/CREDITS.md — these are placeholders for Sacred's own work. */
const pointPhotos = [
  { src: "/images/why/planning.jpg", alt: "Drawing up plans and measurements before work begins." },
  { src: "/images/why/care.jpg", alt: "A clean, prepared room with floors protected and the work area clear." },
  { src: "/images/why/completed.jpg", alt: "A completed living space with fitted joinery and finished walls." },
];

/* Canvas-driven, so it stays out of the initial bundle and off the main
   thread until the reader is near it. */
const BurnAway = dynamic(() => import("@/components/ui/burn-away"));

export default function WhySacredSection() {
  const { why } = seo;

  return (
    <section
      id="why"
      aria-labelledby="why-heading"
      className="scroll-mt-20 bg-paper text-ink"
    >
      <div className="mx-auto max-w-[90rem] px-6 py-24 sm:px-10 lg:px-14 lg:py-36">
        <SectionHeading
          index="02"
          label="Why Sacred"
          id="why-heading"
          heading={why.heading}
          intro={why.intro}
        />

        <div className="mt-14 grid gap-12 lg:mt-20 lg:grid-cols-12 lg:gap-16">
          {/* Numbered reasons */}
          <ol className="lg:col-span-7">
            {why.items.map((item, i) => (
              <li
                key={item.title}
                data-reveal
                className="group grid grid-cols-[auto_1fr] gap-x-5 border-t border-ink/12 py-8 last:border-b sm:gap-x-8 sm:py-10 lg:py-14"
              >
                <span
                  aria-hidden
                  className="font-sans text-xs tracking-[0.2em] tabular-nums text-sacred"
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div className="grid gap-5 sm:grid-cols-[1fr_11rem] sm:items-start sm:gap-7">
                  <div>
                    <h3 className="font-display text-[clamp(1.375rem,2.4vw,2rem)] leading-tight transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-x-1.5">
                      {item.title}
                    </h3>
                    <p className="mt-4 max-w-[40rem] font-sans text-base leading-relaxed text-pretty text-ink/70">
                      {item.body}
                    </p>
                  </div>

                  <div className="relative aspect-[4/3] w-full overflow-hidden bg-ink sm:aspect-[4/3]">
                    <Image
                      src={pointPhotos[i].src}
                      alt={pointPhotos[i].alt}
                      fill
                      loading="lazy"
                      sizes="(max-width: 640px) 100vw, 11rem"
                      className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-105"
                    />
                  </div>
                </div>
              </li>
            ))}
          </ol>

          {/*
            Problem to solution, burned through as you scroll.

            `data-burn-track` marks the column, which stays in normal flow and
            is as tall as the three points beside it — that is what the burn is
            timed against. The visual itself is sticky inside it, so it holds
            the finished room on screen while the reader works down the list
            instead of leaving a white void below a short image.
          */}
          <div data-burn-track className="lg:col-span-5">
            <div className="lg:sticky lg:top-28">
              <div data-reveal>
                {/* Reserved height matches the mounted canvas, so swapping
                    the placeholder for it shifts nothing. */}
                <LazyOnView minHeight="clamp(22rem, 72vh, 40rem)">
                  <BurnAway
                    beforeSrc="/frames/frame_0001.webp"
                    afterSrc="/frames/frame_0149.webp"
                    beforeLabel="Before"
                    afterLabel="After"
                    start="top 75%"
                    end="center 40%"
                    alt="A Sacred Innovations project dissolving from its original stripped-back condition into the finished room."
                    /* Tall enough to fill the column (no white void beneath
                       it) but short enough that `sticky` has real travel: the
                       column is only as tall as the three points beside it,
                       so every pixel of image height is a pixel of hold lost. */
                    className="aspect-[4/5] sm:aspect-[16/10] lg:aspect-auto lg:h-[min(62vh,34rem)]"
                  />
                </LazyOnView>
                <p className="mt-5 font-sans text-sm leading-relaxed text-ink/55">
                  One Conroe-area project, start to finish. Scroll to burn
                  through from the original condition to the completed work.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
