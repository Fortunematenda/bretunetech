import { Globe, ShieldCheck, BriefcaseBusiness, Activity, Users, Target, Award, Eye, Network, Camera, Wifi, Zap, Cpu } from 'lucide-react';
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
    <div className="w-full px-4 sm:px-6 lg:px-8 py-10 sm:py-14 bg-white min-h-screen">
      <section className="w-full max-w-6xl mx-auto">
        <div className="mb-10 sm:mb-12 text-center">
          <p className="text-cyan-400 text-xs font-semibold tracking-wider uppercase mb-3">About Bretune</p>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">Reliable Connectivity for Modern Businesses</h1>
          <p className="text-sm sm:text-base text-gray-600 max-w-3xl mx-auto">
            Bretune Technologies is a South African networking and ecommerce platform focused on high-quality infrastructure, trusted hardware procurement, and dependable support services.
          </p>
        </div>

        {/* Mission */}
        <div className="mb-12 rounded-2xl border border-gray-200 bg-gray-50 p-6 sm:p-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-[#003d7a]/10 flex items-center justify-center">
              <Target className="w-6 h-6 text-[#003d7a]" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Our Mission</h2>
          </div>
          <p className="text-gray-600 text-sm sm:text-base">
            To provide South African businesses with reliable, enterprise-grade technology solutions through trusted supplier partnerships, expert technical support, and transparent service delivery.
          </p>
        </div>

        {/* Vision */}
        <div className="mb-12 rounded-2xl border border-gray-200 bg-gray-50 p-6 sm:p-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-[#003d7a]/10 flex items-center justify-center">
              <Eye className="w-6 h-6 text-[#003d7a]" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Our Vision</h2>
          </div>
          <p className="text-gray-600 text-sm sm:text-base">
            To be the leading technology solutions provider in South Africa, recognized for quality products, exceptional service, and building long-term partnerships with businesses and installers nationwide.
          </p>
        </div>

        {/* What We Do */}
        <div className="mb-12 rounded-2xl border border-gray-200 bg-gray-50 p-6 sm:p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">What We Do</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-lg bg-[#003d7a]/10 flex items-center justify-center shrink-0">
                <Network className="w-5 h-5 text-[#003d7a]" />
              </div>
              <div>
                <h3 className="text-gray-900 font-semibold mb-1">Networking</h3>
                <p className="text-gray-600 text-sm">Enterprise routers, switches, and wireless solutions for reliable connectivity.</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-lg bg-[#003d7a]/10 flex items-center justify-center shrink-0">
                <Camera className="w-5 h-5 text-[#003d7a]" />
              </div>
              <div>
                <h3 className="text-gray-900 font-semibold mb-1">CCTV</h3>
                <p className="text-gray-600 text-sm">Professional surveillance systems with remote monitoring capabilities.</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-lg bg-[#003d7a]/10 flex items-center justify-center shrink-0">
                <Globe className="w-5 h-5 text-[#003d7a]" />
              </div>
              <div>
                <h3 className="text-gray-900 font-semibold mb-1">Fibre Infrastructure</h3>
                <p className="text-gray-600 text-sm">Fibre optic cabling and deployment for high-speed networks.</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-lg bg-[#003d7a]/10 flex items-center justify-center shrink-0">
                <Wifi className="w-5 h-5 text-[#003d7a]" />
              </div>
              <div>
                <h3 className="text-gray-900 font-semibold mb-1">Wireless Solutions</h3>
                <p className="text-gray-600 text-sm">Point-to-point and point-to-multiplicity wireless links.</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-lg bg-[#003d7a]/10 flex items-center justify-center shrink-0">
                <Zap className="w-5 h-5 text-[#003d7a]" />
              </div>
              <div>
                <h3 className="text-gray-900 font-semibold mb-1">Backup Power</h3>
                <p className="text-gray-600 text-sm">UPS systems, inverters, and batteries for uninterrupted power.</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-lg bg-[#003d7a]/10 flex items-center justify-center shrink-0">
                <Cpu className="w-5 h-5 text-[#003d7a]" />
              </div>
              <div>
                <h3 className="text-gray-900 font-semibold mb-1">Technology Products</h3>
                <p className="text-gray-600 text-sm">Quality hardware from trusted brands through authorized distributors.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Highlights */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Why Choose Us</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
            {highlights.map((item) => (
              <article
                key={item.title}
                className="rounded-2xl border border-gray-200 bg-white p-5 sm:p-6 hover:shadow-lg hover:border-[#003d7a]/30 transition-all"
              >
                <div className="w-11 h-11 rounded-xl bg-[#003d7a]/10 flex items-center justify-center mb-4">
                  <item.icon className="w-5 h-5 text-[#003d7a]" />
                </div>
                <h2 className="text-lg font-semibold text-gray-900 mb-2">{item.title}</h2>
                <p className="text-sm text-gray-600">{item.description}</p>
              </article>
            ))}
          </div>
        </div>

        {/* Values */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Our Values</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5">
            {values.map((item) => (
              <article
                key={item.title}
                className="rounded-2xl border border-gray-200 bg-white p-5 sm:p-6 text-center hover:shadow-lg hover:border-[#003d7a]/30 transition-all"
              >
                <div className="w-11 h-11 rounded-xl bg-[#003d7a]/10 flex items-center justify-center mb-4 mx-auto">
                  <item.icon className="w-5 h-5 text-[#003d7a]" />
                </div>
                <h2 className="text-lg font-semibold text-gray-900 mb-2">{item.title}</h2>
                <p className="text-sm text-gray-600">{item.description}</p>
              </article>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="rounded-2xl border border-[#003d7a]/30 bg-[#003d7a]/5 p-6 sm:p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Ready to Work Together?</h2>
          <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
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
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#003d7a] hover:bg-[#0055a4] text-white font-semibold rounded-xl transition-colors"
            >
              Email Us
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
