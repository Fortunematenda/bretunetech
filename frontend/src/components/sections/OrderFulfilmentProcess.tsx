import React from 'react';
import { ShoppingBag, CheckCircle, Package, Truck, MapPin, Home } from 'lucide-react';

const steps = [
  {
    icon: ShoppingBag,
    title: 'Customer Places Order',
    description: 'Order received and processed',
  },
  {
    icon: CheckCircle,
    title: 'Order Confirmed',
    description: 'Confirmation email sent',
  },
  {
    icon: Package,
    title: 'Supplier Inventory Verified',
    description: 'Stock availability confirmed',
  },
  {
    icon: Truck,
    title: 'Product Dispatched',
    description: 'Shipped from supplier',
  },
  {
    icon: MapPin,
    title: 'Tracking Provided',
    description: 'Tracking number sent',
  },
  {
    icon: Home,
    title: 'Delivered To Customer',
    description: 'Order delivered',
  },
];

interface OrderFulfilmentProcessProps {
  className?: string;
}

export default function OrderFulfilmentProcess({ className = '' }: OrderFulfilmentProcessProps) {
  return (
    <div className={`bg-white border border-gray-200 rounded-2xl p-6 sm:p-8 ${className}`}>
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">How Ordering Works</h2>
        <p className="text-gray-600">From order to delivery in 6 simple steps</p>
      </div>

      <div className="relative">
        {/* Connection Line */}
        <div className="hidden md:block absolute top-8 left-8 right-8 h-0.5 bg-gray-200" />

        <div className="grid grid-cols-1 md:grid-cols-6 gap-6">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div key={index} className="relative">
                <div className="flex flex-col items-center text-center">
                  {/* Step Circle */}
                  <div className="relative z-10 w-16 h-16 rounded-full bg-[#003d7a] text-white flex items-center justify-center mb-4 shadow-lg">
                    <Icon className="w-7 h-7" />
                  </div>

                  {/* Step Number Badge */}
                  <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-cyan-400 text-white text-xs font-bold flex items-center justify-center">
                    {index + 1}
                  </div>

                  {/* Step Content */}
                  <h3 className="text-sm font-semibold text-gray-900 mb-1">{step.title}</h3>
                  <p className="text-xs text-gray-600">{step.description}</p>

                  {/* Arrow for mobile */}
                  {index < steps.length - 1 && (
                    <div className="md:hidden mt-4">
                      <div className="w-0.5 h-8 bg-gray-200 mx-auto" />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-8 pt-6 border-t border-gray-200">
        <p className="text-sm text-gray-600 text-center">
          Need help with your order? Contact our support team at{' '}
          <a href="mailto:support@bretunetech.com" className="text-[#003d7a] font-medium hover:underline">
            support@bretunetech.com
          </a>
        </p>
      </div>
    </div>
  );
}
