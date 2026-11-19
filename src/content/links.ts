/**
 * The SEO copy ends several passages with an internal-link sentence
 * ("Explore kitchen remodeling.", "Read how to compare remodeling estimates
 * line by line.", and so on). Those destination pages do not exist yet.
 *
 * Rather than ship anchors that 404 or point somewhere misleading, the copy
 * renders as text until a destination is filled in here. Add the path and the
 * sentence becomes a real link automatically — no component changes.
 */
export const internalLinks: Record<string, string | null> = {
  "Explore kitchen remodeling.": null,
  "See our bathroom remodeling services.": null,
  "View flooring and tile and painting and drywall.": null,
  "Explore custom cabinetry and built-ins and Flex Rooms.": null,
  "See decks, fences, and outdoor living. You can also view the Conroe terraced garden project, which included a retaining wall, cedar privacy fencing, and custom steps.":
    null,
  "Explore handyman services, rental and investor services, and commercial renovations.":
    null,
  "Read how to compare remodeling estimates line by line.": null,
};

export function linkFor(sentence: string): string | null {
  return internalLinks[sentence] ?? null;
}
