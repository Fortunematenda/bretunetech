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
    <div className="min-h-screen bg-gray-950 py-16">
      <div className="max-w-3xl mx-auto px-4">
        <h1 className="text-4xl font-bold text-white mb-4">Frequently Asked Questions</h1>
        <p className="text-gray-400 mb-12">
          Find answers to common questions about our products and services.
        </p>
        
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div key={index} className="bg-gray-900 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-2">{faq.question}</h3>
              <p className="text-gray-400">{faq.answer}</p>
            </div>
          ))}
        </div>
        
        <div className="mt-12 text-center">
          <p className="text-gray-400 mb-4">Still have questions?</p>
          <a 
            href="/contact" 
            className="inline-block px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-colors"
          >
            Contact Us
          </a>
        </div>
      </div>
    </div>
  );
}
