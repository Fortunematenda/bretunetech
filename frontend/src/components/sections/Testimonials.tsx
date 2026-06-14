'use client';

import React from 'react';
import { Star, Quote, MessageSquare } from 'lucide-react';
import Carousel from '@/components/ui/Carousel';

const testimonials = [
  {
    name: 'John Smith',
    company: 'Tech Solutions SA',
    rating: 5,
    review: 'Excellent service and fast delivery. The MikroTik equipment we ordered was exactly what we needed for our client network installation. Highly recommended!',
    avatar: 'JS'
  },
  {
    name: 'Sarah Mbeki',
    company: 'Campus Connect',
    rating: 5,
    review: 'BretuneTech has been our go-to supplier for all our networking needs. Their technical support is outstanding and pricing is competitive.',
    avatar: 'SM'
  },
  {
    name: 'David Nkosi',
    company: 'SecureNet Installations',
    rating: 5,
    review: 'Professional service with quality products. The CCTV systems we purchased have been working flawlessly. Will definitely order again.',
    avatar: 'DN'
  },
  {
    name: 'Amanda Van Wyk',
    company: 'Office WiFi Pro',
    rating: 5,
    review: 'Great range of Ubiquiti products and knowledgeable staff. They helped us design the perfect wireless solution for our client\'s office.',
    avatar: 'AV'
  }
];

const Testimonials = () => {
  const hasReviews = testimonials.length > 0;

  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">What Our Customers Say</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            {hasReviews ? 'Trusted by businesses and installers across South Africa' : 'Building Trust Through Quality Service'}
          </p>
        </div>

        {hasReviews ? (
          <Carousel autoPlay={true} interval={6000}>
            {testimonials.map((testimonial, index) => (
              <div key={index} className="px-4 max-w-3xl mx-auto">
                <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
                  {/* Quote Icon */}
                  <div className="flex justify-center mb-6">
                    <div className="w-16 h-16 bg-gradient-to-br from-[#003d7a] to-[#0055a4] rounded-full flex items-center justify-center">
                      <Quote className="w-8 h-8 text-white" />
                    </div>
                  </div>

                  {/* Rating */}
                  <div className="flex justify-center gap-1 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-5 h-5 ${i < testimonial.rating ? 'fill-amber-400 text-amber-400' : 'text-gray-200 fill-gray-200'}`}
                      />
                    ))}
                  </div>

                  {/* Review */}
                  <p className="text-gray-700 text-lg text-center leading-relaxed mb-6 italic">
                    "{testimonial.review}"
                  </p>

                  {/* Author */}
                  <div className="flex items-center justify-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-[#003d7a] to-[#0055a4] rounded-full flex items-center justify-center text-white font-bold">
                      {testimonial.avatar}
                    </div>
                    <div className="text-left">
                      <p className="font-semibold text-gray-900">{testimonial.name}</p>
                      <p className="text-sm text-gray-500">{testimonial.company}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </Carousel>
        ) : (
          <div className="max-w-3xl mx-auto">
            <div className="bg-white rounded-2xl p-12 shadow-lg border border-gray-100 text-center">
              <div className="flex justify-center mb-6">
                <div className="w-20 h-20 bg-gradient-to-br from-[#003d7a] to-[#0055a4] rounded-full flex items-center justify-center">
                  <MessageSquare className="w-10 h-10 text-white" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Building Trust Through Quality Service</h3>
              <p className="text-gray-600 mb-6">
                We're committed to providing exceptional products and service. Customer reviews will be displayed here as we grow our community of satisfied customers.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                  <span>Customer Reviews</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                  <span>Product Ratings</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                  <span>Installation Photos</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default Testimonials;
