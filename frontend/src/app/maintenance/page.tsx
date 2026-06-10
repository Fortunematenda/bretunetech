'use client';

import { useEffect, useState } from 'react';
import { Construction, Clock, Mail } from 'lucide-react';

interface MaintenanceData {
  maintenanceMode: boolean;
  message: string;
}

export default function MaintenancePage() {
  const [data, setData] = useState<MaintenanceData>({
    maintenanceMode: true,
    message: 'We are currently performing maintenance. Please check back soon.',
  });

  useEffect(() => {
    fetch('/api/maintenance-status')
      .then((res) => res.json())
      .then((data) => setData(data))
      .catch(() => {
        // Use default message if fetch fails
      });
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-orange-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        <div className="bg-white rounded-2xl shadow-2xl p-8 md:p-12 text-center">
          <div className="flex justify-center mb-6">
            <div className="bg-blue-100 p-6 rounded-full">
              <Construction className="w-16 h-16 text-blue-600" />
            </div>
          </div>

          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Under Maintenance
          </h1>

          <p className="text-xl text-gray-600 mb-8 leading-relaxed">
            {data.message}
          </p>

          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <div className="bg-blue-50 rounded-xl p-6">
              <Clock className="w-8 h-8 text-blue-600 mx-auto mb-3" />
              <h3 className="font-semibold text-gray-900 mb-2">Temporary</h3>
              <p className="text-sm text-gray-600">
                We're working hard to improve your experience. This won't take long.
              </p>
            </div>

            <div className="bg-orange-50 rounded-xl p-6">
              <Mail className="w-8 h-8 text-orange-600 mx-auto mb-3" />
              <h3 className="font-semibold text-gray-900 mb-2">Need Help?</h3>
              <p className="text-sm text-gray-600">
                Contact us at{' '}
                <a href="mailto:support@bretunetech.com" className="text-blue-600 hover:underline">
                  support@bretunetech.com
                </a>
              </p>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-6">
            <p className="text-sm text-gray-500">
              © {new Date().getFullYear()} Bretune Technologies. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
