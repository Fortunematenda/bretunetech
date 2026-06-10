'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useSearchParams } from 'next/navigation';
import { ChevronLeft, Loader2 } from 'lucide-react';
import ProductForm from '@/components/admin/ProductForm';
import { productsApi } from '@/lib/api';
import { useAuthStore } from '@/store/auth-store';

export default function EditProductPage() {
  const { id } = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const returnUrl = searchParams.get('returnUrl') || '/admin/products';
  const { token } = useAuthStore();
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id || !token) return;
    productsApi.getById(token, id)
      .then((data) => {
        if (data) {
          setProduct(data);
        } else {
          setError('Product not found');
        }
      })
      .catch(() => setError('Failed to load product'))
      .finally(() => setLoading(false));
  }, [id, token]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="w-6 h-6 text-cyan-400 animate-spin" />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="text-center py-24">
        <p className="text-slate-400">{error || 'Product not found'}</p>
        <Link href={returnUrl} className="text-cyan-400 hover:text-cyan-300 text-sm mt-3 inline-block">
          ← Back to Products
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2">
        <Link
          href={returnUrl}
          className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-white transition-colors"
        >
          <ChevronLeft className="w-4 h-4" /> Products
        </Link>
        <span className="text-slate-600">/</span>
        <span className="text-sm text-slate-300 truncate max-w-xs">{product.name}</span>
      </div>

      <div>
        <h1 className="text-2xl font-bold text-white">Edit Product</h1>
        <p className="text-slate-400 text-sm mt-0.5">{product.name}</p>
      </div>

      <ProductForm productId={id} initialData={product} />
    </div>
  );
}
