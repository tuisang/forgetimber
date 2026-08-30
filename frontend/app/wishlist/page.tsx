"use client";

import Link from "next/link";
import { useWishlist } from "@/lib/WishlistContext";
import { useCart } from "@/lib/CartContext";
import Footer from "@/components/Footer";

export default function WishlistPage() {
  const { items, removeFromWishlist, clearWishlist } = useWishlist();
  const { addToCart } = useCart();

  return (
    <main className="min-h-screen bg-[#0e0e0e] text-[#e5e2e1]">
      <div className="max-w-5xl mx-auto px-6 py-16">
        <div className="flex items-center justify-between mb-10">
          <h1 className="text-3xl md:text-4xl font-bold">Your Wishlist</h1>
          {items.length > 0 && (
            <button
              onClick={clearWishlist}
              className="text-sm text-[#9c8e84] hover:text-[#e8bf9b] transition-colors"
            >
              Clear all
            </button>
          )}
        </div>

        {items.length === 0 ? (
          <div className="text-center py-24">
            <p className="text-[#9c8e84] mb-6">
              Nothing saved yet. Browse our tools and tap the heart icon to save items for later.
            </p>
            <Link
              href="/shop"
              className="inline-block bg-[#e8bf9b] text-[#442b12] font-semibold px-6 py-3 hover:bg-[#e8bf9b]/90 transition-colors"
            >
              Browse Tools
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((item) => (
              <div
                key={item.id}
                className="bg-[#1a1a1a] rounded-xl overflow-hidden group shadow-lg flex flex-col"
              >
                <img
                  src={item.img}
                  alt={item.name}
                  className="w-full h-52 object-cover"
                />
                <div className="p-4 flex flex-col flex-1">
                  <h3 className="font-bold text-lg mb-1">{item.name}</h3>
                  <p className="text-[#e8bf9b] font-semibold mb-4">
                    KSh {item.price.toLocaleString()}
                  </p>
                  <div className="mt-auto flex gap-2">
                    <button
                      onClick={() =>
                        addToCart(
                          {
                            id: item.id,
                            name: item.name,
                            price: item.price,
                            priceLabel: `KSh ${item.price.toLocaleString()}`,
                            img: item.img,
                          },
                          1
                        )
                      }
                      className="flex-1 bg-[#e8bf9b] text-[#442b12] font-semibold px-3 py-2 rounded text-sm hover:bg-[#e8bf9b]/90 transition-colors"
                    >
                      Add to Cart
                    </button>
                    <button
                      onClick={() => removeFromWishlist(item.id)}
                      aria-label={`Remove ${item.name} from wishlist`}
                      className="px-3 py-2 rounded text-sm border border-[#3a3a3a] text-[#9c8e84] hover:text-[#e8bf9b] hover:border-[#e8bf9b] transition-colors"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <Footer />
    </main>
  );
}
