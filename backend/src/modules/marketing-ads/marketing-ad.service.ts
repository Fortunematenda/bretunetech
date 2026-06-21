import prisma from '../../lib/prisma';
import { CreateMarketingAdDto, UpdateMarketingAdDto, ListMarketingAdsDto, GenerateMarketingCopyDto } from './marketing-ad.dto';
import { NotFoundError } from '../../lib/errors';
import { logger } from '../../lib/logger';

const log = logger.child('MarketingAdService');

export class MarketingAdService {
  async listMarketingAds(filters: ListMarketingAdsDto) {
    const { page = 1, limit = 20, template, isActive, search } = filters;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (template) where.template = template;
    if (isActive !== undefined) where.isActive = isActive;
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { headline: { contains: search, mode: 'insensitive' } },
        { productName: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [ads, total] = await Promise.all([
      prisma.marketingAd.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.marketingAd.count({ where }),
    ]);

    // Transform flat fields to nested product structure
    const transformedAds = ads.map(ad => ({
      ...ad,
      product: {
        productId: ad.productId,
        productName: ad.productName,
        productImage: ad.productImage,
        price: ad.price,
        salePrice: ad.salePrice,
        brand: ad.brand,
        description: ad.description,
      },
    }));

    return {
      ads: transformedAds,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async getMarketingAdById(id: string) {
    const ad = await prisma.marketingAd.findUnique({
      where: { id },
    });
    if (!ad) throw new NotFoundError('Marketing Ad');
    
    // Transform flat fields to nested product structure
    return {
      ...ad,
      product: {
        productId: ad.productId,
        productName: ad.productName,
        productImage: ad.productImage,
        price: ad.price,
        salePrice: ad.salePrice,
        brand: ad.brand,
        description: ad.description,
      },
    };
  }

  async createMarketingAd(dto: CreateMarketingAdDto) {
    const ad = await prisma.marketingAd.create({
      data: {
        title: dto.title,
        template: dto.template,
        productId: dto.product.productId,
        productName: dto.product.productName,
        productImage: dto.product.productImage,
        price: dto.product.price,
        salePrice: dto.product.salePrice,
        brand: dto.product.brand,
        description: dto.product.description,
        headline: dto.headline,
        subheading: dto.subheading,
        benefits: dto.benefits,
        pricing: dto.pricing,
        branding: dto.branding,
        exportFormat: dto.exportFormat,
        generatedImageUrl: dto.generatedImageUrl,
        generatedThumbnailUrl: dto.generatedThumbnailUrl,
        downloadCount: dto.downloadCount,
        isActive: dto.isActive,
      },
    });
    log.info('Marketing ad created', { id: ad.id, title: ad.title });
    return ad;
  }

  async updateMarketingAd(id: string, dto: UpdateMarketingAdDto) {
    await this.getMarketingAdById(id); // Ensure exists

    const ad = await prisma.marketingAd.update({
      where: { id },
      data: {
        ...(dto.title !== undefined && { title: dto.title }),
        ...(dto.template !== undefined && { template: dto.template }),
        ...(dto.product !== undefined && {
          productId: dto.product.productId,
          productName: dto.product.productName,
          productImage: dto.product.productImage,
          price: dto.product.price,
          salePrice: dto.product.salePrice,
          brand: dto.product.brand,
          description: dto.product.description,
        }),
        ...(dto.headline !== undefined && { headline: dto.headline }),
        ...(dto.subheading !== undefined && { subheading: dto.subheading }),
        ...(dto.benefits !== undefined && { benefits: dto.benefits }),
        ...(dto.pricing !== undefined && { pricing: dto.pricing }),
        ...(dto.branding !== undefined && { branding: dto.branding }),
        ...(dto.exportFormat !== undefined && { exportFormat: dto.exportFormat }),
        ...(dto.generatedImageUrl !== undefined && { generatedImageUrl: dto.generatedImageUrl }),
        ...(dto.generatedThumbnailUrl !== undefined && { generatedThumbnailUrl: dto.generatedThumbnailUrl }),
        ...(dto.downloadCount !== undefined && { downloadCount: dto.downloadCount }),
        ...(dto.isActive !== undefined && { isActive: dto.isActive }),
      },
    });
    log.info('Marketing ad updated', { id: ad.id, title: ad.title });
    return ad;
  }

  async deleteMarketingAd(id: string) {
    await this.getMarketingAdById(id); // Ensure exists
    await prisma.marketingAd.delete({
      where: { id },
    });
    log.info('Marketing ad deleted', { id });
    return { message: 'Marketing ad deleted' };
  }

  async duplicateMarketingAd(id: string) {
    const original = await this.getMarketingAdById(id);
    const { id: _, createdAt, updatedAt, ...data } = original;
    
    const duplicated = await prisma.marketingAd.create({
      data: {
        ...data,
        title: `${data.title} (Copy)`,
        downloadCount: 0,
      },
    });
    log.info('Marketing ad duplicated', { id: duplicated.id, originalId: id });
    return duplicated;
  }

  async incrementDownloadCount(id: string) {
    await prisma.marketingAd.update({
      where: { id },
      data: {
        downloadCount: {
          increment: 1,
        },
      },
    });
  }

  async getStatistics() {
    const [totalAds, mostDownloaded, templateStats, recentAds] = await Promise.all([
      prisma.marketingAd.count(),
      prisma.marketingAd.findFirst({
        orderBy: { downloadCount: 'desc' },
      }),
      prisma.marketingAd.groupBy({
        by: ['template'],
        _count: {
          template: true,
        },
        orderBy: {
          _count: {
            template: 'desc',
          },
        },
      }),
      prisma.marketingAd.findMany({
        orderBy: { createdAt: 'desc' },
        take: 5,
      }),
    ]);

    // Transform mostDownloaded if it exists
    const transformedMostDownloaded = mostDownloaded ? {
      ...mostDownloaded,
      product: {
        productId: mostDownloaded.productId,
        productName: mostDownloaded.productName,
        productImage: mostDownloaded.productImage,
        price: mostDownloaded.price,
        salePrice: mostDownloaded.salePrice,
        brand: mostDownloaded.brand,
        description: mostDownloaded.description,
      },
    } : null;

    // Transform recentAds
    const transformedRecentAds = recentAds.map(ad => ({
      ...ad,
      product: {
        productId: ad.productId,
        productName: ad.productName,
        productImage: ad.productImage,
        price: ad.price,
        salePrice: ad.salePrice,
        brand: ad.brand,
        description: ad.description,
      },
    }));

    return {
      totalAds,
      mostDownloaded: transformedMostDownloaded,
      mostUsedTemplate: templateStats[0]?.template || null,
      recentAds: transformedRecentAds,
    };
  }

  async generateMarketingCopy(dto: GenerateMarketingCopyDto) {
    // This would integrate with an AI service like OpenAI
    // For now, return template-based suggestions
    const productName = dto.productName;
    const category = dto.category || 'technology';

    const suggestions = {
      headlines: [
        `Eliminate Dead WiFi Areas In Your Home`,
        `Strong WiFi For Every Corner Of Your Home`,
        `Upgrade Your Network Today`,
        `Fast. Reliable. Everywhere.`,
        `Stay Connected Without Limits`,
        `Secure Your Home Today`,
        `Power Your Connectivity`,
      ],
      subheadings: [
        `Seamless Mesh WiFi Coverage For Every Room`,
        `Experience Blazing Fast Internet Speeds`,
        `Professional Network Solutions For Your Business`,
        `Advanced Technology For Modern Living`,
        `Complete Home Network Coverage`,
      ],
      benefits: [
        { text: 'No More Dead Zones', icon: '✓' },
        { text: 'Connect 100+ Devices', icon: '✓' },
        { text: 'Fast & Stable Internet', icon: '✓' },
        { text: 'Whole Home Coverage', icon: '✓' },
        { text: 'Easy Setup', icon: '✓' },
        { text: 'Perfect For Streaming', icon: '✓' },
      ],
      ctas: [
        'Order Now At BretuneTech.com',
        'Shop Today',
        'Get Yours Now',
        'Limited Time Offer',
      ],
    };

    return suggestions;
  }
}

export const marketingAdService = new MarketingAdService();
