"use client";

import { useWishlist, WishlistItem } from "@/lib/WishlistContext";

export default function WishlistButton({
  item,
  className = "",
}: {
  item: WishlistItem;
  className?: string;
}) {
  const { isWishlisted, toggleWishlist } = useWishlist();
  const active = isWishlisted(item.id);

  return (
    <button
      type="button"
      aria-label={active ? `Remove ${item.name} from wishlist` : `Save ${item.name} to wishlist`}
      aria-pressed={active}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleWishlist(item);
      }}
      className={`flex items-center justify-center rounded-full bg-black/50 backdrop-blur-sm w-9 h-9 transition-colors hover:bg-black/70 ${className}`}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        width="18"
        height="18"
        fill={active ? "#e8bf9b" : "none"}
        stroke={active ? "#e8bf9b" : "#ffffff"}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8z" />
      </svg>
    </button>
  );
}
