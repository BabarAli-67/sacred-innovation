import HeroScrollytelling from "@/components/HeroScrollytelling";
import Navbar from "@/components/Navbar";
import ScrollReveal from "@/components/ScrollReveal";
import SacredFooter from "@/components/sections/SacredFooter";
import CostSection from "@/components/sections/CostSection";
import EstimateCtaSection from "@/components/sections/EstimateCtaSection";
import FaqSection from "@/components/sections/FaqSection";
import ProcessSection from "@/components/sections/ProcessSection";
import ServiceAreaSection from "@/components/sections/ServiceAreaSection";
import ServicesSection from "@/components/sections/ServicesSection";
import WhySacredSection from "@/components/sections/WhySacredSection";
import seo from "@/content/seo.json";
import { brand, contact } from "@/lib/brand";

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "HomeAndConstructionBusiness",
  name: brand.legalName,
  alternateName: brand.name,
  slogan: brand.signature,
  description: seo.meta.description,
  telephone: contact.phoneE164,
  foundingDate: "2024-03-12",
  address: {
    "@type": "PostalAddress",
    addressLocality: "Conroe",
    addressRegion: "TX",
    addressCountry: "US",
  },
  areaServed: seo.serviceArea.cities.map((name) => ({ "@type": "City", name })),
  founder: { "@type": "Person", name: "Joshua Woolever" },
  makesOffer: seo.services.items.map((s) => ({
    "@type": "Offer",
    itemOffered: { "@type": "Service", name: s.title, description: s.body },
  })),
};

export default function Home() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <Navbar />
      <ScrollReveal />

      <main>
        {/* Finalised — do not modify. */}
        <HeroScrollytelling />

        {/* Below the fold: every section below is a server component, so none
            of it ships JavaScript that could compete with the hero canvas. */}
        <ServicesSection />
        <WhySacredSection />
        <ProcessSection />
        <CostSection />
        <ServiceAreaSection />
        <FaqSection />
        <EstimateCtaSection />
      </main>

      <SacredFooter />
    </>
  );
}
