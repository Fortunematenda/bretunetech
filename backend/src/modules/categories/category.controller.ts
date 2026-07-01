import { Router, Request, Response } from 'express';
import { authenticate, adminOnly } from '../../middleware/auth';
import { validate } from '../../middleware/validate';
import { asyncHandler } from '../../middleware/error-handler';
import { categoryService } from './category.service';
import { createCategorySchema, updateCategorySchema } from './category.dto';

const router = Router();

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

export default router;
