import { MetadataRoute } from "next";

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
