/**
 * SACRED INNOVATIONS — brand content
 * Every string below is taken from, or derived directly from,
 * "Sacred Brand Foundation v1 / Leadership Review / 14 Nov 2026".
 *
 * Voice (section 05): warm, capable, specific and expressive.
 * Guardrail (section 05): no unsupported "best", "guaranteed return",
 * "zero disruption" or blanket compliance claims. No unreconciled
 * financial results (section 10).
 */

export const brand = {
  name: "Sacred Innovations",
  legalName: "Sacred Innovations LLC",
  signature: "Make your space, Sacred.",
  pillars: "Care. Craft. Character.",
  invitation: "Tell us what you want to improve.",
  founded: "March 12, 2024",
  entityFormed: "December 17, 2025",
  base: "Conroe, Texas",
  region: "North Houston",
} as const;

/** Narrative phases mapped to what the frame sequence actually shows. */
export type Phase = {
  id: string;
  /** Scroll range, 0–1, across the pinned hero. */
  range: readonly [number, number];
  eyebrow: string;
  headline: string;
  sub?: string;
};

/**
 * Hero entry copy. Supplied verbatim by the client and reproduced
 * character-for-character — do not rewrite, reflow or re-punctuate.
 * `npm run verify:copy` checks these strings against copy/hero.txt.
 */
export const heroEntry = {
  /** Scroll range, 0–1, matching the old first phase. */
  range: [0.0, 0.2] as readonly [number, number],
  headline: "Custom Home Renovation in Conroe, TX, Built Around Your Needs",
  paragraphs: [
    "Does your home need more storage, a better layout, updated finishes, or repairs that have been waiting too long? A custom home renovation should address the way you use your space. Sacred Innovations helps Conroe homeowners plan practical improvements around their priorities and budget.",
    "You do not need a finished design to get started. Share a few photos, your property ZIP code, and a short description of the work. We can discuss the next step and whether the project fits our services.",
  ],
  primaryCta: "Request a Project Estimate",
  phoneCta: "Call (936) 703-8460",
} as const;

export const contact: {
  phoneDisplay: string;
  phoneHref: string;
  phoneE164: string;
  /** Fill in to turn the estimate CTA into a real mailto. */
  email: string | null;
  /** Fill in to point the estimate CTA at a form page instead. */
  estimateFormPath: string | null;
} = {
  phoneDisplay: "(936) 703-8460",
  phoneHref: "tel:+19367038460",
  phoneE164: "+1-936-703-8460",
  email: null,
  estimateFormPath: null,
};

/** Where "Request a Project Estimate" should go, given what is configured. */
export function estimateHref(): string {
  if (contact.estimateFormPath) return contact.estimateFormPath;
  if (contact.email) {
    return `mailto:${contact.email}?subject=${encodeURIComponent("Project estimate request")}`;
  }
  return contact.phoneHref;
}

/** Narrative phases that follow the entry panel. */
export const heroPhases: readonly Phase[] = [
  {
    id: "clarity",
    range: [0.2, 0.45],
    eyebrow: "01 — Clarity before commitment",
    headline: "Settled before\nit begins.",
    sub: "Scope, exclusions, selections and decision makers defined before the work depends on them.",
  },
  {
    id: "craft",
    range: [0.45, 0.7],
    eyebrow: "02 — Craftsmanship with intention",
    headline: "Built for the way\nthe room is used.",
    sub: "Custom cabinetry, built-ins and finishes detailed around real daily use.",
  },
  {
    id: "evidence",
    range: [0.7, 0.9],
    eyebrow: "03 — Accountability through evidence",
    headline: "Every transition,\nfit and finish.",
    sub: "Reviewed before closeout, with an honest record of what is complete and what remains.",
  },
  {
    id: "signature",
    range: [0.9, 1.0],
    eyebrow: "Conroe · The Woodlands · Montgomery · Willis · Spring",
    headline: "Make your space,\nSacred.",
    sub: brand.invitation,
  },
] as const;

export const nav = [
  { href: "#services", label: "Services" },
  { href: "#process", label: "Process" },
  { href: "#areas", label: "Service area" },
  { href: "#faq", label: "FAQ" },
] as const;
