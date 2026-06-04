import { reviewRepository } from './review.repository';
import { CreateReviewDto, UpdateReviewDto, ListReviewsDto } from './review.dto';
import { NotFoundError, ConflictError } from '../../lib/errors';
import { logger } from '../../lib/logger';

const log = logger.child('ReviewService');

export class ReviewService {
  async createReview(userId: string, dto: CreateReviewDto) {
    // Check if user already reviewed this product
    const existing = await reviewRepository.findByUserAndProduct(userId, dto.productId);
    if (existing) {
      throw new ConflictError('You have already reviewed this product');
    }

    const review = await reviewRepository.create({
      userId,
      productId: dto.productId,
      rating: dto.rating,
      title: dto.title,
      comment: dto.comment,
    });

    log.info('Review created', { id: review.id, userId, productId: dto.productId });
    return review;
  }

  async updateReview(userId: string, reviewId: string, dto: UpdateReviewDto) {
    const review = await reviewRepository.findById(reviewId);
    if (!review) throw new NotFoundError('Review');
    if (review.userId !== userId) {
      throw new ConflictError('You can only edit your own reviews');
    }

    const updated = await reviewRepository.update(reviewId, dto);
    log.info('Review updated', { id: reviewId });
    return updated;
  }

  async deleteReview(userId: string, reviewId: string) {
    const review = await reviewRepository.findById(reviewId);
    if (!review) throw new NotFoundError('Review');
    if (review.userId !== userId) {
      throw new ConflictError('You can only delete your own reviews');
    }

    await reviewRepository.delete(reviewId);
    log.info('Review deleted', { id: reviewId });
    return { message: 'Review deleted' };
  }

  async listReviews(filters: ListReviewsDto) {
    const page = parseInt(filters.page);
    const limit = parseInt(filters.limit);

    const { reviews, total } = await reviewRepository.findMany({
      productId: filters.productId,
      isApproved: true,
      page,
      limit,
    });

    return {
      reviews,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async getProductReviews(productId: string) {
    const { reviews, total } = await reviewRepository.findMany({
      productId,
      isApproved: true,
      page: 1,
      limit: 10,
    });

    const stats = await reviewRepository.getProductStats(productId);

    return { reviews, total, stats };
  }

  async getProductStats(productId: string) {
    return reviewRepository.getProductStats(productId);
  }
}

export const reviewService = new ReviewService();
