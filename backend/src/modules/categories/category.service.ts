import prisma from '../../lib/prisma';
import { CreateCategoryDto, UpdateCategoryDto } from './category.dto';
import { NotFoundError, BadRequestError } from '../../lib/errors';
import { generateSlug } from '../../utils/slug';
import { logger } from '../../lib/logger';
import { parse } from 'csv-parse/sync';
import * as xlsx from 'xlsx';

const log = logger.child('CategoryService');

export class CategoryService {
  async listCategories() {
    const categories = await prisma.category.findMany({
      include: {
        children: {
          include: { _count: { select: { products: { where: { isActive: true, status: 'PUBLISHED' } } } } }
        },
        _count: { select: { products: { where: { isActive: true, status: 'PUBLISHED' } } } }
      },
      where: { parentId: null },
      orderBy: { sortOrder: 'asc' },
    });

    // Only show categories that have products (directly or through subcategories)
    // Also filter children to only show those with products
    // Calculate total product count including subcategories
    return categories
      .map(cat => {
        const childProductCount = cat.children.reduce((sum, child) => sum + child._count.products, 0);
        const totalProductCount = cat._count.products + childProductCount;
        return {
          ...cat,
          _count: { products: totalProductCount },
          children: cat.children.filter(child => child._count.products > 0)
        };
      })
      .filter(cat => {
        const hasOwnProducts = cat._count.products > 0;
        const hasChildProducts = cat.children.length > 0;
        return hasOwnProducts || hasChildProducts;
      });
  }

  async listAllCategories() {
    return prisma.category.findMany({
      include: {
        parent: {
          select: { id: true, name: true }
        },
        children: {
          include: { _count: { select: { products: true } } }
        },
        _count: { select: { products: true } }
      },
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
    const category = await prisma.category.upsert({
      where: { slug },
      update: { name: dto.name, description: dto.description, imageUrl: dto.imageUrl, parentId: dto.parentId, sortOrder: dto.sortOrder },
      create: { name: dto.name, slug, description: dto.description, imageUrl: dto.imageUrl, parentId: dto.parentId, sortOrder: dto.sortOrder },
    });
    log.info('Category created/updated', { id: category.id, name: category.name });
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

  async bulkDelete(ids: string[]) {
    if (!ids.length) throw new BadRequestError('No category IDs provided');

    const result = await prisma.category.deleteMany({
      where: { id: { in: ids } },
    });
    log.info('Bulk delete categories', { count: result.count });
    return { message: `${result.count} categor${result.count === 1 ? 'y' : 'ies'} deleted`, deleted: result.count };
  }

  async bulkImport(buffer: Buffer) {
    let rawRows: any[];
    const fileType = this.detectFileType(buffer);

    try {
      if (fileType === 'excel') {
        const workbook = xlsx.read(buffer, { type: 'buffer' });
        const sheetName = workbook.SheetNames[0];
        if (!sheetName) throw new BadRequestError('Excel file has no sheets');
        rawRows = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName], { defval: '' });
      } else {
        const content = buffer.toString('utf-8');
        const firstLine = content.split('\n')[0] || '';
        const delimiter = firstLine.includes(';') ? ';' : ',';
        rawRows = parse(buffer, {
          columns: true,
          skip_empty_lines: true,
          trim: true,
          bom: true,
          relax_column_count: true,
          delimiter,
          escape: '"',
          quote: '"',
        });
      }
    } catch (err: any) {
      throw new BadRequestError(`File parsing error: ${err.message}`);
    }

    if (rawRows.length === 0) throw new BadRequestError('File is empty');

    const results: { name: string; success: boolean; error?: string }[] = [];
    let imported = 0;
    let failed = 0;

    // Build a slug → id lookup for parent resolution
    const existingCats = await prisma.category.findMany({ select: { id: true, slug: true, name: true } });
    const slugToId = new Map(existingCats.map(c => [c.slug, c.id]));
    const nameToId = new Map(existingCats.map(c => [c.name.toLowerCase(), c.id]));

    for (const raw of rawRows) {
      const name = this.normalizeField(raw, ['name', 'Name', 'category', 'Category', 'title', 'Title']);
      const description = this.normalizeField(raw, ['description', 'Description', 'desc']);
      const parentName = this.normalizeField(raw, ['parent', 'parentName', 'parent_name', 'Parent', 'Parent Category']);
      const sortOrderRaw = this.normalizeField(raw, ['sortOrder', 'sort_order', 'Sort Order']);
      const imageUrl = this.normalizeField(raw, ['imageUrl', 'image_url', 'Image', 'image']);

      if (!name || !name.trim()) {
        results.push({ name: name || '(empty)', success: false, error: 'Missing name' });
        failed++;
        continue;
      }

      const trimmedName = name.trim();
      const slug = generateSlug(trimmedName);

      let parentId: string | null = null;
      if (parentName && parentName.trim()) {
        const trimmedParent = parentName.trim();
        parentId = nameToId.get(trimmedParent.toLowerCase()) || slugToId.get(generateSlug(trimmedParent)) || null;
        if (!parentId) {
          // Create parent if it doesn't exist
          const parentSlug = generateSlug(trimmedParent);
          const parent = await prisma.category.upsert({
            where: { slug: parentSlug },
            update: {},
            create: { name: trimmedParent, slug: parentSlug, sortOrder: 0 },
          });
          parentId = parent.id;
          slugToId.set(parentSlug, parent.id);
          nameToId.set(trimmedParent.toLowerCase(), parent.id);
        }
      }

      const sortOrder = sortOrderRaw ? parseInt(sortOrderRaw, 10) || 0 : 0;

      try {
        const category = await prisma.category.upsert({
          where: { slug },
          update: {
            name: trimmedName,
            description: description?.trim() || undefined,
            imageUrl: imageUrl?.trim() || undefined,
            parentId: parentId || undefined,
            sortOrder,
          },
          create: {
            name: trimmedName,
            slug,
            description: description?.trim() || undefined,
            imageUrl: imageUrl?.trim() || undefined,
            parentId: parentId || undefined,
            sortOrder,
          },
        });
        slugToId.set(slug, category.id);
        nameToId.set(trimmedName.toLowerCase(), category.id);
        results.push({ name: trimmedName, success: true });
        imported++;
      } catch (err: any) {
        results.push({ name: trimmedName, success: false, error: err.message });
        failed++;
      }
    }

    log.info('Bulk import categories complete', { total: rawRows.length, imported, failed });

    return {
      total: rawRows.length,
      imported,
      failed,
      results,
    };
  }

  private detectFileType(buffer: Buffer): string {
    if (buffer.length > 4 &&
      ((buffer[0] === 0x50 && buffer[1] === 0x4B && buffer[2] === 0x03 && buffer[3] === 0x04) ||
       (buffer[0] === 0xD0 && buffer[1] === 0xCF && buffer[2] === 0x11 && buffer[3] === 0xE0))) {
      return 'excel';
    }
    return 'csv';
  }

  private normalizeField(raw: any, keys: string[]): string | undefined {
    for (const key of keys) {
      if (raw[key] !== undefined && raw[key] !== null && String(raw[key]).trim() !== '') {
        return String(raw[key]);
      }
    }
    return undefined;
  }
}

export const categoryService = new CategoryService();
