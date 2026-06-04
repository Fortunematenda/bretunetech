import { Globe, ShieldCheck, BriefcaseBusiness, Activity } from 'lucide-react';

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
      </section>
    </div>
  );
}
