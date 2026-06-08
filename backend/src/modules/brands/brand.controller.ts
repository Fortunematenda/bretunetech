import { Router, Request, Response } from 'express';
import multer from 'multer';
import { authenticate, adminOnly } from '../../middleware/auth';
import { asyncHandler } from '../../middleware/error-handler';
import { uploadImageBuffer } from '../../lib/cloudinary';
import { BadRequestError } from '../../lib/errors';
import prisma from '../../lib/prisma';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml'];
    if (allowed.includes(file.mimetype)) cb(null, true);
    else cb(new BadRequestError('Only image files are allowed') as any);
  },
});

const router = Router();

router.post(
  '/upload-image',
  authenticate,
  adminOnly,
  upload.single('image'),
  asyncHandler(async (req: Request, res: Response) => {
    if (!req.file) return res.status(400).json({ error: 'No image file uploaded' }) as any;
    const result = await uploadImageBuffer(req.file.buffer, req.file.originalname, 'bretunetech/brands');
    if (result) return res.json({ url: result.url }) as any;
    const base64 = req.file.buffer.toString('base64');
    res.json({ url: `data:${req.file.mimetype};base64,${base64}` });
  })
);

router.get(
  '/',
  asyncHandler(async (_req: Request, res: Response) => {
    const brands = await prisma.brand.findMany({
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
    });
    res.json(brands);
  })
);

router.post(
  '/',
  authenticate,
  adminOnly,
  asyncHandler(async (req: Request, res: Response) => {
    const { name, slug, description, logoUrl, sortOrder } = req.body;
    const brand = await prisma.brand.create({
      data: {
        name: name.trim(),
        slug: slug?.trim() || name.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
        description: description?.trim() || null,
        logoUrl: logoUrl?.trim() || null,
        sortOrder: sortOrder ?? 0,
      },
    });
    res.status(201).json(brand);
  })
);

router.put(
  '/:id',
  authenticate,
  adminOnly,
  asyncHandler(async (req: Request, res: Response) => {
    const { name, slug, description, logoUrl, sortOrder, isActive } = req.body;
    const brand = await prisma.brand.update({
      where: { id: req.params.id as string },
      data: {
        ...(name !== undefined && { name: name.trim() }),
        ...(slug !== undefined && { slug: slug.trim() }),
        ...(description !== undefined && { description: description?.trim() || null }),
        ...(logoUrl !== undefined && { logoUrl: logoUrl?.trim() || null }),
        ...(sortOrder !== undefined && { sortOrder }),
        ...(isActive !== undefined && { isActive }),
      },
    });
    res.json(brand);
  })
);

router.delete(
  '/:id',
  authenticate,
  adminOnly,
  asyncHandler(async (req: Request, res: Response) => {
    await prisma.brand.delete({ where: { id: req.params.id as string } });
    res.json({ success: true });
  })
);

export default router;
