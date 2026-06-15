"use client";
export const dynamic = "force-dynamic";

import ProductCarousel from "@/components/ProductCarousel";

export default function ShopPage() {
  return (
    <main className="container mx-auto py-8">
      <h1 className="text-4xl font-bold mb-6">
        Woodworking Tools Marketplace
      </h1>

      <ProductCarousel />
    </main>
  );
}