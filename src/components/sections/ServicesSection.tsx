import SectionHeading from "./SectionHeading";
import ServicesCarousel from "./ServicesCarousel";
import seo from "@/content/seo.json";

/**
 * One Services section. The carousel carries every service title, its full
 * verbatim description and its link sentence, so the separate "All services"
 * grid that used to sit beneath it was a duplicate and is gone.
 *
 * Static import (not `next/dynamic`): with `cacheComponents`, Turbopack's
 * instant-validation worker cannot resolve dynamically imported client
 * modules and reports a false "Could not validate `instant`" error. The
 * carousel is still a client boundary, so its JS stays out of the server
 * bundle; SSR still emits every service title, description, and link. It is
 * deliberately NOT wrapped in LazyOnView — that would drop the copy from
 * the HTML. The rotation already idles off-screen via its own observer.
 */
export default function ServicesSection() {
  const { services } = seo;

  return (
    <section
      id="services"
      aria-labelledby="services-heading"
      className="scroll-mt-20 bg-ink text-white"
    >
      <div className="mx-auto max-w-7xl px-6 py-24 sm:px-10 lg:px-12 lg:py-36">
        <SectionHeading
          index="01"
          label="Services"
          id="services-heading"
          heading={services.heading}
          intro={services.intro}
          tone="dark"
        />

        <div data-reveal className="mt-12 lg:mt-16">
          <ServicesCarousel />
        </div>
      </div>
    </section>
  );
}
