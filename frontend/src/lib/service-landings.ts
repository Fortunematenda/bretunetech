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
  sections: { heading: string; body: string }[];
  pricingNote: string;
  faqs: { question: string; answer: string }[];
  whatsappMessage: string;
  keywords?: string[];
  offerings?: { title: string; description: string }[];
  audiencePoints?: string[];
  steps?: { title: string; description: string }[];
  coverage?: string;
  areaServed?: string;
  disclaimer?: string;
  serviceArea: string;
  relatedSlugs: string[];
  productLinks: { href: string; label: string }[];
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
      'Wi-Fi installation in Cape Town for offices, shops, and homes. Site survey, access-point placement, and handover of SSIDs and admin access. Request a quote.',
    h1: 'Wi-Fi Installation in Cape Town',
    intro:
      'We design and install Wi-Fi that covers the rooms people actually use, then test it before we leave.',
    paragraphs: [],
    sections: [
      {
        heading: 'What a Wi-Fi installation includes',
        body: 'A typical job starts with a walkthrough or floor plan so we can see walls, interference, and where people work. We then recommend how many access points you need, where they should go, and whether they should run on existing cabling or new PoE drops. After installation we check coverage, set channel and power levels, and hand over SSIDs, a guest network if you want one, and the admin login.',
      },
      {
        heading: 'Equipment we configure',
        body: 'We regularly work with MikroTik, Ubiquiti, Reyee, Ruijie, and similar business Wi-Fi. Equipment can come from our store, or we can reuse suitable access points and switches you already own after a compatibility check. This page is for indoor and campus Wi-Fi. A wireless bridge between two buildings is a separate point-to-point installation.',
      },
      {
        heading: 'Cape Town service area',
        body: 'On-site Wi-Fi work is focused on the Cape Town metro and the wider Western Cape, including offices, retail, warehouses, and homes. Tell us the suburb and building type when you enquire so we can confirm travel before we book a visit.',
      },
    ],
    pricingNote:
      'Quotes depend on the number of access points, cabling, and whether we supply the hardware. Send the suburb and a short description of the site and we will quote before any installation starts.',
    faqs: [
      {
        question: 'Do you only install new Wi-Fi equipment?',
        answer:
          'No. We can supply new equipment from BretuneTech or work with suitable access points and switches you already have.',
      },
      {
        question: 'Can you fix Wi-Fi that is already installed?',
        answer:
          'Yes. We look for dead zones, channel congestion, and controller or router settings that are limiting coverage, then change placement, add access points, or correct the configuration.',
      },
      {
        question: 'Do you install Wi-Fi outside Cape Town?',
        answer:
          'On-site installs are centred on Cape Town and the Western Cape. Some configuration can be finished remotely once the hardware is online.',
      },
    ],
    whatsappMessage: "Hi BretuneTech! I'd like a quote for a Wi-Fi installation in Cape Town.",
    serviceArea:
      'On-site Wi-Fi installation across Cape Town and the Western Cape. Remote configuration is available once the equipment is reachable.',
    relatedSlugs: ['structured-cabling', 'network-troubleshooting', 'mikrotik-configuration', 'point-to-point-wireless'],
    productLinks: [
      { href: '/products/category/wifi', label: 'Wi-Fi routers, mesh systems and access points' },
      { href: '/products/category/networking', label: 'Switches, routers and PoE equipment' },
    ],
  }),
  landing('network-installation', {
    title: 'Network Installation & Cabling Cape Town',
    metaDescription:
      'Professional network installation, structured cabling, router setup and WiFi extension in Cape Town. Get a quote from Bretune Technologies.',
    keywords: [
      'Network installation Cape Town',
      'Structured cabling Cape Town',
      'Ethernet cabling installation',
      'Network setup Cape Town',
      'Router installation',
      'WiFi network extension',
      'Office network installation',
    ],
    h1: 'Network Installation & Structured Cabling in Cape Town',
    intro:
      'Professional network installation, structured cabling and WiFi solutions for homes and businesses across Cape Town.',
    paragraphs: [
      'At Bretune Technologies, we help customers get the most out of their existing fibre or internet connections.',
      'Once the internet service provider has installed and activated the connection, we handle the internal networking, cabling, WiFi distribution and equipment configuration required to connect the property.',
    ],
    sections: [
      {
        heading: 'After your internet connection is active',
        body: 'Once the internet service provider has installed and activated the connection, we handle the internal networking, cabling, WiFi distribution and equipment configuration required to connect the property.',
      },
    ],
    offerings: [
      {
        title: 'Network Installation & Configuration',
        description:
          'Installation and configuration of routers, network switches and wireless access points for homes and businesses.',
      },
      {
        title: 'Structured Network Cabling',
        description:
          'Professional Ethernet cabling, including cable routing, network points, termination, testing and labelling.',
      },
      {
        title: 'WiFi Coverage & Extension',
        description:
          'Extend existing internet connectivity to additional rooms, buildings and outdoor areas using access points, mesh systems and point-to-point wireless links.',
      },
      {
        title: 'Fibre Router & ONT Integration',
        description:
          'Connect and configure internal networking equipment to work with an existing fibre ONT or ISP router.',
      },
      {
        title: 'Network Upgrades & Troubleshooting',
        description:
          'Diagnose connectivity problems, upgrade networking equipment and improve existing network performance.',
      },
    ],
    audiencePoints: [
      'Homeowners requiring improved WiFi coverage.',
      'Businesses installing or upgrading office networks.',
      'Properties requiring additional Ethernet network points.',
      'Customers extending internet connectivity to outbuildings.',
      'Offices requiring router and switch configuration.',
    ],
    steps: [
      {
        title: 'Site Assessment',
        description: 'Assess existing connectivity and network requirements.',
      },
      {
        title: 'Network Planning',
        description: 'Recommend appropriate equipment and network design.',
      },
      {
        title: 'Installation & Configuration',
        description: 'Install and configure network equipment and cabling.',
      },
      {
        title: 'Testing & Handover',
        description: 'Verify connectivity, network performance and WiFi coverage.',
      },
    ],
    coverage:
      'Cape Town and surrounding areas, including Fish Hoek, Sun Valley, Ocean View, Noordhoek and Kommetjie.',
    areaServed:
      'Cape Town, Fish Hoek, Sun Valley, Ocean View, Noordhoek, Kommetjie, Western Cape, South Africa',
    disclaimer:
      'Bretune Technologies does not install fibre infrastructure or activate fibre lines. These services are handled by the relevant infrastructure provider or internet service provider. Our work focuses on internal networking, structured cabling, WiFi distribution and connectivity improvements.',
    pricingNote:
      'Quotes follow a site assessment and depend on cable runs, network points and the equipment required. Tell us your suburb and what needs connecting, and we will price the work before we start.',
    faqs: [
      {
        question: 'Do you install the fibre line or activate the connection?',
        answer:
          'No. Fibre infrastructure, splicing and line activation are handled by the infrastructure provider or your internet service provider. Bretune Technologies starts after that connection is installed and activated.',
      },
      {
        question: 'Can you connect our network to an existing fibre ONT?',
        answer:
          'Yes. We connect and configure routers, switches and access points so they work with an existing fibre ONT or ISP router.',
      },
      {
        question: 'Do you install Ethernet network points?',
        answer:
          'Yes. We route, terminate, test and label Ethernet cabling for homes, offices and outbuildings.',
      },
    ],
    whatsappMessage:
      "Hi BretuneTech! I'd like a quote for network installation and structured cabling in Cape Town.",
    serviceArea:
      'On-site network installation across Cape Town and the Western Cape. Remote support is available nationwide.',
    relatedSlugs: ['structured-cabling', 'mikrotik-configuration', 'wifi-installations', 'point-to-point-wireless'],
    productLinks: [{ href: '/products/category/networking', label: 'Routers, switches and network infrastructure' }],
  }),
  landing('cctv-setup', {
    title: 'CCTV Installation Cape Town',
    metaDescription:
      'CCTV installation in Cape Town for shops, yards, and offices. Camera planning, NVR setup, and remote viewing. Request a site quote from BretuneTech.',
    h1: 'CCTV Installation in Cape Town',
    intro:
      'We plan cameras around the areas you need to review — entrances, tills, yards, and blind spots — and set up recording you can actually open later.',
    paragraphs: [],
    sections: [
      {
        heading: 'Cameras, recorders and storage',
        body: 'After a walkthrough we propose camera positions and whether each view needs a turret, bullet, or another form factor already in our CCTV range. We install the NVR or recorder, create user accounts, and size the hard drive discussion around how many days of footage you want to keep. Retention depends on camera count, resolution, and disk size, which we explain in the quote.',
      },
      {
        heading: 'Cabling and remote viewing',
        body: 'Cameras are cabled and powered as part of the install, usually over PoE. We set up phone or computer viewing and show your team how to export a clip. We do not leave a recorder open to the internet without access controls. New copper runs for cameras can be included with structured cabling when the building does not already have them.',
      },
      {
        heading: 'Cape Town properties',
        body: 'On-site CCTV work covers shops, offices, homes, and yards in Cape Town and the Western Cape. Multi-branch sites can reuse the same layout notes so each premises is familiar to the people who review footage.',
      },
    ],
    pricingNote:
      'A small camera-and-NVR install is quoted as one scope. Larger sites are quoted per camera plus the cabling the building needs. Share the suburb and property type when you enquire.',
    faqs: [
      {
        question: 'Can I view the cameras on my phone?',
        answer:
          'Yes. We set up remote viewing and walk you through the app during handover.',
      },
      {
        question: 'How long is footage kept?',
        answer:
          'That depends on how many cameras you record, the resolution, and the disk installed. We state the expected retention in the quote instead of guessing a number of days up front.',
      },
      {
        question: 'Which CCTV brands do you install?',
        answer:
          'Our catalogue focus is Hikvision cameras, NVRs, and related accessories. We confirm the exact models in the quote.',
      },
    ],
    whatsappMessage: "Hi BretuneTech! I'd like a quote for a CCTV installation in Cape Town.",
    serviceArea: 'On-site CCTV installation across Cape Town and the Western Cape.',
    relatedSlugs: ['structured-cabling', 'wifi-installations', 'network-troubleshooting'],
    productLinks: [
      { href: '/products/category/cctv-security', label: 'CCTV cameras, NVRs and security hardware' },
    ],
  }),
  landing('mikrotik-configuration', {
    title: 'MikroTik Configuration Cape Town',
    metaDescription:
      'MikroTik RouterOS configuration in Cape Town and remotely across South Africa. VLANs, VPNs, firewalls, and dual-WAN failover, with a config backup when we finish.',
    h1: 'MikroTik Configuration in Cape Town',
    intro:
      'We build and repair RouterOS configurations for businesses that need routing, segmentation, VPN access, or a second WAN that takes over when fibre drops.',
    paragraphs: [],
    sections: [
      {
        heading: 'Typical MikroTik work',
        body: 'Common tasks include edge routers, VLANs that separate staff and guest traffic, firewall rules, WireGuard or IPsec VPN, traffic queues, and dual-WAN failover between fibre and LTE. We export a backup and leave short notes on what changed.',
      },
      {
        heading: 'On-site in Cape Town, remote elsewhere',
        body: 'Cape Town sites can be configured in person. If the router is already reachable, the same work can be done remotely anywhere in South Africa. We agree the change window before we touch a live network.',
      },
      {
        heading: 'Hardware',
        body: 'We configure MikroTik routers and related networking gear from our catalogue, and we also work on MikroTik hardware you already have. If a device should be upgraded before we start, we say so in the quote.',
      },
    ],
    pricingNote:
      'Straightforward remote configuration is quoted once the requirements are clear. Multi-WAN and multi-site VPN work is scoped after a short discovery call.',
    faqs: [
      {
        question: 'Can you fix a MikroTik configured by someone else?',
        answer:
          'Yes. We export the current configuration, point out rules that are risky or unclear, and change it only after you approve the plan.',
      },
      {
        question: 'Do you support current RouterOS releases?',
        answer:
          'Yes. We work on current RouterOS 7 releases and we flag a device that should be upgraded before configuration starts.',
      },
    ],
    whatsappMessage: "Hi BretuneTech! I'd like a quote for MikroTik configuration.",
    serviceArea:
      'On-site MikroTik work in Cape Town and the Western Cape. Remote configuration is available across South Africa when the router is reachable.',
    relatedSlugs: ['wifi-installations', 'network-troubleshooting', 'point-to-point-wireless', 'network-installation'],
    productLinks: [{ href: '/products/category/networking', label: 'MikroTik routers, switches and networking gear' }],
  }),
  landing('remote-support', {
    title: 'Remote Network Support South Africa',
    metaDescription:
      'Remote network support for South African businesses. Outages, Wi-Fi controllers, and router faults handled securely when a Cape Town site visit is not required.',
    h1: 'Remote Network Support for South African Businesses',
    intro:
      'When the fault can be reached over the network, we connect securely, stabilise it, and send you a short note of what changed.',
    paragraphs: [],
    sections: [
      {
        heading: 'What remote support covers',
        body: 'Remote sessions cover ISP-outage triage, Wi-Fi controller issues, MikroTik and firewall misconfiguration, VPN failures, and changes that stopped working after a recent edit. If the fault needs someone on site, we say so early. Cape Town visits are booked as network support.',
      },
      {
        heading: 'How access works',
        body: 'We use an approved remote tool, confirm the scope before changing production equipment, and close the session when the work is done. We do not ask for unrelated passwords in chat.',
      },
    ],
    pricingNote:
      'Remote incidents are quoted as a session after a short intake. Ongoing arrangements are discussed separately if you want a named contact for repeat issues.',
    faqs: [
      {
        question: 'How soon can a remote session start?',
        answer:
          'Many sessions start the same business day when someone on site can grant access. Call or WhatsApp if the site is fully offline.',
      },
      {
        question: 'When do you need to visit instead?',
        answer:
          'Failed cabling, dead hardware, wireless alignment, and anything we cannot see remotely needs an on-site visit. In Cape Town that is booked as network support or the relevant installation.',
      },
    ],
    whatsappMessage: 'Hi BretuneTech! I need remote network support.',
    serviceArea:
      'Remote support is available across South Africa. On-site follow-up is available in Cape Town and the Western Cape.',
    relatedSlugs: ['network-troubleshooting', 'mikrotik-configuration', 'wifi-installations'],
    productLinks: [{ href: '/products/category/networking', label: 'Networking equipment' }],
  }),
  landing('network-troubleshooting', {
    title: 'Network Support Cape Town',
    metaDescription:
      'Network support in Cape Town for slow links, packet loss, DNS faults, and unstable Wi-Fi. We measure the problem on site and quote the repair before extra work starts.',
    h1: 'Network Support in Cape Town',
    intro:
      'If the network is slow, dropping, or only works after a reboot, we measure the path on site and fix the layer that is actually failing.',
    paragraphs: [],
    sections: [
      {
        heading: 'Faults we investigate',
        body: 'On-site support covers packet loss, high latency, DNS and DHCP problems, flaky switches, bad PoE, duplex mismatches, and Wi-Fi that is congested or misconfigured. We baseline the link first so the repair is based on a measurement, not a random reboot.',
      },
      {
        heading: 'What happens during a visit',
        body: 'We agree the symptoms and the rooms affected, then test WAN, LAN, and wireless separately. Typical outcomes include replacing a failed injector or cable, correcting DNS, separating guest traffic, or documenting an ISP fault you can escalate. If the router can be reached without a visit, remote network support may be the faster option.',
      },
      {
        heading: 'Cape Town service area',
        body: 'This on-site service covers the Cape Town metro and the wider Western Cape. Include your suburb, what failed, and when it started so we can schedule the visit.',
      },
    ],
    pricingNote:
      'Diagnostic visits are quoted before we travel. Further repair work is only added after we agree it with you.',
    faqs: [
      {
        question: 'Should I reboot everything before you arrive?',
        answer:
          'Only if the site is fully offline. If the fault comes and goes, leave it in place so we can see it.',
      },
      {
        question: 'Can you work with our existing ISP?',
        answer:
          'Yes. When the measurements point at the WAN, we document them so you can escalate to the provider, and we can join a call if that helps.',
      },
      {
        question: 'Is this the same as remote support?',
        answer:
          'No. This page is an on-site Cape Town visit. Remote support is for faults we can reach without travelling.',
      },
    ],
    whatsappMessage: 'Hi BretuneTech! I need network support in Cape Town.',
    serviceArea: 'On-site network support across Cape Town and the Western Cape.',
    relatedSlugs: ['remote-support', 'wifi-installations', 'mikrotik-configuration', 'structured-cabling'],
    productLinks: [{ href: '/products/category/networking', label: 'Switches, routers and networking equipment' }],
  }),
  landing('structured-cabling', {
    title: 'Structured Cabling Cape Town',
    metaDescription:
      'Structured cabling in Cape Town for offices, shops, and homes. CAT6 drops, patch panels, cabinets, and labelled outlets. Quote before any cable is pulled.',
    h1: 'Structured Cabling in Cape Town',
    intro:
      'We install copper cabling that ends on a labelled patch panel, so desks, access points, and cameras have a permanent outlet instead of loose leads.',
    paragraphs: [],
    sections: [
      {
        heading: 'What structured cabling covers',
        body: 'The work includes route planning, cable pulling, terminations, patch panels, cabinet or rack dressing, and a simple port map. We test the runs we install and label both ends. Fibre ISP handoffs and internal fibre backbones are quoted separately as fibre installation.',
      },
      {
        heading: 'Where the cables go',
        body: 'Typical drops serve desks, wireless access points, till points, and CCTV cameras. If you are also installing Wi-Fi or cameras, we can coordinate the cabling with that scope so the outlets land where the equipment will actually be mounted.',
      },
      {
        heading: 'Cape Town service area',
        body: 'On-site cabling is focused on Cape Town and the Western Cape. Photos of the ceiling, cabinet, and destination rooms make the quote more accurate.',
      },
    ],
    pricingNote:
      'Quotes follow the number of outlets, the route, and whether a cabinet or patch panel is required. We confirm the price before drilling or pulling cable.',
    faqs: [
      {
        question: 'Do you install fibre as well as copper?',
        answer:
          'Copper structured cabling is this service. Fibre routes are scoped on the fibre installation page so each job stays clear.',
      },
      {
        question: 'Will the outlets be labelled?',
        answer:
          'Yes. We label both ends and leave a port list so the next change does not depend on guessing.',
      },
      {
        question: 'Can cabling be combined with Wi-Fi or CCTV?',
        answer:
          'Yes. New access-point and camera positions often need new drops. We can quote those outlets with the installation they serve.',
      },
    ],
    whatsappMessage: "Hi BretuneTech! I'd like a quote for structured cabling in Cape Town.",
    serviceArea: 'On-site structured cabling across Cape Town and the Western Cape.',
    relatedSlugs: ['wifi-installations', 'cctv-setup', 'network-installation', 'network-troubleshooting'],
    productLinks: [{ href: '/products/category/networking', label: 'Switches, cabinets and networking hardware' }],
  }),
  landing('point-to-point-wireless', {
    title: 'Point-to-Point Wireless Installation Cape Town',
    metaDescription:
      'Point-to-point wireless installation in Cape Town. Line-of-sight checks, radio mounting, and link alignment for buildings that cannot share a cable.',
    h1: 'Point-to-Point Wireless Installation in Cape Town',
    intro:
      'We install a wireless bridge between two points when a cable run is impractical, after checking that the path between them is viable.',
    paragraphs: [],
    sections: [
      {
        heading: 'When a wireless link is used',
        body: 'Typical links join a main building to a gatehouse, warehouse, outbuilding, or neighbouring premises. We look at distance and line of sight before recommending radios. If trees, roofs, or other structures block the path, we say so instead of forcing a link that cannot align.',
      },
      {
        heading: 'Installation steps',
        body: 'The visit covers mounting, alignment, configuration of the bridge, and a check that traffic passes. Indoor Wi-Fi for the people inside each building is a separate Wi-Fi installation. Router and VLAN changes, including MikroTik, are quoted as configuration work when the link needs them.',
      },
      {
        heading: 'Cape Town service area',
        body: 'On-site alignment is done in Cape Town and the Western Cape. Send both site addresses, or a description of the two ends, with your enquiry.',
      },
    ],
    pricingNote:
      'The quote depends on the path, the mounting height, and whether we supply the radios. We confirm line of sight assumptions before the installation is booked.',
    faqs: [
      {
        question: 'Do you need a clear line of sight?',
        answer:
          'Yes for a reliable bridge. We check the path first. If it is blocked, we will tell you rather than install radios that cannot align.',
      },
      {
        question: 'Is this the same as office Wi-Fi?',
        answer:
          'No. Point-to-point radios link two sites. Office and home coverage uses access points and is quoted as Wi-Fi installation.',
      },
      {
        question: 'Which radios do you use?',
        answer:
          'We select from outdoor wireless and CPE products in our catalogue, including Ubiquiti and MikroTik where they fit the distance. The exact model is named in the quote.',
      },
    ],
    whatsappMessage: "Hi BretuneTech! I'd like a quote for a point-to-point wireless link in Cape Town.",
    serviceArea: 'On-site point-to-point installation across Cape Town and the Western Cape.',
    relatedSlugs: ['wifi-installations', 'mikrotik-configuration', 'structured-cabling'],
    productLinks: [
      { href: '/products/category/wireless-solutions', label: 'Outdoor wireless bridges and CPEs' },
      { href: '/products/category/networking', label: 'Routers and switches' },
    ],
  }),
];

export function getServiceLanding(slug: string): ServiceLanding | undefined {
  return serviceLandings.find((s) => s.slug === slug);
}

export function getAllServiceSlugs(): string[] {
  return serviceLandings.map((s) => s.slug);
}
