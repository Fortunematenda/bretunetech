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
          className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-white transition-colors"
        >
          <ChevronLeft className="w-4 h-4" /> Products
        </Link>
        <span className="text-slate-600">/</span>
        <span className="text-sm text-slate-300">Add Product</span>
      </div>

      <div>
        <h1 className="text-2xl font-bold text-white">Add New Product</h1>
        <p className="text-slate-400 text-sm mt-0.5">Fill in the details below to add a product to the store.</p>
      </div>

      <ProductForm />
    </div>
  );
}
