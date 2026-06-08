import { adRepository } from './ad.repository';
import { CreateAdDto, UpdateAdDto, ListAdsDto } from './ad.dto';
import { NotFoundError } from '../../lib/errors';
import { logger } from '../../lib/logger';

const log = logger.child('AdService');

export class AdService {
  async listAds(filters: ListAdsDto) {
    const { ads, total, page, limit } = await adRepository.findMany(filters);

    return {
      ads,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async getAdById(id: string) {
    const ad = await adRepository.findById(id);
    if (!ad) throw new NotFoundError('Ad');
    return ad;
  }

  async getActiveAds() {
    return adRepository.findActive();
  }

  async createAd(dto: CreateAdDto) {
    const ad = await adRepository.create(dto);
    log.info('Ad created', { id: ad.id, title: ad.title });
    return ad;
  }

  async updateAd(id: string, dto: UpdateAdDto) {
    await this.getAdById(id); // Ensure exists

    const ad = await adRepository.update(id, dto);
    log.info('Ad updated', { id: ad.id, title: ad.title });
    return ad;
  }

  async deleteAd(id: string) {
    await this.getAdById(id); // Ensure exists
    await adRepository.delete(id);
    log.info('Ad deleted', { id });
    return { message: 'Ad deleted' };
  }
}

export const adService = new AdService();
