'use client';

import { useEffect, useState } from 'react';
import { CheckCircle, Download, Printer, X } from 'lucide-react';

/**
 * The receipt a guest downloads after placing a café order.
 *
 * Payment is settled at the desk — there is no online payment — so the
 * receipt doubles as the bill: it lists every line item, the total payable
 * and a clear "payment due at the desk" notice. The same markup prints
 * (window.print → Save as PDF) via the `.receipt-print` rules in
 * styles/globals.css, and a real .pdf is generated with jsPDF.
 */

export type ReceiptItem = {
  name: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
};

export type ReceiptData = {
  orderRef: string;
  /** ISO timestamp of the order (zone-normalised by the caller). */
  placedAt: string;
  guestName: string | null;
  /** "Table 3" or "Cottage Monal Haven". */
  seatLabel: string;
  tableNumber: number;
  items: ReceiptItem[];
  totalAmount: number;
  status: string;
  paymentStatus: string;
  paymentMethod?: string | null;
};

const STATUS_LABELS: Record<string, string> = {
  PENDING: 'Received',
  PREPARING: 'Preparing',
  READY: 'Ready to serve',
  DELIVERED: 'Served',
  CANCELLED: 'Cancelled',
};

const inr = (n: number) => `₹${Math.round(n).toLocaleString('en-IN')}`;
const pdfInr = (n: number) => `Rs. ${Math.round(n).toLocaleString('en-IN')}`;

/** jsPDF's built-in fonts only cover Latin-1; strip anything else (₹ → "Rs."). */
const ascii = (s: string) =>
  s
    .replace(/₹/g, 'Rs. ')
    .replace(/[–—]/g, '-')
    .replace(/[’‘]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/…/g, '...')
    .replace(/[^\x20-\x7E]/g, '');

function formatWhen(iso: string): string {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '';
  return d.toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

async function buildPdf(order: ReceiptData) {
  const { jsPDF } = await import('jspdf');
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  const W = doc.internal.pageSize.getWidth();
  const H = doc.internal.pageSize.getHeight();
  const M = 48;
  const right = W - M;
  const centre = W / 2;
  const colQty = M + 268;
  const colRate = M + 350;
  let y = 44;

  // Vedara logo, fetched so it can be embedded without bundling the bytes.
  try {
    const res = await fetch('/images/vedara-logo.jpeg');
    const blob = await res.blob();
    const dataUrl: string = await new Promise((resolve, reject) => {
      const fr = new FileReader();
      fr.onload = () => resolve(String(fr.result));
      fr.onerror = () => reject(fr.error);
      fr.readAsDataURL(blob);
    });
    const size = 76;
    doc.addImage(dataUrl, 'JPEG', (W - size) / 2, y, size, size);
    y += size + 14;
  } catch {
    // The receipt is still valid without the logo.
  }

  doc.setFont('helvetica', 'bold').setFontSize(20).setTextColor(0);
  doc.text('THE VEDARA', centre, y, { align: 'center' });
  y += 13;
  doc.setFont('helvetica', 'normal').setFontSize(9).setTextColor(90);
  doc.text('HIMALAYAN BOUTIQUE RETREAT', centre, y, { align: 'center' });
  y += 12;
  doc.text('Ghiyagi, Jibhi, Himachal Pradesh 175123', centre, y, { align: 'center' });
  y += 11;
  doc.text('+91-9118882242  ·  vedararetreat@gmail.com', centre, y, { align: 'center' });
  y += 16;

  doc.setDrawColor(190).setLineWidth(0.7).line(M, y, right, y);
  y += 20;
  doc.setFont('helvetica', 'bold').setFontSize(13).setTextColor(0);
  doc.text('ORDER RECEIPT', centre, y, { align: 'center' });
  y += 20;

  const meta: Array<[string, string]> = [
    ['Order reference', order.orderRef],
    ['Date', formatWhen(order.placedAt)],
    ['Guest', order.guestName || 'Walk-in guest'],
    ['Order for', order.seatLabel],
    ['Kitchen status', STATUS_LABELS[order.status] || order.status],
  ];
  doc.setFontSize(9.5);
  for (const [key, value] of meta) {
    doc.setFont('helvetica', 'normal').setTextColor(110);
    doc.text(key, M, y);
    doc.setFont('helvetica', 'bold').setTextColor(0);
    doc.text(ascii(String(value)), M + 110, y);
    y += 14;
  }
  y += 4;

  doc.setDrawColor(190).line(M, y, right, y);
  y += 15;
  doc.setFont('helvetica', 'bold').setFontSize(8.5).setTextColor(110);
  doc.text('ITEM', M, y);
  doc.text('QTY', colQty, y);
  doc.text('RATE', colRate, y);
  doc.text('AMOUNT', right, y, { align: 'right' });
  y += 6;
  doc.setDrawColor(190).line(M, y, right, y);
  y += 13;

  doc.setTextColor(0);
  for (const item of order.items) {
    const lines: string[] = doc.splitTextToSize(ascii(item.name), 250);
    doc.setFont('helvetica', 'normal').setFontSize(9.5);
    lines.forEach((line, i) => doc.text(line, M, y + i * 12));
    doc.text(String(item.quantity), colQty, y);
    doc.text(pdfInr(item.unitPrice), colRate, y);
    doc.text(pdfInr(item.totalPrice), right, y, { align: 'right' });
    y += Math.max(lines.length * 12, 12) + 5;
    if (y > H - 160) break; // never spill into the totals block
  }

  y += 4;
  doc.setDrawColor(120).setLineWidth(0.9).line(M, y, right, y);
  y += 18;
  doc.setFont('helvetica', 'bold').setFontSize(12).setTextColor(0);
  doc.text('TOTAL PAYABLE AT DESK', M, y);
  doc.text(pdfInr(order.totalAmount), right, y, { align: 'right' });
  y += 26;

  const paid = order.paymentStatus === 'PAID';
  const boxH = 46;
  doc.setDrawColor(paid ? 60 : 200).setLineWidth(0.8).rect(M, y, right - M, boxH);
  doc.setFont('helvetica', 'bold').setFontSize(10).setTextColor(0);
  doc.text(paid ? 'PAID - THANK YOU' : 'PAYMENT DUE AT THE DESK', M + 12, y + 18);
  doc.setFont('helvetica', 'normal').setFontSize(8.5).setTextColor(80);
  const note = paid
    ? 'Settled at the reception counter. No online payment was taken for this order.'
    : 'Settle in cash / UPI / card at the reception counter. No online payment has been taken for this order.';
  doc.text(doc.splitTextToSize(note, right - M - 24), M + 12, y + 33);
  y += boxH + 30;

  if (y > H - 70) y = H - 70;
  doc.setFontSize(8).setTextColor(120);
  doc.text('Thank you for dining with us.', centre, y, { align: 'center' });
  y += 11;
  doc.text(
    ascii(`Order ${order.orderRef} · Prices in INR, taxes inclusive · vedararetreat@gmail.com`),
    centre,
    y,
    { align: 'center' }
  );
  y += 11;
  doc.text('Computer-generated receipt from The Vedara, Jibhi.', centre, y, { align: 'center' });

  return doc;
}

export function OrderReceipt({
  order,
  onClose,
}: {
  order: ReceiptData;
  onClose: () => void;
}) {
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const doc = await buildPdf(order);
      doc.save(`Vedara-Receipt-${order.orderRef}.pdf`);
    } catch {
      alert('Could not generate the PDF. Please use the Print button instead.');
    } finally {
      setDownloading(false);
    }
  };

  const paid = order.paymentStatus === 'PAID';

  return (
    <div
      className="receipt-overlay fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="receipt-shell relative bg-white dark:bg-[#231B12] w-full max-w-md rounded-2xl shadow-2xl max-h-[92vh] overflow-y-auto my-4"
        onClick={e => e.stopPropagation()}
      >
        <div className="no-print flex items-start justify-between gap-3 px-6 pt-5 pb-1">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-600 shrink-0" />
            <div>
              <h3 className="font-serif text-lg text-foreground">Order Placed!</h3>
              <p className="text-xs text-muted-foreground">
                Sent to the kitchen · Ref {order.orderRef}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close receipt"
            className="p-1.5 rounded-full text-muted-foreground hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="receipt-print bg-white text-gray-900 px-6 py-4">
          <div className="text-center">
            {/* Plain img: prints reliably and never waits on the image optimizer. */}
            <img
              src="/images/vedara-logo.jpeg"
              alt="The Vedara"
              className="w-20 h-20 object-contain mx-auto"
            />
            <h2 className="font-serif text-xl tracking-wide text-gray-900 mt-1">THE VEDARA</h2>
            <p className="text-[10px] uppercase tracking-[0.3em] text-gray-500">
              Himalayan Boutique Retreat
            </p>
            <p className="text-[11px] text-gray-500 mt-1.5 leading-relaxed">
              Ghiyagi, Jibhi, Himachal Pradesh 175123
              <br />
              +91-9118882242 · vedararetreat@gmail.com
            </p>
          </div>

          <div className="border-t border-b border-gray-300 my-3 py-1.5 flex items-center justify-between text-[10px] uppercase tracking-[0.2em] text-gray-500">
            <span>Order Receipt</span>
            <span className="font-semibold text-gray-700">{order.orderRef}</span>
          </div>

          <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-[12px] mb-3">
            <div>
              <span className="text-gray-500 text-[10.5px] uppercase tracking-wider">Date</span>
              <p className="font-medium">{formatWhen(order.placedAt)}</p>
            </div>
            <div>
              <span className="text-gray-500 text-[10.5px] uppercase tracking-wider">Order for</span>
              <p className="font-medium">{order.seatLabel}</p>
            </div>
            <div>
              <span className="text-gray-500 text-[10.5px] uppercase tracking-wider">Guest</span>
              <p className="font-medium truncate">{order.guestName || 'Walk-in guest'}</p>
            </div>
            <div>
              <span className="text-gray-500 text-[10.5px] uppercase tracking-wider">
                Kitchen status
              </span>
              <p className="font-medium">{STATUS_LABELS[order.status] || order.status}</p>
            </div>
          </div>

          <table className="w-full text-[12.5px] border-collapse">
            <thead>
              <tr className="text-[10px] uppercase tracking-wider text-gray-500 border-y border-gray-300">
                <th className="text-left font-medium py-1.5">Item</th>
                <th className="text-center font-medium">Qty</th>
                <th className="text-right font-medium">Rate</th>
                <th className="text-right font-medium">Amount</th>
              </tr>
            </thead>
            <tbody>
              {order.items.map((item, i) => (
                <tr key={i} className="border-b border-dashed border-gray-200 align-top">
                  <td className="py-2 pr-2 leading-snug">{item.name}</td>
                  <td className="py-2 text-center">{item.quantity}</td>
                  <td className="py-2 text-right whitespace-nowrap">{inr(item.unitPrice)}</td>
                  <td className="py-2 text-right font-medium whitespace-nowrap">
                    {inr(item.totalPrice)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="flex justify-between items-baseline pt-3 mt-1 border-t-2 border-gray-400">
            <span className="text-[10px] uppercase tracking-[0.2em] text-gray-500">
              Total payable at desk
            </span>
            <span className="text-lg font-bold">{inr(order.totalAmount)}</span>
          </div>

          <div
            className={`mt-3 rounded-lg border px-3 py-2 text-center ${
              paid
                ? 'border-green-300 bg-green-50 text-green-800'
                : 'border-amber-300 bg-amber-50 text-amber-800'
            }`}
          >
            <p className="text-[10.5px] font-semibold uppercase tracking-[0.15em]">
              {paid ? 'Payment received — thank you' : 'Payment due at the desk'}
            </p>
            <p className="text-[11px] mt-0.5">
              {paid
                ? 'Settled at the reception counter. No online payment was taken.'
                : 'Settle in cash / UPI / card at reception. No online payment has been taken.'}
            </p>
          </div>

          <p className="text-[10px] text-gray-500 text-center mt-3 leading-relaxed">
            Thank you for dining with us · Prices in INR, taxes inclusive
            <br />
            Computer-generated receipt · {order.orderRef}
          </p>
        </div>

        <div className="no-print flex gap-2 px-6 pb-6 pt-4">
          <button
            onClick={handleDownload}
            disabled={downloading}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-vedara-900 text-white text-sm font-medium hover:bg-vedara-900/80 transition-colors disabled:opacity-60"
          >
            <Download className="w-4 h-4" />
            {downloading ? 'Preparing…' : 'Download PDF'}
          </button>
          <button
            onClick={() => window.print()}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gray-100 dark:bg-[#2E2519] text-gray-700 dark:text-[#F3ECDA] text-sm font-medium hover:bg-gray-200 dark:hover:bg-[#2E2519]/80 transition-colors"
          >
            <Printer className="w-4 h-4" />
            Print
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl bg-gray-100 dark:bg-[#2E2519] text-gray-700 dark:text-[#F3ECDA] text-sm font-medium hover:bg-gray-200 dark:hover:bg-[#2E2519]/80 transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
