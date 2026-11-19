import SectionHeading from "./SectionHeading";
import seo from "@/content/seo.json";
import { linkFor } from "@/content/links";

export default function CostSection() {
  const { cost } = seo;
  const comparingHref = linkFor(cost.comparingLink);

  return (
    <section
      id="cost"
      aria-labelledby="cost-heading"
      className="scroll-mt-20 bg-paper text-ink"
    >
      <div className="mx-auto max-w-[90rem] px-6 py-24 sm:px-10 lg:px-14 lg:py-36">
        <SectionHeading
          index="04"
          label="Cost"
          id="cost-heading"
          heading={cost.heading}
          intro={cost.intro}
        />

        <div className="mt-14 grid gap-12 lg:mt-20 lg:grid-cols-12 lg:gap-16">
          {/* Preparation checklist */}
          <div data-reveal className="lg:col-span-7">
            {/* Photograph behind the checklist, darkened hard so the list
                stays legible. Contrast is carried by the overlay, not by the
                photograph, so a brighter replacement image cannot break it. */}
            <div className="relative isolate overflow-hidden p-7 text-white sm:p-10">
              <div
                aria-hidden
                className="absolute inset-0 -z-20 bg-[url('/images/cost/prepare.jpg')] bg-cover bg-center"
              />
              <div
                aria-hidden
                className="absolute inset-0 -z-10 bg-ink/88"
              />
              <h3 className="font-display text-[clamp(1.25rem,2vw,1.625rem)] leading-tight">
                {cost.prepareLead}
              </h3>

              <ul className="mt-7 grid gap-x-10 gap-y-4 sm:grid-cols-2">
                {cost.prepare.map((item) => (
                  <li key={item} className="grid grid-cols-[auto_1fr] gap-3">
                    <svg
                      viewBox="0 0 20 20"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.75"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden
                      className="mt-[0.3rem] size-3.5 shrink-0 text-sacred"
                    >
                      <path d="M4 10.5 8 14.5 16 5.5" />
                    </svg>
                    <span className="font-sans text-[0.9375rem] leading-relaxed text-pretty text-white/85">
                      {item}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <p className="mt-8 max-w-[44rem] font-sans text-base leading-relaxed text-pretty text-ink/70">
              {cost.afterPrepare}
            </p>
          </div>

          {/* Comparing estimates */}
          <aside data-reveal className="lg:col-span-5">
            <div className="relative isolate h-full overflow-hidden border-t-2 border-sacred p-7 text-white sm:p-10">
              <div
                aria-hidden
                className="absolute inset-0 -z-20 bg-[url('/images/cost/comparing.jpg')] bg-cover bg-center"
              />
              <div aria-hidden className="absolute inset-0 -z-10 bg-ink/90" />
              <h3 className="font-display text-[clamp(1.375rem,2.2vw,1.875rem)] leading-tight text-balance">
                Comparing estimates
              </h3>
              <p className="mt-6 font-sans text-base leading-relaxed text-pretty text-white/75">
                {cost.comparing}
              </p>
              {comparingHref ? (
                <a
                  href={comparingHref}
                  className="mt-6 inline-flex font-sans text-sm text-sacred underline decoration-sacred/40 underline-offset-4 transition-colors duration-200 hover:decoration-sacred"
                >
                  {cost.comparingLink}
                </a>
              ) : (
                <p className="mt-6 font-sans text-sm leading-relaxed text-white/50">
                  {cost.comparingLink}
                </p>
              )}
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}
