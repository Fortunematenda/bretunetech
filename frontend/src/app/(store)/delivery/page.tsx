import { Truck, Clock, MapPin, ShieldCheck, Package, AlertCircle } from 'lucide-react';
import { brand } from '@/lib/brand';

export default function DeliveryPage() {
  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
      <section className="w-full">
        <div className="mb-10 sm:mb-12 text-center">
          <p className="text-cyan-400 text-xs font-semibold tracking-wider uppercase mb-3">Delivery Information</p>
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-4">Shipping & Delivery Policy</h1>
          <p className="text-sm sm:text-base text-gray-400 max-w-3xl mx-auto">
            We deliver networking equipment, CCTV systems, and power solutions across South Africa. Read our delivery options, timelines, and policies below.
          </p>
        </div>

        {/* Delivery Options */}
        <div className="mb-12 rounded-2xl border border-gray-800/70 bg-gradient-to-b from-slate-900/80 to-gray-950 p-6 sm:p-8">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
            <Truck className="w-6 h-6 text-cyan-400" /> Delivery Options
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="rounded-xl border border-gray-700/50 bg-gray-900/50 p-5">
              <h3 className="text-lg font-semibold text-white mb-2">Standard Delivery</h3>
              <p className="text-gray-400 text-sm mb-3">
                3-5 business days to major centers. 5-7 business days to regional areas.
              </p>
              <p className="text-cyan-400 font-semibold">R99 - Free on orders over R2,000</p>
            </div>
            <div className="rounded-xl border border-gray-700/50 bg-gray-900/50 p-5">
              <h3 className="text-lg font-semibold text-white mb-2">Express Delivery</h3>
              <p className="text-gray-400 text-sm mb-3">
                1-2 business days to major centers. Next-day delivery for orders placed before 12:00.
              </p>
              <p className="text-cyan-400 font-semibold">R179 - Available in Gauteng, KZN, Western Cape</p>
            </div>
            <div className="rounded-xl border border-gray-700/50 bg-gray-900/50 p-5">
              <h3 className="text-lg font-semibold text-white mb-2">Courier Collection</h3>
              <p className="text-gray-400 text-sm mb-3">
                Arrange your own courier to collect from our warehouse in {brand.location}.
              </p>
              <p className="text-cyan-400 font-semibold">Free - Collection by appointment</p>
            </div>
            <div className="rounded-xl border border-gray-700/50 bg-gray-900/50 p-5">
              <h3 className="text-lg font-semibold text-white mb-2">Installation Delivery</h3>
              <p className="text-gray-400 text-sm mb-3">
                For installation projects, we deliver equipment directly to your site at no extra charge.
              </p>
              <p className="text-cyan-400 font-semibold">Free - With installation service</p>
            </div>
          </div>
        </div>

        {/* Delivery Timeline */}
        <div className="mb-12 rounded-2xl border border-gray-800/70 bg-gradient-to-b from-slate-900/80 to-gray-950 p-6 sm:p-8">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
            <Clock className="w-6 h-6 text-cyan-400" /> Processing Timeline
          </h2>
          <div className="space-y-4 text-gray-400 text-sm sm:text-base">
            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center shrink-0">
                <span className="text-cyan-400 font-semibold text-sm">1</span>
              </div>
              <div>
                <h3 className="text-white font-semibold mb-1">Order Confirmation</h3>
                <p>You'll receive an order confirmation email within 1 hour of placing your order.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center shrink-0">
                <span className="text-cyan-400 font-semibold text-sm">2</span>
              </div>
              <div>
                <h3 className="text-white font-semibold mb-1">Order Processing</h3>
                <p>We process and pack your order within 1-2 business days. You'll receive tracking details via email.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center shrink-0">
                <span className="text-cyan-400 font-semibold text-sm">3</span>
              </div>
              <div>
                <h3 className="text-white font-semibold mb-1">Shipment</h3>
                <p>Your order is handed to our courier partner. Delivery time depends on your location and chosen option.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center shrink-0">
                <span className="text-cyan-400 font-semibold text-sm">4</span>
              </div>
              <div>
                <h3 className="text-white font-semibold mb-1">Delivery</h3>
                <p>The courier will contact you to arrange delivery. Please ensure someone is available to receive the package.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Delivery Areas */}
        <div className="mb-12 rounded-2xl border border-gray-800/70 bg-gradient-to-b from-slate-900/80 to-gray-950 p-6 sm:p-8">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
            <MapPin className="w-6 h-6 text-cyan-400" /> Delivery Areas
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-gray-400 text-sm sm:text-base">
            <div>
              <h3 className="text-white font-semibold mb-2">Major Centers (1-3 days)</h3>
              <ul className="space-y-1">
                <li>• Johannesburg, Pretoria, Ekurhuleni</li>
                <li>• Cape Town, Stellenbosch, Paarl</li>
                <li>• Durban, Pietermaritzburg</li>
                <li>• Port Elizabeth, East London</li>
                <li>• Bloemfontein</li>
              </ul>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-2">Regional Areas (3-7 days)</h3>
              <ul className="space-y-1">
                <li>• Polokwane, Nelspruit, Mbombela</li>
                <li>• Rustenburg, Mahikeng</li>
                <li>• Kimberley</li>
                <li>• Upington</li>
                <li>• All other towns and cities</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Important Notes */}
        <div className="mb-12 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-6 sm:p-8">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
            <AlertCircle className="w-6 h-6 text-amber-400" /> Important Notes
          </h2>
          <ul className="space-y-3 text-gray-400 text-sm sm:text-base">
            <li className="flex gap-3">
              <ShieldCheck className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <span>All packages are insured during transit. We'll replace any items damaged in delivery.</span>
            </li>
            <li className="flex gap-3">
              <Package className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <span>Please inspect your package upon delivery. Report any damage or missing items within 24 hours.</span>
            </li>
            <li className="flex gap-3">
              <MapPin className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <span>Delivery to remote areas may take longer. We'll notify you if your location has extended delivery times.</span>
            </li>
            <li className="flex gap-3">
              <Clock className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <span>Delivery times are estimates and not guaranteed. We strive to meet all delivery timelines.</span>
            </li>
          </ul>
        </div>

        {/* Contact */}
        <div className="rounded-2xl border border-cyan-500/30 bg-cyan-500/10 p-6 sm:p-8 text-center">
          <h2 className="text-2xl font-bold text-white mb-3">Questions About Delivery?</h2>
          <p className="text-gray-400 mb-6 max-w-2xl mx-auto">
            If you have questions about delivery to your area, need express shipping, or want to arrange collection, contact us.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <a
              href={`https://wa.me/${brand.whatsapp}?text=${encodeURIComponent('Hi Bretunetech, I have a question about delivery.')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-500 text-white font-semibold rounded-xl transition-colors"
            >
              Chat on WhatsApp
            </a>
            <a
              href={`mailto:${brand.emailSales}`}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-cyan-500 hover:bg-cyan-400 text-slate-900 font-semibold rounded-xl transition-colors"
            >
              Email Us
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
