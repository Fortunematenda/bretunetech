import { Router } from 'express';
import { marketingAdController } from './marketing-ad.controller';
import multer from 'multer';

const router = Router();

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
});

router.get('/', marketingAdController.getAllMarketingAds.bind(marketingAdController));
router.get('/statistics', marketingAdController.getStatistics.bind(marketingAdController));
router.get('/generate-copy', marketingAdController.generateMarketingCopy.bind(marketingAdController));
router.get('/:id', marketingAdController.getMarketingAdById.bind(marketingAdController));
router.post('/', marketingAdController.createMarketingAd.bind(marketingAdController));
router.put('/:id', marketingAdController.updateMarketingAd.bind(marketingAdController));
router.delete('/:id', marketingAdController.deleteMarketingAd.bind(marketingAdController));
router.post('/:id/duplicate', marketingAdController.duplicateMarketingAd.bind(marketingAdController));
router.post('/:id/download', marketingAdController.incrementDownloadCount.bind(marketingAdController));
router.post('/upload-image', upload.single('image'), marketingAdController.uploadImage.bind(marketingAdController));

export default router;
