'use client';

import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import ProductForm from '@/components/admin/ProductForm';

export default function NewProductPage() {
  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2">
        <Link
          href="/admin/products"
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" /> Products
        </Link>
        <span className="text-gray-600">/</span>
        <span className="text-sm text-gray-700">Add Product</span>
      </div>

      <div>
        <h1 className="text-2xl font-bold text-gray-900">Add New Product</h1>
        <p className="text-gray-500 text-sm mt-0.5">Fill in the details below to add a product to the store.</p>
      </div>

      <ProductForm />
    </div>
  );
}
