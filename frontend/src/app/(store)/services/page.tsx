import Link from 'next/link';
import { ArrowRight, Wifi, Cable, Camera, Router, Headset, Wrench } from 'lucide-react';
import { serviceCatalog } from '@/lib/brand';

const serviceIcons = {
  'wifi-installations': Wifi,
  'fibre-installations': Cable,
  'cctv-setup': Camera,
  'mikrotik-configuration': Router,
  'remote-support': Headset,
  'network-troubleshooting': Wrench,
} as const;

export default function ServicesPage() {
  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
      <section className="w-full">
        <div className="text-center mb-10 sm:mb-12">
          <p className="text-cyan-400 text-xs font-semibold tracking-wider uppercase mb-3">Enterprise Services</p>
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-4">Network Services for South African Businesses</h1>
          <p className="text-gray-400 max-w-3xl mx-auto text-sm sm:text-base">
            Bretune Technologies provides certified networking services from wireless rollouts and fibre installations to MikroTik optimization and remote support.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {serviceCatalog.map((service) => {
            const Icon = serviceIcons[service.slug as keyof typeof serviceIcons] ?? Wifi;
            return (
              <article
                key={service.slug}
                className="rounded-2xl border border-gray-800/70 bg-gradient-to-b from-slate-900/80 to-gray-950 p-5 hover:border-cyan-500/40 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_12px_30px_rgba(0,0,0,0.35)]"
              >
                <div className="w-11 h-11 rounded-xl border border-cyan-500/30 bg-cyan-500/10 flex items-center justify-center mb-4">
                  <Icon className="w-5 h-5 text-cyan-300" />
                </div>
                <h2 className="text-lg font-semibold text-white mb-2">{service.name}</h2>
                <p className="text-sm text-gray-400">{service.description}</p>
              </article>
            );
          })}
        </div>

        <div className="mt-10 rounded-2xl border border-gray-800/70 bg-gray-900/40 p-6 sm:p-8 flex flex-col sm:flex-row gap-4 sm:gap-6 sm:items-center sm:justify-between">
          <div>
            <h3 className="text-xl font-semibold text-white">Need a custom network deployment?</h3>
            <p className="text-sm text-gray-400 mt-1">Talk to our engineering team for a tailored scope and quote.</p>
          </div>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-cyan-500 text-slate-900 font-semibold text-sm hover:bg-cyan-400 transition-colors"
          >
            Request a Consultation <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
