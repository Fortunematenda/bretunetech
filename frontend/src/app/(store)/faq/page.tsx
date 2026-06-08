export default function FAQPage() {
  const faqs = [
    {
      question: "What is Bretune Tech?",
      answer: "Bretune Tech is a leading provider of refurbished laptops and tech products in South Africa. We offer quality devices at affordable prices."
    },
    {
      question: "Are your laptops refurbished?",
      answer: "Yes, all our laptops are professionally refurbished, tested, and come with a warranty. They're restored to excellent working condition."
    },
    {
      question: "What warranty do you offer?",
      answer: "We offer a standard warranty on all our products. Specific warranty terms depend on the product category and condition."
    },
    {
      question: "Do you deliver nationwide?",
      answer: "Yes, we deliver to all major cities and towns across South Africa. Delivery times and costs vary by location."
    },
    {
      question: "Can I return a product?",
      answer: "Yes, we have a return policy. Please check our returns page or contact customer support for specific terms."
    },
    {
      question: "How do I contact support?",
      answer: "You can reach us through our contact page, email, or phone. Visit the Contact Us page for details."
    }
  ];

  return (
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
  );
}
