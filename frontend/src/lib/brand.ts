export const brand = {
  name: 'BretuneTech',
  fullName: 'Bretune Technologies (Pty) Ltd',
  shortName: 'BretuneTech',
  tagline: 'Enterprise Technology. Reliable Connectivity.',
  domain: 'bretunetech.com',
  website: 'https://bretunetech.com',
  storeUrl: 'https://bretunetech.com',
  adminUrl: 'https://admin.bretunetech.com',
  apiUrl: 'https://bretunetech.com/api',
  email: 'sales@bretunetech.com',
  emailSales: 'sales@bretunetech.com',
  emailSupport: 'support@bretunetech.com',
  emailAccounts: 'accounts@bretunetech.com',
  emailFortune: 'fortune@bretunetech.com',
  phone: '+27 61 268 5933',
  whatsapp: '27612685933',
  location: 'Cape Town, South Africa',
  currency: 'ZAR',
  vatRate: 0,
};

export const serviceCatalog = [
  {
    slug: 'wifi-installations',
    name: 'Wi-Fi Installations',
    description:
      'Site survey, access-point placement, and controller setup for reliable coverage in offices, warehouses, and homes. We plan channels and power levels so roaming stays stable — ideal for Cape Town SMEs and multi-floor sites across the Western Cape.',
    audience: 'Offices, retail, and homes needing dependable wireless coverage',
    process: 'Survey → design → install → validate coverage → hand over credentials',
  },
  {
    slug: 'fibre-installations',
    name: 'Fibre Installations',
    description:
      'Structured fibre and last-mile handoffs with clean rack dressing, labelling, and throughput checks. We coordinate ONT/router integration so your LAN is ready for business-grade internet without messy temporary cabling.',
    audience: 'Businesses upgrading from copper or expanding campus links',
    process: 'Scope path → terminate & dress → light & test → document ports',
  },
  {
    slug: 'cctv-setup',
    name: 'CCTV Setup',
    description:
      'Camera layout, NVR/VMS configuration, and secure remote viewing for shops, yards, and offices. We focus on usable footage, sensible retention, and alerting — not camera count for its own sake.',
    audience: 'Retail, warehouses, and properties needing monitored surveillance',
    process: 'Risk walkthrough → camera plan → install → remote access setup',
  },
  {
    slug: 'mikrotik-configuration',
    name: 'MikroTik Configuration',
    description:
      'RouterOS setup for routing, VLANs, traffic shaping, VPN, failover, and firewall hardening. Suited to ISPs, installers, and businesses that need predictable WAN behaviour and clear documentation.',
    audience: 'Networks needing MikroTik routers, VPNs, or dual-WAN failover',
    process: 'Requirements → config build → cutover → backup & docs',
  },
  {
    slug: 'remote-support',
    name: 'Remote Support',
    description:
      'Fast remote troubleshooting for outages, Wi-Fi issues, and router misconfigurations. We jump on securely, stabilise the incident, and leave you with clear next steps — available nationwide when on-site is not required.',
    audience: 'Teams that need quick help without waiting for a truck roll',
    process: 'Intake → remote diagnose → fix or escalate → summary',
  },
  {
    slug: 'network-troubleshooting',
    name: 'Network Troubleshooting',
    description:
      'Root-cause diagnostics for packet loss, latency, DNS failures, and flaky links. We measure first, then fix — useful when “the Wi-Fi is slow” has already burned hours without a clear answer.',
    audience: 'Sites with intermittent connectivity or unexplained performance drops',
    process: 'Baseline → isolate layer → remediate → verify with metrics',
  },
];
