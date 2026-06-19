'use client';

import { CheckCircle2 } from 'lucide-react';
import { LinkedinIcon, FacebookIcon } from '@/components/ui/SocialIcons';

export default function StayConnected() {
  const reasons = [
    'Networking tips',
    'CCTV solutions',
    'Technology updates',
    'Product specials',
    'Industry insights',
  ];

  return (
    <section className="w-full px-4 sm:px-6 lg:px-8 py-16 sm:py-24 bg-gradient-to-br from-blue-50 via-cyan-50 to-blue-100">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            Stay Connected with BretuneTech
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Follow us on social media for exclusive content, industry insights, and the latest technology updates
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center mb-12">
          {/* Left Side - Benefits */}
          <div className="space-y-6">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">Follow BretuneTech for:</h3>
            <div className="space-y-4">
              {reasons.map((reason, index) => (
                <div key={index} className="flex items-center gap-4 group">
                  <div className="flex-shrink-0">
                    <CheckCircle2 className="w-6 h-6 text-[#0066CC] group-hover:scale-110 transition-transform" />
                  </div>
                  <span className="text-lg text-gray-700 group-hover:text-[#0066CC] transition-colors">
                    {reason}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Right Side - Social Buttons */}
          <div className="space-y-4 lg:pl-8">
            <a
              href="https://www.linkedin.com/company/bretunetech"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-3 w-full px-6 py-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold rounded-xl transition-all duration-300 hover:shadow-lg hover:scale-105 group"
            >
              <LinkedinIcon className="w-6 h-6 group-hover:scale-110 transition-transform" />
              <span>Follow on LinkedIn</span>
            </a>

            <a
              href="https://www.facebook.com/bretunetech"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-3 w-full px-6 py-4 bg-gradient-to-r from-blue-700 to-blue-800 hover:from-blue-800 hover:to-blue-900 text-white font-bold rounded-xl transition-all duration-300 hover:shadow-lg hover:scale-105 group"
            >
              <FacebookIcon className="w-6 h-6 group-hover:scale-110 transition-transform" />
              <span>Follow on Facebook</span>
            </a>

            <div className="pt-4 text-center">
              <p className="text-sm text-gray-600">
                Get connected with thousands of South African tech professionals
              </p>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="mt-12 pt-12 border-t border-blue-200 text-center">
          <p className="text-lg text-gray-700">
            Connect with BretuneTech on social media for updates, product news, and technology tips.
          </p>
        </div>
      </div>
    </section>
  );
}
