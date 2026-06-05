'use client';

import { useState } from 'react';
import { MessageCircle, X, Minimize2 } from 'lucide-react';
import { brand } from '@/lib/brand';

export default function WhatsAppChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);

  return (
    <>
      {/* Floating Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-green-600 hover:bg-green-500 text-white rounded-full shadow-lg shadow-green-600/30 flex items-center justify-center transition-all duration-300 hover:scale-110"
          aria-label="Chat on WhatsApp"
        >
          <MessageCircle className="w-7 h-7" />
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl overflow-hidden transition-all duration-300">
          {/* Header */}
          <div className="bg-green-600 px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <MessageCircle className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-white font-semibold text-sm">Bretunetech</p>
                <p className="text-green-100 text-xs">Typical reply time: &lt;1 hour</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white/80 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="p-4 bg-gray-50">
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <p className="text-gray-700 text-sm mb-3">
                Hi! 👋 Welcome to Bretunetech. How can we help you today?
              </p>
              <p className="text-gray-500 text-xs mb-4">
                Click below to start a WhatsApp conversation with our team.
              </p>
              <a
                href={`https://wa.me/${brand.whatsapp}?text=${encodeURIComponent('Hi Bretunetech, I have a question about your products.')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 w-full px-4 py-2.5 bg-green-600 hover:bg-green-500 text-white font-semibold rounded-lg transition-colors text-sm"
              >
                <MessageCircle className="w-4 h-4" /> Start Chat
              </a>
            </div>
          </div>

          {/* Footer */}
          <div className="px-4 py-2 bg-gray-100 border-t border-gray-200">
            <p className="text-gray-500 text-xs text-center">
              Powered by WhatsApp
            </p>
          </div>
        </div>
      )}
    </>
  );
}
