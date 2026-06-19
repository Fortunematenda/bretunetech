'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Heart, ShoppingCart, Trash2, ArrowRight, Loader2 } from 'lucide-react';
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
  image: string;
  inStock: boolean;
}

export default function WishlistPage() {
  const [wishlistItems, setWishlistItems] = useState<WishlistDisplayItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const { token, user } = useAuthStore();
  const { setItems, removeItem } = useWishlistStore();
  const addItem = useCartStore((s) => s.addItem);

  const fetchWishlist = async () => {
    if (!token) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const items = await getWishlist(token);
      // Update store with fresh data
      setItems(items);
      const displayItems: WishlistDisplayItem[] = items.map((item: ApiWishlistItem) => ({
        id: item.product.id,
        wishlistId: item.id,
        name: item.product.name,
        slug: item.product.slug,
        price: item.product.sellingPrice,
        image: item.product.images?.[0]?.url || '/assets/placeholder.svg',
        inStock: true, // You might want to check actual stock
      }));
      setWishlistItems(displayItems);
    } catch (err) {
      setError('Failed to load wishlist');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchWishlist();
  }, [token]);

  const handleRemoveFromWishlist = async (productId: string) => {
    if (!token) return;
    
    try {
      await removeFromWishlist(productId, token);
      removeItem(productId);
      setWishlistItems(items => items.filter(item => item.id !== productId));
    } catch (err) {
      console.error('Failed to remove from wishlist:', err);
    }
  };

  const moveToCart = (item: WishlistDisplayItem) => {
    addItem({
      productId: item.id,
      name: item.name,
      price: item.price,
      quantity: 1,
      type: 'product',
      image: item.image,
    });
    handleRemoveFromWishlist(item.id);
  };

  if (!token) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">My Wishlist</h1>
          <p className="text-gray-500 mb-6">Please login to view your wishlist</p>
          <Link href="/login" className="text-blue-600 hover:underline">Login</Link>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-600" />
          <p className="mt-4 text-gray-500">Loading wishlist...</p>
        </div>
      </div>
    );
  }

  if (wishlistItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">My Wishlist</h1>
            <Heart className="w-6 h-6 sm:w-8 sm:h-8 text-red-500" />
          </div>
          
          <div className="bg-white shadow-lg rounded-lg p-6 sm:p-12 text-center">
            <div className="flex justify-center mb-4 sm:mb-6">
              <div className="bg-red-50 p-4 sm:p-6 rounded-full">
                <Heart className="w-12 h-12 sm:w-16 sm:h-16 text-red-300" />
              </div>
            </div>
            <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-2">
              Your wishlist is empty
            </h2>
            <p className="text-gray-500 mb-6 sm:mb-8 max-w-md mx-auto text-sm sm:text-base">
              Start adding products you love! Your wishlist helps you keep track of items you want to buy later.
            </p>
            <Link
              href="/products"
              className="inline-flex items-center px-4 sm:px-6 py-2.5 sm:py-3 border border-transparent text-sm sm:text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors"
            >
              Browse Products
              <ArrowRight className="ml-2 w-4 h-4 sm:w-5 sm:h-5" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full px-4 sm:px-6 py-6 sm:py-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6 sm:mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">My Wishlist</h1>
          <p className="text-gray-500 mt-1">{wishlistItems.length} item{wishlistItems.length !== 1 ? 's' : ''}</p>
        </div>
        <Heart className="w-6 h-6 sm:w-8 sm:h-8 text-red-500 fill-red-500" />
      </div>

      <div className="grid lg:grid-cols-3 gap-6 lg:gap-8">
        {/* Wishlist Items */}
        <div className="lg:col-span-2 space-y-3 sm:space-y-4">
          {wishlistItems.map((item) => (
            <div key={item.id} className="bg-white border border-gray-200 rounded-xl p-3 sm:p-4 sm:p-5 flex gap-3 sm:gap-4 shadow-sm">
              {/* Image */}
              <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gray-100 rounded-lg flex items-center justify-center shrink-0 overflow-hidden border border-gray-200">
                <Image 
                  src={item.image} 
                  alt={item.name} 
                  width={96} 
                  height={96} 
                  className="w-full h-full object-contain p-1" 
                />
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h3 className="text-xs sm:text-sm font-medium text-gray-900 truncate">{item.name}</h3>
                    <span className="text-base sm:text-lg font-bold text-[#003d7a] mt-1 block">{formatPrice(item.price)}</span>
                  </div>
                  <button
                    onClick={() => handleRemoveFromWishlist(item.id)}
                    className="p-1 sm:p-1.5 text-gray-500 hover:text-red-400 transition-colors shrink-0"
                    title="Remove from wishlist"
                  >
                    <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </button>
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 mt-2 sm:mt-3">
                  <Link
                    href={`/products/${item.slug}`}
                    className="flex items-center justify-center gap-2 py-2 px-3 sm:px-4 rounded-lg font-medium bg-[#003d7a] text-white hover:bg-blue-800 transition-colors text-xs sm:text-sm"
                  >
                    View Product
                  </Link>
                  
                  <button
                    onClick={() => moveToCart(item)}
                    className="flex items-center justify-center gap-2 py-2 px-3 sm:px-4 rounded-lg font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors text-xs sm:text-sm"
                  >
                    <ShoppingCart className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> Add to Cart
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div>
          <div className="bg-white border border-gray-200 rounded-xl p-4 sm:p-6 lg:sticky lg:top-24 shadow-sm">
            <h2 className="text-base sm:text-lg font-bold text-gray-900 mb-3 sm:mb-4">Wishlist Summary</h2>
            <p className="text-gray-500 text-xs sm:text-sm mb-3 sm:mb-4">{wishlistItems.length} items saved for later</p>
            
            <Link
              href="/products"
              className="w-full flex items-center justify-center gap-2 py-2.5 sm:py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm sm:text-base font-medium rounded-xl transition-colors"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
