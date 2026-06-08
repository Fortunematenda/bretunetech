import Link from 'next/link';
import { Mail, Phone, MapPin } from 'lucide-react';
import { brand } from '@/lib/brand';

const footerLinks = {
  'Shop': [
    { href: '/shop', label: 'Shop All' },
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
    { href: '/about', label: 'About Bretunetech' },
    { href: '/services', label: 'Services' },
    { href: '/quote', label: 'Get a Quote' },
    { href: '/contact', label: 'Contact Us' },
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
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-violet-500 to-violet-700 flex items-center justify-center shrink-0">
                <span className="text-white text-sm font-black">B</span>
              </div>
              <div>
                <span className="text-xl font-bold text-white">Bretune</span>
                <span className="text-xl font-bold text-cyan-400">tech</span>
                <span className="text-xs text-gray-400 block -mt-1">bretunetech.com</span>
              </div>
            </Link>
            <p className="text-sm text-gray-400 mb-4">
              {brand.tagline} South African enterprise networking solutions, installations, and ecommerce procurement in one platform.
            </p>
            <div className="space-y-2 text-sm text-gray-400">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-blue-400" />
                <span>{brand.email}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-blue-400" />
                <span>{brand.phone}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-blue-400" />
                <span>{brand.location}</span>
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

        <div className="border-t border-gray-800 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-gray-500">
            &copy; {new Date().getFullYear()} {brand.name}. All rights reserved.
          </p>
          <div className="flex items-center gap-4 text-xs text-gray-500">
            <span>Payment: EFT | PayFast | Yoco</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
