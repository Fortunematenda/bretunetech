import { Router, Request, Response } from 'express';
import { authenticate } from '../../middleware/auth';
import { validate } from '../../middleware/validate';
import { asyncHandler } from '../../middleware/error-handler';
import { addressService } from './address.service';
import { createAddressSchema, updateAddressSchema } from './address.dto';

const router = Router();

router.get(
  '/',
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    const addresses = await addressService.listAddresses(req.user!.userId);
    res.json(addresses);
  })
);

router.post(
  '/',
  authenticate,
  validate(createAddressSchema),
  asyncHandler(async (req: Request, res: Response) => {
    const address = await addressService.createAddress(req.user!.userId, req.body);
    res.status(201).json(address);
  })
);

router.put(
  '/:id',
  authenticate,
  validate(updateAddressSchema),
  asyncHandler(async (req: Request, res: Response) => {
    const address = await addressService.updateAddress(req.user!.userId, req.params.id as string, req.body);
    res.json(address);
  })
);

router.delete(
  '/:id',
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    const result = await addressService.deleteAddress(req.user!.userId, req.params.id as string);
    res.json(result);
  })
);

export default router;
