import type { ReactNode } from "react";

type Props = {
  /** Section number shown in the eyebrow, e.g. "01". */
  index: string;
  /** Short label beside the number. Never a replacement for the heading. */
  label: string;
  id: string;
  heading: string;
  intro?: string;
  tone?: "dark" | "light";
  children?: ReactNode;
};

/**
 * Shared heading block so every below-the-fold section keeps the same
 * eyebrow / display-serif / intro rhythm as the rest of the page.
 */
export default function SectionHeading({
  index,
  label,
  id,
  heading,
  intro,
  tone = "light",
  children,
}: Props) {
  const dark = tone === "dark";
  return (
    <header className="max-w-[54rem]">
      <p
        data-reveal
        className={[
          "font-sans text-[0.6875rem] tracking-[0.26em] uppercase",
          dark ? "text-white/55" : "text-ink/50",
        ].join(" ")}
      >
        <span className="mr-3 inline-block h-[0.4rem] w-[0.4rem] translate-y-[-0.1rem] bg-sacred" />
        {index} — {label}
      </p>

      <h2
        id={id}
        data-reveal
        className={[
          "font-display mt-7 text-[clamp(1.875rem,4.2vw,3.25rem)] leading-[1.06] text-balance",
          dark ? "text-white" : "text-ink",
        ].join(" ")}
      >
        {heading}
      </h2>

      {intro ? (
        <p
          data-reveal
          className={[
            "mt-7 font-sans text-base leading-relaxed text-pretty sm:text-lg",
            dark ? "text-white/70" : "text-ink/70",
          ].join(" ")}
        >
          {intro}
        </p>
      ) : null}

      {children}
    </header>
  );
}
