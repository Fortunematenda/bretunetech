import type { Metadata } from 'next';
import { generatePageMetadata, generateFAQSchema, generateBreadcrumbSchema } from '@/lib/seo';
import { COMPANY } from '@/lib/company';

export const metadata: Metadata = generatePageMetadata({
  title: 'Frequently Asked Questions',
  description: 'Find answers to common questions about Bretunetech products, delivery, returns, warranties, and installation services.',
  path: '/faq',
});

const faqs = [
  {
    question: "Do you deliver nationwide?",
    answer: "Yes. We deliver throughout South Africa."
  },
  {
    question: "How long does delivery take?",
    answer: "Major cities typically receive deliveries within 1–3 business days. Regional and remote areas may take longer."
  },
  {
    question: "Do you offer installation services?",
    answer: "Yes. We provide networking, CCTV, fibre and power solution installation services in selected areas."
  },
  {
    question: "What payment methods do you accept?",
    answer: "We support secure online payment methods and EFT payments."
  },
  {
    question: "Can I request a quotation?",
    answer: "Yes. Customers can request quotations for products and projects directly through the website."
  },
  {
    question: "Are your products genuine?",
    answer: "Yes. Products are sourced through authorised suppliers and distributors."
  },
  {
    question: "What happens if a product is out of stock?",
    answer: "Customers will be notified and offered alternatives, backorder options or refunds where applicable."
  },
  {
    question: "How do I track my order?",
    answer: "Tracking information will be provided once the order has been dispatched."
  },
  {
    question: "Do products come with a warranty?",
    answer: "Most products include a manufacturer warranty. Warranty periods vary by product and manufacturer."
  },
  {
    question: "Can I return a product?",
    answer: "Yes, subject to the conditions outlined in our Returns & Refunds Policy."
  }
];

export default function FAQPage() {
  const faqSchema = generateFAQSchema(faqs);
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: '/' },
    { name: 'FAQ', url: '/faq' },
  ]);

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
    <div className="w-full px-4 sm:px-6 py-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-cyan-500/10 border border-cyan-500/30 rounded-full text-sm text-cyan-600 font-medium mb-4">
          FAQ
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">Frequently Asked Questions</h1>
        <p className="text-gray-500 max-w-xl mx-auto">
          Find answers to common questions about our products and services.
        </p>
      </div>
      
      {/* FAQ Items */}
      <div className="space-y-4 mb-8">
        {faqs.map((faq, index) => (
          <div key={index} className="bg-white border border-gray-200 rounded-2xl p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-2">{faq.question}</h3>
            <p className="text-sm text-gray-600">{faq.answer}</p>
          </div>
        ))}
      </div>
      
      {/* CTA Card */}
      <div className="bg-[#003d7a] rounded-2xl p-6 text-white">
        <h2 className="text-xl font-bold mb-2">Still have questions?</h2>
        <p className="text-blue-100 mb-4">
          Our support team is here to help you.
        </p>
        <a 
          href="/contact" 
          className="inline-block px-5 py-2.5 rounded-xl bg-white text-[#003d7a] font-semibold text-sm hover:bg-gray-100 transition-colors"
        >
          Contact Us
        </a>
      </div>
    </div>
    </>
  );
}
