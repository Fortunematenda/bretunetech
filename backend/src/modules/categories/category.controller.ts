import { Router, Request, Response } from 'express';
import multer from 'multer';
import { authenticate, adminOnly } from '../../middleware/auth';
import { validate } from '../../middleware/validate';
import { asyncHandler } from '../../middleware/error-handler';
import { categoryService } from './category.service';
import { createCategorySchema, updateCategorySchema } from './category.dto';
import { BadRequestError } from '../../lib/errors';

const router = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowedExtensions = ['.csv', '.xls', '.xlsx'];
    const hasAllowedExtension = allowedExtensions.some(ext => file.originalname.toLowerCase().endsWith(ext));
    if (hasAllowedExtension) {
      cb(null, true);
    } else {
      cb(new BadRequestError('Only CSV and Excel files (.csv, .xls, .xlsx) are allowed') as any);
    }
  },
});

router.get(
  '/',
  asyncHandler(async (req: Request, res: Response) => {
    const all = req.query.all === 'true';
    const categories = all ? await categoryService.listAllCategories() : await categoryService.listCategories();
    res.json(categories);
  })
);

router.get(
  '/:slug',
  asyncHandler(async (req: Request, res: Response) => {
    const category = await categoryService.getCategoryBySlug(req.params.slug as string);
    res.json(category);
  })
);

router.post(
  '/',
  authenticate,
  adminOnly,
  validate(createCategorySchema),
  asyncHandler(async (req: Request, res: Response) => {
    const category = await categoryService.createCategory(req.body);
    res.status(201).json(category);
  })
);

router.put(
  '/:id',
  authenticate,
  adminOnly,
  validate(updateCategorySchema),
  asyncHandler(async (req: Request, res: Response) => {
    const category = await categoryService.updateCategory(req.params.id as string, req.body);
    res.json(category);
  })
);

router.delete(
  '/:id',
  authenticate,
  adminOnly,
  asyncHandler(async (req: Request, res: Response) => {
    const result = await categoryService.deleteCategory(req.params.id as string);
    res.json(result);
  })
);

router.post(
  '/bulk-delete',
  authenticate,
  adminOnly,
  asyncHandler(async (req: Request, res: Response) => {
    const { ids } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) {
      throw new BadRequestError('No category IDs provided');
    }
    const result = await categoryService.bulkDelete(ids);
    res.json(result);
  })
);

router.post(
  '/bulk-import',
  authenticate,
  adminOnly,
  upload.single('file'),
  asyncHandler(async (req: Request, res: Response) => {
    if (!req.file) throw new BadRequestError('No file uploaded');
    const result = await categoryService.bulkImport(req.file.buffer);
    res.json(result);
  })
);

export default router;
