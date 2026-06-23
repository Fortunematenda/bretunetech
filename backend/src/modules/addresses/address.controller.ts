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

// Proxy endpoint for Google Places Autocomplete (no auth required for suggestions)
router.get(
  '/autocomplete',
  asyncHandler(async (req: Request, res: Response) => {
    const { input } = req.query;
    const apiKey = process.env.GOOGLE_MAPS_API_KEY;

    if (!input || typeof input !== 'string') {
      return res.status(400).json({ error: 'Input is required' });
    }

    if (!apiKey) {
      return res.status(500).json({ error: 'Google Maps API key not configured' });
    }

    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(input)}&key=${apiKey}&components=country:za&types=address`
      );
      const data = await response.json();
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch suggestions' });
    }
  })
);

// Proxy endpoint for Google Places Details (no auth required)
router.get(
  '/place-details',
  asyncHandler(async (req: Request, res: Response) => {
    const { place_id } = req.query;
    const apiKey = process.env.GOOGLE_MAPS_API_KEY;

    if (!place_id || typeof place_id !== 'string') {
      return res.status(400).json({ error: 'Place ID is required' });
    }

    if (!apiKey) {
      return res.status(500).json({ error: 'Google Maps API key not configured' });
    }

    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/place/details/json?place_id=${place_id}&key=${apiKey}&fields=address_components,formatted_address,geometry`
      );
      const data = await response.json();
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch place details' });
    }
  })
);

export default router;
