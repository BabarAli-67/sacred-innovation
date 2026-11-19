/**
 * SACRED INNOVATIONS — Brand Foundation reference
 *
 * Extracted from "Sacred Brand Foundation v1 / Leadership Review /
 * 14 Nov 2026". None of it is rendered on the homepage today: the
 * below-the-fold sections are driven by src/content/seo.json instead.
 *
 * It is kept here, out of src/lib/brand.ts, so the runtime module stays to
 * what the page actually imports — and so this material is ready for the
 * service pages, the About page and proposals when they are built.
 *
 * Guardrails from the foundation still apply to anything reused from here:
 * no unsupported "best", "guaranteed return" or "zero disruption" claims,
 * and no financial results until they are reconciled. The mission and vision
 * are proposed, not adopted policy.
 */
import { brand } from "@/lib/brand";

export const positioning = {
  title: "The identity at a glance.",
  lede:
    "Sacred Innovations brings thoughtful design, skilled craftsmanship, and practical coordination to residential renovations, investor property improvements, and commercial spaces.",
  shortDescription:
    "Sacred Innovations is a Conroe-based renovation and property-improvement company serving North Houston. From repairs and custom built-ins to whole-home rehabilitation and commercial improvements, we bring care, character, and coordinated planning to the spaces people use every day.",
  fullDescription:
    "Sacred Innovations LLC helps homeowners, property investors, and businesses improve the places they depend on. Based in Conroe, Texas, the company works across North Houston on residential renovations, custom cabinetry and built-ins, flooring, painting, outdoor living, rental preparation, and defined commercial improvements. Its portfolio includes whole-home rehabilitation, distinctive interior finishes, and projects shaped around the practical needs of the people using the space.",
  forWhom:
    "Homeowners, property investors, property managers and businesses with a defined renovation or improvement need.",
} as const;

/** Section 04 — proposed working principles. */
export const principles = [
  {
    n: "01",
    title: "Care for people and property",
    body:
      "Listen to the people who use the space. Protect belongings and access routes. Leave the work area orderly.",
    lookFor: "Site preparation, respectful communication, documented cleanup.",
  },
  {
    n: "02",
    title: "Craftsmanship with intention",
    body:
      "Make the layout, materials and finish details serve the way the space will be used.",
    lookFor: "Review transitions, fit, finish and functional details before closeout.",
  },
  {
    n: "03",
    title: "Clarity before commitment",
    body:
      "Define the scope, exclusions, selections and decision makers before the work depends on them.",
    lookFor: "Written scope, approved changes and realistic next steps.",
  },
  {
    n: "04",
    title: "Accountability through evidence",
    body: "Describe what is complete, what remains and what needs a decision.",
    lookFor: "Before/progress/after documentation and an honest open-item list.",
  },
  {
    n: "05",
    title: "Innovation that serves the work",
    body:
      "Use technology when it improves understanding, coordination or documentation.",
    lookFor:
      "Explain the practical benefit; retain qualified judgment and field verification.",
  },
  {
    n: "06",
    title: "Character without compromise",
    body:
      "Welcome individuality while keeping communication and workmanship dependable.",
    lookFor: "Personal design choices supported by practical construction decisions.",
  },
] as const;

/** Section 05 / 01 — service lines named in the brand foundation. */
export const services = [
  {
    title: "Residential renovation",
    body:
      "Whole-home rehabilitation and room-by-room improvement for the places people live every day.",
  },
  {
    title: "Custom cabinetry & built-ins",
    body:
      "Carpentry and custom woodworking detailed around how the space is actually used.",
  },
  {
    title: "Flooring & painting",
    body:
      "Surface work handled as part of the whole — transitions, fit and finish reviewed together.",
  },
  {
    title: "Outdoor living",
    body: "Exterior spaces treated with the same scope discipline as the rooms inside.",
  },
  {
    title: "Rental preparation",
    body: "Investor property improvement and turn work, documented stage by stage.",
  },
  {
    title: "Commercial improvements",
    body:
      "Defined scopes for businesses and property managers, coordinated around operating hours.",
  },
] as const;

export const mission =
  "To transform the spaces people depend on through thoughtful design, skilled craftsmanship, and genuine care—making every project clearer, every commitment accountable, and every improvement a source of lasting value.";

export const vision =
  "A future where the places we live, work, and heal reflect the dignity and potential of the people within them—and where Sacred sets the standard for construction through empowered teams, dependable systems, and work that earns lasting trust.";

export const underlyingIdea =
  "The spaces entrusted to Sacred, the people who use them and the promises made in building them deserve care.";

export const founder = {
  name: "Joshua Woolever",
  role: "Founder & Owner",
  story:
    "Joshua Woolever founded Sacred Innovations in Conroe in 2024, bringing a background in public speaking, marketing, business consulting, and fitness to a more hands-on pursuit: improving the environments people use every day. His published story connects creative problem-solving and personal service with his development in carpentry, custom woodworking, and the construction trades.",
} as const;

/**
 * Verifiable facts only. The brand foundation (section 05) rules out
 * unsupported superlatives, and section 10 keeps financial results out
 * until they are reconciled — so these are dates, places and counts,
 * not review scores or revenue.
 */
export const facts = [
  { value: 2024, suffix: "", label: "Founded in Conroe", note: brand.founded },
  { value: 6, suffix: "", label: "Working principles", note: brand.pillars },
  { value: 5, suffix: "+", label: "Cities served", note: "North Houston region" },
  { value: 6, suffix: "", label: "Service lines", note: "Residential to commercial" },
] as const;

export const serviceArea = {
  primary: ["Conroe", "The Woodlands", "Montgomery", "Willis", "Spring"],
  note:
    "Dallas–Fort Worth work is considered through Garland coordination. Project location, scope, and availability are confirmed during consultation.",
} as const;

