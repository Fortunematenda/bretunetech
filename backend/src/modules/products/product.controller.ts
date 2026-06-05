import { Router, Request, Response } from 'express';
import { authenticate, adminOnly } from '../../middleware/auth';
import { validate } from '../../middleware/validate';
import { asyncHandler } from '../../middleware/error-handler';
import { productService } from './product.service';
import { listProductsSchema, createProductSchema, updateProductSchema } from './product.dto';

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

// GET /api/products/:slug
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
    console.log('CREATE PRODUCT - Request body:', JSON.stringify(req.body, null, 2));
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
