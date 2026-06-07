import { reviewRepository } from './review.repository';
import { CreateReviewDto, UpdateReviewDto, ListReviewsDto } from './review.dto';
import { NotFoundError, ConflictError } from '../../lib/errors';
import { logger } from '../../lib/logger';
import prisma from '../../lib/prisma';

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

    // Update product's cached rating fields
    await this.updateProductRatingCache(dto.productId);

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
    
    // Update product's cached rating fields
    await this.updateProductRatingCache(review.productId);

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
    
    // Update product's cached rating fields
    await this.updateProductRatingCache(review.productId);

    log.info('Review deleted', { id: reviewId });
    return { message: 'Review deleted' };
  }

  async approveReview(reviewId: string) {
    const review = await reviewRepository.findById(reviewId);
    if (!review) throw new NotFoundError('Review');

    const updated = await prisma.review.update({
      where: { id: reviewId },
      data: { isApproved: true },
    });
    
    // Update product's cached rating fields
    await this.updateProductRatingCache(review.productId);

    log.info('Review approved', { id: reviewId });
    return updated;
  }

  private async updateProductRatingCache(productId: string) {
    const stats = await reviewRepository.getProductStats(productId);
    await prisma.product.update({
      where: { id: productId },
      data: {
        averageRating: stats.average,
        reviewCount: stats.count,
      },
    });
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

  async listAllReviews(filters: { page: number; limit: number; status?: string }) {
    const where = filters.status ? { isApproved: filters.status === 'approved' } : {};
    
    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where,
        include: {
          user: { select: { id: true, email: true, firstName: true, lastName: true } },
          product: { select: { id: true, name: true, slug: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: (filters.page - 1) * filters.limit,
        take: filters.limit,
      }),
      prisma.review.count({ where }),
    ]);

    return {
      reviews,
      pagination: {
        page: filters.page,
        limit: filters.limit,
        total,
        pages: Math.ceil(total / filters.limit),
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
