import prisma from '../../lib/prisma';
import { CreateAddressDto, UpdateAddressDto } from './address.dto';
import { NotFoundError } from '../../lib/errors';
import { logger } from '../../lib/logger';

const log = logger.child('AddressService');

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

    const address = await prisma.address.create({
      data: { userId, ...dto },
    });

    log.info('Address created', { userId, addressId: address.id });
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
