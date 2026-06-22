import { Router, Request, Response } from 'express';
import { asyncHandler } from '../../middleware/error-handler';
import { logger } from '../../lib/logger';

const router = Router();
const log = logger.child('AddressValidation');

const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY || '';

interface ValidateBody {
  address: string;
  placeId?: string;
}

// POST /api/address/validate
router.post(
  '/validate',
  asyncHandler(async (req: Request, res: Response) => {
    const { address, placeId } = req.body as ValidateBody;

    if (!address && !placeId) {
      return res.status(400).json({ error: 'Address or placeId is required' });
    }

    if (!GOOGLE_MAPS_API_KEY) {
      log.warn('Google Maps API key not configured');
      return res.json({
        verified: false,
        formattedAddress: address || '',
        streetAddress: '',
        suburb: '',
        city: '',
        province: '',
        postalCode: '',
        country: 'South Africa',
        latitude: 0,
        longitude: 0,
        placeId: placeId || '',
        message: 'Address validation service not configured',
      });
    }

    try {
      // Try Geocoding API (works well for South African addresses)
      let geocodeUrl: string;
      if (placeId) {
        geocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?place_id=${encodeURIComponent(placeId)}&key=${GOOGLE_MAPS_API_KEY}`;
      } else {
        geocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&components=country:ZA&key=${GOOGLE_MAPS_API_KEY}`;
      }

      const geocodeRes = await fetch(geocodeUrl);
      const geocodeData: any = await geocodeRes.json();

      if (geocodeData.status !== 'OK' || !geocodeData.results?.length) {
        return res.json({
          verified: false,
          formattedAddress: address || '',
          streetAddress: '',
          suburb: '',
          city: '',
          province: '',
          postalCode: '',
          country: 'South Africa',
          latitude: 0,
          longitude: 0,
          placeId: placeId || '',
          message: 'Could not verify this address',
        });
      }

      const result = geocodeData.results[0];
      const components = result.address_components || [];
      const location = result.geometry?.location;

      const getComponent = (types: string[]): string => {
        const comp = components.find((c: any) => types.some((t: string) => c.types.includes(t)));
        return comp?.long_name || '';
      };

      const streetNumber = getComponent(['street_number']);
      const route = getComponent(['route']);
      const streetAddress = streetNumber ? `${streetNumber} ${route}` : route;
      const suburb = getComponent(['sublocality', 'sublocality_level_1', 'neighborhood']);
      const city = getComponent(['locality', 'administrative_area_level_2']);
      const province = getComponent(['administrative_area_level_1']);
      const postalCode = getComponent(['postal_code']);
      const country = getComponent(['country']) || 'South Africa';

      return res.json({
        verified: true,
        formattedAddress: result.formatted_address || '',
        streetAddress,
        suburb,
        city,
        province,
        postalCode,
        country,
        latitude: location?.lat || 0,
        longitude: location?.lng || 0,
        placeId: result.place_id || placeId || '',
      });
    } catch (err: any) {
      log.error('Address validation failed', { error: err.message });
      return res.json({
        verified: false,
        formattedAddress: address || '',
        streetAddress: '',
        suburb: '',
        city: '',
        province: '',
        postalCode: '',
        country: 'South Africa',
        latitude: 0,
        longitude: 0,
        placeId: placeId || '',
        message: 'Address validation service temporarily unavailable',
      });
    }
  })
);

export default router;
