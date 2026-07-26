'use client';

import { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ChevronRight, Loader2 } from 'lucide-react';
import { appToast } from '@/lib/toast';
import { useCartStore } from '@/store/cart-store';
import { useAuthStore } from '@/store/auth-store';
import { useWishlistStore } from '@/store/wishlist-store';
import { checkWishlist, addToWishlist, removeFromWishlist } from '@/lib/wishlist-api';
import { productsApi } from '@/lib/api';
import { getProductReviews, Review, ReviewStats } from '@/lib/reviews-api';
import ProductGallery from '@/components/product-detail/ProductGallery';
import ProductInfoCenter from '@/components/product-detail/ProductInfoCenter';
import ProductPurchaseCard from '@/components/product-detail/ProductPurchaseCard';
import ProductTabs from '@/components/product-detail/ProductTabs';
import RelatedProducts from '@/components/product-detail/RelatedProducts';
import MobileAccordion from '@/components/product-detail/MobileAccordion';
import MobileProductSummary from '@/components/product-detail/MobileProductSummary';
import MobileStickyBuyBar from '@/components/product-detail/MobileStickyBuyBar';

interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  sellingPrice: number;
  costPrice?: number;
  originalPrice?: number;
  discountExpiresAt?: string;
  condition: string;
  stockQuantity: number;
  stockCpt?: number;
  stockJhb?: number;
  stockDbn?: number;
  category?: { name: string; slug: string };
  tags?: { tag: string }[];
  images: { url: string; altText?: string }[];
  sku?: string;
  specifications?: { key: string; value: string }[];
  manualUrl?: string;
  additionalInfo?: string;
  documents?: { id: string; url: string; name: string; type: string }[];
  shippingDays?: number;
  supplierName?: string;
  brand?: { id: string; name: string; slug: string };
}

export default function ProductDetailPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const slug = params.slug as string;
  const returnUrl = searchParams.get('returnUrl') || '/products';
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const addItem = useCartStore((s) => s.addItem);
  const { token, user } = useAuthStore();
  const { addItem: addToStore, removeItem: removeFromStore, isInWishlist: checkStoreWishlist } = useWishlistStore();
  const [quantity, setQuantity] = useState(1);
  const [warehouseLocation, setWarehouseLocation] = useState<'CPT' | 'JHB' | 'DBN' | undefined>(undefined);
  const [addedToCart, setAddedToCart] = useState(false);
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [isWishlistLoading, setIsWishlistLoading] = useState(false);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewStats, setReviewStats] = useState<ReviewStats | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<any[]>([]);
  const [isLoadingRelated, setIsLoadingRelated] = useState(false);
  const [accordionOpen, setAccordionOpen] = useState<Record<string, boolean>>({});
  const toggleAccordion = (key: string) => setAccordionOpen((prev) => ({ ...prev, [key]: !prev[key] }));
  const isAuthenticated = !!user && !!token;

  const getShippingText = () => {
    if (!product) return 'Ships in 3-4 work days';
    const cpt = product.stockCpt ?? 0;
    const jhb = product.stockJhb ?? 0;
    const dbn = product.stockDbn ?? 0;
    const warehouses = [cpt > 0 && 'CPT', jhb > 0 && 'JHB', dbn > 0 && 'DBN'].filter(Boolean) as string[];
    if (warehouses.length === 0) {
      if (product.shippingDays === 1) return 'Ships in 1 work day';
      if (product.shippingDays === 2) return 'Ships in 1-2 work days';
      if (product.shippingDays && product.shippingDays > 2) return `Ships in ${product.shippingDays - 1}-${product.shippingDays} work days`;
      return 'Ships in 3-5 work days';
    }
    return `Same-day dispatch from ${warehouses.join(' & ')}`;
  };

  // Fetch product from API
  useEffect(() => {
    const fetchProduct = async () => {
      setIsLoading(true);
      setLoadError(null);
      try {
        const data = await productsApi.getBySlug(slug);
        setProduct(data);

        // Track product view for analytics
        try {
          const API_BASE = process.env.NEXT_PUBLIC_API_URL || '/api';
          const visitorId = localStorage.getItem('bt_visitor_id') || crypto.randomUUID();
          const sessionId = sessionStorage.getItem('bt_session_id') || crypto.randomUUID();
          if (!localStorage.getItem('bt_visitor_id')) localStorage.setItem('bt_visitor_id', visitorId);
          if (!sessionStorage.getItem('bt_session_id')) sessionStorage.setItem('bt_session_id', sessionId);
          fetch(`${API_BASE}/analytics/track`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              visitorId,
              sessionId,
              pageUrl: `/products/${slug}`,
              pageTitle: data.name,
              referrer: document.referrer || undefined,
              productId: data.id,
            }),
            keepalive: true,
          }).catch(() => {});
        } catch {}

        // Save to recently viewed (scoped by user ID)
        try {
          const rvKey = `recentlyViewed_${user?.id ?? 'guest'}`;
          const stored = localStorage.getItem(rvKey);
          const recentlyViewed = stored ? JSON.parse(stored) : [];
          const productEntry = {
            id: data.id,
            slug: data.slug,
            name: data.name,
            price: data.sellingPrice,
            image: data.images[0]?.url || '',
            originalPrice: (data as any).originalPrice,
            shippingDays: (data as any).shippingDays || 3,
          };
          const filtered = recentlyViewed.filter((p: any) => p.id !== data.id);
          filtered.unshift(productEntry);
          const trimmed = filtered.slice(0, 10);
          localStorage.setItem(rvKey, JSON.stringify(trimmed));
        } catch (error) {
          console.error('Error saving to recently viewed:', error);
        }

        // Related products — similar item type / features only (not brand)
        setIsLoadingRelated(true);
        try {
          const seen = new Set<string>([data.slug]);
          const scored: { product: any; score: number }[] = [];
          const stopWords = new Set([
            'and', 'the', 'for', 'with', 'from', 'new', 'used', 'set', 'per', 'kit', 'of', 'in', 'to',
            'a', 'an', 'by', 'on', 'or', 'pack', 'pcs', 'pc', 'unit', 'black', 'white', 'dual', 'band',
          ]);
          // Strip brand tokens so we match product type, not manufacturer
          const brandTokens = new Set(
            String(data.brand?.name || '')
              .toLowerCase()
              .replace(/[^a-z0-9\s]/g, ' ')
              .split(/\s+/)
              .filter((w: string) => w.length >= 2)
          );

          const nameWords: string[] = String(data.name || '')
            .toLowerCase()
            .replace(/[^a-z0-9\s]/g, ' ')
            .split(/\s+/)
            .filter((w: string) => w.length >= 3 && !stopWords.has(w) && !brandTokens.has(w) && !/^\d+$/.test(w));

          const productTypes = [
            'router', 'switch', 'camera', 'access', 'point', 'ap', 'antenna', 'cable', 'poe',
            'firewall', 'gateway', 'nvr', 'dvr', 'ups', 'injector', 'patch', 'sfp', 'media',
            'converter', 'radio', 'cpe', 'ont', 'onu', 'modem', 'bridge', 'controller',
            'turret', 'bullet', 'dome', 'wifi', 'wireless', 'ethernet', 'fibre', 'fiber',
          ];
          const typeWords = nameWords.filter((w) => productTypes.some((t) => w.includes(t) || t.includes(w)));
          const featureWords = nameWords.filter((w) => !typeWords.includes(w)).slice(0, 4);

          const scoreCandidate = (p: any, base = 0) => {
            const pName = String(p.name || '').toLowerCase();
            const pBrand = String(p.brand?.name || p.brand || '').toLowerCase();
            const typeHits = typeWords.filter((w) => pName.includes(w)).length;
            const featureHits = featureWords.filter((w) => pName.includes(w)).length;
            const sameCategory = p.category?.slug && p.category.slug === data.category?.slug ? 3 : 0;
            // Prefer similar product class; do not reward same brand
            const sameBrandPenalty =
              data.brand?.name && pBrand && pBrand === String(data.brand.name).toLowerCase() ? -8 : 0;
            // Must share a product-type or feature word (not brand / not category alone)
            if (typeHits === 0 && featureHits === 0) return null;
            return {
              product: p,
              score: base + typeHits * 8 + featureHits * 4 + sameCategory + sameBrandPenalty,
            };
          };

          const addProducts = (list: any[], base = 0) => {
            for (const p of list || []) {
              if (!p?.slug || seen.has(p.slug)) continue;
              const row = scoreCandidate(p, base);
              if (!row || row.score <= 0) continue;
              seen.add(p.slug);
              scored.push(row);
            }
          };

          // Search by product type first (cross-brand similar items)
          const typeQuery = (typeWords[0] || featureWords[0] || '').trim();
          if (typeQuery) {
            try {
              const byType = await productsApi.list({ search: typeQuery, limit: '24' });
              addProducts(byType.products, 6);
            } catch { /* silent */ }
          }

          // Feature search (e.g. "poe", "wifi 6", "4mp") without brand
          const featureQuery = [...typeWords.slice(0, 1), ...featureWords.slice(0, 1)].join(' ').trim();
          if (featureQuery && featureQuery !== typeQuery) {
            try {
              const byFeature = await productsApi.list({ search: featureQuery, limit: '16' });
              addProducts(byFeature.products, 4);
            } catch { /* silent */ }
          }

          // Same category as fallback pool, still scored by similarity (not brand)
          if (data.category?.slug) {
            try {
              const byCat = await productsApi.list({ category: data.category.slug, limit: '24' });
              addProducts(byCat.products, 2);
            } catch { /* silent */ }
          }

          scored.sort((a, b) => b.score - a.score);
          const final: any[] = [];
          const usedNames = new Set<string>();
          let sameBrandCount = 0;
          for (const s of scored) {
            const pName = String(s.product.name || '').toLowerCase();
            if (!pName || usedNames.has(pName)) continue;
            const pBrand = String(s.product.brand?.name || '').toLowerCase();
            const isSameBrand =
              !!data.brand?.name && pBrand === String(data.brand.name).toLowerCase();
            // Cap same-brand results so the row stays "similar items", not brand shelf
            if (isSameBrand && sameBrandCount >= 1) continue;
            if (isSameBrand) sameBrandCount += 1;
            usedNames.add(pName);
            final.push(s.product);
            if (final.length >= 4) break;
          }
          setRelatedProducts(final);
        } catch {
          setRelatedProducts([]);
        } finally {
          setIsLoadingRelated(false);
        }
      } catch (error) {
        setLoadError('Product not found');
      } finally {
        setIsLoading(false);
      }
    };

    if (slug) {
      fetchProduct();
    }
  }, [slug]);

  // Fetch reviews when product loads
  useEffect(() => {
    if (!product) return;
    getProductReviews(product.id).then((data) => {
      setReviews(data.reviews);
      setReviewStats(data.stats);
    }).catch(() => {});
  }, [product?.id]);

  // Check initial wishlist status
  useEffect(() => {
    if (!product || !token) return;
    checkWishlist(product.id, token)
      .then(setIsInWishlist)
      .catch(() => setIsInWishlist(false));
  }, [product, token]);

  // Also check store for local state
  useEffect(() => {
    if (product) {
      setIsInWishlist(checkStoreWishlist(product.id));
    }
  }, [product, checkStoreWishlist]);

  const toggleWishlist = async () => {
    if (!isAuthenticated || !token) {
      appToast.info('Please login to add to wishlist');
      return;
    }

    if (!product) return;

    setIsWishlistLoading(true);
    try {
      if (isInWishlist) {
        await removeFromWishlist(product.id, token);
        removeFromStore(product.id);
        setIsInWishlist(false);
        appToast.success('Removed from wishlist');
      } else {
        const wishlistItem = await addToWishlist(product.id, token);
        addToStore(wishlistItem);
        setIsInWishlist(true);
        appToast.success('Added to wishlist!');
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update wishlist';
      appToast.error(message);
    } finally {
      setIsWishlistLoading(false);
    }
  };

  const handleAddToCart = () => {
    if (!product) return;
    addItem({
      productId: product.id,
      name: product.name,
      price: product.sellingPrice,
      quantity,
      type: 'product',
      image: product.images?.[0]?.url,
      warehouseLocation,
    });
    if (token) {
      import('@/lib/api').then(({ cartApi }) => {
        cartApi.addItem(token, { productId: product.id, quantity, warehouseLocation }).catch(() => {});
      });
    }
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2500);
  };

  const handleBuyNow = () => {
    if (!product) return;
    addItem({
      productId: product.id,
      name: product.name,
      price: product.sellingPrice,
      quantity,
      type: 'product',
      image: product.images?.[0]?.url,
      warehouseLocation,
    });
    if (token) {
      import('@/lib/api').then(({ cartApi }) => {
        cartApi.addItem(token, { productId: product.id, quantity, warehouseLocation }).catch(() => {});
      });
    }
    window.location.href = '/cart';
  };

  if (isLoading) {
    return (
      <div className="w-full px-4 py-16 text-center bg-white min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin mx-auto text-[#003d7a] mb-4" />
        <p className="text-slate-500">Loading product...</p>
      </div>
    );
  }

  if (!product || loadError) {
    return (
      <div className="w-full px-4 py-16 text-center bg-white min-h-screen">
        <h1 className="text-2xl font-bold text-slate-900 mb-4">Product Not Found</h1>
        <p className="text-slate-500 mb-6">The product you&apos;re looking for doesn&apos;t exist.</p>
        <Link href={returnUrl} className="text-[#003d7a] hover:text-[#0055a4]">Back to products</Link>
      </div>
    );
  }

  const inStock = (product.stockQuantity > 0) || ((product.stockCpt ?? 0) > 0) || ((product.stockJhb ?? 0) > 0) || ((product.stockDbn ?? 0) > 0);
  const warehouseStockCount = [
    (product.stockCpt ?? 0) > 0,
    (product.stockJhb ?? 0) > 0,
    (product.stockDbn ?? 0) > 0,
  ].filter(Boolean).length;
  const requiresWarehouse = inStock && warehouseStockCount > 0;
  const canPurchase = inStock && (!requiresWarehouse || !!warehouseLocation);
  const maxQty = Math.max(product.stockQuantity || 0, 1);
  const deliveryEstimate = (() => {
    if (requiresWarehouse) return '1–3 work days';
    const days = product.shippingDays && product.shippingDays > 0 ? product.shippingDays : 3;
    if (days <= 1) return '1 work day';
    if (days === 2) return '1–2 work days';
    return `${Math.max(1, days - 1)}–${days} work days`;
  })();

  return (
    <div className="w-full min-h-screen bg-white" data-product-id={product.id}>
      {/* ── Mobile (Takealot-style) ── */}
      <div className="lg:hidden pb-28">
        <ProductGallery
          product={product}
          returnUrl={returnUrl}
          isInWishlist={isInWishlist}
          onToggleWishlist={toggleWishlist}
        />

        <div className="space-y-5 px-4 pt-4">
          <MobileProductSummary
            product={product}
            reviewStats={reviewStats}
            quantity={quantity}
            setQuantity={setQuantity}
            maxQty={maxQty}
            warehouseLocation={warehouseLocation}
            setWarehouseLocation={setWarehouseLocation}
            requiresWarehouse={requiresWarehouse}
            deliveryEstimate={deliveryEstimate}
            inStock={inStock}
          />

          <MobileAccordion
            product={product}
            accordionOpen={accordionOpen}
            toggleAccordion={toggleAccordion}
            reviews={reviews}
            reviewStats={reviewStats}
            isAuthenticated={isAuthenticated}
          />

          <RelatedProducts products={relatedProducts} isLoading={isLoadingRelated} />
        </div>

        <MobileStickyBuyBar
          price={product.sellingPrice}
          originalPrice={product.originalPrice}
          inStock={inStock}
          canPurchase={canPurchase}
          addedToCart={addedToCart}
          isAdding={false}
          onAddToCart={handleAddToCart}
        />
      </div>

      {/* ── Desktop ── */}
      <div className="mx-auto hidden w-full max-w-[1560px] px-6 py-8 lg:block">
        <nav className="mb-4 flex items-center gap-1.5 overflow-x-auto text-xs text-slate-500">
          <Link href="/" className="whitespace-nowrap hover:text-[#003d7a]">Home</Link>
          <ChevronRight className="h-3 w-3 shrink-0" />
          <Link href="/products" className="whitespace-nowrap hover:text-[#003d7a]">Products</Link>
          <ChevronRight className="h-3 w-3 shrink-0" />
          {product.category && (
            <>
              <Link href={`/products?category=${product.category.slug}`} className="whitespace-nowrap hover:text-[#003d7a]">
                {product.category.name}
              </Link>
              <ChevronRight className="h-3 w-3 shrink-0" />
            </>
          )}
          <span className="truncate text-slate-900">{product.name}</span>
        </nav>

        <div className="grid auto-rows-start grid-cols-[minmax(0,1fr)_380px] gap-8 xl:grid-cols-[minmax(0,1fr)_400px]">
          <main className="min-w-0">
            <div className="mb-6 flex gap-10">
              <div className="w-[52%] shrink-0 xl:w-[50%]">
                <ProductGallery
                  product={product}
                  returnUrl={returnUrl}
                  isInWishlist={isInWishlist}
                  onToggleWishlist={toggleWishlist}
                />
              </div>
              <div className="min-w-0 flex-1">
                <ProductInfoCenter
                  product={product}
                  reviewStats={reviewStats}
                  getShippingText={getShippingText}
                />
              </div>
            </div>

            <ProductTabs
              product={product}
              reviews={reviews}
              setReviews={setReviews}
              reviewStats={reviewStats}
              setReviewStats={setReviewStats}
              isAuthenticated={isAuthenticated}
              token={token}
            />

            <RelatedProducts products={relatedProducts} isLoading={isLoadingRelated} />
          </main>

          <aside className="shrink-0">
            <ProductPurchaseCard
              product={product}
              quantity={quantity}
              setQuantity={setQuantity}
              warehouseLocation={warehouseLocation}
              setWarehouseLocation={setWarehouseLocation}
              addedToCart={addedToCart}
              onAddToCart={handleAddToCart}
              onBuyNow={handleBuyNow}
              isInWishlist={isInWishlist}
              isWishlistLoading={isWishlistLoading}
              onToggleWishlist={toggleWishlist}
              inStock={inStock}
              getShippingText={getShippingText}
            />
          </aside>
        </div>
      </div>
    </div>
  );
}
