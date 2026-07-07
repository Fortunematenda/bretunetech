import Link from 'next/link';
import Image from 'next/image';
import { Mail, Phone } from 'lucide-react';
import { brand } from '@/lib/brand';
import { COMPANY } from '@/lib/company';
import { LinkedinIcon, FacebookIcon } from '@/components/ui/SocialIcons';

const footerLinks = {
  'Shop': [
    { href: '/products', label: 'Shop All' },
    { href: '/products?category=power-solutions', label: 'Power Solutions' },
    { href: '/products?category=internet-networking', label: 'Networking' },
    { href: '/products?category=accessories', label: 'Accessories' },
    { href: '/bundles', label: 'Bundles & Kits' },
  ],
  'Customer Service': [
    { href: '/account', label: 'My Account' },
    { href: '/account/orders', label: 'Track Order' },
    { href: '/delivery', label: 'Delivery Info' },
    { href: '/returns', label: 'Returns & Refunds' },
    { href: '/warranty', label: 'Warranty' },
    { href: '/faq', label: 'FAQ' },
  ],
  'Company': [
    { href: '/about', label: 'About BretuneTech' },
    { href: '/services', label: 'Services' },
    { href: '/quote', label: 'Get a Quote' },
    { href: '/contact', label: 'Contact Us' },
    { href: '/company-information', label: 'Company Information' },
    { href: '/privacy', label: 'Privacy Policy' },
    { href: '/terms', label: 'Terms of Service' },
  ],
};

export default function Footer() {
  return (
    <footer className="bg-[#003d7a] border-t border-blue-800/50">
      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <Link href="/" className="flex items-center gap-3 mb-4">
              <div className="relative w-10 h-10 shrink-0">
                <Image
                  src="/assets/logo/logo.png"
                  alt="BretuneTech"
                  fill
                  sizes="40px"
                  className="object-contain"
                />
              </div>
              <div>
                <span className="text-xl font-bold text-white">BretuneTech</span>
                <span className="text-xs text-gray-400 block -mt-0.5">{brand.domain}</span>
              </div>
            </Link>
            <p className="text-sm text-gray-400 mb-4">
              {brand.tagline} South African enterprise networking solutions, installations, and ecommerce procurement in one platform.
            </p>
            <div className="space-y-2 text-sm text-gray-400">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-blue-400" />
                <span>{COMPANY.supportEmail}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-blue-400" />
                <span>{brand.phone}</span>
              </div>
            </div>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h3 className="text-sm font-semibold text-white mb-4">{title}</h3>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link href={link.href} className="text-sm text-gray-400 hover:text-white transition-colors">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-gray-800 mt-10 pt-6">
          {/* Connect With Us Section */}
          <div className="mb-6 pb-6 border-b border-gray-800">
            <h3 className="text-sm font-semibold text-white mb-4">Connect With Us</h3>
            <div className="flex items-center gap-3">
              <a
                href="https://www.linkedin.com/company/bretunetech"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-600 hover:bg-blue-500 transition-all duration-300 hover:scale-110 group"
                title="Follow us on LinkedIn"
              >
                <LinkedinIcon className="w-5 h-5 text-white" />
              </a>
              <a
                href="https://www.facebook.com/bretunetech"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-700 hover:bg-blue-600 transition-all duration-300 hover:scale-110 group"
                title="Follow us on Facebook"
              >
                <FacebookIcon className="w-5 h-5 text-white" />
              </a>
            </div>
          </div>

          {/* Copyright */}
          <div className="text-xs text-gray-400 text-center">
            <p className="mb-1">&copy; {new Date().getFullYear()} {COMPANY.brandName}. All Rights Reserved.</p>
            <p className="text-gray-400">
              {COMPANY.brandName} is a trading name of {COMPANY.legalName}.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
