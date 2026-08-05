import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import Navbar from "@/components/Navbar";
import ArtisanChatbot from "@/components/ArtisanChatbot";
import FloatingActions from "@/components/FloatingActions";
import { CartProvider } from "@/lib/CartContext";
import { Suspense } from "react";
import Loading from "@/app/loading";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

const OG_IMAGE = "https://lh3.googleusercontent.com/aida-public/AB6AXuDKZkFB7nfJk6r7jmyQO-AVHnZdP7LJr29ZqN0oN7deW8u-FynV8eH49R4bubmO2QUoz08l5GAEmy704ZORM-htSo6QE8m1XQrNzsO9QWzsBJmHRZ7Y2DBUDqj62PuAbh-lASPFQ57rHdGz29cx9ckkpH4Zq2YmYd9he093plIplw7Okh7gZhohycXc2UdEF5He9qps9SX4cRwWOcjzKRvPvhskTw1ZJOvhJ2O_TXcdFP9WV_YbCCsPzmlJZwtHvC6fiB2l2pwLqsMT";

export const metadata: Metadata = {
  metadataBase: new URL('https://forgetimber.tuistech.co.ke'),
  title: {
    default: "Forge & Timber Atelier | Bespoke Furniture & Metalwork Nairobi",
    template: "%s | Forge & Timber Atelier",
  },
  description: "Bespoke furniture and metalwork studio in Nairobi, Kenya. We combine African hardwoods with industrial steel to create timeless, handcrafted pieces. Custom orders, M-Pesa payments.",
  keywords: [
    "bespoke furniture Nairobi",
    "custom furniture Kenya",
    "metalwork Nairobi",
    "timber furniture Kenya",
    "steel furniture Nairobi",
    "Forge Timber Atelier",
    "handmade furniture Kenya",
    "wood metal furniture",
    "Mvule furniture",
    "African hardwood furniture",
    "furniture maker Nairobi",
    "industrial furniture Kenya",
  ],
  authors: [{ name: "Forge & Timber Atelier", url: "https://tuistech.co.ke" }],
  creator: "Forge & Timber Atelier",
  publisher: "Forge & Timber Atelier",
  category: "Furniture & Home Decor",
  openGraph: {
    type: "website",
    locale: "en_KE",
    url: "https://forgetimber.tuistech.co.ke",
    siteName: "Forge & Timber Atelier",
    title: "Forge & Timber Atelier | Bespoke Furniture & Metalwork Nairobi",
    description: "Handcrafted furniture and metalwork in Nairobi, Kenya. African hardwoods meet industrial steel. Custom orders, M-Pesa payments accepted.",
    images: [{ url: OG_IMAGE, width: 1200, height: 630, alt: "Forge & Timber Atelier - Bespoke Furniture Nairobi" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Forge & Timber Atelier | Bespoke Furniture Nairobi",
    description: "Handcrafted furniture and metalwork in Nairobi, Kenya.",
    images: [OG_IMAGE],
    creator: "@forgeandtimber",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION ?? "",
  },
  alternates: { canonical: 'https://forgetimber.tuistech.co.ke' }
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  name: "Forge & Timber Atelier",
  description: "Bespoke furniture and metalwork studio in Nairobi, Kenya. Custom handcrafted pieces combining African hardwoods with industrial steel.",
  url: "https://tuistech.co.ke",
  telephone: "+254726461196",
  email: "alex2000rui@gmail.com",
  address: {
    "@type": "PostalAddress",
    addressLocality: "Nairobi",
    addressCountry: "KE",
  },
  geo: {
    "@type": "GeoCoordinates",
    latitude: -1.2921,
    longitude: 36.8219,
  },
  openingHoursSpecification: [
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      opens: "08:00",
      closes: "18:00",
    },
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Saturday"],
      opens: "09:00",
      closes: "15:00",
    },
  ],
  priceRange: "KSh 15,000 - KSh 500,000+",
  image: OG_IMAGE,
  sameAs: [],
  hasOfferCatalog: {
    "@type": "OfferCatalog",
    name: "Bespoke Furniture & Metalwork Services",
    itemListElement: [
      { "@type": "Offer", itemOffered: { "@type": "Service", name: "Custom Furniture" } },
      { "@type": "Offer", itemOffered: { "@type": "Service", name: "Architectural Metalwork" } },
      { "@type": "Offer", itemOffered: { "@type": "Service", name: "Wood-Metal Décor" } },
      { "@type": "Offer", itemOffered: { "@type": "Service", name: "Restoration & Repairs" } },
      { "@type": "Offer", itemOffered: { "@type": "Service", name: "Precision Welding" } },
      { "@type": "Offer", itemOffered: { "@type": "Service", name: "Commercial Installations" } },
    ],
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <ClerkProvider>
      <html lang="en-KE" className="dark">
        <head>
          <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@500&display=swap" rel="stylesheet" />
          <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
          <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
          <meta name="theme-color" content="#131313" />
          <meta name="msapplication-TileColor" content="#131313" />
          <link rel="canonical" href="https://tuistech.co.ke" />
        </head>
        <body className={`${geistSans.variable} ${geistMono.variable} bg-[#131313] text-[#e5e2e1]`}>
          <CartProvider>
            <Navbar />
            <Suspense fallback={<Loading />}>
              {children}
            </Suspense>
            <ArtisanChatbot />
            <FloatingActions />
          </CartProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
