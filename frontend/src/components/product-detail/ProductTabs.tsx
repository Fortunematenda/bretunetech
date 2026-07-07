'use client';

import { useState } from 'react';
import { Star, File, CheckCircle, X } from 'lucide-react';
import SignInButton from '@/components/ui/SignInButton';
import { getProductReviews, createReview, Review, ReviewStats } from '@/lib/reviews-api';

interface ProductTabsProps {
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
  reviews: Review[];
  setReviews: (reviews: Review[]) => void;
  reviewStats: ReviewStats | null;
  setReviewStats: (stats: ReviewStats | null) => void;
  isAuthenticated: boolean;
  token: string | null;
}

type TabKey = 'details' | 'specifications' | 'additionalInfo' | 'reviews' | 'documents';

const SPEC_SECTIONS = [
  { key: 'general', label: 'General', keywords: ['model', 'sku', 'condition', 'brand', 'manufacturer', 'warranty', 'part number', 'mpn', 'gtin', 'upc', 'ean'] },
  { key: 'connectivity', label: 'Connectivity', keywords: ['network', 'ethernet', 'wifi', 'wireless', 'bluetooth', 'usb', 'hdmi', 'port', 'interface', 'connection', 'rj45', 'fiber', 'sfp', 'antenna', 'frequency', 'band', 'throughput', 'speed'] },
  { key: 'power', label: 'Power', keywords: ['power', 'voltage', 'current', 'adapter', 'supply', 'battery', 'consumption', 'watt', 'poe', 'input', 'dc'] },
  { key: 'physical', label: 'Physical', keywords: ['dimension', 'weight', 'size', 'mount', 'enclosure', 'material', 'colour', 'color', 'led', 'indicator', 'temperature', 'operating', 'humidity'] },
];

function groupSpecifications(specs: { key: string; value: string }[]) {
  const sections: Record<string, { key: string; value: string }[]> = {
    general: [],
    connectivity: [],
    power: [],
    physical: [],
    other: [],
  };

  for (const spec of specs) {
    const keyLower = spec.key.toLowerCase();
    let placed = false;
    for (const section of SPEC_SECTIONS) {
      if (section.keywords.some((k) => keyLower.includes(k))) {
        sections[section.key].push(spec);
        placed = true;
        break;
      }
    }
    if (!placed) sections.other.push(spec);
  }

  return sections;
}

export default function ProductTabs({
  product,
  reviews,
  setReviews,
  reviewStats,
  setReviewStats,
  isAuthenticated,
  token,
}: ProductTabsProps) {
  const [activeTab, setActiveTab] = useState<TabKey>('details');
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewForm, setReviewForm] = useState({ rating: 5, title: '', comment: '' });
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [reviewError, setReviewError] = useState('');

  const tabs = [
    { key: 'details', full: 'Details' },
    { key: 'specifications', full: 'Specifications' },
    ...(product.additionalInfo ? [{ key: 'additionalInfo', full: 'Additional Info' }] : []),
    { key: 'reviews', full: `Reviews${reviewStats && reviewStats.count > 0 ? ` (${reviewStats.count})` : ''}` },
    { key: 'documents', full: 'Documents' },
  ] as { key: string; full: string }[];

  const handleSubmitReview = async () => {
    if (!product || !token) return;
    setIsSubmittingReview(true);
    setReviewError('');
    try {
      await createReview(token, {
        productId: product.id,
        rating: reviewForm.rating,
        title: reviewForm.title,
        comment: reviewForm.comment,
      });
      setShowReviewForm(false);
      setReviewForm({ rating: 5, title: '', comment: '' });
      const data = await getProductReviews(product.id);
      setReviews(data.reviews);
      setReviewStats(data.stats);
    } catch (err: any) {
      setReviewError(err?.message || 'Failed to submit review');
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const docs = product.documents?.length
    ? product.documents
    : product.manualUrl
      ? [{ id: 'legacy', url: product.manualUrl, name: 'User Manual / Datasheet', type: 'pdf' }]
      : [];

  const hasSpecs = (product.specifications && product.specifications.length > 0) || product.sku;

  return (
    <div className="border-t border-slate-100 pt-6">
      <div className="flex gap-1 overflow-x-auto scrollbar-none border-b border-slate-200 mb-5">
        {tabs.map(({ key, full }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key as TabKey)}
            className={`shrink-0 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors ${
              activeTab === key
                ? 'border-[#003d7a] text-[#003d7a]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            {full}
          </button>
        ))}
      </div>

      <div className="text-sm text-slate-700 leading-relaxed">
        {activeTab === 'details' && (
          <div className="max-w-3xl">
            {product.description ? (
              <p className="whitespace-pre-wrap">{product.description}</p>
            ) : (
              <div className="bg-slate-50 border border-slate-100 rounded-xl p-6 text-center">
                <p className="text-slate-500 italic">Product details will be updated soon. Contact BretuneTech for more information.</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'additionalInfo' && (
          <p className="whitespace-pre-wrap max-w-3xl">{product.additionalInfo}</p>
        )}

        {activeTab === 'specifications' && (
          <div className="max-w-3xl">
            {hasSpecs ? (
              <div className="space-y-6">
                {product.sku && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="text-slate-500 text-sm">SKU</span>
                    <span className="font-medium text-slate-900 font-mono break-all">{product.sku}</span>
                  </div>
                )}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-slate-500 text-sm">Condition</span>
                  <span className="font-medium text-slate-900">{product.condition}</span>
                </div>

                {product.specifications && product.specifications.length > 0 && (
                  (() => {
                    const sections = groupSpecifications(product.specifications);
                    return Object.entries(sections)
                      .filter(([, items]) => items.length > 0)
                      .map(([key, items]) => {
                        const section = SPEC_SECTIONS.find((s) => s.key === key);
                        return (
                          <div key={key}>
                            {section && section.key !== 'other' && (
                              <h4 className="text-sm font-bold text-slate-900 mb-2 uppercase tracking-wide">{section.label}</h4>
                            )}
                            <div className="border border-slate-100 rounded-xl overflow-hidden divide-y divide-slate-100">
                              {items.map((spec, idx) => (
                                <div
                                  key={idx}
                                  className={`grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4 p-3 sm:p-4 ${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}`}
                                >
                                  <span className="text-slate-500 text-sm">{spec.key}</span>
                                  <span className="font-medium text-slate-900 break-words">{spec.value}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      });
                  })()
                )}
              </div>
            ) : (
              <p className="italic text-slate-400">No specifications available.</p>
            )}
          </div>
        )}

        {activeTab === 'reviews' && (
          <div className="space-y-4 max-w-3xl">
            {reviews.length === 0 ? (
              <p className="text-slate-400 italic">
                No reviews yet.{!isAuthenticated && <> <SignInButton className="text-[#003d7a] hover:underline">Sign in</SignInButton> to write one.</>}
              </p>
            ) : (
              reviews.slice(0, 5).map((review) => (
                <div key={review.id} className="border-b border-slate-100 pb-4">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-slate-900">{review.user.firstName} {review.user.lastName}</span>
                    <span className="text-xs text-slate-400">{new Date(review.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="flex gap-0.5 mb-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className={`w-4 h-4 ${i < review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-slate-200'}`} />
                    ))}
                  </div>
                  {review.title && <p className="font-medium text-sm text-slate-900 mb-0.5">{review.title}</p>}
                  <p className="text-sm text-slate-600">{review.comment}</p>
                </div>
              ))
            )}

            {isAuthenticated && !showReviewForm && (
              <button
                onClick={() => setShowReviewForm(true)}
                className="px-4 py-2 bg-[#003d7a] text-white rounded-lg text-sm font-medium hover:bg-[#002a55] transition-colors"
              >
                Write a Review
              </button>
            )}

            {showReviewForm && (
              <div className="space-y-3 max-w-lg border border-slate-200 rounded-xl p-4">
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => setReviewForm({ ...reviewForm, rating: star })}
                      className={`text-2xl ${star <= reviewForm.rating ? 'text-yellow-400' : 'text-slate-300'}`}
                    >
                      ★
                    </button>
                  ))}
                </div>
                <input
                  type="text"
                  value={reviewForm.title}
                  onChange={(e) => setReviewForm({ ...reviewForm, title: e.target.value })}
                  placeholder="Title (optional)"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-[#003d7a]"
                />
                <textarea
                  value={reviewForm.comment}
                  onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                  placeholder="Your review..."
                  rows={4}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-[#003d7a]"
                />
                {reviewError && <p className="text-sm text-red-500">{reviewError}</p>}
                <div className="flex gap-2">
                  <button
                    onClick={handleSubmitReview}
                    disabled={!reviewForm.comment.trim() || isSubmittingReview}
                    className="px-4 py-2 bg-[#003d7a] text-white rounded-lg text-sm font-medium disabled:opacity-50"
                  >
                    {isSubmittingReview ? 'Submitting...' : 'Submit Review'}
                  </button>
                  <button
                    onClick={() => setShowReviewForm(false)}
                    className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'documents' && (
          <div className="max-w-3xl">
            {docs.length > 0 ? (
              <div className="space-y-2">
                {docs.map((doc) => (
                  <a
                    key={doc.id}
                    href={doc.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 hover:border-[#003d7a]/30 hover:bg-[#e6f0ff]/30 transition-colors group"
                  >
                    <File className="w-5 h-5 text-[#003d7a] shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-900 group-hover:text-[#003d7a] truncate">{doc.name}</p>
                      <p className="text-xs text-slate-400 uppercase">{doc.type}</p>
                    </div>
                    <span className="text-xs text-[#003d7a] font-medium shrink-0">Download ↓</span>
                  </a>
                ))}
              </div>
            ) : (
              <p className="italic text-slate-400">No documents available.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
