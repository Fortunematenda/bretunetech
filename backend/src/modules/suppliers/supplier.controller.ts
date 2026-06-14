import { Router, Request, Response } from 'express';
import prisma from '../../lib/prisma';
import { authenticate, adminOnly } from '../../middleware/auth';
import { asyncHandler } from '../../middleware/error-handler';

const router = Router();

// GET /api/suppliers - List all suppliers (public for dropdowns)
router.get(
  '/',
  asyncHandler(async (req: Request, res: Response) => {
    const { active } = req.query;
    const where: any = {};
    if (active === 'true') where.isActive = true;

    const suppliers = await prisma.supplier.findMany({
      where,
      orderBy: { name: 'asc' },
    });
    res.json(suppliers);
  })
);

// GET /api/suppliers/:id - Get single supplier
router.get(
  '/:id',
  authenticate,
  adminOnly,
  asyncHandler(async (req: Request, res: Response) => {
    const supplier = await prisma.supplier.findUnique({
      where: { id: req.params.id as string },
    });
    if (!supplier) {
      return res.status(404).json({ error: 'Supplier not found' });
    }
    res.json(supplier);
  })
);

// POST /api/suppliers - Create supplier
router.post(
  '/',
  authenticate,
  adminOnly,
  asyncHandler(async (req: Request, res: Response) => {
    const { name, contactPerson, email, phone, website, address, city, notes, isActive } = req.body;
    if (!name?.trim()) {
      return res.status(400).json({ error: 'Supplier name is required' });
    }

    const supplier = await prisma.supplier.create({
      data: {
        name: name.trim(),
        contactPerson: contactPerson?.trim() || null,
        email: email?.trim() || null,
        phone: phone?.trim() || null,
        website: website?.trim() || null,
        address: address?.trim() || null,
        city: city?.trim() || null,
        notes: notes?.trim() || null,
        isActive: isActive !== undefined ? isActive : true,
      },
    });
    res.status(201).json(supplier);
  })
);

// PUT /api/suppliers/:id - Update supplier
router.put(
  '/:id',
  authenticate,
  adminOnly,
  asyncHandler(async (req: Request, res: Response) => {
    const { name, contactPerson, email, phone, website, address, city, notes, isActive } = req.body;

    const existing = await prisma.supplier.findUnique({ where: { id: req.params.id as string } });
    if (!existing) {
      return res.status(404).json({ error: 'Supplier not found' });
    }

    const supplier = await prisma.supplier.update({
      where: { id: req.params.id as string },
      data: {
        ...(name !== undefined && { name: name.trim() }),
        ...(contactPerson !== undefined && { contactPerson: contactPerson?.trim() || null }),
        ...(email !== undefined && { email: email?.trim() || null }),
        ...(phone !== undefined && { phone: phone?.trim() || null }),
        ...(website !== undefined && { website: website?.trim() || null }),
        ...(address !== undefined && { address: address?.trim() || null }),
        ...(city !== undefined && { city: city?.trim() || null }),
        ...(notes !== undefined && { notes: notes?.trim() || null }),
        ...(isActive !== undefined && { isActive }),
      },
    });
    res.json(supplier);
  })
);

// DELETE /api/suppliers/:id - Delete supplier
router.delete(
  '/:id',
  authenticate,
  adminOnly,
  asyncHandler(async (req: Request, res: Response) => {
    const existing = await prisma.supplier.findUnique({ where: { id: req.params.id as string } });
    if (!existing) {
      return res.status(404).json({ error: 'Supplier not found' });
    }

    await prisma.supplier.delete({ where: { id: req.params.id as string } });
    res.json({ message: `Supplier "${existing.name}" deleted` });
  })
);

export default router;
