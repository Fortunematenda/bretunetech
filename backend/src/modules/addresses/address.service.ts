import prisma from '../../lib/prisma';
import { CreateAddressDto, UpdateAddressDto } from './address.dto';
import { NotFoundError } from '../../lib/errors';
import { logger } from '../../lib/logger';

const log = logger.child('AddressService');

async function geocodeAddress(address: string): Promise<{ lat: number; lng: number; formattedAddress: string } | null> {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  if (!apiKey) {
    log.warn('Google Maps API key not configured, skipping geocoding');
    return null;
  }

  try {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${apiKey}`
    );
    const data: any = await response.json();

    if (data.status === 'OK' && data.results && data.results.length > 0) {
      const result = data.results[0];
      return {
        lat: result.geometry.location.lat,
        lng: result.geometry.location.lng,
        formattedAddress: result.formatted_address,
      };
    } else {
      log.warn('Geocoding failed', { status: data.status, address });
      return null;
    }
  } catch (error) {
    log.error('Geocoding error', { error, address });
    return null;
  }
}

export class AddressService {
  async listAddresses(userId: string) {
    return prisma.address.findMany({
      where: { userId },
      orderBy: { isDefault: 'desc' },
    });
  }

  async createAddress(userId: string, dto: CreateAddressDto) {
    if (dto.isDefault) {
      await prisma.address.updateMany({
        where: { userId },
        data: { isDefault: false },
      });
    }

    // Try to geocode the address for coordinates only
    const fullAddress = `${dto.street}, ${dto.suburb || ''}, ${dto.city}, ${dto.province}, ${dto.postalCode}, ${dto.country}`;
    const geocoded = await geocodeAddress(fullAddress);

    const address = await prisma.address.create({
      data: {
        userId,
        street: dto.street, // Preserve user's exact input
        suburb: dto.suburb,
        city: dto.city,
        province: dto.province,
        postalCode: dto.postalCode,
        country: dto.country,
        isDefault: dto.isDefault,
        placeId: dto.placeId,
        latitude: geocoded?.lat,
        longitude: geocoded?.lng,
        formattedAddress: geocoded?.formattedAddress,
        addressVerified: !!geocoded,
      },
    });

    log.info('Address created', { userId, addressId: address.id, verified: !!geocoded, street: dto.street });
    return address;
  }

  async updateAddress(userId: string, id: string, dto: UpdateAddressDto) {
    const existing = await prisma.address.findFirst({ where: { id, userId } });
    if (!existing) throw new NotFoundError('Address');

    if (dto.isDefault) {
      await prisma.address.updateMany({
        where: { userId },
        data: { isDefault: false },
      });
    }

    const address = await prisma.address.update({ where: { id }, data: dto });
    log.info('Address updated', { addressId: id });
    return address;
  }

  async deleteAddress(userId: string, id: string) {
    const existing = await prisma.address.findFirst({ where: { id, userId } });
    if (!existing) throw new NotFoundError('Address');

    await prisma.address.delete({ where: { id } });
    log.info('Address deleted', { addressId: id });
    return { message: 'Address deleted' };
  }
}

export const addressService = new AddressService();
