'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Heart, ShoppingCart, Trash2, ArrowRight, Loader2, Package, User, ArrowLeft, SlidersHorizontal, Check } from 'lucide-react';
import { useRouter } from 'next/navigation';
import SignInButton from '@/components/ui/SignInButton';
import { useAuthStore } from '@/store/auth-store';
import { useWishlistStore } from '@/store/wishlist-store';
import { useCartStore } from '@/store/cart-store';
import { getWishlist, removeFromWishlist, type WishlistItem as ApiWishlistItem } from '@/lib/wishlist-api';
import { formatPrice } from '@/lib/utils';

interface WishlistDisplayItem {
  id: string;
  wishlistId: string;
  name: string;
  slug: string;
  price: number;
  originalPrice?: number;
  image: string;
  inStock: boolean;
  stockQuantity: number;
}

export default function WishlistPage() {
  const router = useRouter();
  const [wishlistItems, setWishlistItems] = useState<WishlistDisplayItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [addedId, setAddedId] = useState<string | null>(null);
  const { token } = useAuthStore();
  const { setItems, removeItem } = useWishlistStore();
  const addItem = useCartStore((s) => s.addItem);

  const fetchWishlist = async () => {
    if (!token) { setIsLoading(false); return; }
    try {
      setIsLoading(true);
      const items = await getWishlist(token);
      setItems(items);
      setWishlistItems(items.map((item: ApiWishlistItem) => ({
        id: item.product.id,
        wishlistId: item.id,
        name: item.product.name,
        slug: item.product.slug,
        price: item.product.sellingPrice,
        originalPrice: item.product.originalPrice,
        image: item.product.images?.[0]?.url || '/assets/placeholder.svg',
        inStock: (item.product.stockQuantity ?? 0) > 0,
        stockQuantity: item.product.stockQuantity ?? 0,
      })));
    } catch {
      /* silent */
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchWishlist(); }, [token]);

  const handleRemove = async (productId: string) => {
    if (!token) return;
    setRemovingId(productId);
    try {
      await removeFromWishlist(productId, token);
      removeItem(productId);
      setWishlistItems((prev) => prev.filter((i) => i.id !== productId));
    } finally {
      setRemovingId(null);
    }
  };

  const moveToCart = (item: WishlistDisplayItem) => {
    addItem({ productId: item.id, name: item.name, price: item.price, quantity: 1, type: 'product', image: item.image });
    setAddedId(item.id);
    setTimeout(() => setAddedId(null), 1500);
    handleRemove(item.id);
  };

  const moveAllToCart = () => {
    wishlistItems.filter((i) => i.inStock).forEach((item) => {
      addItem({ productId: item.id, name: item.name, price: item.price, quantity: 1, type: 'product', image: item.image });
      removeFromWishlist(item.id, token!).catch(() => {});
      removeItem(item.id);
    });
    setWishlistItems((prev) => prev.filter((i) => !i.inStock));
  };

  /* ── Not logged in ── */
  if (!token) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 py-16 text-center">
        <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-4">
          <User className="w-8 h-8 text-red-400" />
        </div>
        <h2 className="text-lg font-bold text-gray-900 mb-1">Sign in to see your Wishlist</h2>
        <p className="text-sm text-gray-500 mb-6 max-w-xs">
          Save your favourite products and come back to them anytime.
        </p>
        <SignInButton className="px-6 py-3 bg-[#003d7a] text-white text-sm font-semibold rounded-xl hover:bg-blue-900 transition-colors">
          Sign In
        </SignInButton>
      </div>
    );
  }

  /* ── Loading ── */
  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 py-16">
        <Loader2 className="w-8 h-8 animate-spin text-[#003d7a] mb-3" />
        <p className="text-sm text-gray-500">Loading wishlist…</p>
      </div>
    );
  }

  /* ── Empty ── */
  if (wishlistItems.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 py-16 text-center">
        <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mb-5">
          <Heart className="w-10 h-10 text-red-300" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Your wishlist is empty</h2>
        <p className="text-sm text-gray-500 mb-8 max-w-xs">
          Tap the heart icon on any product to save it here.
        </p>
        <Link
          href="/products"
          className="inline-flex items-center gap-2 px-6 py-3 bg-[#003d7a] text-white text-sm font-semibold rounded-xl hover:bg-blue-900 transition-colors"
        >
          Browse Products <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  /* ── Main ── */
  const totalValue = wishlistItems.reduce((sum, i) => sum + i.price, 0);

  return (
    <>
    {/* ══ MOBILE LAYOUT (Image 1) ══ */}
    <div className="sm:hidden bg-gray-50 min-h-screen pb-24">
      {/* Mobile header */}
      <div className="sticky top-0 z-30 bg-white border-b border-gray-100 flex items-center justify-between px-4 py-3.5">
        <button onClick={() => router.back()} aria-label="Go back" className="text-gray-700">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-lg font-bold text-gray-900">My Wishlist</h1>
        <button aria-label="Filter" className="text-gray-700">
          <SlidersHorizontal className="w-5 h-5" />
        </button>
      </div>

      <div className="px-4 pt-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-bold text-gray-500">Saved items</h2>
          <span className="text-xs font-medium text-gray-500 bg-white border border-gray-200 px-2.5 py-1 rounded-full">
            {wishlistItems.length} items
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {wishlistItems.map((item) => {
            const lowStock = item.inStock && item.stockQuantity > 0 && item.stockQuantity <= 3;
            return (
              <div key={item.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
                <div className="relative bg-gray-50 aspect-square flex items-center justify-center p-3">
                  <Link href={`/products/${item.slug}`} className="w-full h-full flex items-center justify-center">
                    <img src={item.image} alt={item.name} className="max-w-full max-h-full object-contain"
                      onError={(e) => { (e.target as HTMLImageElement).src = '/assets/placeholder.svg'; }} />
                  </Link>
                  <button
                    onClick={() => handleRemove(item.id)}
                    disabled={removingId === item.id}
                    aria-label="Remove from wishlist"
                    className="absolute top-2 right-2 w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center"
                  >
                    {removingId === item.id
                      ? <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                      : <Heart className="w-4 h-4 text-[#003d7a] fill-[#003d7a]" />}
                  </button>
                </div>
                <div className="p-3 flex flex-col flex-1">
                  <Link href={`/products/${item.slug}`}>
                    <h3 className="text-sm font-bold text-gray-900 leading-snug line-clamp-2">{item.name}</h3>
                  </Link>
                  <p className="text-base font-bold text-[#003d7a] mt-1.5">{formatPrice(item.price)}</p>
                  <p className={`flex items-center gap-1 text-xs mt-1 ${
                    !item.inStock ? 'text-red-500' : lowStock ? 'text-orange-500' : 'text-green-600'
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${
                      !item.inStock ? 'bg-red-500' : lowStock ? 'bg-orange-500' : 'bg-green-500'
                    }`} />
                    {!item.inStock ? 'Out of Stock' : lowStock ? `Only ${item.stockQuantity} left` : 'In Stock'}
                  </p>
                  <div className="flex items-center gap-1.5 mt-2.5">
                    <button
                      onClick={() => moveToCart(item)}
                      disabled={!item.inStock || addedId === item.id}
                      className={`flex-1 flex items-center justify-center gap-1 py-2 rounded-lg text-[11px] font-semibold transition-colors ${
                        !item.inStock ? 'bg-gray-100 text-gray-400' : addedId === item.id ? 'bg-green-500 text-white' : 'bg-[#003d7a] text-white'
                      }`}
                    >
                      {addedId === item.id ? <Check className="w-3.5 h-3.5" /> : <ShoppingCart className="w-3.5 h-3.5" />}
                      {addedId === item.id ? 'Added' : 'Add to Cart'}
                    </button>
                    <button
                      onClick={() => handleRemove(item.id)}
                      className="flex items-center justify-center gap-1 px-2.5 py-2 rounded-lg text-[11px] font-semibold border border-gray-200 text-gray-500"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Remove
                    </button>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Promo card */}
          <div className="bg-blue-50/60 rounded-2xl border border-blue-100 flex flex-col items-center justify-center text-center p-4">
            <div className="w-12 h-12 rounded-full bg-[#003d7a] flex items-center justify-center mb-3">
              <ShoppingCart className="w-6 h-6 text-white" />
            </div>
            <p className="text-sm font-bold text-gray-900">Love it? Get it!</p>
            <p className="text-[11px] text-gray-500 leading-snug mt-1 mb-3">Move your favourite items to cart and checkout.</p>
            <button
              onClick={moveAllToCart}
              className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl border-2 border-[#003d7a] text-[#003d7a] text-xs font-semibold bg-white"
            >
              <ShoppingCart className="w-4 h-4" /> Move All to Cart
            </button>
          </div>
        </div>
      </div>
    </div>

    {/* ══ DESKTOP LAYOUT ══ */}
    <div className="hidden sm:block max-w-3xl mx-auto px-3 sm:px-4 py-4 sm:py-8">

      {/* Page header */}
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">My Wishlist</h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
            {wishlistItems.length} item{wishlistItems.length !== 1 ? 's' : ''} saved
          </p>
        </div>
        <Heart className="w-6 h-6 text-red-500 fill-red-500" />
      </div>

      <div className="flex flex-col lg:flex-row gap-4 lg:gap-6">

        {/* ── Product list ── */}
        <div className="flex-1 space-y-3">
          {wishlistItems.map((item) => {
            const discount = item.originalPrice && item.originalPrice > item.price
              ? Math.round(((item.originalPrice - item.price) / item.originalPrice) * 100)
              : null;

            return (
              <div
                key={item.id}
                className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden"
              >
                <div className="flex gap-3 p-3 sm:p-4">

                  {/* Image */}
                  <Link
                    href={`/products/${item.slug}`}
                    className="relative w-24 h-24 sm:w-28 sm:h-28 bg-gray-50 rounded-xl border border-gray-100 flex items-center justify-center shrink-0 overflow-hidden"
                  >
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-contain p-1.5"
                      onError={(e) => { (e.target as HTMLImageElement).src = '/assets/placeholder.svg'; }}
                    />
                    {discount && (
                      <span className="absolute top-1 left-1 bg-red-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-md">
                        -{discount}%
                      </span>
                    )}
                  </Link>

                  {/* Details */}
                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div className="flex items-start justify-between gap-2">
                      <Link href={`/products/${item.slug}`} className="flex-1 min-w-0">
                        <h3 className="text-xs sm:text-sm font-semibold text-gray-900 leading-snug line-clamp-2">
                          {item.name}
                        </h3>
                      </Link>
                      {/* Remove button */}
                      <button
                        onClick={() => handleRemove(item.id)}
                        disabled={removingId === item.id}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors shrink-0"
                        title="Remove from wishlist"
                      >
                        {removingId === item.id
                          ? <Loader2 className="w-4 h-4 animate-spin" />
                          : <Trash2 className="w-4 h-4" />}
                      </button>
                    </div>

                    {/* Price row */}
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-base sm:text-lg font-bold text-[#003d7a]">{formatPrice(item.price)}</span>
                      {item.originalPrice && (
                        <span className="text-xs text-gray-400 line-through">{formatPrice(item.originalPrice)}</span>
                      )}
                    </div>

                    {/* Stock badge */}
                    <span className={`self-start text-[10px] font-bold px-2 py-0.5 rounded-md mt-1 ${
                      item.inStock ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'
                    }`}>
                      {item.inStock ? 'In Stock' : 'Out of Stock'}
                    </span>
                  </div>
                </div>

                {/* Action buttons — full width, below image on mobile */}
                <div className="flex gap-2 px-3 pb-3 sm:px-4 sm:pb-4">
                  <button
                    onClick={() => moveToCart(item)}
                    disabled={!item.inStock || addedId === item.id}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-colors ${
                      !item.inStock
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : addedId === item.id
                        ? 'bg-green-500 text-white'
                        : 'bg-[#003d7a] text-white hover:bg-blue-900'
                    }`}
                  >
                    <ShoppingCart className="w-3.5 h-3.5 shrink-0" />
                    {addedId === item.id ? 'Added!' : item.inStock ? 'Add to Cart' : 'Out of Stock'}
                  </button>
                  <Link
                    href={`/products/${item.slug}`}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
                  >
                    View Product
                  </Link>
                </div>
              </div>
            );
          })}
        </div>

        {/* ── Summary sidebar (desktop) / bottom card (mobile) ── */}
        <div className="lg:w-64 shrink-0">
          <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-4 sm:p-5 lg:sticky lg:top-24">
            <h2 className="text-sm font-bold text-gray-900 mb-3">Summary</h2>

            <div className="space-y-2 text-sm mb-4">
              <div className="flex justify-between text-gray-500">
                <span>Items</span>
                <span>{wishlistItems.length}</span>
              </div>
              <div className="flex justify-between font-bold text-gray-900 border-t border-gray-100 pt-2">
                <span>Total value</span>
                <span>{formatPrice(totalValue)}</span>
              </div>
            </div>

            <Link
              href="/products"
              className="w-full flex items-center justify-center gap-2 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-semibold rounded-xl transition-colors"
            >
              Continue Shopping
            </Link>

            <Link
              href="/cart"
              className="w-full flex items-center justify-center gap-2 py-2.5 mt-2 bg-[#003d7a] hover:bg-blue-900 text-white text-sm font-semibold rounded-xl transition-colors"
            >
              <ShoppingCart className="w-4 h-4" /> View Cart
            </Link>
          </div>
        </div>
      </div>
    </div>
    </>
  );
}
