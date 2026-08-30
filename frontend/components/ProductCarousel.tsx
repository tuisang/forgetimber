"use client";

import { useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Navigation } from "swiper/modules";
import { useCart } from "@/lib/CartContext";
import WishlistButton from "@/components/WishlistButton";

import "swiper/css";
import "swiper/css/navigation";

const products = [
   {
    id: 1,
    name: "Bender",
    image: "/tools/bender.jpg",
    price: 24500,
    reviews: 128,
  },
  {
    id: 2,
    name: "Clamp",
    image: "/tools/clamp.jpg",
    price: 18900,
    reviews: 96,
  },
  {
    id: 3,
    name: "Drill",
    image: "/tools/drill.webp",
    price: 12500,
    reviews: 75,
  },
  {
    id: 4,
    name: "CNC",
    image: "/tools/cnc.webp",
    price: 9500,
    reviews: 62,
  },
  {
    id: 5,
    name: "Cutter",
    image: "/tools/cutter.jpg",
    price: 4200,
    reviews: 44,
  },
  {
    id: 6,
    name: "Files",
    image: "/tools/files.jpg",
    price: 32000,
    reviews: 31,
  },
  {
    id: 7,
    name: "Grip",
    image: "/tools/grip.jpg",
    price: 6500,
    reviews: 18,
  },
  {
    id: 8,
    name: "Spinner",
    image: "/tools/spinner.jpg",
    price: 11500,
    reviews: 50,
  },
  {
    id: 9,
    name: "Vice",
    image: "/tools/vice.jpg",
    price: 2800,
    reviews: 39,
  },
  {
    id: 10,
    name: "Woodwaf",
    image: "/tools/woodwaf.jpg",
    price: 17500,
    reviews: 85,
  },
];

export default function ProductCarousel() {
  const { cart = [], addToCart } = useCart();
  const [quantities, setQuantities] = useState<Record<number, number>>({});

  const updateQuantity = (id: number, change: number) => {
    setQuantities((prev) => ({
      ...prev,
      [id]: Math.max(1, (prev[id] || 1) + change),
    }));
  };



  return (
    <section className="py-12 bg-[#131313]">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-4xl font-bold text-white">
            Woodworking Tools
          </h2>

          <div className="bg-[#e8bf9b] text-black px-4 py-2 rounded-lg font-bold">
            Cart: {cart.length}
          </div>
        </div>

        <Swiper
          modules={[Autoplay, Navigation]}
          loop={true}
          navigation
          speed={1500}
          autoplay={{
            delay: 2500,
            disableOnInteraction: false,
            pauseOnMouseEnter: true,
          }}
          spaceBetween={20}
          slidesPerView={5}
          breakpoints={{
            320: {
              slidesPerView: 1,
            },
            640: {
              slidesPerView: 2,
            },
            1024: {
              slidesPerView: 3,
            },
            1280: {
              slidesPerView: 5,
            },
          }}
        >
          {products.map((product) => (
            <SwiperSlide key={product.id}>
              <div className="relative rounded-xl overflow-hidden group shadow-xl">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-[340px] object-cover transition-transform duration-500 group-hover:scale-105"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />

                <div className="absolute top-4 left-4">
                  <h3 className="text-white font-bold text-lg">
                    {product.name}
                  </h3>
                </div>

                <div className="absolute top-4 right-4 flex items-start gap-2">
                  <WishlistButton item={{ id: product.id, name: product.name, price: product.price, img: product.image }} />
                  <div className="bg-[#e8bf9b] text-black px-3 py-1 rounded-full font-semibold">
                    KSh {product.price.toLocaleString()}
                  </div>
                </div>

                <div className="absolute bottom-4 right-4 bg-black/70 backdrop-blur-sm p-3 rounded-xl w-[190px]">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-yellow-400">
                      ★★★★★
                    </div>

                    <span className="text-xs text-white">
                      ({product.reviews})
                    </span>
                  </div>

                  <div className="flex items-center justify-center gap-2 mb-3">
                    <button
                      onClick={() =>
                        updateQuantity(product.id, -1)
                      }
                      className="bg-white text-black w-8 h-8 rounded font-bold"
                    >
                      -
                    </button>

                    <span className="text-white font-bold">
                      {quantities[product.id] || 1}
                    </span>

                    <button
                      onClick={() =>
                        updateQuantity(product.id, 1)
                      }
                      className="bg-white text-black w-8 h-8 rounded font-bold"
                    >
                      +
                    </button>
                  </div>

                  <button
  onClick={() =>
    addToCart({
      ...product,
      quantity: quantities[product.id] || 1,
    })
  }
  className="bg-[#e8bf9b] text-[#442b12] px-3 py-2 rounded w-full font-semibold"
>
  Add to Cart
</button>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  );
}