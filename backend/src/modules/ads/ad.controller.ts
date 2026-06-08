import { Request, Response } from 'express';
import { adService } from './ad.service';
import { createAdSchema, updateAdSchema, listAdsSchema } from './ad.dto';
import prisma from '../../lib/prisma';

export class AdController {
  async getAllAds(req: Request, res: Response) {
    try {
      const ads = await prisma.ad.findMany({
        orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
      });
      res.json({ ads, pagination: { page: 1, limit: 50, total: ads.length, pages: 1 } });
    } catch (error: any) {
      console.error('getAllAds error:', error);
      res.status(500).json({ error: error.message || 'Failed to fetch ads' });
    }
  }

  async getActiveAds(req: Request, res: Response) {
    try {
      const ads = await adService.getActiveAds();
      res.json(ads);
    } catch (error: any) {
      console.error('getActiveAds error:', error);
      res.status(500).json({ error: 'Failed to fetch ads' });
    }
  }

  async getAdById(req: Request, res: Response) {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const ad = await adService.getAdById(id);
      res.json(ad);
    } catch (error: any) {
      console.error('getAdById error:', error);
      res.status(404).json({ error: error.message || 'Ad not found' });
    }
  }

  async createAd(req: Request, res: Response) {
    try {
      const dto = createAdSchema.parse(req.body);
      const ad = await adService.createAd(dto);
      res.status(201).json(ad);
    } catch (error: any) {
      console.error('createAd error:', error);
      res.status(400).json({ error: error.message || 'Failed to create ad' });
    }
  }

  async updateAd(req: Request, res: Response) {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const dto = updateAdSchema.parse(req.body);
      const ad = await adService.updateAd(id, dto);
      res.json(ad);
    } catch (error: any) {
      console.error('updateAd error:', error);
      res.status(400).json({ error: error.message || 'Failed to update ad' });
    }
  }

  async deleteAd(req: Request, res: Response) {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const result = await adService.deleteAd(id);
      res.json(result);
    } catch (error: any) {
      console.error('deleteAd error:', error);
      res.status(404).json({ error: error.message || 'Ad not found' });
    }
  }
}

export const adController = new AdController();
