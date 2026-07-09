import PDFDocument from 'pdfkit';
import { Buffer } from 'buffer';
import * as fs from 'fs';
import * as path from 'path';

interface InvoiceData {
  invoiceNumber: string;
  orderNumber: string;
  date: Date;
  customer: {
    name: string;
    email: string;
    phone?: string;
  };
  address?: {
    street: string;
    city: string;
    province: string;
    postalCode: string;
  };
  items: {
    name: string;
    sku?: string;
    quantity: number;
    price: number;
  }[];
  subtotal: number;
  shippingCost: number;
  total: number;
  status: string;
  paymentMethod: string;
  bankDetails?: {
    bankName?: string;
    accountHolder?: string;
    accountNumber?: string;
    accountType?: string;
    branchCode?: string;
  };
  company: {
    brandName: string;
    legalName: string;
    registrationNumber: string;
    taxNumber: string;
    website: string;
    email?: string;
    supportEmail: string;
    country: string;
    businessType: string;
    vatIncluded?: boolean;
    vatRate?: number;
  };
}

const money = (value: number) => {
  const num = Number(value || 0).toFixed(2);
  const parts = num.split('.');
  const whole = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  return `R ${whole},${parts[1]}`;
};

export async function generateInvoicePDF(data: InvoiceData): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50, size: 'A4' });
      const chunks: Buffer[] = [];

      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      const primaryColor = '#003d7a';
      const accentColor = '#f97316';
      const grayColor = '#6b7280';
      const textColor = '#374151';
      const lightBorder = '#e5e7eb';

      // Layout cursor system
      let cursorY = 50;

      // Logo - try to load from public assets or use fallback
      try {
        const logoPath = path.join(process.cwd(), '../frontend/public/assets/logo/logo-no-bac.png');
        if (fs.existsSync(logoPath)) {
          doc.image(logoPath, 50, cursorY, { width: 80, fit: [80, 80] });
        }
      } catch (e) {
        // Logo not available, continue without it
      }

      // Right side: Invoice title and details
      const invoiceRightX = 400;
      doc.fontSize(22).fillColor(primaryColor).text('INVOICE', invoiceRightX, cursorY, {
        width: 150,
        align: 'right',
      });
      cursorY += 30;

      doc.fontSize(9).fillColor(grayColor).text(`Invoice #: ${data.invoiceNumber}`, invoiceRightX, cursorY, {
        width: 150,
        align: 'right',
      });
      cursorY += 14;

      doc.fontSize(9).fillColor(grayColor).text(`Order #: ${data.orderNumber}`, invoiceRightX, cursorY, {
        width: 150,
        align: 'right',
      });
      cursorY += 14;

      const formattedDate = data.date.toLocaleDateString('en-ZA', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });

      doc.fontSize(9).fillColor(grayColor).text(`Date: ${formattedDate}`, invoiceRightX, cursorY, {
        width: 150,
        align: 'right',
      });
      cursorY += 14;

      // Payment Method
      doc.fontSize(9).fillColor(grayColor).text(`Payment: ${data.paymentMethod}`, invoiceRightX, cursorY, {
        width: 150,
        align: 'right',
      });
      cursorY += 14;

      // Status badge
      const statusColor =
        ['PAID', 'COMPLETED', 'DELIVERED'].includes(data.status.toUpperCase())
          ? '#10b981'
          : '#f59e0b';

      doc.roundedRect(invoiceRightX + 30, cursorY, 120, 24, 5).fill(statusColor);
      doc.fontSize(8).fillColor('#ffffff').text(data.status.toUpperCase(), invoiceRightX + 30, cursorY + 8, {
        width: 120,
        align: 'center',
      });

      // Reset cursor for left side company info
      cursorY = 140;

      // Left side: Company info below logo
      doc.fontSize(8).fillColor(grayColor).text(
        `Operated by ${data.company.legalName}`,
        50,
        cursorY
      );
      cursorY += 12;

      doc.fontSize(8).fillColor(grayColor).text(
        `Reg: ${data.company.registrationNumber}`,
        50,
        cursorY
      );
      cursorY += 12;

      doc.fontSize(8).fillColor(grayColor).text(
        `Tax: ${data.company.taxNumber}`,
        50,
        cursorY
      );
      cursorY += 12;

      doc.fontSize(8).fillColor(grayColor).text(
        `${data.company.website} | ${data.company.supportEmail}`,
        50,
        cursorY
      );
      cursorY += 30; // Extra spacing before Bill To

      // Divider
      doc.moveTo(50, cursorY).lineTo(550, cursorY).strokeColor(lightBorder).lineWidth(1).stroke();
      cursorY += 25;

      // Bill To and Ship To section
      doc.fontSize(12).fillColor(primaryColor).text('Bill To:', 50, cursorY);
      cursorY += 20;

      doc.fontSize(10).fillColor(textColor).text(data.customer.name, 50, cursorY);
      cursorY += 14;

      doc.fontSize(9).fillColor(grayColor).text(data.customer.email, 50, cursorY);
      cursorY += 12;

      if (data.customer.phone) {
        doc.fontSize(9).fillColor(grayColor).text(data.customer.phone, 50, cursorY);
        cursorY += 12;
      }

      // Ship To (on right side)
      let shipToY = cursorY - 50; // Align with Bill To start
      if (data.address) {
        doc.fontSize(12).fillColor(primaryColor).text('Ship To:', 310, shipToY);
        shipToY += 20;

        doc.fontSize(9).fillColor(textColor).text(data.address.street, 310, shipToY, { width: 200 });
        shipToY += 14;

        doc.fontSize(9).fillColor(textColor).text(
          `${data.address.city}, ${data.address.province}`,
          310,
          shipToY
        );
        shipToY += 12;

        doc.fontSize(9).fillColor(textColor).text(data.address.postalCode, 310, shipToY);
      }

      cursorY += 30; // Spacing before items table

      // Items table
      const tableTop = cursorY;

      doc.moveTo(50, tableTop).lineTo(550, tableTop).strokeColor(primaryColor).lineWidth(2).stroke();

      doc.fontSize(10).fillColor(primaryColor).text('SKU', 50, tableTop + 10);
      doc.text('Item', 120, tableTop + 10);
      doc.text('Qty', 315, tableTop + 10);
      doc.text('Price', 380, tableTop + 10, { width: 70, align: 'right' });
      doc.text('Total', 480, tableTop + 10, { width: 70, align: 'right' });

      doc.moveTo(50, tableTop + 32).lineTo(550, tableTop + 32).strokeColor(lightBorder).lineWidth(1).stroke();

      let itemY = tableTop + 48;

      data.items.forEach((item) => {
        const itemTotal = item.price * item.quantity;

        doc.fontSize(8).fillColor(grayColor).text(item.sku || 'N/A', 50, itemY);
        doc.fontSize(9).fillColor(textColor).text(item.name, 120, itemY, {
          width: 180,
          lineGap: 2,
        });
        doc.fontSize(9).fillColor(grayColor).text(String(item.quantity), 315, itemY);
        doc.text(money(item.price), 380, itemY, { width: 70, align: 'right' });
        doc.fillColor(textColor).text(money(itemTotal), 480, itemY, { width: 70, align: 'right' });

        itemY += 30;

        // Only add page if we're running out of space for more items + totals + footer
        if (itemY > 550) {
          doc.addPage();
          itemY = 60;
        }
      });

      // Totals - use safe PDF page measurements
      const margin = 60;
      const pageWidth = doc.page.width;
      const contentRight = pageWidth - margin;

      const totalsWidth = 260;
      const totalsX = contentRight - totalsWidth;

      const labelX = totalsX;
      const amountX = totalsX + 120;
      const amountWidth = totalsWidth - 120;

      let totalsY = itemY + 30;

      doc.moveTo(totalsX, totalsY).lineTo(contentRight, totalsY).strokeColor(lightBorder).lineWidth(1).stroke();

      totalsY += 12;

      doc.fontSize(10).fillColor(grayColor).text('Subtotal:', labelX, totalsY, {
        width: 120,
        align: 'left',
      });

      doc.fillColor(textColor).text(money(data.subtotal), amountX, totalsY, {
        width: amountWidth,
        align: 'right',
        lineBreak: false,
      });

      totalsY += 18;

      doc.fillColor(grayColor).text('Shipping:', labelX, totalsY, {
        width: 120,
        align: 'left',
      });

      doc.fillColor(textColor).text(
        data.shippingCost === 0 ? 'FREE' : money(data.shippingCost),
        amountX,
        totalsY,
        { width: amountWidth, align: 'right', lineBreak: false }
      );

      totalsY += 28;

      doc.moveTo(totalsX, totalsY).lineTo(contentRight, totalsY).strokeColor(primaryColor).lineWidth(2).stroke();

      totalsY += 18;

      doc.fontSize(12).fillColor(primaryColor).text('Total:', labelX, totalsY, {
        width: 120,
        align: 'left',
      });

      doc.fontSize(18).fillColor(primaryColor).text(money(data.total), amountX, totalsY - 4, {
        width: amountWidth,
        align: 'right',
        lineBreak: false,
      });

      cursorY = totalsY + 45;

      // Add spacing before footer
      cursorY += 30;

      // Check if we need a new page before footer - only if truly out of space
      const bankDetailsHeight = (data.paymentMethod.toUpperCase() === 'EFT' && data.bankDetails) ? 85 : 0;
      const footerContentHeight = 50 + bankDetailsHeight;
      // Only add page if we're very close to bottom (within 100px of page end)
      if (cursorY + footerContentHeight > 750) {
        doc.addPage();
        cursorY = 50;
      }

      // Footer at dynamic position based on content
      const footerY = cursorY;
      doc.moveTo(50, footerY).lineTo(550, footerY).strokeColor(lightBorder).lineWidth(1).stroke();

      const footerTextY = footerY + 15;

      // Left side: Company info
      doc.fontSize(9).fillColor(grayColor).text('Thank you for your business.', 50, footerTextY);
      doc.fontSize(8).fillColor(grayColor).text(
        `${data.company.brandName} is a trading name of ${data.company.legalName}`,
        50,
        footerTextY + 14
      );
      doc.fontSize(8).fillColor(grayColor).text(
        `${data.company.website} | ${data.company.supportEmail}`,
        50,
        footerTextY + 28
      );

      // Right side: EFT Bank Details
      if (data.paymentMethod.toUpperCase() === 'EFT' && data.bankDetails) {
        const bankX = 310;
        doc.fontSize(10).fillColor(primaryColor).text('Bank Details for EFT Payment:', bankX, footerTextY, { width: 200, align: 'right' });

        const lineSpacing = 14;
        let bankY = footerTextY + 16;

        if (data.bankDetails.bankName) {
          doc.fontSize(8).fillColor(textColor).text(`Bank: ${data.bankDetails.bankName}`, bankX, bankY, { width: 200, align: 'right' });
          bankY += lineSpacing;
        }

        if (data.bankDetails.accountHolder) {
          doc.fontSize(8).fillColor(textColor).text(`Account: ${data.bankDetails.accountNumber}`, bankX, bankY, { width: 200, align: 'right' });
          bankY += lineSpacing;
        }

        if (data.bankDetails.branchCode) {
          doc.fontSize(8).fillColor(textColor).text(`Branch: ${data.bankDetails.branchCode}`, bankX, bankY, { width: 200, align: 'right' });
          bankY += lineSpacing;
        }

        doc.fontSize(9).fillColor('#dc2626').text(
          `Ref: ${data.orderNumber}`,
          bankX,
          bankY,
          { width: 200, align: 'right' }
        );
      }

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}
