import { serviceCatalog } from './brand';

export type ServiceLanding = {
  slug: string;
  name: string;
  shortDescription: string;
  audience: string;
  process: string;
  title: string;
  metaDescription: string;
  h1: string;
  intro: string;
  paragraphs: string[];
  pricingNote: string;
  faqs: { question: string; answer: string }[];
  whatsappMessage: string;
};

function catalog(slug: string) {
  const s = serviceCatalog.find((item) => item.slug === slug);
  if (!s) throw new Error(`Unknown service slug: ${slug}`);
  return s;
}

function landing(
  slug: string,
  fields: Omit<ServiceLanding, 'slug' | 'name' | 'shortDescription' | 'audience' | 'process'>
): ServiceLanding {
  const s = catalog(slug);
  return {
    slug: s.slug,
    name: s.name,
    shortDescription: s.description,
    audience: s.audience,
    process: s.process,
    ...fields,
  };
}

export const serviceLandings: ServiceLanding[] = [
  landing('wifi-installations', {
    title: 'Wi-Fi Installation Cape Town',
    metaDescription:
      'Professional Wi-Fi installation in Cape Town and the Western Cape. Site surveys, access-point design, and stable roaming for offices, retail, and homes.',
    h1: 'Wi-Fi Installation in Cape Town',
    intro:
      'We design and install business-grade Wi-Fi that covers the rooms you actually use — not just the ceiling nearest the router.',
    paragraphs: [
      'A typical project starts with a walkthrough or floor plan review so we understand walls, interference, and where people work. From there we recommend access-point count and placement, cable or PoE paths, and whether a cloud or on-prem controller fits your team.',
      'After install we validate coverage, tune channels and power, and hand over SSIDs, guest access, and admin credentials in plain language. Equipment can come from our store (Ubiquiti, MikroTik, Cudy, and more) or we can work with gear you already own when it is suitable.',
      'On-site installs focus on Cape Town metro and the Western Cape. Multi-site or remote branches can often be staged with a local contact and finished with remote configuration support.',
    ],
    pricingNote:
      'Small office / home-office installs are often quoted as a fixed package after a short survey. Larger warehouses and multi-floor sites are scoped per floor plan. Call or WhatsApp for a ballpark before we visit.',
    faqs: [
      {
        question: 'Do you only install brand-new equipment?',
        answer:
          'No. We can supply new gear from BretuneTech or integrate suitable existing access points and switches after a quick compatibility check.',
      },
      {
        question: 'How long does a typical Wi-Fi install take?',
        answer:
          'A small office is often completed in one day once cabling paths are clear. Larger sites may need a survey day plus an install day.',
      },
      {
        question: 'Can you improve Wi-Fi that already exists?',
        answer:
          'Yes. We diagnose dead zones, channel congestion, and misconfigured controllers, then remediate with placement changes, extra APs, or config fixes.',
      },
    ],
    whatsappMessage: "Hi BretuneTech! I'd like a quote for a Wi-Fi installation in Cape Town.",
  }),
  landing('fibre-installations', {
    title: 'Fibre Installation Cape Town',
    metaDescription:
      'Structured fibre and last-mile handoffs in Cape Town. Clean terminations, rack dressing, labelling, and LAN readiness for business internet.',
    h1: 'Fibre Installation & Structured Cabling in Cape Town',
    intro:
      'We handle practical fibre and structured cabling so your ISP handoff and internal LAN are tidy, labelled, and ready for production traffic.',
    paragraphs: [
      'Projects range from a single ONT-to-router tidy-up to multi-drop fibre or copper runs between rooms and outbuildings. We plan pathways, protect bends and splices, and document ports so the next technician is not guessing.',
      'Where needed we coordinate with your ISP for activation windows and confirm throughput after cutover. Rack work includes cable management and clear labelling — not loose loops left “for later”.',
      'Primary on-site coverage is Cape Town and the Western Cape. Remote sites can be supported with staged kits and video-assisted termination checks when travel is not practical on day one.',
    ],
    pricingNote:
      'Pricing depends on run length, terminations, and rack work. Share photos or a sketch of the path and we will give a fixed quote before drilling or pulling cable.',
    faqs: [
      {
        question: 'Do you work with any fibre ISP?',
        answer:
          'We integrate common South African ISP handoffs. Tell us your provider and we will confirm ONT placement and router requirements before the visit.',
      },
      {
        question: 'Can you install CAT6 as well as fibre?',
        answer:
          'Yes. Many sites need a mix of fibre backbone and copper drops to desks, APs, and cameras. We scope both in one quote when useful.',
      },
    ],
    whatsappMessage: "Hi BretuneTech! I'd like a quote for a fibre installation in Cape Town.",
  }),
  landing('cctv-setup', {
    title: 'CCTV Installation Cape Town',
    metaDescription:
      'CCTV installation in Cape Town for shops, yards, and offices. Camera planning, NVR setup, remote viewing, and practical retention — not camera spam.',
    h1: 'CCTV Installation in Cape Town',
    intro:
      'We design surveillance that answers real questions: who entered, when, and can you review it remotely without fighting the app.',
    paragraphs: [
      'After a risk walkthrough we propose camera positions, lens types, and recording retention that match your risk — entrances, tills, yards, and blind spots — without overselling camera count.',
      'Install includes mounting, PoE or power, NVR/VMS configuration, user accounts, and remote viewing on phone or PC. We test night performance and show your team how to export clips.',
      'On-site work centres on Cape Town and the Western Cape. Multi-branch rollouts can reuse a standard template so every site looks familiar to managers.',
    ],
    pricingNote:
      'Starter kits (a few cameras + NVR) are quoted as packages. Larger sites are priced per camera plus cabling complexity. Ask for a site visit quote with suburb and property type.',
    faqs: [
      {
        question: 'Can I view cameras on my phone?',
        answer:
          'Yes. We set up secure remote access and walk you through the app. We avoid exposing NVRs directly to the open internet without hardening.',
      },
      {
        question: 'How long is footage kept?',
        answer:
          'Retention depends on camera count, resolution, and disk size. We size storage for your target days and explain the trade-offs clearly.',
      },
    ],
    whatsappMessage: "Hi BretuneTech! I'd like a quote for a CCTV setup in Cape Town.",
  }),
  landing('mikrotik-configuration', {
    title: 'MikroTik Configuration Cape Town',
    metaDescription:
      'MikroTik RouterOS configuration for SMEs and ISPs — routing, VLANs, VPN, dual-WAN failover, and firewall hardening with clear documentation.',
    h1: 'MikroTik Configuration in Cape Town & South Africa',
    intro:
      'We build RouterOS configs that behave predictably under load — failover that actually fails over, VPNs your team can use, and firewalls you can still understand later.',
    paragraphs: [
      'Common work includes hEX/CCR edge routers, VLAN segmentation for guest vs staff, traffic shaping, WireGuard or IPsec VPN, and dual-WAN failover for fibre + LTE.',
      'Every engagement ends with a config backup and short notes on what was changed. We can work on-site in Cape Town or remotely nationwide when you have a stable temporary link.',
      'If you are an installer or ISP needing repeatable templates for customer CPE, we can standardise a base config and train your team on safe change processes.',
    ],
    pricingNote:
      'Remote config jobs are often fixed-fee once requirements are clear. Complex multi-WAN or VPN meshes are scoped after a short discovery call.',
    faqs: [
      {
        question: 'Can you fix a MikroTik that was configured by someone else?',
        answer:
          'Yes. We export the current config, identify risky rules, and rebuild or harden it with your approval before cutover.',
      },
      {
        question: 'Do you support RouterOS 7?',
        answer:
          'Yes. We work on current RouterOS releases and call out when a device should be upgraded before we start.',
      },
    ],
    whatsappMessage: "Hi BretuneTech! I'd like a quote for MikroTik configuration.",
  }),
  landing('remote-support', {
    title: 'Remote Network Support South Africa',
    metaDescription:
      'Remote network support for South African businesses — outages, Wi-Fi issues, and router misconfigurations fixed securely without waiting for a truck roll.',
    h1: 'Remote Network Support for South African Businesses',
    intro:
      'When the network is down and a site visit would take hours, we connect securely, stabilise the incident, and leave you with clear next steps.',
    paragraphs: [
      'Remote support covers ISP outages triage, Wi-Fi controller issues, MikroTik/firewall misconfigurations, VPN failures, and “it worked yesterday” regressions.',
      'We use approved remote tools, confirm scope before changing production gear, and document what we did. If the fault needs hands on site, we say so early and can arrange a Cape Town visit.',
      'Available nationwide for devices we can reach over the internet or via a temporary hotspot. Ideal for SMEs without a full-time IT person on every campus.',
    ],
    pricingNote:
      'Incidents are usually billed as a remote session block after a short intake. Ongoing retainer options are available for businesses that want priority response.',
    faqs: [
      {
        question: 'How fast can you start?',
        answer:
          'Same-business-day for many incidents when someone on site can grant access. Critical outages get prioritised — WhatsApp or call to escalate.',
      },
      {
        question: 'Is remote support secure?',
        answer:
          'We use encrypted sessions, least-privilege access, and end the session when work is done. We never ask for unrelated passwords in chat.',
      },
    ],
    whatsappMessage: 'Hi BretuneTech! I need remote support assistance.',
  }),
  landing('network-troubleshooting', {
    title: 'Network Troubleshooting Cape Town',
    metaDescription:
      'Network troubleshooting in Cape Town — packet loss, latency, DNS failures, and flaky links diagnosed with measurements, not guesswork.',
    h1: 'Network Troubleshooting in Cape Town',
    intro:
      'If “the Wi-Fi is slow” has already burned a day, we baseline the path, isolate the layer, and fix the root cause.',
    paragraphs: [
      'We measure first: latency, loss, DNS, DHCP, wireless airtime, and WAN health. That stops random AP reboots and cable swaps that never stick.',
      'Typical outcomes include replacing a bad PoE injector, fixing duplex mismatches, correcting DNS, separating guest traffic, or proving an ISP fault with evidence you can escalate.',
      'On-site diagnostics focus on Cape Town and the Western Cape; many issues can start remotely if you have a spare laptop or phone hotspot for access.',
    ],
    pricingNote:
      'Diagnostic visits are quoted as a half-day or full-day block. If we find a clear fix during the visit, remediation labour is included in that quote when agreed upfront.',
    faqs: [
      {
        question: 'Should I reboot everything before you arrive?',
        answer:
          'Only if users are fully offline. Otherwise leave the fault in place — intermittent issues are easier to catch when they are still happening.',
      },
      {
        question: 'Can you work with our existing ISP?',
        answer:
          'Yes. We document evidence and can join a three-way call when the fault sits on the WAN side.',
      },
    ],
    whatsappMessage: 'Hi BretuneTech! I need help with network troubleshooting in Cape Town.',
  }),
];

export function getServiceLanding(slug: string): ServiceLanding | undefined {
  return serviceLandings.find((s) => s.slug === slug);
}

export function getAllServiceSlugs(): string[] {
  return serviceLandings.map((s) => s.slug);
}
