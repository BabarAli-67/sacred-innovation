import SectionHeading from "./SectionHeading";
import seo from "@/content/seo.json";

/**
 * Built on native <details>/<summary>. That ships zero JavaScript, works
 * before hydration and without it, is keyboard and screen-reader correct for
 * free, and keeps every answer in the DOM for crawlers. The open/close
 * animation is progressive enhancement in CSS (see globals.css) — where it is
 * unsupported the panel simply opens instantly.
 */
export default function FaqSection() {
  const { faq } = seo;

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faq.items.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    })),
  };

  return (
    <section
      id="faq"
      aria-labelledby="faq-heading"
      className="scroll-mt-20 bg-paper text-ink"
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      <div className="mx-auto max-w-[90rem] px-6 py-24 sm:px-10 lg:px-14 lg:py-36">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-4">
            <SectionHeading
              index="06"
              label="FAQ"
              id="faq-heading"
              heading={faq.heading}
            />
            <p
              data-reveal
              className="mt-7 max-w-[26rem] font-sans text-base leading-relaxed text-pretty text-ink/65"
            >
              Still deciding what to ask? Send photos and your ZIP code and we
              will take it from there.
            </p>
          </div>

          <div className="lg:col-span-8">
            <div className="border-t border-ink/12">
              {faq.items.map((item) => (
                <details
                  key={item.q}
                  data-reveal
                  className="faq-item group border-b border-ink/12"
                >
                  <summary className="flex cursor-pointer list-none items-start justify-between gap-6 py-6 transition-colors duration-200 hover:text-ink/70 sm:py-7">
                    <h3 className="font-display text-[clamp(1.125rem,1.9vw,1.5rem)] leading-snug text-balance">
                      {item.q}
                    </h3>
                    <span
                      aria-hidden
                      className="relative mt-1.5 block size-4 shrink-0"
                    >
                      <span className="absolute top-1/2 left-0 h-px w-4 -translate-y-1/2 bg-sacred" />
                      <span className="faq-plus absolute top-0 left-1/2 h-4 w-px -translate-x-1/2 bg-sacred transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]" />
                    </span>
                  </summary>

                  <div className="faq-answer pb-7">
                    <p className="max-w-[46rem] font-sans text-base leading-relaxed text-pretty text-ink/70">
                      {item.a}
                    </p>
                  </div>
                </details>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
