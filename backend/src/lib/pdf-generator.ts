import PDFDocument from 'pdfkit';
import { Buffer } from 'buffer';

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
  };
}

const money = (value: number) => `R ${Number(value || 0).toFixed(2)}`;

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

      // Header
      doc.fontSize(24).fillColor(primaryColor).text(data.company.brandName.toUpperCase(), 50, 50);

      doc.fontSize(9).fillColor(grayColor).text(
        `Operated by ${data.company.legalName}`,
        50,
        78
      );

      doc.fontSize(8).fillColor(grayColor).text(
        `Registration Number: ${data.company.registrationNumber}`,
        50,
        92
      );

      doc.fontSize(8).fillColor(grayColor).text(
        `Tax Number: ${data.company.taxNumber}`,
        50,
        104
      );

      doc.fontSize(8).fillColor(grayColor).text(
        `${data.company.website} | ${data.company.supportEmail}`,
        50,
        116
      );

      // Invoice title
      doc.fontSize(22).fillColor(primaryColor).text('INVOICE', 400, 50, {
        width: 150,
        align: 'right',
      });

      doc.fontSize(9).fillColor(grayColor).text(`Invoice #: ${data.invoiceNumber}`, 400, 80, {
        width: 150,
        align: 'right',
      });

      doc.fontSize(9).fillColor(grayColor).text(`Order #: ${data.orderNumber}`, 400, 94, {
        width: 150,
        align: 'right',
      });

      const formattedDate = data.date.toLocaleDateString('en-ZA', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });

      doc.fontSize(9).fillColor(grayColor).text(`Date: ${formattedDate}`, 400, 108, {
        width: 150,
        align: 'right',
      });

      // Status badge
      const statusColor =
        ['PAID', 'COMPLETED', 'DELIVERED'].includes(data.status.toUpperCase())
          ? '#10b981'
          : '#f59e0b';

      doc.roundedRect(430, 126, 120, 24, 5).fill(statusColor);
      doc.fontSize(8).fillColor('#ffffff').text(data.status.toUpperCase(), 430, 134, {
        width: 120,
        align: 'center',
      });

      // Divider
      doc.moveTo(50, 165).lineTo(550, 165).strokeColor(lightBorder).lineWidth(1).stroke();

      // Bill To
      doc.fontSize(12).fillColor(primaryColor).text('Bill To:', 50, 185);
      doc.fontSize(10).fillColor(textColor).text(data.customer.name, 50, 205);
      doc.fontSize(9).fillColor(grayColor).text(data.customer.email, 50, 220);

      if (data.customer.phone) {
        doc.fontSize(9).fillColor(grayColor).text(data.customer.phone, 50, 235);
      }

      // Ship To
      if (data.address) {
        doc.fontSize(12).fillColor(primaryColor).text('Ship To:', 310, 185);
        doc.fontSize(9).fillColor(textColor).text(data.address.street, 310, 205);
        doc.fontSize(9).fillColor(textColor).text(
          `${data.address.city}, ${data.address.province}`,
          310,
          220
        );
        doc.fontSize(9).fillColor(textColor).text(data.address.postalCode, 310, 235);
      }

      // Items table
      const tableTop = 285;

      doc.moveTo(50, tableTop).lineTo(550, tableTop).strokeColor(primaryColor).lineWidth(2).stroke();

      doc.fontSize(10).fillColor(primaryColor).text('Item', 50, tableTop + 10);
      doc.text('Qty', 315, tableTop + 10);
      doc.text('Price', 380, tableTop + 10, { width: 70, align: 'right' });
      doc.text('Total', 480, tableTop + 10, { width: 70, align: 'right' });

      doc.moveTo(50, tableTop + 32).lineTo(550, tableTop + 32).strokeColor(lightBorder).lineWidth(1).stroke();

      let itemY = tableTop + 48;

      data.items.forEach((item) => {
        const itemTotal = item.price * item.quantity;

        doc.fontSize(9).fillColor(textColor).text(item.name, 50, itemY, {
          width: 240,
          lineGap: 2,
        });

        doc.fontSize(9).fillColor(grayColor).text(String(item.quantity), 315, itemY);
        doc.text(money(item.price), 380, itemY, { width: 70, align: 'right' });
        doc.fillColor(textColor).text(money(itemTotal), 480, itemY, { width: 70, align: 'right' });

        itemY += 30;

        if (itemY > 650) {
          doc.addPage();
          itemY = 60;
        }
      });

      // Totals
      const totalsY = itemY + 20;

      doc.moveTo(350, totalsY).lineTo(550, totalsY).strokeColor(lightBorder).lineWidth(1).stroke();

      doc.fontSize(10).fillColor(grayColor).text('Subtotal:', 380, totalsY + 12);
      doc.fillColor(textColor).text(money(data.subtotal), 480, totalsY + 12, {
        width: 70,
        align: 'right',
      });

      doc.fillColor(grayColor).text('Shipping:', 380, totalsY + 32);
      doc.fillColor(textColor).text(
        data.shippingCost === 0 ? 'FREE' : money(data.shippingCost),
        480,
        totalsY + 32,
        { width: 70, align: 'right' }
      );

      doc.moveTo(350, totalsY + 55).lineTo(550, totalsY + 55).strokeColor(primaryColor).lineWidth(2).stroke();

      doc.fontSize(12).fillColor(primaryColor).text('Total:', 380, totalsY + 68);
      doc.fontSize(14).fillColor(primaryColor).text(money(data.total), 480, totalsY + 65, {
        width: 70,
        align: 'right',
      });

      // Payment Method
      doc.fontSize(9).fillColor(grayColor).text(
        `Payment Method: ${data.paymentMethod}`,
        50,
        totalsY + 110
      );

      // EFT Bank Details
      if (data.paymentMethod.toUpperCase() === 'EFT' && data.bankDetails) {
        const bankY = totalsY + 135;

        doc.roundedRect(50, bankY, 500, 130, 5)
          .fill('#f8fbff');

        doc.roundedRect(50, bankY, 500, 130, 5)
          .stroke(primaryColor)
          .lineWidth(1)
          .stroke();

        doc.fontSize(12)
          .fillColor(primaryColor)
          .text('Bank Details for EFT Payment', 65, bankY + 15);

        let y = bankY + 40;

        const lineSpacing = 18;

        if (data.bankDetails.bankName) {
          doc.text(`Bank: ${data.bankDetails.bankName}`, 65, y);
          y += lineSpacing;
        }

        if (data.bankDetails.accountHolder) {
          doc.text(`Account Holder: ${data.bankDetails.accountHolder}`, 65, y);
          y += lineSpacing;
        }

        if (data.bankDetails.accountNumber) {
          doc.text(`Account Number: ${data.bankDetails.accountNumber}`, 65, y);
          y += lineSpacing;
        }

        if (data.bankDetails.accountType) {
          doc.text(`Account Type: ${data.bankDetails.accountType}`, 65, y);
          y += lineSpacing;
        }

        if (data.bankDetails.branchCode) {
          doc.text(`Branch Code: ${data.bankDetails.branchCode}`, 65, y);
          y += lineSpacing + 5;
        }

        doc.fontSize(9)
          .fillColor('#dc2626')
          .text(
            `IMPORTANT: Use Order Number ${data.orderNumber} as your payment reference.`,
            65,
            y
          );

        doc.fontSize(8)
          .fillColor(grayColor)
          .text(
            'Orders will only be processed once payment has been received and cleared.',
            65,
            y + 18
          );
      }

      // Footer
      const footerY = 710;

      doc.moveTo(50, footerY).lineTo(550, footerY).strokeColor(lightBorder).lineWidth(1).stroke();

      doc.fontSize(9).fillColor(grayColor).text('Thank you for your business.', 50, footerY + 15);

      doc.fontSize(8).fillColor(grayColor).text(
        `${data.company.brandName} is a trading name of ${data.company.legalName}`,
        50,
        footerY + 32
      );

      doc.fontSize(8).fillColor(grayColor).text(
        `${data.company.website} | ${data.company.supportEmail}`,
        50,
        footerY + 46
      );

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}
