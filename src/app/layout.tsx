import type { Metadata, Viewport } from "next";
import { DM_Sans, DM_Serif_Display } from "next/font/google";
import { brand } from "@/lib/brand";
import { framePath, PRIORITY_COUNT } from "@/lib/frames";
import seo from "@/content/seo.json";
import "./globals.css";

/* Section 08 / FONTS — DM Serif Display for display, DM Sans for body. */
const dmSerif = DM_Serif_Display({
  variable: "--font-dm-serif",
  subsets: ["latin"],
  weight: "400",
  display: "swap",
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://sacredinnovations.example"),
  /* Title and description come straight from the SEO content document. */
  title: {
    default: seo.meta.title,
    template: `%s — ${brand.name}`,
  },
  description: seo.meta.description,
  applicationName: brand.name,
  keywords: [
    "renovation",
    "custom built-ins",
    "cabinetry",
    "Conroe",
    "The Woodlands",
    "North Houston",
    "property improvement",
    "commercial improvements",
  ],
  openGraph: {
    type: "website",
    title: seo.meta.title,
    description: seo.meta.description,
    siteName: brand.name,
    locale: "en_US",
    images: [{ url: "/poster.jpg", width: 1280, height: 720, alt: brand.name }],
  },
  twitter: {
    card: "summary_large_image",
    title: seo.meta.title,
    description: seo.meta.description,
    images: ["/poster.jpg"],
  },
  icons: {
    icon: "/icon.png",
    apple: "/apple-icon.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#0b0b0b",
  colorScheme: "light",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${dmSerif.variable} ${dmSans.variable} h-full antialiased`}
    >
      <head>
        {/* The very first frames are the LCP. Fetch them with the document,
            not after the hero component hydrates. */}
        {Array.from({ length: 4 }, (_, i) => (
          <link
            key={i}
            rel="preload"
            as="image"
            href={framePath(i)}
            type="image/webp"
            fetchPriority={i === 0 ? "high" : "low"}
          />
        ))}
        <link rel="preload" as="image" href={framePath(PRIORITY_COUNT - 1)} type="image/webp" />
      </head>
      {/* Browser extensions commonly inject attributes onto <body> before
          React hydrates (Grammarly, ColorZilla and friends). This suppresses
          the resulting warning for this element's own attributes only — it
          does not extend to any child, so real mismatches still surface. */}
      <body suppressHydrationWarning className="bg-ink text-ink min-h-full">
        {children}
      </body>
    </html>
  );
}
