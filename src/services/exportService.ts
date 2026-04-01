import * as XLSX from 'xlsx';
import PDFDocument from 'pdfkit';
import { Transaction } from '../models/Transaction';
import { Types } from 'mongoose';

interface ExportFilters {
  startDate?: Date;
  endDate?: Date;
  type?: string;
  categoryId?: string;
}

const getTransactionsForExport = async (userId: string, filters: ExportFilters) => {
  const query: any = { userId: new Types.ObjectId(userId) };
  if (filters.type) query.type = filters.type;
  if (filters.categoryId) query.categoryId = new Types.ObjectId(filters.categoryId);
  if (filters.startDate || filters.endDate) {
    query.date = {};
    if (filters.startDate) query.date.$gte = filters.startDate;
    if (filters.endDate) query.date.$lte = filters.endDate;
  }
  return Transaction.find(query)
    .populate('categoryId', 'name type')
    .populate('walletId', 'name currency')
    .sort({ date: -1 });
};

export const exportExcel = async (userId: string, filters: ExportFilters): Promise<Buffer> => {
  const transactions = await getTransactionsForExport(userId, filters);
  const rows = transactions.map((t) => ({
    Date: t.date.toISOString().split('T')[0],
    Type: t.type,
    Category: (t.categoryId as any)?.name || '',
    Wallet: (t.walletId as any)?.name || '',
    Amount: t.amount,
    Currency: (t.walletId as any)?.currency || 'LAK',
    Note: t.note || '',
  }));

  const ws = XLSX.utils.json_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Transactions');
  return XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
};

export const exportPdf = async (userId: string, filters: ExportFilters): Promise<Buffer> => {
  const transactions = await getTransactionsForExport(userId, filters);

  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 40 });
    const chunks: Buffer[] = [];
    doc.on('data', (chunk) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    doc.fontSize(18).text('Transaction History', { align: 'center' });
    doc.moveDown();
    doc.fontSize(9);

    // Header
    doc
      .font('Helvetica-Bold')
      .text('Date', 40, doc.y, { continued: true, width: 80 })
      .text('Type', { continued: true, width: 70 })
      .text('Category', { continued: true, width: 100 })
      .text('Wallet', { continued: true, width: 80 })
      .text('Amount', { continued: true, width: 80 })
      .text('Note', { width: 120 });
    doc.font('Helvetica');
    doc.moveDown(0.5);
    doc.moveTo(40, doc.y).lineTo(555, doc.y).stroke();
    doc.moveDown(0.3);

    transactions.forEach((t) => {
      const y = doc.y;
      if (y > 720) {
        doc.addPage();
      }
      const currency = (t.walletId as any)?.currency || 'LAK';
      doc
        .text(t.date.toISOString().split('T')[0], 40, doc.y, { continued: true, width: 80 })
        .text(t.type, { continued: true, width: 70 })
        .text((t.categoryId as any)?.name || '', { continued: true, width: 100 })
        .text((t.walletId as any)?.name || '', { continued: true, width: 80 })
        .text(`${t.amount} ${currency}`, { continued: true, width: 80 })
        .text(t.note || '', { width: 120 });
    });

    doc.end();
  });
};
