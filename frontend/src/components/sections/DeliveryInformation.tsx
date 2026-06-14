import React from 'react';
import { Truck, Package, Clock, AlertCircle } from 'lucide-react';

interface DeliveryInformationProps {
  className?: string;
}

export default function DeliveryInformation({ className = '' }: DeliveryInformationProps) {
  const stockStatuses = [
    {
      icon: Package,
      title: 'Supplier Stock',
      description: 'Ships in 1-3 Business Days',
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
    },
    {
      icon: Clock,
      title: 'Special Order',
      description: 'Ships in 3-7 Business Days',
      color: 'text-amber-600',
      bgColor: 'bg-amber-50',
      borderColor: 'border-amber-200',
    },
    {
      icon: AlertCircle,
      title: 'Out of Stock',
      description: 'Available on Request',
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
    },
  ];

  return (
    <div className={`bg-white border border-gray-200 rounded-2xl p-6 ${className}`}>
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-lg bg-[#003d7a]/10 flex items-center justify-center">
          <Truck className="w-5 h-5 text-[#003d7a]" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Delivery Information</h3>
          <p className="text-sm text-gray-600">Nationwide delivery throughout South Africa</p>
        </div>
      </div>

      <div className="space-y-4">
        <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-3">Stock Status</h4>
        {stockStatuses.map((status, index) => {
          const Icon = status.icon;
          return (
            <div
              key={index}
              className={`flex items-start gap-3 p-4 rounded-lg border ${status.bgColor} ${status.borderColor}`}
            >
              <div className={`w-8 h-8 rounded-full bg-white flex items-center justify-center shrink-0`}>
                <Icon className={`w-4 h-4 ${status.color}`} />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">{status.title}</p>
                <p className="text-xs text-gray-600">{status.description}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-6 pt-4 border-t border-gray-200">
        <p className="text-xs text-gray-500">
          Delivery times may vary based on location and product availability. Tracking information will be provided once your order is dispatched.
        </p>
      </div>
    </div>
  );
}
