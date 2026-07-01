import prisma from '../../lib/prisma';
import { CreateCategoryDto, UpdateCategoryDto } from './category.dto';
import { NotFoundError } from '../../lib/errors';
import { generateSlug } from '../../utils/slug';
import { logger } from '../../lib/logger';

const log = logger.child('CategoryService');

export class CategoryService {
  async listCategories() {
    return prisma.category.findMany({
      include: {
        children: {
          include: { _count: { select: { products: true } } }
        },
        _count: { select: { products: true } }
      },
      where: { parentId: null },
      orderBy: { sortOrder: 'asc' },
    });
  }

  async listAllCategories() {
    return prisma.category.findMany({
      orderBy: { sortOrder: 'asc' },
    });
  }

  async getCategoryBySlug(slug: string) {
    const category = await prisma.category.findUnique({
      where: { slug },
      include: {
        children: true,
        products: {
          where: { isActive: true },
          include: { images: { take: 1 }, tags: true },
          take: 20,
        },
      },
    });
    if (!category) throw new NotFoundError('Category');
    return category;
  }

  async createCategory(dto: CreateCategoryDto) {
    const slug = generateSlug(dto.name);
    const category = await prisma.category.create({
      data: { name: dto.name, slug, description: dto.description, imageUrl: dto.imageUrl, parentId: dto.parentId, sortOrder: dto.sortOrder },
    });
    log.info('Category created', { id: category.id, name: category.name });
    return category;
  }

  async updateCategory(id: string, dto: UpdateCategoryDto) {
    const existing = await prisma.category.findUnique({ where: { id } });
    if (!existing) throw new NotFoundError('Category');

    const data: any = { ...dto };
    if (dto.name) data.slug = generateSlug(dto.name);

    const category = await prisma.category.update({ where: { id }, data });
    log.info('Category updated', { id });
    return category;
  }

  async deleteCategory(id: string) {
    const existing = await prisma.category.findUnique({ where: { id }, include: { _count: { select: { products: true } } } });
    if (!existing) throw new NotFoundError('Category');

    await prisma.category.delete({ where: { id } });
    log.info('Category deleted', { id });
    return { message: 'Category deleted' };
  }
}

export const categoryService = new CategoryService();
