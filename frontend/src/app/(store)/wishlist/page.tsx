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
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">My Wishlist</h1>
          <p className="text-gray-500 mb-6">Please login to view your wishlist</p>
          <Link href="/login" className="text-blue-600 hover:underline">Login</Link>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-600" />
          <p className="mt-4 text-gray-500">Loading wishlist...</p>
        </div>
      </div>
    );
  }

  if (wishlistItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold text-gray-900">My Wishlist</h1>
            <Heart className="w-8 h-8 text-red-500" />
          </div>
          
          <div className="bg-white shadow-lg rounded-lg p-12 text-center">
            <div className="flex justify-center mb-6">
              <div className="bg-red-50 p-6 rounded-full">
                <Heart className="w-16 h-16 text-red-300" />
              </div>
            </div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">
              Your wishlist is empty
            </h2>
            <p className="text-gray-500 mb-8 max-w-md mx-auto">
              Start adding products you love! Your wishlist helps you keep track of items you want to buy later.
            </p>
            <Link
              href="/products"
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors"
            >
              Browse Products
              <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full px-4 sm:px-6 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Wishlist</h1>
          <p className="text-gray-500 mt-1">{wishlistItems.length} item{wishlistItems.length !== 1 ? 's' : ''}</p>
        </div>
        <Heart className="w-8 h-8 text-red-500 fill-red-500" />
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Wishlist Items */}
        <div className="lg:col-span-2 space-y-4">
          {wishlistItems.map((item) => (
            <div key={item.id} className="bg-white border border-gray-200 rounded-xl p-4 sm:p-5 flex gap-4 shadow-sm">
              {/* Image */}
              <div className="w-24 h-24 bg-gray-100 rounded-lg flex items-center justify-center shrink-0 overflow-hidden border border-gray-200">
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
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">{item.name}</h3>
                    <span className="text-lg font-bold text-[#003d7a] mt-1 block">{formatPrice(item.price)}</span>
                  </div>
                  <button
                    onClick={() => handleRemoveFromWishlist(item.id)}
                    className="p-1.5 text-gray-500 hover:text-red-400 transition-colors"
                    title="Remove from wishlist"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex items-center gap-2 mt-3">
                  <Link
                    href={`/products/${item.slug}`}
                    className="flex items-center justify-center gap-2 py-2 px-4 rounded-lg font-medium bg-[#003d7a] text-white hover:bg-blue-800 transition-colors text-sm"
                  >
                    View Product
                  </Link>
                  
                  <button
                    onClick={() => moveToCart(item)}
                    className="flex items-center justify-center gap-2 py-2 px-4 rounded-lg font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors text-sm"
                  >
                    <ShoppingCart className="w-4 h-4" /> Add to Cart
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div>
          <div className="bg-white border border-gray-200 rounded-xl p-6 sticky top-24 shadow-sm">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Wishlist Summary</h2>
            <p className="text-gray-500 text-sm mb-4">{wishlistItems.length} items saved for later</p>
            
            <Link
              href="/products"
              className="w-full flex items-center justify-center gap-2 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-xl transition-colors"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
