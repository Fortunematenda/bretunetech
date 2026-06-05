import { Globe, ShieldCheck, BriefcaseBusiness, Activity, Users, Target, Award } from 'lucide-react';
import { brand } from '@/lib/brand';

const highlights = [
  {
    title: 'Enterprise-Grade Infrastructure',
    description: 'We design and deliver resilient networking stacks for SMEs, campuses, and distributed teams.',
    icon: Globe,
  },
  {
    title: 'Security-First Delivery',
    description: 'From firewall policy to segmentation and remote access, security is built into every deployment.',
    icon: ShieldCheck,
  },
  {
    title: 'Business-Critical Support',
    description: 'Rapid escalation and proactive monitoring keep operations online and teams productive.',
    icon: BriefcaseBusiness,
  },
  {
    title: 'Measured Performance',
    description: 'We optimize throughput, uptime, and user experience with data-driven network operations.',
    icon: Activity,
  },
];

const values = [
  {
    title: 'Customer-First',
    description: 'Your success is our priority. We listen, understand, and deliver solutions that fit your needs.',
    icon: Users,
  },
  {
    title: 'Quality Always',
    description: 'We only stock and install equipment we trust. No shortcuts, no compromises.',
    icon: Award,
  },
  {
    title: 'Results-Driven',
    description: 'We focus on outcomes—faster networks, reliable connectivity, and satisfied customers.',
    icon: Target,
  },
];

export default function AboutPage() {
  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
      <section className="w-full">
        <div className="mb-10 sm:mb-12 text-center">
          <p className="text-cyan-400 text-xs font-semibold tracking-wider uppercase mb-3">About Bretune</p>
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-4">Reliable Connectivity for Modern Businesses</h1>
          <p className="text-sm sm:text-base text-gray-400 max-w-3xl mx-auto">
            Bretune Technologies is a South African networking and ecommerce platform focused on high-quality infrastructure, trusted hardware procurement, and dependable support services.
          </p>
        </div>

        {/* Our Story */}
        <div className="mb-12 rounded-2xl border border-gray-800/70 bg-gradient-to-b from-slate-900/80 to-gray-950 p-6 sm:p-8">
          <h2 className="text-2xl font-bold text-white mb-4">Our Story</h2>
          <div className="space-y-4 text-gray-400 text-sm sm:text-base">
            <p>
              Founded with a simple mission—to make enterprise-grade networking accessible to South African businesses—Bretune Technologies has grown from a local installation team to a comprehensive technology provider.
            </p>
            <p>
              We started by solving real problems: schools without reliable internet, businesses struggling with network downtime, and installers who couldn't find quality equipment at fair prices. We built relationships with trusted suppliers, learned what works in African conditions, and developed solutions that last.
            </p>
            <p>
              Today, we combine hands-on installation experience with an online platform that makes it easy to source the right equipment. Whether you're a business owner needing a complete network upgrade, an installer looking for reliable hardware, or a school building a connected campus, we're here to help.
            </p>
          </div>
        </div>

        {/* What We Do */}
        <div className="mb-12 rounded-2xl border border-gray-800/70 bg-gradient-to-b from-slate-900/80 to-gray-950 p-6 sm:p-8">
          <h2 className="text-2xl font-bold text-white mb-4">What We Do</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-gray-400 text-sm sm:text-base">
            <div>
              <h3 className="text-white font-semibold mb-2">Network Installations</h3>
              <p>From fibre deployments to wireless point-to-point links, we design and install networks that perform.</p>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-2">CCTV & Security</h3>
              <p>Professional camera systems with remote monitoring, recording, and smart alerts.</p>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-2">Power Solutions</h3>
              <p>UPS systems, solar inverters, and lithium batteries to keep your equipment running during load shedding.</p>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-2">Equipment Procurement</h3>
              <p>Online store stocking networking gear, cameras, cabling, and accessories from trusted brands.</p>
            </div>
          </div>
        </div>

        {/* Highlights */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-white mb-6 text-center">Why Choose Us</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
            {highlights.map((item) => (
              <article
                key={item.title}
                className="rounded-2xl border border-gray-800/70 bg-gradient-to-b from-slate-900/80 to-gray-950 p-5 sm:p-6"
              >
                <div className="w-11 h-11 rounded-xl border border-cyan-500/30 bg-cyan-500/10 flex items-center justify-center mb-4">
                  <item.icon className="w-5 h-5 text-cyan-300" />
                </div>
                <h2 className="text-lg font-semibold text-white mb-2">{item.title}</h2>
                <p className="text-sm text-gray-400">{item.description}</p>
              </article>
            ))}
          </div>
        </div>

        {/* Values */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-white mb-6 text-center">Our Values</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5">
            {values.map((item) => (
              <article
                key={item.title}
                className="rounded-2xl border border-gray-800/70 bg-gradient-to-b from-slate-900/80 to-gray-950 p-5 sm:p-6 text-center"
              >
                <div className="w-11 h-11 rounded-xl border border-cyan-500/30 bg-cyan-500/10 flex items-center justify-center mb-4 mx-auto">
                  <item.icon className="w-5 h-5 text-cyan-300" />
                </div>
                <h2 className="text-lg font-semibold text-white mb-2">{item.title}</h2>
                <p className="text-sm text-gray-400">{item.description}</p>
              </article>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="rounded-2xl border border-cyan-500/30 bg-cyan-500/10 p-6 sm:p-8 text-center">
          <h2 className="text-2xl font-bold text-white mb-3">Ready to Work Together?</h2>
          <p className="text-gray-400 mb-6 max-w-2xl mx-auto">
            Whether you need a network assessment, equipment recommendation, or complete installation, our team is ready to help.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <a
              href={`https://wa.me/${brand.whatsapp}?text=${encodeURIComponent('Hi Bretunetech, I\'d like to discuss a project with you.')}`}
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
