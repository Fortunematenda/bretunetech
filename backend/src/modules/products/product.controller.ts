import { Router, Request, Response } from 'express';
import multer from 'multer';
import { authenticate, adminOnly, superAdminOnly } from '../../middleware/auth';
import { validate } from '../../middleware/validate';
import { asyncHandler } from '../../middleware/error-handler';
import { productService } from './product.service';
import { listProductsSchema, createProductSchema, updateProductSchema, exportProductsSchema } from './product.dto';
import { BadRequestError } from '../../lib/errors';
import cloudinary from '../../lib/cloudinary';

const router = Router();

// Multer: accept PDF / Word / common doc types up to 20MB
const docUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 20 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/plain',
    ];
    if (allowed.includes(file.mimetype) || file.originalname.endsWith('.pdf')) {
      cb(null, true);
    } else {
      cb(new BadRequestError('Only PDF, Word, Excel or text files are allowed') as any);
    }
  },
});

// POST /api/products/upload-document (admin) — upload a PDF/doc to Cloudinary
router.post(
  '/upload-document',
  authenticate,
  adminOnly,
  docUpload.single('document'),
  asyncHandler(async (req: Request, res: Response) => {
    if (!req.file) throw new BadRequestError('No document file uploaded');

    const safeFilename = req.file.originalname
      .replace(/\.[^.]+$/, '')
      .replace(/[^a-zA-Z0-9-_]/g, '-')
      .toLowerCase();

    const result = await new Promise<any>((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          {
            folder: 'bretunetech/documents',
            public_id: `${safeFilename}-${Date.now()}`,
            resource_type: 'raw',
          },
          (err, res) => {
            if (err || !res) return reject(err || new Error('Upload failed'));
            resolve(res);
          }
        )
        .end(req.file!.buffer);
    });

    res.json({ url: result.secure_url, publicId: result.public_id, originalName: req.file.originalname });
  })
);

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
