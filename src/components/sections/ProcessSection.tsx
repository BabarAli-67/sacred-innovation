import SectionHeading from "./SectionHeading";
import StreamingMessage from "@/components/ui/streaming-message";
import seo from "@/content/seo.json";

/* Static import (not `next/dynamic`): same instant-validation issue as the
   services carousel under `cacheComponents` + Turbopack. Still a client
   boundary; SSR keeps all four step descriptions in the HTML. Gating on
   LazyOnView would drop that copy. It starts streaming via its own
   IntersectionObserver anyway. */

export default function ProcessSection() {
  const { process } = seo;

  return (
    <section
      id="process"
      aria-labelledby="process-heading"
      className="scroll-mt-20 bg-linen text-ink"
    >
      <div className="mx-auto max-w-[90rem] px-6 py-24 sm:px-10 lg:px-14 lg:py-36">
        <SectionHeading
          index="03"
          label="Process"
          id="process-heading"
          heading={process.heading}
          intro={process.intro}
        />

        {/* Conversational view of the same four steps: pick one and its
            answer streams in. Every step's text is in the HTML regardless. */}
        <div data-reveal className="mt-14 lg:mt-20">
          <StreamingMessage
            label="Estimate guidance"
            steps={seo.process.steps.map((s, i) => ({
              id: `step-${i + 1}`,
              title: s.title,
              body: s.body,
            }))}
            footnote={seo.process.note}
          />
        </div>

      </div>
    </section>
  );
}
