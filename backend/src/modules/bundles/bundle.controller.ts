import { Router, Request, Response } from 'express';
import { authenticate, adminOnly } from '../../middleware/auth';
import { validate } from '../../middleware/validate';
import { asyncHandler } from '../../middleware/error-handler';
import { bundleService } from './bundle.service';
import { listBundlesSchema, createBundleSchema, updateBundleSchema } from './bundle.dto';

const router = Router();

router.get(
  '/',
  validate(listBundlesSchema, 'query'),
  asyncHandler(async (req: Request, res: Response) => {
    const bundles = await bundleService.listBundles(req.query.featured as string | undefined);
    res.json(bundles);
  })
);

router.get(
  '/:slug',
  asyncHandler(async (req: Request, res: Response) => {
    const bundle = await bundleService.getBundleBySlug(req.params.slug as string);
    res.json(bundle);
  })
);

router.post(
  '/',
  authenticate,
  adminOnly,
  validate(createBundleSchema),
  asyncHandler(async (req: Request, res: Response) => {
    const bundle = await bundleService.createBundle(req.body);
    res.status(201).json(bundle);
  })
);

router.put(
  '/:id',
  authenticate,
  adminOnly,
  validate(updateBundleSchema),
  asyncHandler(async (req: Request, res: Response) => {
    const bundle = await bundleService.updateBundle(req.params.id as string, req.body);
    res.json(bundle);
  })
);

router.delete(
  '/:id',
  authenticate,
  adminOnly,
  asyncHandler(async (req: Request, res: Response) => {
    const result = await bundleService.deleteBundle(req.params.id as string);
    res.json(result);
  })
);

export default router;
