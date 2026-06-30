'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Heart, ShoppingCart, Trash2, ArrowRight, Loader2, Package, User, ArrowLeft, SlidersHorizontal, Check, Grid2X2, MapPin, CreditCard, Settings, LogOut, ChevronDown } from 'lucide-react';
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
    <div className="md:hidden bg-gray-50 min-h-screen pb-24">
      {/* Mobile header */}
      <div className="sticky top-0 z-30 bg-white border-b border-gray-100 flex items-center justify-between px-4 py-3.5">
        <Link href="/account" aria-label="Go back" className="text-gray-700">
          <ArrowLeft className="w-5 h-5" />
        </Link>
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
                <div className="relative bg-white aspect-square flex items-center justify-center p-3">
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
                      {addedId === item.id ? 'Added' : 'Add'}
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
          <div className="bg-[#e6f0ff]/60 rounded-2xl border border-blue-100 flex flex-col items-center justify-center text-center p-4">
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
    <main className="hidden md:block min-h-screen bg-slate-50">
      <section className="px-8 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-start justify-between gap-6 mb-8">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Wishlist</h1>
              <p className="text-slate-500 mt-2">
                {wishlistItems.length} saved items ready for your next purchase
              </p>
            </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={moveAllToCart}
                  className="h-11 px-5 rounded-xl bg-[#003d7a] text-white font-bold text-sm flex items-center gap-2 hover:bg-blue-700"
                >
                  <ShoppingCart className="w-4 h-4" />
                  Move All to Cart
                </button>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-5 mb-8">
              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
                <p className="text-sm text-slate-500">Saved Items</p>
                <p className="text-xl font-semibold text-slate-900 mt-2">{wishlistItems.length}</p>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
                <p className="text-sm text-slate-500">In Stock</p>
                <p className="text-xl font-semibold text-green-600 mt-2">{wishlistItems.filter(i => i.inStock).length}</p>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
                <p className="text-sm text-slate-500">Out of Stock</p>
                <p className="text-xl font-semibold text-red-500 mt-2">{wishlistItems.filter(i => !i.inStock).length}</p>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
                <p className="text-sm text-slate-500">Estimated Total</p>
                <p className="text-xl font-semibold text-blue-700 mt-2">
                  {formatPrice(wishlistItems.filter(i => i.inStock).reduce((sum, item) => sum + item.price, 0))}
                </p>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-4 mb-6 shadow-sm">
              <div className="flex items-center gap-3">
                <Package className="w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search your wishlist..."
                  className="flex-1 h-10 outline-none text-sm text-slate-700 placeholder:text-slate-400"
                />

                <select className="h-10 rounded-xl border border-slate-200 px-3 text-sm font-semibold text-slate-700 outline-none">
                  <option>Sort by: Recently Added</option>
                  <option>Price: Low to High</option>
                  <option>Price: High to Low</option>
                  <option>In Stock First</option>
                </select>
              </div>
            </div>

            {wishlistItems.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-200 py-20 text-center shadow-sm">
                <div className="w-20 h-20 rounded-full bg-[#e6f0ff] flex items-center justify-center mx-auto mb-4">
                  <Heart className="w-10 h-10 text-[#003d7a]" />
                </div>

                <h2 className="text-2xl font-bold text-slate-900">Your wishlist is empty</h2>
                <p className="text-sm text-slate-500 mt-2">
                  Save products you love and come back to them later.
                </p>

                <Link
                  href="/products"
                  className="inline-flex mt-6 h-11 px-6 rounded-xl bg-[#003d7a] text-white font-bold items-center justify-center"
                >
                  Browse Products
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
                {wishlistItems.map((item) => {
                  const lowStock = item.inStock && item.stockQuantity > 0 && item.stockQuantity <= 3;
                  const isOutOfStock = !item.inStock;
                  const discount = item.originalPrice && item.originalPrice > item.price
                    ? Math.round(((item.originalPrice - item.price) / item.originalPrice) * 100)
                    : null;

                  return (
                    <div key={item.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden hover:shadow-md transition-all">
                      <div className="relative bg-white h-48 flex items-center justify-center">
                        <Link href={`/products/${item.slug}`} className="w-full h-full flex items-center justify-center">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-full h-full object-contain p-6"
                            onError={(e) => {
                              (e.currentTarget as HTMLImageElement).src = '/assets/placeholder.svg';
                            }}
                          />
                        </Link>

                        <button
                          onClick={() => handleRemove(item.id)}
                          disabled={removingId === item.id}
                          className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center text-[#003d7a]"
                        >
                          {removingId === item.id
                            ? <Loader2 className="w-4 h-4 animate-spin" />
                            : <Heart className="w-4 h-4 fill-blue-600" />}
                        </button>

                        {discount && (
                          <span className="absolute top-3 left-3 bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded-full">
                            -{discount}%
                          </span>
                        )}

                        <span
                          className={`absolute top-3 left-3 text-[10px] font-bold px-2 py-1 rounded-full ${
                            isOutOfStock
                              ? 'bg-red-50 text-red-600'
                              : lowStock
                              ? 'bg-orange-50 text-orange-600'
                              : 'bg-green-50 text-green-700'
                          }`}
                        >
                          {isOutOfStock ? 'Out of Stock' : lowStock ? `Only ${item.stockQuantity} left` : 'In Stock'}
                        </span>
                      </div>

                      <div className="p-4">
                        <Link href={`/products/${item.slug}`}>
                          <h3 className="text-sm text-slate-900 leading-snug line-clamp-2 min-h-[36px]">
                            {item.name}
                          </h3>
                        </Link>

                        <div className="mt-3 flex items-end gap-2">
                          <p className="text-base font-semibold text-blue-700">{formatPrice(item.price)}</p>

                          {item.originalPrice ? (
                            <p className="text-xs text-slate-400 line-through mb-0.5">
                              {formatPrice(item.originalPrice)}
                            </p>
                          ) : null}
                        </div>

                        <div className="mt-4 grid grid-cols-[1fr_auto] gap-2">
                          <button
                            onClick={() => moveToCart(item)}
                            disabled={isOutOfStock || addedId === item.id}
                            className={`h-9 rounded-lg font-semibold text-xs flex items-center justify-center gap-2 transition-colors ${
                              isOutOfStock
                                ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                                : addedId === item.id
                                ? 'bg-green-500 text-white'
                                : 'bg-[#003d7a] hover:bg-blue-700 text-white'
                            }`}
                          >
                            {addedId === item.id ? <Check className="w-3.5 h-3.5" /> : <ShoppingCart className="w-3.5 h-3.5" />}
                            {addedId === item.id ? 'Added' : isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
                          </button>

                          <button
                            onClick={() => handleRemove(item.id)}
                            disabled={removingId === item.id}
                            className="h-9 px-3 rounded-lg border border-slate-200 text-slate-600 hover:text-red-600 hover:border-red-200 hover:bg-red-50 flex items-center justify-center gap-2"
                          >
                            {removingId === item.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                            <span className="hidden xl:inline text-xs font-semibold">Remove</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>
      </main>
    </>
  );
}
