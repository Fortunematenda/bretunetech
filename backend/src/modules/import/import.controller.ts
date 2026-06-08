import { Router, Request, Response } from 'express';
import multer from 'multer';
import { authenticate, adminOnly } from '../../middleware/auth';
import { validate } from '../../middleware/validate';
import { asyncHandler } from '../../middleware/error-handler';
import { importService } from './import.service';
import { manualImportSchema, bulkImportSettingsSchema, updateImportSettingsSchema } from './import.dto';
import { BadRequestError } from '../../lib/errors';
import prisma from '../../lib/prisma';

const router = Router();

// Multer config: accept CSV files up to 5MB, store in memory
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype === 'text/csv' || file.originalname.endsWith('.csv')) {
      cb(null, true);
    } else {
      cb(new BadRequestError('Only CSV files are allowed') as any);
    }
  },
});

// ─── POST /api/import/single — Manual single product import ───
router.post(
  '/single',
  authenticate,
  adminOnly,
  validate(manualImportSchema),
  asyncHandler(async (req: Request, res: Response) => {
    const globalMarkup = await importService.getGlobalMarkup();
    const result = await importService.importSingle(req.body, globalMarkup, true);
    res.status(result.success ? 201 : 400).json(result);
  })
);

// ─── POST /api/import/csv/preview — Preview CSV without importing ───
router.post(
  '/csv/preview',
  authenticate,
  adminOnly,
  upload.single('file'),
  asyncHandler(async (req: Request, res: Response) => {
    if (!req.file) throw new BadRequestError('No CSV file uploaded');

    const globalMarkup = req.body.globalMarkup
      ? parseFloat(req.body.globalMarkup)
      : await importService.getGlobalMarkup();

    const preview = importService.previewCsv(req.file.buffer, globalMarkup);
    res.json({ ...preview, detectedHeaders: importService.getHeaders(req.file.buffer) });
  })
);

// ─── POST /api/import/csv — Bulk import from CSV ────────────────
router.post(
  '/csv',
  authenticate,
  adminOnly,
  upload.single('file'),
  asyncHandler(async (req: Request, res: Response) => {
    if (!req.file) throw new BadRequestError('No CSV file uploaded');

    const settings = bulkImportSettingsSchema.parse({
      globalMarkup: req.body.globalMarkup ? parseFloat(req.body.globalMarkup) : 35,
      skipDuplicates: req.body.skipDuplicates !== 'false',
      uploadImages: req.body.uploadImages !== 'false',
      addVatToCost: req.body.addVatToCost === 'true' || req.body.addVatToCost === true,
      vatRate: req.body.vatRate ? parseFloat(req.body.vatRate) : 15,
    });

    const { rows, errors: parseErrors } = importService.parseCsv(req.file.buffer);

    if (rows.length === 0) {
      // Return the validation errors instead of a generic throw so the client can show them
      return res.status(400).json({
        error: 'No valid rows found in CSV. Check that your column headers match the expected format.',
        parseErrors,
        detectedHeaders: importService.getHeaders(req.file.buffer),
        expectedHeaders: ['name', 'description', 'category', 'cost_price', 'supplier_name', 'supplier_sku', 'image_url', 'condition', 'stock_quantity', 'markup_percentage', 'tags'],
      });
    }

    const result = await importService.bulkImport(rows, settings);

    res.json({
      ...result,
      parseErrors,
    });
  })
);

// ─── POST /api/import/csv/preview-mapped — Preview with column map ──────────
router.post(
  '/csv/preview-mapped',
  authenticate,
  adminOnly,
  upload.single('file'),
  asyncHandler(async (req: Request, res: Response) => {
    if (!req.file) throw new BadRequestError('No CSV file uploaded');

    let columnMap: Record<string, string> = {};
    try {
      columnMap = req.body.columnMap ? JSON.parse(req.body.columnMap) : {};
    } catch {
      throw new BadRequestError('Invalid columnMap JSON');
    }

    const globalMarkup = req.body.globalMarkup
      ? parseFloat(req.body.globalMarkup)
      : await importService.getGlobalMarkup();

    const preview = importService.previewCsvWithMap(req.file.buffer, columnMap, globalMarkup);
    res.json({ ...preview, detectedHeaders: importService.getHeaders(req.file.buffer) });
  })
);

// ─── POST /api/import/csv/mapped — Import with user-defined column map ──────
router.post(
  '/csv/mapped',
  authenticate,
  adminOnly,
  upload.single('file'),
  asyncHandler(async (req: Request, res: Response) => {
    if (!req.file) throw new BadRequestError('No CSV file uploaded');

    let columnMap: Record<string, string> = {};
    try {
      columnMap = req.body.columnMap ? JSON.parse(req.body.columnMap) : {};
    } catch {
      throw new BadRequestError('Invalid columnMap JSON');
    }

    const settings = bulkImportSettingsSchema.parse({
      globalMarkup: req.body.globalMarkup ? parseFloat(req.body.globalMarkup) : 35,
      skipDuplicates: req.body.skipDuplicates !== 'false',
      uploadImages: req.body.uploadImages !== 'false',
      addVatToCost: req.body.addVatToCost === 'true' || req.body.addVatToCost === true,
      vatRate: req.body.vatRate ? parseFloat(req.body.vatRate) : 15,
    });

    const { rows, errors: parseErrors } = importService.parseCsvWithMap(req.file.buffer, columnMap);

    if (rows.length === 0) {
      return res.status(400).json({
        error: 'No valid rows found after applying column mapping.',
        parseErrors,
        detectedHeaders: importService.getHeaders(req.file.buffer),
      });
    }

    const result = await importService.bulkImport(rows, settings);
    res.json({ ...result, parseErrors });
  })
);

// ─── DELETE /api/import/cleanup-deleted — Hard-delete all soft-deleted products ──
router.delete(
  '/cleanup-deleted',
  authenticate,
  adminOnly,
  asyncHandler(async (_req: Request, res: Response) => {
    const inactive = await prisma.product.findMany({
      where: { isActive: false },
      select: { id: true },
    });
    const ids = inactive.map((p: { id: string }) => p.id);
    if (ids.length === 0) return res.json({ message: 'Nothing to clean up', deleted: 0 });
    await prisma.productImage.deleteMany({ where: { productId: { in: ids } } });
    await prisma.productTag.deleteMany({ where: { productId: { in: ids } } });
    await prisma.productSpecification.deleteMany({ where: { productId: { in: ids } } });
    await prisma.product.deleteMany({ where: { id: { in: ids } } });
    res.json({ message: `Cleaned up ${ids.length} deleted products`, deleted: ids.length });
  })
);

// ─── PATCH /api/import/settings — Update global markup ─────────
router.patch(
  '/settings',
  authenticate,
  adminOnly,
  validate(updateImportSettingsSchema),
  asyncHandler(async (req: Request, res: Response) => {
    const globalMarkup = await importService.setGlobalMarkup(req.body.globalMarkup);
    res.json({
      message: 'Import settings updated',
      globalMarkup,
    });
  })
);

// ─── GET /api/import/settings — Get import configuration ────────
router.get(
  '/settings',
  authenticate,
  adminOnly,
  asyncHandler(async (_req: Request, res: Response) => {
    const globalMarkup = await importService.getGlobalMarkup();
    res.json({
      globalMarkup,
      maxCsvRows: null,
      maxFileSize: '50MB',
      supportedColumns: [
        'name', 'description', 'category', 'supplier_name', 'supplier_sku',
        'cost_price', 'image_url', 'condition', 'stock_quantity', 'markup_percentage', 'tags',
      ],
      categoryMappings: {
        'technology': ['laptop', 'desktop', 'computer', 'tablet', 'monitor'],
        'power-solutions': ['battery', 'ups', 'inverter', 'solar', 'charger'],
        'internet-networking': ['router', 'switch', 'network', 'wifi', 'access point'],
        'accessories': ['keyboard', 'mouse', 'headset', 'webcam', 'usb', 'cable'],
      },
    });
  })
);

// ─── GET /api/import/template — Download CSV template ───────────
router.get(
  '/template',
  authenticate,
  adminOnly,
  asyncHandler(async (_req: Request, res: Response) => {
    const csvHeader = 'name,description,category,supplier_name,supplier_sku,cost_price,image_url,condition,stock_quantity,markup_percentage,tags\n';
    const sampleRow = '"MikroTik hAP ac3 Router","Dual-band wireless router with 5 Gigabit ports","Networking","Scoop","SC-NET-001",1800,"https://example.com/router.jpg","NEW",20,25,"Best Seller,Networking"\n';

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=voltnet-import-template.csv');
    res.send(csvHeader + sampleRow);
  })
);

export default router;
