import { Request, Response } from 'express';
import { marketingAdService } from './marketing-ad.service';
import { createMarketingAdSchema, updateMarketingAdSchema, listMarketingAdsSchema, generateMarketingCopySchema } from './marketing-ad.dto';

export class MarketingAdController {
  async getAllMarketingAds(req: Request, res: Response) {
    try {
      const filters = listMarketingAdsSchema.parse(req.query);
      const result = await marketingAdService.listMarketingAds(filters);
      res.json(result);
    } catch (error: any) {
      console.error('getAllMarketingAds error:', error);
      res.status(400).json({ error: error.message || 'Failed to fetch marketing ads' });
    }
  }

  async getMarketingAdById(req: Request, res: Response) {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const ad = await marketingAdService.getMarketingAdById(id);
      res.json(ad);
    } catch (error: any) {
      console.error('getMarketingAdById error:', error);
      res.status(404).json({ error: error.message || 'Marketing ad not found' });
    }
  }

  async createMarketingAd(req: Request, res: Response) {
    try {
      const dto = createMarketingAdSchema.parse(req.body);
      const ad = await marketingAdService.createMarketingAd(dto);
      res.status(201).json(ad);
    } catch (error: any) {
      console.error('createMarketingAd error:', error);
      res.status(400).json({ error: error.message || 'Failed to create marketing ad' });
    }
  }

  async updateMarketingAd(req: Request, res: Response) {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const dto = updateMarketingAdSchema.parse(req.body);
      const ad = await marketingAdService.updateMarketingAd(id, dto);
      res.json(ad);
    } catch (error: any) {
      console.error('updateMarketingAd error:', error);
      res.status(400).json({ error: error.message || 'Failed to update marketing ad' });
    }
  }

  async deleteMarketingAd(req: Request, res: Response) {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const result = await marketingAdService.deleteMarketingAd(id);
      res.json(result);
    } catch (error: any) {
      console.error('deleteMarketingAd error:', error);
      res.status(404).json({ error: error.message || 'Marketing ad not found' });
    }
  }

  async duplicateMarketingAd(req: Request, res: Response) {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const ad = await marketingAdService.duplicateMarketingAd(id);
      res.status(201).json(ad);
    } catch (error: any) {
      console.error('duplicateMarketingAd error:', error);
      res.status(404).json({ error: error.message || 'Failed to duplicate marketing ad' });
    }
  }

  async incrementDownloadCount(req: Request, res: Response) {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      await marketingAdService.incrementDownloadCount(id);
      res.json({ message: 'Download count incremented' });
    } catch (error: any) {
      console.error('incrementDownloadCount error:', error);
      res.status(404).json({ error: error.message || 'Marketing ad not found' });
    }
  }

  async getStatistics(req: Request, res: Response) {
    try {
      const stats = await marketingAdService.getStatistics();
      res.json(stats);
    } catch (error: any) {
      console.error('getStatistics error:', error);
      res.status(500).json({ error: error.message || 'Failed to fetch statistics' });
    }
  }

  async generateMarketingCopy(req: Request, res: Response) {
    try {
      const dto = generateMarketingCopySchema.parse(req.body);
      const suggestions = await marketingAdService.generateMarketingCopy(dto);
      res.json(suggestions);
    } catch (error: any) {
      console.error('generateMarketingCopy error:', error);
      res.status(400).json({ error: error.message || 'Failed to generate marketing copy' });
    }
  }

  async uploadImage(req: Request, res: Response) {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }

      // Upload to Cloudinary
      const { uploadImageBuffer } = require('../../lib/cloudinary');
      const result = await uploadImageBuffer(req.file.buffer, req.file.originalname, 'marketing-ads');

      if (!result) {
        return res.status(500).json({ error: 'Failed to upload image to Cloudinary' });
      }

      res.json({ url: result.url });
    } catch (error: any) {
      console.error('uploadImage error:', error);
      res.status(500).json({ error: error.message || 'Failed to upload image' });
    }
  }
}

export const marketingAdController = new MarketingAdController();
