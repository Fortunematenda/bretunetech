import { Router, Request, Response } from 'express';
import multer from 'multer';
import { authenticate, adminOnly } from '../../middleware/auth';
import { validate } from '../../middleware/validate';
import { asyncHandler } from '../../middleware/error-handler';
import { importService } from './import.service';
import { manualImportSchema, bulkImportSettingsSchema, updateImportSettingsSchema } from './import.dto';
import { BadRequestError } from '../../lib/errors';

const router = Router();

// Multer config: accept CSV files up to 5MB, store in memory
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
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
    res.json(preview);
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
      globalMarkup: req.body.globalMarkup ? parseFloat(req.body.globalMarkup) : 25,
      skipDuplicates: req.body.skipDuplicates !== 'false',
      uploadImages: req.body.uploadImages !== 'false',
    });

    const { rows, errors: parseErrors } = importService.parseCsv(req.file.buffer);

    if (rows.length === 0) {
      throw new BadRequestError('No valid rows found in CSV');
    }

    const result = await importService.bulkImport(rows, settings);

    res.json({
      ...result,
      parseErrors,
    });
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
      maxCsvRows: 500,
      maxFileSize: '5MB',
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
