import Link from 'next/link';
import Image from 'next/image';
import { Mail, Phone } from 'lucide-react';
import { brand } from '@/lib/brand';
import { COMPANY } from '@/lib/company';
import { LinkedinIcon, FacebookIcon } from '@/components/ui/SocialIcons';
import { TrackedPhoneLink } from '@/components/analytics/TrackedLinks';

const footerLinks = {
  'Shop': [
    { href: '/products', label: 'Shop All' },
    { href: '/products?category=power-solutions', label: 'Power Solutions' },
    { href: '/products?category=internet-networking', label: 'Networking' },
    { href: '/products?category=accessories', label: 'Accessories' },
    { href: '/bundles', label: 'Bundles & Kits' },
  ],
  'Services': [
    { href: '/services', label: 'All Services' },
    { href: '/services/wifi-installations', label: 'Wi-Fi Installation' },
    { href: '/services/cctv-setup', label: 'CCTV Installation' },
    { href: '/services/fibre-installations', label: 'Fibre Installation' },
    { href: '/services/mikrotik-configuration', label: 'MikroTik Config' },
    { href: '/services/areas/cape-town', label: 'Cape Town Area' },
    { href: '/quote', label: 'Get a Quote' },
  ],
  'Company': [
    { href: '/about', label: 'About BretuneTech' },
    { href: '/contact', label: 'Contact Us' },
    { href: '/delivery', label: 'Delivery Info' },
    { href: '/faq', label: 'FAQ' },
    { href: '/company-information', label: 'Company Information' },
    { href: '/privacy', label: 'Privacy Policy' },
    { href: '/terms', label: 'Terms of Service' },
  ],
};

export default function Footer() {
  return (
    <footer className="border-t border-primary/20 bg-primary">
      <div className="mx-auto w-full max-w-[1560px] px-4 py-12 sm:px-6">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div>
            <Link href="/" className="mb-4 flex items-center gap-3">
              <div className="relative size-10 shrink-0">
                <Image
                  src="/assets/logo/logo.png"
                  alt="BretuneTech"
                  fill
                  sizes="40px"
                  className="object-contain"
                />
              </div>
              <div>
                <span className="text-xl font-bold text-primary-foreground">BretuneTech</span>
                <span className="block -mt-0.5 text-xs text-primary-foreground/60">{brand.domain}</span>
              </div>
            </Link>
            <p className="mb-4 text-sm text-primary-foreground/70">
              {brand.tagline} South African enterprise networking solutions, installations, and ecommerce procurement in one platform.
            </p>
            <div className="space-y-2 text-sm text-primary-foreground/70">
              <div className="flex items-center gap-2">
                <Mail className="size-4 text-primary-foreground/80" aria-hidden="true" />
                <a href={`mailto:${brand.email}`} className="transition-colors hover:text-primary-foreground">
                  {brand.email}
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="size-4 text-primary-foreground/80" aria-hidden="true" />
                <TrackedPhoneLink
                  location="footer"
                  href={`tel:${brand.phone.replace(/\s/g, '')}`}
                  className="transition-colors hover:text-primary-foreground"
                >
                  {brand.phone}
                </TrackedPhoneLink>
              </div>
              <p className="pt-1 text-xs text-primary-foreground/50">{brand.location}</p>
            </div>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h3 className="mb-4 text-sm font-semibold text-primary-foreground">{title}</h3>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link href={link.href} className="text-sm text-primary-foreground/70 transition-colors hover:text-primary-foreground">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 border-t border-primary-foreground/15 pt-6">
          <div className="mb-6 border-b border-primary-foreground/15 pb-6">
            <h3 className="mb-4 text-sm font-semibold text-primary-foreground">Connect With Us</h3>
            <div className="flex items-center gap-3">
              <a
                href="https://www.linkedin.com/company/bretunetech"
                target="_blank"
                rel="noopener noreferrer"
                className="flex size-10 items-center justify-center rounded-full bg-blue-600 transition-all hover:scale-110 hover:bg-blue-500"
                aria-label="Follow us on LinkedIn"
              >
                <LinkedinIcon className="size-5 text-white" />
              </a>
              <a
                href="https://www.facebook.com/bretunetech"
                target="_blank"
                rel="noopener noreferrer"
                className="flex size-10 items-center justify-center rounded-full bg-blue-700 transition-all hover:scale-110 hover:bg-blue-600"
                aria-label="Follow us on Facebook"
              >
                <FacebookIcon className="size-5 text-white" />
              </a>
            </div>
          </div>

          <div className="text-center text-xs text-primary-foreground/60">
            <p className="mb-1">&copy; {new Date().getFullYear()} {COMPANY.brandName}. All Rights Reserved.</p>
            <p>
              {COMPANY.brandName} is a trading name of {COMPANY.legalName}.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
