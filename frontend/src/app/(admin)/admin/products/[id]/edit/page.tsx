'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { ChevronLeft, Loader2 } from 'lucide-react';
import ProductForm from '@/components/admin/ProductForm';
import { productsApi } from '@/lib/api';
import { useAuthStore } from '@/store/auth-store';

export default function EditProductPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
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
          setError('Product not found (empty response)');
        }
      })
      .catch((err) => {
        console.error('Failed to load product:', err);
        setError(`Failed to load product: ${err.message || 'Unknown error'}`);
      })
      .finally(() => setLoading(false));
  }, [id, token]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="w-6 h-6 text-cyan-600 animate-spin" />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="text-center py-24">
        <p className="text-gray-500">{error || 'Product not found'}</p>
        <Link href={returnUrl} className="text-cyan-600 hover:text-cyan-700 text-sm mt-3 inline-block">
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
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" /> Products
        </Link>
        <span className="text-gray-600">/</span>
        <span className="text-sm text-gray-700 truncate max-w-xs">{product.name}</span>
      </div>

      <div>
        <h1 className="text-2xl font-bold text-gray-900">Edit Product</h1>
        <p className="text-gray-500 text-sm mt-0.5">{product.name}</p>
      </div>

      <ProductForm productId={id} initialData={product} />
    </div>
  );
}
