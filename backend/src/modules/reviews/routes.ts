import { Router } from 'express';
import { authenticate, adminOnly } from '../../middleware/auth';
import { validate } from '../../middleware/validate';
import { createReviewSchema, updateReviewSchema, listReviewsSchema } from './review.dto';
import { reviewService } from './review.service';

const router = Router();

// List reviews (public - only approved)
router.get('/', validate(listReviewsSchema, 'query'), async (req, res, next) => {
  try {
    const result = await reviewService.listReviews(req.query as any);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

// List all reviews (admin - including pending)
router.get('/admin/all', authenticate, adminOnly, async (req, res, next) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const status = req.query.status as string;
    
    const reviews = await reviewService.listAllReviews({ page, limit, status });
    res.json(reviews);
  } catch (err) {
    next(err);
  }
});

// Get reviews for a specific product (public)
router.get('/product/:productId', async (req, res, next) => {
  try {
    const result = await reviewService.getProductReviews(req.params.productId);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

// Get product review stats (public)
router.get('/product/:productId/stats', async (req, res, next) => {
  try {
    const stats = await reviewService.getProductStats(req.params.productId);
    res.json(stats);
  } catch (err) {
    next(err);
  }
});

// Create review (authenticated)
router.post('/', authenticate, validate(createReviewSchema), async (req, res, next) => {
  try {
    const user = (req as any).user;
    const review = await reviewService.createReview(user.userId, req.body);
    res.status(201).json(review);
  } catch (err) {
    next(err);
  }
});

// Approve review (admin)
router.patch('/:id/approve', authenticate, adminOnly, async (req, res, next) => {
  try {
    const review = await reviewService.approveReview(req.params.id as string);
    res.json(review);
  } catch (err) {
    next(err);
  }
});

// Update review (authenticated)
router.put('/:id', authenticate, validate(updateReviewSchema), async (req, res, next) => {
  try {
    const user = (req as any).user;
    const review = await reviewService.updateReview(user.userId, req.params.id as string, req.body);
    res.json(review);
  } catch (err) {
    next(err);
  }
});

// Delete review (authenticated)
router.delete('/:id', authenticate, async (req, res, next) => {
  try {
    const user = (req as any).user;
    await reviewService.deleteReview(user.userId, req.params.id as string);
    res.json({ message: 'Review deleted' });
  } catch (err) {
    next(err);
  }
});

export default router;
