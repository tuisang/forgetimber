import Script from "next/script";

/**
 * Loads Google Analytics 4 only when NEXT_PUBLIC_GA_MEASUREMENT_ID is set.
 * Safe to ship with the env var unset — renders nothing until configured.
 * To enable: create a GA4 property at analytics.google.com, then set
 * NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXX in your Vercel project's env vars.
 */
export default function GoogleAnalytics() {
  const measurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
  if (!measurementId) return null;

  return (
    <>
      <Script src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`} strategy="afterInteractive" />
      <Script id="ga4-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${measurementId}');
        `}
      </Script>
    </>
  );
}
