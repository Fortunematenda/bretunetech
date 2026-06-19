import { Router, Request, Response } from 'express';
import { authenticate, adminOnly, superAdminOnly } from '../../middleware/auth';
import { validate } from '../../middleware/validate';
import { asyncHandler } from '../../middleware/error-handler';
import { productService } from './product.service';
import { listProductsSchema, createProductSchema, updateProductSchema, exportProductsSchema } from './product.dto';

const router = Router();

// GET /api/products - List products with search & filter
router.get(
  '/',
  validate(listProductsSchema, 'query'),
  asyncHandler(async (req: Request, res: Response) => {
    const result = await productService.listProducts(req.query as any);
    res.json(result);
  })
);

// GET /api/products/admin/:id (admin - get by ID) - must be before /:slug
router.get(
  '/admin/:id',
  authenticate,
  adminOnly,
  asyncHandler(async (req: Request, res: Response) => {
    const product = await productService.getProductById(req.params.id as string);
    res.json(product);
  })
);

// GET /api/products/export (admin) - Export products as CSV
router.get(
  '/export',
  authenticate,
  adminOnly,
  validate(exportProductsSchema, 'query'),
  asyncHandler(async (req: Request, res: Response) => {
    const csv = await productService.exportProducts(req.query as any);
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=products.csv');
    res.send(csv);
  })
);

// GET /api/products/:slug (public)
router.get(
  '/:slug',
  asyncHandler(async (req: Request, res: Response) => {
    const product = await productService.getProductBySlug(req.params.slug as string);
    res.json(product);
  })
);

// POST /api/products (admin)
router.post(
  '/',
  authenticate,
  adminOnly,
  validate(createProductSchema),
  asyncHandler(async (req: Request, res: Response) => {
    const product = await productService.createProduct(req.body);
    res.status(201).json(product);
  })
);

// PUT /api/products/:id (admin)
router.put(
  '/:id',
  authenticate,
  adminOnly,
  validate(updateProductSchema),
  asyncHandler(async (req: Request, res: Response) => {
    const product = await productService.updateProduct(req.params.id as string, req.body);
    res.json(product);
  })
);

// DELETE /api/products/bulk/category/:slug (super_admin only) — hard-delete all products in a category
router.delete(
  '/bulk/category/:slug',
  authenticate,
  superAdminOnly,
  asyncHandler(async (req: Request, res: Response) => {
    const { productRepository } = await import('./product.repository');
    const result = await productRepository.hardDeleteByCategory(req.params.slug as string);
    res.json({ message: `Deleted ${result.deleted} products from category "${req.params.slug}"`, ...result });
  })
);

// DELETE /api/products/:id (admin)
router.delete(
  '/:id',
  authenticate,
  adminOnly,
  asyncHandler(async (req: Request, res: Response) => {
    const result = await productService.deleteProduct(req.params.id as string);
    res.json(result);
  })
);

export default router;
