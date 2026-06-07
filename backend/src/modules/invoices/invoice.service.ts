import prisma from '../../lib/prisma';
import type { InvoiceStatus, PaymentMethod } from '../../../generated/prisma/client';

interface InvoiceItem {
  name: string;
  description?: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

interface CreateInvoiceInput {
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  customerAddress?: string;
  items: InvoiceItem[];
  subtotal: number;
  vatAmount: number;
  total: number;
  dueDate: string;
  notes?: string;
  orderId?: string;
}

interface UpdateInvoiceInput {
  status?: InvoiceStatus;
  amountPaid?: number;
  paymentMethod?: PaymentMethod;
  paymentRef?: string;
  notes?: string;
}

interface ListFilters {
  status?: InvoiceStatus;
  page: number;
  limit: number;
}

export class InvoiceService {
  async create(data: CreateInvoiceInput) {
    const year = new Date().getFullYear();
    const count = await prisma.invoice.count({
      where: {
        createdAt: {
          gte: new Date(year, 0, 1),
          lt: new Date(year + 1, 0, 1),
        },
      },
    });
    
    const invoiceNumber = `INV-${year}-${String(count + 1).padStart(4, '0')}`;
    
    return prisma.invoice.create({
      data: {
        invoiceNumber,
        customerName: data.customerName,
        customerEmail: data.customerEmail,
        customerPhone: data.customerPhone,
        customerAddress: data.customerAddress,
        items: data.items as any,
        subtotal: data.subtotal,
        vatAmount: data.vatAmount,
        total: data.total,
        dueDate: new Date(data.dueDate),
        notes: data.notes,
        orderId: data.orderId,
        status: 'DRAFT',
        amountPaid: 0,
      },
    });
  }

  async list(filters: ListFilters) {
    const where = {
      ...(filters.status && { status: filters.status }),
    };

    const [invoices, total] = await Promise.all([
      prisma.invoice.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (filters.page - 1) * filters.limit,
        take: filters.limit,
        include: {
          order: {
            select: { id: true, orderNumber: true },
          },
        },
      }),
      prisma.invoice.count({ where }),
    ]);

    return {
      invoices,
      pagination: {
        page: filters.page,
        limit: filters.limit,
        total,
        totalPages: Math.ceil(total / filters.limit),
      },
    };
  }

  async getById(id: string) {
    return prisma.invoice.findUnique({
      where: { id },
      include: {
        order: true,
        user: {
          select: { id: true, email: true, firstName: true, lastName: true },
        },
      },
    });
  }

  async update(id: string, data: UpdateInvoiceInput) {
    const updateData: any = { ...data };
    
    if (data.status === 'PAID' && data.amountPaid) {
      const invoice = await prisma.invoice.findUnique({ where: { id } });
      if (invoice && data.amountPaid >= invoice.total) {
        updateData.paidAt = new Date();
      }
    }

    return prisma.invoice.update({
      where: { id },
      data: updateData,
    });
  }

  async delete(id: string) {
    return prisma.invoice.delete({
      where: { id },
    });
  }

  async getStats() {
    const now = new Date();
    
    const [
      total,
      draft,
      sent,
      paid,
      overdue,
      outstandingAmount,
      paidThisMonth,
    ] = await Promise.all([
      prisma.invoice.count(),
      prisma.invoice.count({ where: { status: 'DRAFT' } }),
      prisma.invoice.count({ where: { status: 'SENT' } }),
      prisma.invoice.count({ where: { status: 'PAID' } }),
      prisma.invoice.count({ where: { status: 'OVERDUE' } }),
      prisma.invoice.aggregate({
        where: {
          status: { in: ['SENT', 'OVERDUE'] },
        },
        _sum: { total: true },
      }),
      prisma.invoice.aggregate({
        where: {
          status: 'PAID',
          paidAt: {
            gte: new Date(now.getFullYear(), now.getMonth(), 1),
          },
        },
        _sum: { total: true },
      }),
    ]);

    return {
      total,
      draft,
      sent,
      paid,
      overdue,
      outstandingAmount: outstandingAmount._sum.total || 0,
      paidThisMonth: paidThisMonth._sum.total || 0,
    };
  }
}
