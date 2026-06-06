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
}

export async function generateInvoicePDF(data: InvoiceData): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50, size: 'A4' });
      const chunks: Buffer[] = [];

      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      // Colors
      const primaryColor = '#003d7a';
      const accentColor = '#00d4ff';
      const grayColor = '#6b7280';

      // Header
      doc.fontSize(24).fillColor(primaryColor).text('BRETUNE TECHNOLOGIES', 50, 50);
      doc.fontSize(10).fillColor(grayColor).text('Enterprise Networking Solutions', 50, 78);
      doc.fontSize(8).fillColor(grayColor).text('Reg: 2025/545182/07 | VAT: 9276141273', 50, 92);
      doc.fontSize(8).fillColor(grayColor).text('sales@bretunetech.com | +27 61 268 5933', 50, 104);

      // Invoice title
      doc.fontSize(20).fillColor(primaryColor).text('INVOICE', 400, 50, { align: 'right' });
      doc.fontSize(10).fillColor(grayColor).text(`Invoice #: ${data.invoiceNumber}`, 400, 78, { align: 'right' });
      doc.fontSize(10).fillColor(grayColor).text(`Order #: ${data.orderNumber}`, 400, 92, { align: 'right' });

      // Date and status
      const formattedDate = data.date.toLocaleDateString('en-ZA', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
      doc.fontSize(10).fillColor(grayColor).text(`Date: ${formattedDate}`, 400, 106, { align: 'right' });
      
      // Status badge
      const statusColor = data.status === 'PAID' || data.status === 'COMPLETED' ? '#10b981' : '#f59e0b';
      doc.roundedRect(400, 120, 120, 24, 4).fill(statusColor);
      doc.fontSize(9).fillColor('#ffffff').text(data.status.toUpperCase(), 460, 132, { align: 'center' });

      // Divider
      doc.moveTo(50, 160).lineTo(550, 160).strokeColor('#e5e7eb').lineWidth(1).stroke();

      // Bill To
      doc.fontSize(12).fillColor(primaryColor).text('Bill To:', 50, 180);
      doc.fontSize(11).fillColor('#374151').text(data.customer.name, 50, 198);
      doc.fontSize(10).fillColor(grayColor).text(data.customer.email, 50, 212);
      if (data.customer.phone) {
        doc.fontSize(10).fillColor(grayColor).text(data.customer.phone, 50, 226);
      }

      // Ship To (if address exists)
      if (data.address) {
        doc.fontSize(12).fillColor(primaryColor).text('Ship To:', 300, 180);
        doc.fontSize(10).fillColor('#374151').text(data.address.street, 300, 198);
        doc.fontSize(10).fillColor('#374151').text(`${data.address.city}, ${data.address.province}`, 300, 212);
        doc.fontSize(10).fillColor('#374151').text(data.address.postalCode, 300, 226);
      }

      // Items table header
      const tableTop = 280;
      doc.moveTo(50, tableTop).lineTo(550, tableTop).strokeColor(primaryColor).lineWidth(2).stroke();
      
      doc.fontSize(10).fillColor(primaryColor).text('Item', 50, tableTop + 10);
      doc.fontSize(10).fillColor(primaryColor).text('Qty', 300, tableTop + 10);
      doc.fontSize(10).fillColor(primaryColor).text('Price', 380, tableTop + 10, { align: 'right' });
      doc.fontSize(10).fillColor(primaryColor).text('Total', 480, tableTop + 10, { align: 'right' });

      doc.moveTo(50, tableTop + 30).lineTo(550, tableTop + 30).strokeColor('#e5e7eb').lineWidth(1).stroke();

      // Items
      let itemY = tableTop + 45;
      data.items.forEach((item) => {
        doc.fontSize(10).fillColor('#374151').text(item.name, 50, itemY);
        doc.fontSize(10).fillColor(grayColor).text(item.quantity.toString(), 300, itemY);
        doc.fontSize(10).fillColor(grayColor).text(`R${item.price.toFixed(2)}`, 380, itemY, { align: 'right' });
        doc.fontSize(10).fillColor('#374151').text(`R${(item.price * item.quantity).toFixed(2)}`, 480, itemY, { align: 'right' });
        itemY += 25;
      });

      // Totals
      const totalsY = itemY + 20;
      doc.moveTo(350, totalsY).lineTo(550, totalsY).strokeColor('#e5e7eb').lineWidth(1).stroke();

      doc.fontSize(10).fillColor(grayColor).text('Subtotal:', 380, totalsY + 10);
      doc.fontSize(10).fillColor('#374151').text(`R${data.subtotal.toFixed(2)}`, 480, totalsY + 10, { align: 'right' });

      doc.fontSize(10).fillColor(grayColor).text('Shipping:', 380, totalsY + 30);
      doc.fontSize(10).fillColor('#374151').text(data.shippingCost === 0 ? 'FREE' : `R${data.shippingCost.toFixed(2)}`, 480, totalsY + 30, { align: 'right' });

      doc.moveTo(350, totalsY + 50).lineTo(550, totalsY + 50).strokeColor(primaryColor).lineWidth(2).stroke();

      doc.fontSize(12).fillColor(primaryColor).text('Total:', 380, totalsY + 60);
      doc.fontSize(14).fillColor(primaryColor).text(`R${data.total.toFixed(2)}`, 480, totalsY + 58, { align: 'right' });

      // Payment info
      doc.fontSize(10).fillColor(grayColor).text(`Payment Method: ${data.paymentMethod}`, 50, totalsY + 100);

      // Footer
      const footerY = 700;
      doc.moveTo(50, footerY).lineTo(550, footerY).strokeColor('#e5e7eb').lineWidth(1).stroke();
      
      doc.fontSize(9).fillColor(grayColor).text('Thank you for your business!', 50, footerY + 15);
      doc.fontSize(8).fillColor(grayColor).text('BRETUNE TECHNOLOGIES - Enterprise Networking Solutions', 50, footerY + 30);
      doc.fontSize(8).fillColor(grayColor).text('Reg: 2025/545182/07 | VAT: 9276141273', 50, footerY + 45);
      doc.fontSize(8).fillColor(grayColor).text('134 Kommitjie Road, Fish Hoek, Cape Town, 7975', 50, footerY + 60);

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}
