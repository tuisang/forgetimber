import { MetadataRoute } from "next";
export const dynamic = "force-dynamic";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/api/", "/dashboard", "/chat-history"],
      },
    ],
    sitemap: "https://forgetimber.tuistech.co.ke/sitemap.xml",
  };
}
