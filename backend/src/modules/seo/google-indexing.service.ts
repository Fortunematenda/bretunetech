import { google } from 'googleapis';
import prisma from '../../lib/prisma';
import { logger } from '../../lib/logger';
import { seoService } from './seo.service';

const log = logger.child('GoogleIndexingService');

const IMPORTANT_PAGES = [
  { url: 'https://bretunetech.com', pageType: 'homepage' },
  { url: 'https://bretunetech.com/products', pageType: 'page' },
  { url: 'https://bretunetech.com/shop', pageType: 'page' },
  { url: 'https://bretunetech.com/contact', pageType: 'page' },
  { url: 'https://bretunetech.com/about', pageType: 'page' },
  { url: 'https://bretunetech.com/services', pageType: 'page' },
  { url: 'https://bretunetech.com/brands', pageType: 'page' },
  { url: 'https://bretunetech.com/bundles', pageType: 'page' },
  { url: 'https://bretunetech.com/quote', pageType: 'page' },
  { url: 'https://bretunetech.com/trusted-suppliers', pageType: 'page' },
];

const SITEMAP_URL = 'https://bretunetech.com/sitemap.xml';

const CHECKLIST_KEYS = [
  'gsc_sitemap_submitted',
  'gsc_sitemap_status_success',
  'gsc_robots_txt_working',
  'gsc_homepage_inspected',
  'gsc_products_inspected',
];

export class GoogleIndexingService {
  private auth: any | null = null;
  private siteUrl: string;
  private apiEnabled: boolean = false;

  constructor() {
    const clientEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
    const privateKey = process.env.GOOGLE_PRIVATE_KEY;
    this.siteUrl = process.env.GSC_SITE_URL || 'https://www.bretunetech.com';

    if (clientEmail && privateKey) {
      try {
        this.auth = new google.auth.JWT(
          clientEmail,
          undefined,
          privateKey.replace(/\\n/g, '\n'),
          ['https://www.googleapis.com/auth/webmasters.readonly']
        );
        this.apiEnabled = true;
        log.info('Google Search Console API enabled', { siteUrl: this.siteUrl });
      } catch (err: any) {
        log.error('Failed to initialize Google auth', { error: err.message });
        this.apiEnabled = false;
      }
    } else {
      log.warn('Google Search Console API not configured. Set GOOGLE_SERVICE_ACCOUNT_EMAIL and GOOGLE_PRIVATE_KEY.');
    }
  }

  private getSearchConsole() {
    if (!this.auth) return null;
    return google.searchconsole({ version: 'v1', auth: this.auth });
  }

  isApiEnabled() {
    return this.apiEnabled;
  }

  getSiteUrl() {
    return this.siteUrl;
  }

  getSitemapUrl() {
    return SITEMAP_URL;
  }

  getGscUrl(url?: string) {
    const base = 'https://search.google.com/search-console';
    const resource = encodeURIComponent(this.siteUrl);
    if (url) {
      return `${base}/inspect?resource_id=${resource}&url=${encodeURIComponent(url)}`;
    }
    return `${base}/settings?resource_id=${resource}`;
  }

  async inspectUrl(url: string, pageType: string = 'page', notes?: string) {
    const sc = this.getSearchConsole();
    let raw: any = null;

    if (sc) {
      try {
        const res = await sc.urlInspection.index.inspect({
          requestBody: {
            inspectionUrl: url,
            siteUrl: this.siteUrl,
          },
        });
        raw = (res as any).data;
      } catch (err: any) {
        log.error('URL Inspection API call failed', { url, error: err.message });
        throw new Error(`URL Inspection API failed: ${err.message}`);
      }
    }

    const inspection = raw?.inspectionResult;
    const indexStatus = inspection?.indexStatusResult || {};
    const mobileUsability = inspection?.mobileUsabilityResult || {};
    const richResults = inspection?.richResultsResult || {};

    const coverageState = indexStatus.coverageState || null;
    const issue = this.buildIssue(coverageState, indexStatus);
    const recommendedFix = this.buildRecommendedFix(coverageState, indexStatus);

    const payload: any = {
      url,
      pageType,
      status: indexStatus.verdict || null,
      coverageState,
      lastCrawlTime: indexStatus.lastCrawlTime ? new Date(indexStatus.lastCrawlTime) : null,
      googleCanonical: indexStatus.googleCanonical || null,
      userCanonical: indexStatus.userCanonical || null,
      robotsState: indexStatus.robotsInfo?.robotedStatus || null,
      pageFetchState: indexStatus.pageFetchState || null,
      mobileUsability: mobileUsability.verdict || null,
      richResults: richResults.verdict || null,
      issue,
      recommendedFix,
      notes: notes || null,
      checkedAt: new Date(),
      followUpAt: this.needsFollowUp(coverageState) ? new Date(Date.now() + 48 * 60 * 60 * 1000) : null,
    };

    if (pageType === 'product') {
      const product = await prisma.product.findFirst({
        where: { isActive: true, isDeleted: false, slug: this.extractSlug(url) },
        select: { seoScore: true },
      });
      payload.seoScore = product?.seoScore ?? null;
    }

    const record = await prisma.seoUrlInspection.upsert({
      where: { url },
      create: payload,
      update: payload,
    });

    return { record, raw, apiEnabled: this.apiEnabled };
  }

  async inspectUrls(urls: { url: string; pageType: string }[], notes?: string) {
    const results: any[] = [];
    for (const item of urls) {
      try {
        const result = await this.inspectUrl(item.url, item.pageType, notes);
        results.push({ url: item.url, ...result });
      } catch (err: any) {
        results.push({ url: item.url, error: err.message, apiEnabled: this.apiEnabled });
      }
      // Small delay to avoid hitting rate limits
      await new Promise((r) => setTimeout(r, 250));
    }
    return results;
  }

  async getDashboard() {
    const records = await prisma.seoUrlInspection.findMany();
    const lastChecked = records.length > 0
      ? records.map((r) => r.checkedAt).sort((a, b) => b.getTime() - a.getTime())[0]
      : null;

    const byState = (state: string) => records.filter((r) => r.coverageState === state).length;

    // Google Search Console API returns coverage states with spaces and prefixes
    return {
      indexedPages:
        byState('Indexed') +
        byState('IndexingAllowed') +
        byState('Submitted and indexed') +
        byState('Submitted and indexed, not canonical') +
        byState('Submitted, not canonical') +
        byState('Indexed, not submitted in sitemap') +
        byState('Duplicate, submitted URL not selected as canonical') +
        byState('Page is indexed'),
      notIndexedPages:
        byState('NotIndexed') +
        byState('IndexingDenied') +
        byState('URL is unknown to Google') +
        byState('Not indexed, noindex detected') +
        byState('Not indexed, blocked by robots.txt') +
        byState('Not indexed, alternative page with proper canonical tag') +
        byState('Not indexed, page fetch failed') +
        byState('Not indexed, excluded by page removal tool') +
        byState('Page is not indexed'),
      crawledButNotIndexed:
        byState('CrawledNotIndexed') +
        byState('Crawled - currently not indexed') +
        byState('Crawled but not indexed'),
      discoveredButNotIndexed:
        byState('DiscoveredNotIndexed') +
        byState('Discovered - currently not indexed') +
        byState('Discovered but not indexed'),
      duplicatePages:
        byState('Duplicate') +
        byState('Duplicate, Google chose different canonical than user') +
        byState('Duplicate, submitted URL not selected as canonical'),
      pagesWithErrors: records.filter((r) => this.isErrorState(r.coverageState)).length,
      totalInspected: records.length,
      lastChecked,
      apiEnabled: this.apiEnabled,
    };
  }

  async getImportantPages() {
    const records = await prisma.seoUrlInspection.findMany({
      where: { url: { in: IMPORTANT_PAGES.map((p) => p.url) } },
    });
    const map = new Map(records.map((r) => [r.url, r]));

    return IMPORTANT_PAGES.map((p) => {
      const record = map.get(p.url);
      return {
        url: p.url,
        pageType: p.pageType,
        status: record?.status || null,
        coverageState: record?.coverageState || null,
        lastCrawlTime: record?.lastCrawlTime || null,
        googleCanonical: record?.googleCanonical || null,
        userCanonical: record?.userCanonical || null,
        robotsState: record?.robotsState || null,
        pageFetchState: record?.pageFetchState || null,
        mobileUsability: record?.mobileUsability || null,
        richResults: record?.richResults || null,
        issue: record?.issue || null,
        recommendedFix: record?.recommendedFix || null,
        checkedAt: record?.checkedAt || null,
        needsFollowUp: record?.followUpAt ? record.followUpAt <= new Date() : false,
        gscUrl: this.getGscUrl(p.url),
      };
    });
  }

  async getPriorityProducts(limit: number = 20) {
    const products = await prisma.product.findMany({
      where: { isActive: true, isDeleted: false },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        stockQuantity: true,
        isFeatured: true,
        costPrice: true,
        sellingPrice: true,
        seoScore: true,
        images: { select: { id: true }, take: 1 },
      },
    });

    const visits = await prisma.websiteVisit.groupBy({
      by: ['productId'],
      where: { productId: { not: null } },
      _count: { productId: true },
    });
    const visitMap = new Map(visits.map((v) => [v.productId, v._count.productId]));

    const scored = products.map((p) => {
      const cleanDesc = (p.description || '').replace(/<[^>]*>/g, '').trim();
      const views = visitMap.get(p.id) || 0;
      const margin = p.sellingPrice - p.costPrice;
      const marginRatio = p.sellingPrice > 0 ? margin / p.sellingPrice : 0;

      let score = 0;
      if (views > 0) score += Math.min(30, Math.round(Math.log10(views + 1) * 10));
      if (p.stockQuantity > 0) score += 10;
      if (cleanDesc.length >= 100) score += 10;
      if (p.images.length > 0) score += 10;
      if (p.isFeatured) score += 20;
      score += Math.round(marginRatio * 20);
      score += Math.round((p.seoScore || 0) / 10);

      const url = `https://www.bretunetech.com/products/${p.slug}`;
      return { ...p, url, views, margin, priorityScore: score };
    });

    scored.sort((a, b) => b.priorityScore - a.priorityScore);
    return scored.slice(0, limit);
  }

  async getPriorityProductInspections(limit: number = 20) {
    const products = await this.getPriorityProducts(limit);
    const urls = products.map((p) => p.url);
    const records = await prisma.seoUrlInspection.findMany({ where: { url: { in: urls } } });
    const map = new Map(records.map((r) => [r.url, r]));

    return products.map((p) => {
      const record = map.get(p.url);
      return {
        ...p,
        status: record?.status || null,
        coverageState: record?.coverageState || null,
        lastCrawlTime: record?.lastCrawlTime || null,
        googleCanonical: record?.googleCanonical || null,
        userCanonical: record?.userCanonical || null,
        robotsState: record?.robotsState || null,
        pageFetchState: record?.pageFetchState || null,
        mobileUsability: record?.mobileUsability || null,
        richResults: record?.richResults || null,
        issue: record?.issue || null,
        recommendedFix: record?.recommendedFix || null,
        checkedAt: record?.checkedAt || null,
        needsFollowUp: record?.followUpAt ? record.followUpAt <= new Date() : false,
        gscUrl: this.getGscUrl(p.url),
      };
    });
  }

  async getFollowUps() {
    const now = new Date();
    const records = await prisma.seoUrlInspection.findMany({
      where: { followUpAt: { lte: now } },
      orderBy: { followUpAt: 'asc' },
    });
    return records.map((r) => ({
      ...r,
      gscUrl: this.getGscUrl(r.url),
    }));
  }

  async updateNotes(url: string, notes: string) {
    return prisma.seoUrlInspection.update({
      where: { url },
      data: { notes },
    });
  }

  async dismissFollowUp(url: string) {
    return prisma.seoUrlInspection.update({
      where: { url },
      data: { followUpAt: null },
    });
  }

  async getHealthReport() {
    const records = await prisma.seoUrlInspection.findMany({
      orderBy: { checkedAt: 'desc' },
    });

    return records.map((r) => ({
      url: r.url,
      pageType: r.pageType,
      seoScore: r.seoScore,
      indexedStatus: r.coverageState || 'Not checked',
      lastChecked: r.checkedAt,
      issue: r.issue,
      recommendedFix: r.recommendedFix,
    }));
  }

  async getChecklist() {
    const settings = await prisma.setting.findMany({
      where: { key: { in: CHECKLIST_KEYS } },
    });
    const map = new Map(settings.map((s) => [s.key, s.value === 'true']));
    const inspections = await prisma.seoUrlInspection.findMany();
    const homepageInspected = inspections.some((r) => r.url === 'https://www.bretunetech.com');
    const productInspected = inspections.some((r) => r.pageType === 'product');

    return {
      sitemapUrl: SITEMAP_URL,
      sitemapSubmitted: map.get('gsc_sitemap_submitted') ?? false,
      sitemapStatusSuccess: map.get('gsc_sitemap_status_success') ?? false,
      robotsTxtWorking: map.get('gsc_robots_txt_working') ?? false,
      homepageInspected: map.get('gsc_homepage_inspected') ?? homepageInspected,
      productsInspected: map.get('gsc_products_inspected') ?? productInspected,
    };
  }

  async updateChecklist(data: Record<string, boolean>) {
    const updates = Object.entries(data)
      .filter(([key]) => CHECKLIST_KEYS.includes(key))
      .map(([key, value]) =>
        prisma.setting.upsert({
          where: { key },
          create: { key, value: value ? 'true' : 'false', group: 'seo' },
          update: { value: value ? 'true' : 'false' },
        })
      );
    await prisma.$transaction(updates);
    return this.getChecklist();
  }

  async generateImageAltText() {
    const images = await prisma.productImage.findMany({
      where: { altText: null },
      include: { product: { select: { name: true, brand: { select: { name: true } } } } },
    });

    let updated = 0;
    let errors = 0;
    for (const img of images) {
      try {
        const brand = img.product.brand?.name ? `${img.product.brand.name} ` : '';
        const alt = `${brand}${img.product.name}`.trim();
        await prisma.productImage.update({
          where: { id: img.id },
          data: { altText: alt },
        });
        updated++;
      } catch (err: any) {
        errors++;
        log.error('Failed to generate alt text', { imageId: img.id, error: err.message });
      }
    }
    return { updated, errors, total: images.length };
  }

  async buildRelatedProductLinks() {
    const products = await prisma.product.findMany({
      where: { isActive: true, isDeleted: false },
      select: {
        id: true,
        name: true,
        categoryId: true,
        brandId: true,
        sellingPrice: true,
      },
    });

    const productMap = new Map(products.map((p) => [p.id, p]));
    let created = 0;
    let errors = 0;

    await prisma.relatedProduct.deleteMany({});

    for (const product of products) {
      try {
        const candidates = products
          .filter((p) => p.id !== product.id && (p.categoryId === product.categoryId || p.brandId === product.brandId))
          .map((p) => ({
            ...p,
            score:
              (p.categoryId === product.categoryId ? 10 : 0) +
              (p.brandId === product.brandId ? 10 : 0) +
              (1 - Math.min(1, Math.abs(p.sellingPrice - product.sellingPrice) / Math.max(product.sellingPrice, 1))) * 10,
          }))
          .sort((a, b) => b.score - a.score)
          .slice(0, 8);

        const links = candidates.map((c) => ({
          productId: product.id,
          relatedProductId: c.id,
          score: Math.round(c.score),
        }));

        if (links.length > 0) {
          await prisma.relatedProduct.createMany({ data: links, skipDuplicates: true });
          created += links.length;
        }
      } catch (err: any) {
        errors++;
        log.error('Failed to build related links', { productId: product.id, error: err.message });
      }
    }

    return { created, errors, products: products.length };
  }

  async generateAllProductSchemas() {
    const products = await prisma.product.findMany({
      where: { isActive: true, isDeleted: false },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        sku: true,
        sellingPrice: true,
        stockQuantity: true,
        metaTitle: true,
        metaDescription: true,
        images: { select: { url: true, altText: true } },
        brand: { select: { name: true } },
        category: { select: { name: true } },
      },
    });

    let updated = 0;
    let errors = 0;
    for (const p of products) {
      try {
        const seo = seoService.generateSeoForProduct({
          name: p.name,
          description: p.description,
          brand: p.brand,
          category: p.category,
        });
        const schema = {
          '@context': 'https://schema.org',
          '@type': 'Product',
          name: p.name,
          description: p.metaDescription || seo.metaDescription,
          image: p.images.map((img) => img.url),
          sku: p.sku || undefined,
          brand: p.brand ? { '@type': 'Brand', name: p.brand.name } : undefined,
          category: p.category?.name,
          url: `https://www.bretunetech.com/products/${p.slug}`,
          offers: {
            '@type': 'Offer',
            price: p.sellingPrice,
            priceCurrency: 'ZAR',
            availability:
              p.stockQuantity > 0
                ? 'https://schema.org/InStock'
                : 'https://schema.org/OutOfStock',
            url: `https://www.bretunetech.com/products/${p.slug}`,
          },
        };
        await prisma.product.update({
          where: { id: p.id },
          data: { schemaJsonLd: JSON.stringify(schema) },
        });
        updated++;
      } catch (err: any) {
        errors++;
        log.error('Failed to generate product schema', { productId: p.id, error: err.message });
      }
    }
    return { updated, errors, total: products.length };
  }

  private extractSlug(url: string) {
    const match = url.match(/\/products\/([^/?#]+)/);
    return match ? match[1] : '';
  }

  private needsFollowUp(coverageState: string | null) {
    if (!coverageState) return true;
    const needs = [
      'NotIndexed',
      'CrawledNotIndexed',
      'DiscoveredNotIndexed',
      'PageNotFound',
      'ServerError',
      'RedirectError',
      'BlockedByRobots',
      'BlockedDueToOther4xxIssue',
      'BlockedDueToAccessForbidden',
      'Soft404',
    ];
    return needs.includes(coverageState);
  }

  private isErrorState(coverageState: string | null) {
    if (!coverageState) return false;
    const errorStates = [
      'PageNotFound',
      'ServerError',
      'RedirectError',
      'BlockedByRobots',
      'BlockedDueToOther4xxIssue',
      'BlockedDueToAccessForbidden',
      'Soft404',
    ];
    return errorStates.includes(coverageState);
  }

  private buildIssue(coverageState: string | null, indexStatus: any) {
    if (!coverageState) return 'Not inspected yet';
    if (coverageState === 'Indexed') return null;
    if (coverageState === 'NotIndexed') return 'URL is not indexed by Google';
    if (coverageState === 'CrawledNotIndexed') return 'Google crawled but chose not to index';
    if (coverageState === 'DiscoveredNotIndexed') return 'URL discovered but not yet crawled';
    if (coverageState === 'Duplicate') return 'Duplicate or canonical issue';
    if (this.isErrorState(coverageState)) return `Coverage issue: ${coverageState}`;
    return indexStatus?.verdict || 'Unknown status';
  }

  private buildRecommendedFix(coverageState: string | null, indexStatus: any) {
    if (!coverageState || coverageState === 'Indexed') return null;
    if (coverageState === 'NotIndexed') {
      return 'Improve uniqueness, internal links, and request indexing via Search Console.';
    }
    if (coverageState === 'CrawledNotIndexed') {
      return 'Add more unique content, improve page quality, and update internal links.';
    }
    if (coverageState === 'DiscoveredNotIndexed') {
      return 'Submit sitemap, improve crawl budget, and ensure page quality is high.';
    }
    if (coverageState === 'Duplicate') {
      return 'Review canonical tags and consolidate duplicate content.';
    }
    if (coverageState === 'BlockedByRobots') {
      return 'Check robots.txt and meta robots tags blocking indexing.';
    }
    if (coverageState === 'Soft404') {
      return 'Return proper 404 or add meaningful content.';
    }
    if (this.isErrorState(coverageState)) {
      return 'Fix technical errors (redirects, server errors, forbidden access).';
    }
    return 'Inspect URL in Search Console for details.';
  }
}

export const googleIndexingService = new GoogleIndexingService();
