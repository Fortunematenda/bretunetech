'use client';

import { ChevronDown, ListChecks, Cpu, File, Star, MessageSquare } from 'lucide-react';
import SignInButton from '@/components/ui/SignInButton';
import { Review, ReviewStats } from '@/lib/reviews-api';

interface MobileAccordionProps {
  product: {
    id: string;
    name: string;
    description: string;
    additionalInfo?: string;
    specifications?: { key: string; value: string }[];
    sku?: string;
    condition: string;
    documents?: { id: string; url: string; name: string; type: string }[];
    manualUrl?: string;
  };
  accordionOpen: Record<string, boolean>;
  toggleAccordion: (key: string) => void;
  reviews: Review[];
  reviewStats: ReviewStats | null;
  isAuthenticated: boolean;
}

export default function MobileAccordion({
  product,
  accordionOpen,
  toggleAccordion,
  reviews,
  reviewStats,
  isAuthenticated,
}: MobileAccordionProps) {
  const docs = product.documents?.length
    ? product.documents
    : product.manualUrl
      ? [{ id: 'legacy', url: product.manualUrl, name: 'User Manual / Datasheet', type: 'pdf' }]
      : [];

  const sections = [
    { key: 'highlights', icon: ListChecks, iconColor: 'text-[#003d7a]', bgColor: 'bg-blue-50', title: 'Product Highlights', content: product.description || 'Product details will be updated soon. Contact BretuneTech for more information.' },
    ...(product.specifications && product.specifications.length > 0
      ? [{ key: 'specs', icon: Cpu, iconColor: 'text-orange-500', bgColor: 'bg-orange-50', title: 'Specifications', content: null }]
      : []),
    ...(product.additionalInfo
      ? [{ key: 'additional', icon: MessageSquare, iconColor: 'text-[#003d7a]', bgColor: 'bg-blue-50', title: 'Additional Info', content: product.additionalInfo }]
      : []),
    { key: 'reviews', icon: Star, iconColor: 'text-yellow-500', bgColor: 'bg-yellow-50', title: `Reviews ${reviewStats && reviewStats.count > 0 ? `(${reviewStats.count})` : ''}`, content: null },
    ...(docs.length > 0
      ? [{ key: 'documents', icon: File, iconColor: 'text-[#003d7a]', bgColor: 'bg-blue-50', title: 'Documents', content: null }]
      : []),
  ];

  return (
    <div className="sm:hidden mt-4 space-y-2">
      {sections.map((section) => {
        const Icon = section.icon;
        const isOpen = accordionOpen[section.key];

        return (
          <div key={section.key} className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm">
            <button
              onClick={() => toggleAccordion(section.key)}
              className="w-full flex items-center justify-between px-4 py-3.5"
            >
              <div className="flex items-center gap-2.5">
                <div className={`w-8 h-8 ${section.bgColor} rounded-xl flex items-center justify-center shrink-0`}>
                  <Icon className={`w-4 h-4 ${section.iconColor}`} />
                </div>
                <span className="text-sm font-semibold text-slate-900">{section.title}</span>
              </div>
              <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
              <div className="px-4 pb-4 border-t border-slate-100">
                {section.key === 'highlights' || section.key === 'additional' ? (
                  <p className="text-sm text-slate-600 leading-relaxed pt-3 whitespace-pre-wrap">{section.content}</p>
                ) : section.key === 'specs' ? (
                  <div className="divide-y divide-slate-50 pt-2">
                    {product.sku && (
                      <div className="flex gap-2 py-2">
                        <span className="text-xs text-slate-500 w-28 shrink-0">SKU</span>
                        <span className="text-xs font-medium text-slate-900 font-mono break-all">{product.sku}</span>
                      </div>
                    )}
                    <div className="flex gap-2 py-2">
                      <span className="text-xs text-slate-500 w-28 shrink-0">Condition</span>
                      <span className="text-xs font-medium text-slate-900">{product.condition}</span>
                    </div>
                    {product.specifications?.map((spec, idx) => (
                      <div key={idx} className="flex gap-2 py-2">
                        <span className="text-xs text-slate-500 w-28 shrink-0">{spec.key}</span>
                        <span className="text-xs font-medium text-slate-900 break-words">{spec.value}</span>
                      </div>
                    ))}
                  </div>
                ) : section.key === 'reviews' ? (
                  <div className="space-y-3 pt-3">
                    {reviews.length === 0 ? (
                      <p className="text-slate-400 italic text-sm">
                        No reviews yet.{!isAuthenticated && <> <SignInButton className="text-[#003d7a] hover:underline">Sign in</SignInButton> to write one.</>}
                      </p>
                    ) : (
                      reviews.slice(0, 3).map((review) => (
                        <div key={review.id} className="border-b border-slate-100 pb-3">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-medium text-sm text-slate-900">{review.user.firstName} {review.user.lastName}</span>
                            <span className="text-xs text-slate-400">{new Date(review.createdAt).toLocaleDateString()}</span>
                          </div>
                          <div className="flex gap-0.5 mb-1">
                            {[...Array(5)].map((_, i) => (
                              <span key={i} className={i < review.rating ? 'text-yellow-400' : 'text-slate-200'}>★</span>
                            ))}
                          </div>
                          <p className="text-sm text-slate-600">{review.comment}</p>
                        </div>
                      ))
                    )}
                  </div>
                ) : section.key === 'documents' ? (
                  <div className="space-y-2 pt-3">
                    {docs.map((doc) => (
                      <a
                        key={doc.id}
                        href={doc.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 hover:border-[#003d7a] hover:bg-blue-50 transition-colors group"
                      >
                        <File className="w-5 h-5 text-[#003d7a] shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-slate-900 group-hover:text-[#003d7a] truncate">{doc.name}</p>
                          <p className="text-xs text-slate-400 uppercase">{doc.type}</p>
                        </div>
                      </a>
                    ))}
                  </div>
                ) : null}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
