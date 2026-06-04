import prisma from '@/lib/prisma';
import type { BookingStatus, BookingServiceType } from '../../../generated/prisma/client';

interface CreateBookingInput {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  company?: string;
  serviceType: BookingServiceType;
  address: string;
  city: string;
  province: string;
  postalCode: string;
  preferredDate?: string;
  description?: string;
}

interface UpdateBookingInput {
  status?: BookingStatus;
  scheduledDate?: string;
  scheduledTime?: string;
  technicianId?: string;
  technicianName?: string;
  estimatedCost?: number;
  finalCost?: number;
  internalNotes?: string;
}

interface ListFilters {
  status?: BookingStatus;
  serviceType?: BookingServiceType;
  page: number;
  limit: number;
}

export class BookingService {
  async create(data: CreateBookingInput) {
    const bookingNumber = `BK-${Date.now()}`;
    
    return prisma.serviceBooking.create({
      data: {
        bookingNumber,
        customerName: data.customerName,
        customerEmail: data.customerEmail,
        customerPhone: data.customerPhone,
        company: data.company,
        serviceType: data.serviceType,
        address: data.address,
        city: data.city,
        province: data.province,
        postalCode: data.postalCode,
        preferredDate: data.preferredDate ? new Date(data.preferredDate) : null,
        description: data.description,
        status: 'PENDING',
      },
    });
  }

  async list(filters: ListFilters) {
    const where = {
      ...(filters.status && { status: filters.status }),
      ...(filters.serviceType && { serviceType: filters.serviceType }),
    };

    const [bookings, total] = await Promise.all([
      prisma.serviceBooking.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (filters.page - 1) * filters.limit,
        take: filters.limit,
      }),
      prisma.serviceBooking.count({ where }),
    ]);

    return {
      bookings,
      pagination: {
        page: filters.page,
        limit: filters.limit,
        total,
        totalPages: Math.ceil(total / filters.limit),
      },
    };
  }

  async getById(id: string) {
    return prisma.serviceBooking.findUnique({
      where: { id },
    });
  }

  async update(id: string, data: UpdateBookingInput) {
    return prisma.serviceBooking.update({
      where: { id },
      data: {
        ...data,
        scheduledDate: data.scheduledDate ? new Date(data.scheduledDate) : undefined,
      },
    });
  }

  async delete(id: string) {
    return prisma.serviceBooking.delete({
      where: { id },
    });
  }

  async getStats() {
    const [
      total,
      pending,
      confirmed,
      inProgress,
      completed,
      cancelled,
    ] = await Promise.all([
      prisma.serviceBooking.count(),
      prisma.serviceBooking.count({ where: { status: 'PENDING' } }),
      prisma.serviceBooking.count({ where: { status: 'CONFIRMED' } }),
      prisma.serviceBooking.count({ where: { status: 'IN_PROGRESS' } }),
      prisma.serviceBooking.count({ where: { status: 'COMPLETED' } }),
      prisma.serviceBooking.count({ where: { status: 'CANCELLED' } }),
    ]);

    return {
      total,
      pending,
      confirmed,
      inProgress,
      completed,
      cancelled,
    };
  }
}
