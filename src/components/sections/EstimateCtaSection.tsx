import seo from "@/content/seo.json";
import { contact, estimateHref, heroEntry } from "@/lib/brand";

export default function EstimateCtaSection() {
  const { closing } = seo;

  return (
    <section
      id="contact"
      aria-labelledby="contact-heading"
      className="scroll-mt-20 border-b border-white/10 bg-ink text-white"
    >
      <div className="mx-auto max-w-[90rem] px-6 py-24 sm:px-10 lg:px-14 lg:py-36">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-7">
            <p
              data-reveal
              className="font-sans text-[0.6875rem] tracking-[0.26em] text-white/55 uppercase"
            >
              <span className="mr-3 inline-block h-[0.4rem] w-[0.4rem] translate-y-[-0.1rem] bg-sacred" />
              07 — Next step
            </p>

            <h2
              id="contact-heading"
              data-reveal
              className="font-display mt-7 text-[clamp(2.25rem,5.4vw,4.25rem)] leading-[1.01] text-balance"
            >
              {closing.heading}
            </h2>

            <div data-reveal className="mt-8 space-y-5">
              {closing.body.map((p) => (
                <p
                  key={p.slice(0, 24)}
                  className="max-w-[44rem] font-sans text-base leading-relaxed text-pretty text-white/70 sm:text-lg"
                >
                  {p}
                </p>
              ))}
            </div>
          </div>

          {/* What to send — turns the copy's ask into something scannable */}
          <aside data-reveal className="lg:col-span-5">
            <div className="border border-white/12 bg-ink-800 p-7 sm:p-9">
              <h3 className="font-sans text-[0.6875rem] tracking-[0.26em] text-sacred uppercase">
                Send these three things
              </h3>

              <ol className="mt-7 space-y-5">
                {[
                  "A few photos of the space",
                  "Your property ZIP code",
                  "A short description of your plans",
                ].map((item, i) => (
                  <li key={item} className="grid grid-cols-[auto_1fr] gap-4">
                    <span className="font-sans text-xs tracking-[0.2em] tabular-nums text-white/35">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="font-sans text-base leading-snug text-white/85">
                      {item}
                    </span>
                  </li>
                ))}
              </ol>

              <div className="mt-9 flex flex-col gap-3">
                <a
                  href={contact.phoneHref}
                  className="group inline-flex h-14 cursor-pointer items-center justify-center gap-3 bg-sacred px-6 font-sans text-base font-medium text-white transition-colors duration-200 hover:bg-ember"
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden
                    className="size-4"
                  >
                    <path d="M6.6 10.8a15.1 15.1 0 0 0 6.6 6.6l2.2-2.2a1 1 0 0 1 1-.25 11.4 11.4 0 0 0 3.6.58 1 1 0 0 1 1 1V20a1 1 0 0 1-1 1A17 17 0 0 1 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1c0 1.25.2 2.45.57 3.57a1 1 0 0 1-.25 1Z" />
                  </svg>
                  {heroEntry.phoneCta}
                </a>
                {contact.email || contact.estimateFormPath ? (
                  <a
                    href={estimateHref()}
                    className="inline-flex h-14 cursor-pointer items-center justify-center border border-white/20 px-6 font-sans text-base font-medium text-white transition-colors duration-200 hover:border-white/50"
                  >
                    {heroEntry.primaryCta}
                  </a>
                ) : null}
              </div>

              {/* Until `contact.email` or `contact.estimateFormPath` is set in
                  src/lib/brand.ts, the phone is the only working route, so the
                  copy says so plainly. Never surface setup instructions here. */}
              <p className="mt-5 font-sans text-xs leading-relaxed text-white/40">
                {contact.email || contact.estimateFormPath
                  ? "We reply with the next step and anything else we need to see."
                  : "A call is the fastest way to start. We will talk through the space and the work involved."}
              </p>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}
