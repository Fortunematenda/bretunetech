import prisma from '../../lib/prisma';
import crypto from 'crypto';

// Helper to hash IP addresses for privacy
function hashIp(ip: string): string {
  return crypto.createHash('sha256').update(ip + 'bretunetech-salt').digest('hex').substring(0, 16);
}

// Helper to get IP-based geolocation (fallback when Cloudflare headers not available)
async function getIpLocation(ip: string): Promise<{ country: string; city: string } | null> {
  if (!ip || ip === '::1' || ip === '127.0.0.1') {
    return null; // Skip localhost
  }

  try {
    const response = await fetch(`http://ip-api.com/json/${ip}`);
    const data: any = await response.json();

    if (data.status === 'success') {
      return {
        country: data.country || '',
        city: data.city || '',
      };
    }
    return null;
  } catch (error) {
    return null;
  }
}

// Helper to parse user agent for device type and browser
function parseUserAgent(ua: string): { deviceType: string; browser: string } {
  let deviceType = 'desktop';
  let browser = 'Unknown';

  if (/mobile|android|iphone|ipod/i.test(ua)) deviceType = 'mobile';
  else if (/tablet|ipad/i.test(ua)) deviceType = 'tablet';

  if (/firefox/i.test(ua)) browser = 'Firefox';
  else if (/edg/i.test(ua)) browser = 'Edge';
  else if (/chrome/i.test(ua)) browser = 'Chrome';
  else if (/safari/i.test(ua)) browser = 'Safari';
  else if (/opera|opr/i.test(ua)) browser = 'Opera';

  return { deviceType, browser };
}

export const analyticsService = {
  // Track a page visit
  async track(data: {
    visitorId: string;
    sessionId: string;
    ip?: string;
    userAgent?: string;
    pageUrl: string;
    pageTitle?: string;
    referrer?: string;
    productId?: string;
    country?: string;
    city?: string;
    browser?: string;
    deviceType?: string;
  }) {
    const { deviceType: parsedDeviceType, browser: parsedBrowser } = parseUserAgent(data.userAgent || '');
    const deviceType = data.deviceType || parsedDeviceType;
    const browser = data.browser || parsedBrowser;
    const ipHash = data.ip ? hashIp(data.ip) : null;

    // Deduplicate: don't record same page in same session within 30 seconds
    const thirtySecondsAgo = new Date(Date.now() - 30000);
    const existing = await prisma.websiteVisit.findFirst({
      where: {
        sessionId: data.sessionId,
        pageUrl: data.pageUrl,
        createdAt: { gte: thirtySecondsAgo },
      },
    });

    if (existing) return existing;

    return prisma.websiteVisit.create({
      data: {
        visitorId: data.visitorId,
        sessionId: data.sessionId,
        ipHash,
        ipAddress: data.ip,
        userAgent: data.userAgent?.substring(0, 500),
        pageUrl: data.pageUrl,
        pageTitle: data.pageTitle,
        referrer: data.referrer,
        deviceType,
        browser,
        country: data.country,
        city: data.city,
        productId: data.productId,
      },
    });
  },

  // Get summary stats
  async getSummary() {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekStart = new Date(todayStart.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthStart = new Date(todayStart.getTime() - 30 * 24 * 60 * 60 * 1000);

    const [
      visitsToday,
      visitsWeek,
      visitsMonth,
      uniqueToday,
      pageViewsToday,
      productViewsToday,
    ] = await Promise.all([
      prisma.websiteVisit.count({ where: { createdAt: { gte: todayStart } } }),
      prisma.websiteVisit.count({ where: { createdAt: { gte: weekStart } } }),
      prisma.websiteVisit.count({ where: { createdAt: { gte: monthStart } } }),
      prisma.websiteVisit.groupBy({
        by: ['visitorId'],
        where: { createdAt: { gte: todayStart } },
      }).then(r => r.length),
      prisma.websiteVisit.count({ where: { createdAt: { gte: todayStart } } }),
      prisma.websiteVisit.count({ where: { createdAt: { gte: todayStart }, productId: { not: null } } }),
    ]);

    // Top product today
    const topProductToday = await prisma.websiteVisit.groupBy({
      by: ['productId'],
      where: { createdAt: { gte: todayStart }, productId: { not: null } },
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
      take: 1,
    });

    let topProductName = null;
    if (topProductToday.length > 0 && topProductToday[0].productId) {
      const product = await prisma.product.findUnique({
        where: { id: topProductToday[0].productId },
        select: { name: true },
      });
      topProductName = product?.name || null;
    }

    // Most visited page today
    const topPageToday = await prisma.websiteVisit.groupBy({
      by: ['pageUrl'],
      where: { createdAt: { gte: todayStart } },
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
      take: 1,
    });

    return {
      visitsToday,
      visitsWeek,
      visitsMonth,
      uniqueVisitorsToday: uniqueToday,
      pageViewsToday,
      productViewsToday,
      topProductToday: topProductName || 'N/A',
      topProductViews: topProductToday[0]?._count?.id || 0,
      mostVisitedPage: topPageToday[0]?.pageUrl || 'N/A',
      mostVisitedPageViews: topPageToday[0]?._count?.id || 0,
    };
  },

  // Get top pages
  async getTopPages(days: number = 7) {
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    const results = await prisma.websiteVisit.groupBy({
      by: ['pageUrl'],
      where: { createdAt: { gte: since } },
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
      take: 20,
    });

    return results.map(r => ({ pageUrl: r.pageUrl, views: r._count.id }));
  },

  // Get top products
  async getTopProducts(days: number = 7) {
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    const results = await prisma.websiteVisit.groupBy({
      by: ['productId'],
      where: { createdAt: { gte: since }, productId: { not: null } },
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
      take: 20,
    });

    // Fetch product names
    const productIds = results.map(r => r.productId!).filter(Boolean);
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
      select: { id: true, name: true, sku: true },
    });

    const productMap = new Map(products.map(p => [p.id, p]));
    return results.map(r => ({
      productId: r.productId,
      name: productMap.get(r.productId!)?.name || 'Unknown',
      sku: productMap.get(r.productId!)?.sku || '',
      views: r._count.id,
    }));
  },

  // Get traffic sources
  async getTrafficSources(days: number = 7) {
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    const results = await prisma.websiteVisit.groupBy({
      by: ['referrer'],
      where: { createdAt: { gte: since }, referrer: { not: null } },
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
      take: 20,
    });

    return results.map(r => ({
      source: r.referrer || 'Direct',
      visits: r._count.id,
    }));
  },

  // Get device breakdown
  async getDeviceBreakdown(days: number = 7) {
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    const results = await prisma.websiteVisit.groupBy({
      by: ['deviceType'],
      where: { createdAt: { gte: since } },
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
    });

    return results.map(r => ({
      device: r.deviceType || 'Unknown',
      count: r._count.id,
    }));
  },

  // Get visitors over time (daily counts)
  async getVisitorsOverTime(days: number = 30) {
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const visits = await prisma.$queryRawUnsafe<{ date: string; count: bigint }[]>(
      `SELECT DATE("createdAt") as date, COUNT(*) as count
       FROM website_visits
       WHERE "createdAt" >= $1
       GROUP BY DATE("createdAt")
       ORDER BY date ASC`,
      since
    );

    return visits.map(v => ({
      date: v.date,
      count: Number(v.count),
    }));
  },

  // Get browser breakdown
  async getBrowserBreakdown(days: number = 7) {
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    const results = await prisma.websiteVisit.groupBy({
      by: ['browser'],
      where: { createdAt: { gte: since } },
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
    });

    return results.map(r => ({
      browser: r.browser || 'Unknown',
      count: r._count.id,
    }));
  },

  // Get product-specific analytics
  async getProductAnalytics(productId: string) {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekStart = new Date(todayStart.getTime() - 7 * 24 * 60 * 60 * 1000);

    const [totalViews, viewsToday, viewsWeek] = await Promise.all([
      prisma.websiteVisit.count({ where: { productId } }),
      prisma.websiteVisit.count({ where: { productId, createdAt: { gte: todayStart } } }),
      prisma.websiteVisit.count({ where: { productId, createdAt: { gte: weekStart } } }),
    ]);

    return { totalViews, viewsToday, viewsWeek };
  },

  // Customer analytics
  async getCustomerSummary() {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekStart = new Date(todayStart.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthStart = new Date(todayStart.getTime() - 30 * 24 * 60 * 60 * 1000);

    const [
      newToday,
      newThisWeek,
      newThisMonth,
      totalCustomers,
      customersWithOrders,
    ] = await Promise.all([
      prisma.user.count({ where: { role: 'CUSTOMER', createdAt: { gte: todayStart } } }),
      prisma.user.count({ where: { role: 'CUSTOMER', createdAt: { gte: weekStart } } }),
      prisma.user.count({ where: { role: 'CUSTOMER', createdAt: { gte: monthStart } } }),
      prisma.user.count({ where: { role: 'CUSTOMER' } }),
      prisma.user.count({ where: { role: 'CUSTOMER', orders: { some: {} } } }),
    ]);

    return {
      newToday,
      newThisWeek,
      newThisMonth,
      totalCustomers,
      customersWithOrders,
      customersWithoutOrders: totalCustomers - customersWithOrders,
    };
  },

  // Detailed visitors list
  async getVisitorsList(days: number = 1) {
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    const visits = await prisma.websiteVisit.findMany({
      where: { createdAt: { gte: since } },
      orderBy: { createdAt: 'desc' },
      take: 200,
      select: {
        id: true,
        visitorId: true,
        sessionId: true,
        createdAt: true,
        country: true,
        city: true,
        browser: true,
        deviceType: true,
        referrer: true,
        pageUrl: true,
        ipAddress: true,
        userAgent: true,
      },
    });

    // Group by session to get pages viewed count
    const sessionMap = new Map<string, number>();
    visits.forEach(v => {
      sessionMap.set(v.sessionId, (sessionMap.get(v.sessionId) || 0) + 1);
    });

    return visits.map(v => ({
      ...v,
      pagesViewed: sessionMap.get(v.sessionId) || 1,
    }));
  },

  // Hourly visitors for today
  async getHourlyVisitors() {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const visits = await prisma.$queryRawUnsafe<{ hour: number; count: bigint }[]>(
      `SELECT EXTRACT(HOUR FROM "createdAt") as hour, COUNT(*) as count
       FROM website_visits
       WHERE "createdAt" >= $1
       GROUP BY EXTRACT(HOUR FROM "createdAt")
       ORDER BY hour ASC`,
      todayStart
    );

    // Fill all 24 hours
    const hourly = Array.from({ length: 24 }, (_, i) => ({ hour: i, count: 0 }));
    visits.forEach(v => {
      const h = Number(v.hour);
      if (hourly[h]) hourly[h].count = Number(v.count);
    });
    return hourly;
  },

  // Detailed page views with title info
  async getDetailedPageViews(days: number = 7) {
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    
    const results = await prisma.websiteVisit.groupBy({
      by: ['pageUrl', 'pageTitle'],
      where: { createdAt: { gte: since } },
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
      take: 50,
    });

    // Get unique visitors per page
    const uniquePerPage = await Promise.all(
      results.slice(0, 20).map(async (r) => {
        const unique = await prisma.websiteVisit.groupBy({
          by: ['visitorId'],
          where: { pageUrl: r.pageUrl, createdAt: { gte: since } },
        });
        return { pageUrl: r.pageUrl, uniqueVisitors: unique.length };
      })
    );

    const uniqueMap = new Map(uniquePerPage.map(u => [u.pageUrl, u.uniqueVisitors]));

    return results.map(r => ({
      pageUrl: r.pageUrl,
      pageTitle: r.pageTitle || r.pageUrl,
      views: r._count.id,
      uniqueVisitors: uniqueMap.get(r.pageUrl) || 0,
    }));
  },

  // Detailed product views with orders data
  async getDetailedProductViews(days: number = 7) {
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const weekStart = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const results = await prisma.websiteVisit.groupBy({
      by: ['productId'],
      where: { createdAt: { gte: since }, productId: { not: null } },
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
      take: 50,
    });

    const productIds = results.map(r => r.productId!).filter(Boolean);
    
    const [products, viewsToday, viewsWeek, orderCounts] = await Promise.all([
      prisma.product.findMany({
        where: { id: { in: productIds } },
        select: { id: true, name: true, sku: true, slug: true },
      }),
      prisma.websiteVisit.groupBy({
        by: ['productId'],
        where: { productId: { in: productIds }, createdAt: { gte: todayStart } },
        _count: { id: true },
      }),
      prisma.websiteVisit.groupBy({
        by: ['productId'],
        where: { productId: { in: productIds }, createdAt: { gte: weekStart } },
        _count: { id: true },
      }),
      prisma.orderItem.groupBy({
        by: ['productId'],
        where: { productId: { in: productIds } },
        _count: { id: true },
      }),
    ]);

    const productMap = new Map(products.map(p => [p.id, p]));
    const todayMap = new Map(viewsToday.map(v => [v.productId, v._count.id]));
    const weekMap = new Map(viewsWeek.map(v => [v.productId, v._count.id]));
    const orderMap = new Map(orderCounts.map(o => [o.productId, o._count.id]));

    return results.map(r => {
      const totalViews = r._count.id;
      const orders = orderMap.get(r.productId!) || 0;
      return {
        productId: r.productId,
        name: productMap.get(r.productId!)?.name || 'Unknown',
        sku: productMap.get(r.productId!)?.sku || '',
        slug: productMap.get(r.productId!)?.slug || '',
        views: totalViews,
        viewsToday: todayMap.get(r.productId!) || 0,
        viewsWeek: weekMap.get(r.productId!) || 0,
        orders,
        conversionRate: totalViews > 0 ? ((orders / totalViews) * 100).toFixed(1) : '0.0',
      };
    });
  },

  // Unique visitors detail
  async getUniqueVisitorsDetail(days: number = 7) {
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const visitors = await prisma.$queryRawUnsafe<any[]>(
      `SELECT "visitorId",
              MIN("createdAt") as first_visit,
              MAX("createdAt") as last_visit,
              COUNT(*) as pages_viewed,
              COUNT(DISTINCT "productId") FILTER (WHERE "productId" IS NOT NULL) as products_viewed,
              MAX("country") as country,
              MAX("city") as city,
              MAX("browser") as browser,
              MAX("deviceType") as "deviceType",
              MAX("ipAddress") as "ipAddress",
              MAX("userAgent") as "userAgent"
       FROM website_visits
       WHERE "createdAt" >= $1
       GROUP BY "visitorId"
       ORDER BY MAX("createdAt") DESC
       LIMIT 100`,
      since
    );

    return visitors.map(v => ({
      visitorId: v.visitorId,
      firstVisit: v.first_visit,
      lastVisit: v.last_visit,
      pagesViewed: Number(v.pages_viewed),
      productsViewed: Number(v.products_viewed),
      country: v.country,
      city: v.city,
      browser: v.browser,
      deviceType: v.deviceType,
      ipAddress: v.ipAddress,
      userAgent: v.userAgent,
    }));
  },

  // Returning vs new visitors
  async getNewVsReturning(days: number = 7) {
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    // Visitors who have visits before the period
    const allVisitors = await prisma.websiteVisit.groupBy({
      by: ['visitorId'],
      where: { createdAt: { gte: since } },
    });

    const returningCount = await prisma.$queryRawUnsafe<{ count: bigint }[]>(
      `SELECT COUNT(DISTINCT v1."visitorId") as count
       FROM website_visits v1
       WHERE v1."createdAt" >= $1
       AND EXISTS (
         SELECT 1 FROM website_visits v2
         WHERE v2."visitorId" = v1."visitorId"
         AND v2."createdAt" < $1
       )`,
      since
    );

    const total = allVisitors.length;
    const returning = Number(returningCount[0]?.count || 0);
    return { total, newVisitors: total - returning, returning };
  },

  // Weekly breakdown (daily for this week)
  async getWeeklyBreakdown() {
    const weekStart = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const [visits, pageViews, productViews] = await Promise.all([
      prisma.$queryRawUnsafe<{ date: string; count: bigint }[]>(
        `SELECT DATE("createdAt") as date, COUNT(DISTINCT "visitorId") as count
         FROM website_visits WHERE "createdAt" >= $1
         GROUP BY DATE("createdAt") ORDER BY date ASC`,
        weekStart
      ),
      prisma.$queryRawUnsafe<{ date: string; count: bigint }[]>(
        `SELECT DATE("createdAt") as date, COUNT(*) as count
         FROM website_visits WHERE "createdAt" >= $1
         GROUP BY DATE("createdAt") ORDER BY date ASC`,
        weekStart
      ),
      prisma.$queryRawUnsafe<{ date: string; count: bigint }[]>(
        `SELECT DATE("createdAt") as date, COUNT(*) as count
         FROM website_visits WHERE "createdAt" >= $1 AND "productId" IS NOT NULL
         GROUP BY DATE("createdAt") ORDER BY date ASC`,
        weekStart
      ),
    ]);

    return {
      visitors: visits.map(v => ({ date: v.date, count: Number(v.count) })),
      pageViews: pageViews.map(v => ({ date: v.date, count: Number(v.count) })),
      productViews: productViews.map(v => ({ date: v.date, count: Number(v.count) })),
    };
  },

  // Live visitors (active in last 2 minutes)
  async getLiveVisitors() {
    const twoMinAgo = new Date(Date.now() - 2 * 60 * 1000);

    const live = await prisma.websiteVisit.findMany({
      where: { createdAt: { gte: twoMinAgo } },
      orderBy: { createdAt: 'desc' },
      distinct: ['sessionId'],
      select: {
        sessionId: true,
        pageUrl: true,
        productId: true,
        createdAt: true,
      },
    });

    return { count: live.length, sessions: live.slice(0, 20) };
  },

  // New customers detailed list
  async getNewCustomersDetailed(days: number = 1) {
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const customers = await prisma.user.findMany({
      where: { role: 'CUSTOMER', createdAt: { gte: since } },
      orderBy: { createdAt: 'desc' },
      take: 100,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        createdAt: true,
        _count: { select: { orders: true } },
        orders: { select: { totalPrice: true } },
      },
    });

    return customers.map(c => ({
      id: c.id,
      firstName: c.firstName,
      lastName: c.lastName,
      email: c.email,
      phone: c.phone,
      createdAt: c.createdAt,
      orderCount: c._count.orders,
      totalSpend: c.orders.reduce((sum, o) => sum + o.totalPrice, 0),
      status: c._count.orders > 0 ? 'Active' : 'New',
    }));
  },

  // Customer registrations over time
  async getCustomerRegistrations(days: number = 30) {
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const registrations = await prisma.$queryRawUnsafe<{ date: string; count: bigint }[]>(
      `SELECT DATE("createdAt") as date, COUNT(*) as count
       FROM users WHERE role = 'CUSTOMER' AND "createdAt" >= $1
       GROUP BY DATE("createdAt") ORDER BY date ASC`,
      since
    );

    return registrations.map(r => ({ date: r.date, count: Number(r.count) }));
  },

  // Recent customers
  async getRecentCustomers(limit: number = 10) {
    const customers = await prisma.user.findMany({
      where: { role: 'CUSTOMER' },
      orderBy: { createdAt: 'desc' },
      take: limit,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        createdAt: true,
        _count: { select: { orders: true } },
        orders: {
          select: { totalPrice: true },
        },
      },
    });

    return customers.map(c => ({
      id: c.id,
      firstName: c.firstName,
      lastName: c.lastName,
      email: c.email,
      phone: c.phone,
      createdAt: c.createdAt,
      orderCount: c._count.orders,
      totalSpend: c.orders.reduce((sum, o) => sum + o.totalPrice, 0),
    }));
  },
};
