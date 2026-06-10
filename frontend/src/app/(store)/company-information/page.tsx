import { Building2, Mail, Phone, Globe, FileText, ShieldCheck } from 'lucide-react';
import { COMPANY } from '@/lib/company';
import Container from '@/components/layout/Container';

export default function CompanyInformationPage() {
  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 py-10 sm:py-14 bg-white min-h-screen">
      <Container>
        <section className="w-full max-w-4xl mx-auto">
          <div className="mb-10 sm:mb-12 text-center">
            <p className="text-cyan-400 text-xs font-semibold tracking-wider uppercase mb-3">Company Information</p>
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">About {COMPANY.brandName}</h1>
            <p className="text-gray-600 max-w-2xl mx-auto">
              {COMPANY.brandName} is a trading name of {COMPANY.legalName}, a registered South African company specializing in technology ecommerce and solutions.
            </p>
          </div>

          {/* Company Details */}
          <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6 sm:p-8 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-[#003d7a]" />
              Business Details
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Business Name</p>
                <p className="text-gray-900 font-medium">{COMPANY.brandName}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Legal Entity</p>
                <p className="text-gray-900 font-medium">{COMPANY.legalName}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Registration Number</p>
                <p className="text-gray-900 font-medium">{COMPANY.registrationNumber}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Tax Number</p>
                <p className="text-gray-900 font-medium">{COMPANY.taxNumber}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Website</p>
                <a href={COMPANY.website} target="_blank" rel="noopener noreferrer" className="text-[#003d7a] font-medium hover:underline">
                  {COMPANY.website}
                </a>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Country</p>
                <p className="text-gray-900 font-medium">{COMPANY.country}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Email</p>
                <a href={`mailto:${COMPANY.email}`} className="text-[#003d7a] font-medium hover:underline">
                  {COMPANY.email}
                </a>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Support</p>
                <a href={`mailto:${COMPANY.supportEmail}`} className="text-[#003d7a] font-medium hover:underline">
                  {COMPANY.supportEmail}
                </a>
              </div>
              <div className="md:col-span-2">
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Business Type</p>
                <p className="text-gray-900 font-medium">{COMPANY.businessType}</p>
              </div>
            </div>
          </div>

          {/* Trust & Compliance */}
          <div className="bg-[#003d7a]/5 border border-[#003d7a]/20 rounded-2xl p-6 sm:p-8 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-[#003d7a]" />
              Trust & Compliance
            </h2>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-green-500 text-white flex items-center justify-center shrink-0 mt-0.5">
                  <span className="text-xs">✓</span>
                </div>
                <span className="text-gray-700">Registered South African Company</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-green-500 text-white flex items-center justify-center shrink-0 mt-0.5">
                  <span className="text-xs">✓</span>
                </div>
                <span className="text-gray-700">Secure Online Ordering</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-green-500 text-white flex items-center justify-center shrink-0 mt-0.5">
                  <span className="text-xs">✓</span>
                </div>
                <span className="text-gray-700">Supplier-Backed Product Catalogue</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-green-500 text-white flex items-center justify-center shrink-0 mt-0.5">
                  <span className="text-xs">✓</span>
                </div>
                <span className="text-gray-700">Professional Technology Solutions</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-green-500 text-white flex items-center justify-center shrink-0 mt-0.5">
                  <span className="text-xs">✓</span>
                </div>
                <span className="text-gray-700">Networking, CCTV & Power Specialists</span>
              </li>
            </ul>
          </div>

          {/* Legal Documents */}
          <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6 sm:p-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
              <FileText className="w-5 h-5 text-[#003d7a]" />
              Legal Documents
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <a href="/terms" className="flex items-center gap-3 p-4 bg-white border border-gray-200 rounded-lg hover:border-[#003d7a]/50 hover:shadow-sm transition-all">
                <FileText className="w-5 h-5 text-gray-400" />
                <span className="text-gray-900 font-medium">Terms & Conditions</span>
              </a>
              <a href="/privacy" className="flex items-center gap-3 p-4 bg-white border border-gray-200 rounded-lg hover:border-[#003d7a]/50 hover:shadow-sm transition-all">
                <ShieldCheck className="w-5 h-5 text-gray-400" />
                <span className="text-gray-900 font-medium">Privacy Policy</span>
              </a>
              <a href="/delivery" className="flex items-center gap-3 p-4 bg-white border border-gray-200 rounded-lg hover:border-[#003d7a]/50 hover:shadow-sm transition-all">
                <Globe className="w-5 h-5 text-gray-400" />
                <span className="text-gray-900 font-medium">Delivery Policy</span>
              </a>
              <a href="/returns" className="flex items-center gap-3 p-4 bg-white border border-gray-200 rounded-lg hover:border-[#003d7a]/50 hover:shadow-sm transition-all">
                <FileText className="w-5 h-5 text-gray-400" />
                <span className="text-gray-900 font-medium">Refund & Returns Policy</span>
              </a>
            </div>
          </div>

          {/* Contact */}
          <div className="mt-8 text-center">
            <p className="text-gray-600 mb-4">Need more information?</p>
            <a
              href="/contact"
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#003d7a] hover:bg-[#0055a4] text-white text-sm font-semibold rounded-xl transition-all duration-200 hover:shadow-lg"
            >
              <Mail className="w-4 h-4" />
              Contact Us
            </a>
          </div>
        </section>
      </Container>
    </div>
  );
}
