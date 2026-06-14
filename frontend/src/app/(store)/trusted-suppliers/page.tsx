import { Package, CheckCircle } from 'lucide-react';
import Container from '@/components/layout/Container';

const suppliers = [
  {
    name: 'Scoop Distribution',
    description: 'Leading technology distributor in South Africa',
    logo: '/assets/scoop-logo.png',
  },
  {
    name: 'Ringa',
    description: 'Established technology supplier',
    logo: '/assets/ringa-logo.png',
  },
];

const brands = [
  { name: 'MikroTik', logo: '/assets/mikrotik-logo.png' },
  { name: 'Ubiquiti', logo: '/assets/ubiquiti-logo.png' },
  { name: 'Reyee', logo: '/assets/reyee-logo.png' },
  { name: 'Fanvil', logo: '/assets/fanvil-logo.png' },
  { name: 'Hubble', logo: '/assets/hubble-logo.png' },
  { name: 'Cudy', logo: '/assets/cudy-logo.png' },
];

export default function TrustedSuppliersPage() {
  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 py-10 sm:py-14 bg-white min-h-screen">
      <Container>
        <section className="w-full max-w-6xl mx-auto">
          <div className="mb-10 sm:mb-12 text-center">
            <p className="text-cyan-400 text-xs font-semibold tracking-wider uppercase mb-3">Supplier Network</p>
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">Our Supplier Network</h1>
            <p className="text-gray-600 max-w-2xl mx-auto">
              BretuneTech sources products through established technology distributors and suppliers.
            </p>
          </div>

          {/* Suppliers */}
          <div className="mb-12">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
              <Package className="w-6 h-6 text-[#003d7a]" />
              Authorized Distributors
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {suppliers.map((supplier, index) => (
                <div
                  key={index}
                  className="bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-2xl p-6 hover:shadow-lg hover:border-[#003d7a]/30 transition-all duration-300"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-16 h-16 rounded-xl bg-white border border-gray-200 flex items-center justify-center shrink-0">
                      <Package className="w-8 h-8 text-[#003d7a]" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">{supplier.name}</h3>
                      <p className="text-sm text-gray-600">{supplier.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Brands */}
          <div className="mb-12">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
              <CheckCircle className="w-6 h-6 text-[#003d7a]" />
              Trusted Brands
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              {brands.map((brand, index) => (
                <div
                  key={index}
                  className="bg-white border border-gray-200 rounded-xl p-6 flex items-center justify-center hover:shadow-md hover:border-[#003d7a]/30 transition-all duration-300"
                >
                  <div className="text-center">
                    <div className="w-16 h-16 mx-auto mb-2 bg-gray-50 rounded-lg flex items-center justify-center">
                      <Package className="w-8 h-8 text-gray-400" />
                    </div>
                    <p className="text-xs font-medium text-gray-700">{brand.name}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Trust Statement */}
          <div className="bg-[#003d7a]/5 border border-[#003d7a]/20 rounded-2xl p-6 sm:p-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Why Our Suppliers Matter</h2>
            <p className="text-gray-700 mb-4">
              We partner with authorized distributors and suppliers to ensure:
            </p>
            <ul className="space-y-2">
              <li className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                <span className="text-gray-700">Genuine products with manufacturer warranties</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                <span className="text-gray-700">Reliable stock availability and delivery</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                <span className="text-gray-700">Technical support and product expertise</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                <span className="text-gray-700">Competitive pricing through authorized channels</span>
              </li>
            </ul>
          </div>
        </section>
      </Container>
    </div>
  );
}
