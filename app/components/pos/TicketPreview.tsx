'use client';

import { useRef } from 'react';
import { Sale, StoreConfig } from '../../types';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { FiPrinter, FiDownload, FiX } from 'react-icons/fi';
import { jsPDF } from 'jspdf';

interface TicketPreviewProps {
  isOpen: boolean;
  onClose: () => void;
  sale: Sale | null;
  storeConfig: StoreConfig;
}

export function TicketPreview({
  isOpen,
  onClose,
  sale,
  storeConfig,
}: TicketPreviewProps) {
  const ticketRef = useRef<HTMLDivElement>(null);

  if (!isOpen || !sale) return null;

  const handlePrint = () => {
    const printContent = ticketRef.current;
    if (!printContent) return;

    const printWindow = window.open('', '', 'width=300,height=600');
    if (!printWindow) return;

    printWindow.document.write(`
      <html>
        <head>
          <title>Ticket ${sale.ticketNumber}</title>
          <style>
            body {
              font-family: 'Courier New', monospace;
              font-size: 12px;
              margin: 0;
              padding: 10px;
              width: 280px;
            }
            .center { text-align: center; }
            .bold { font-weight: bold; }
            .line { border-top: 1px dashed #000; margin: 8px 0; }
            .item { display: flex; justify-content: space-between; margin: 4px 0; }
            .total { font-size: 14px; font-weight: bold; }
          </style>
        </head>
        <body>
          ${printContent.innerHTML}
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
    printWindow.close();
  };

  const handleDownloadPDF = () => {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: [80, 200],
    });

    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(storeConfig.name, 40, 10, { align: 'center' });

    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text(storeConfig.address, 40, 15, { align: 'center' });
    doc.text(`Tel: ${storeConfig.phone}`, 40, 19, { align: 'center' });

    if (storeConfig.rfc) {
      doc.text(`RFC: ${storeConfig.rfc}`, 40, 23, { align: 'center' });
    }

    doc.setDrawColor(0);
    doc.setLineDashPattern([1, 1], 0);
    doc.line(5, 27, 75, 27);

    doc.text(`Ticket: ${sale.ticketNumber}`, 5, 32);
    doc.text(format(new Date(sale.createdAt), 'dd/MM/yyyy HH:mm', { locale: es }), 5, 36);

    doc.line(5, 40, 75, 40);

    let yPos = 45;
    sale.items.forEach((item) => {
      doc.text(`${item.quantity} x ${item.productName}`, 5, yPos);
      doc.text(`$${item.subtotal.toFixed(2)}`, 75, yPos, { align: 'right' });
      yPos += 4;
    });

    doc.line(5, yPos + 2, 75, yPos + 2);
    yPos += 7;

    doc.text(`Subtotal:`, 5, yPos);
    doc.text(`$${sale.subtotal.toFixed(2)}`, 75, yPos, { align: 'right' });
    yPos += 4;

    if (sale.discount > 0) {
      doc.text(`Descuento:`, 5, yPos);
      doc.text(`-$${sale.discount.toFixed(2)}`, 75, yPos, { align: 'right' });
      yPos += 4;
    }

    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text(`TOTAL:`, 5, yPos);
    doc.text(`$${sale.total.toFixed(2)}`, 75, yPos, { align: 'right' });
    yPos += 5;

    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    const paymentLabels: Record<string, string> = {
      efectivo: 'Efectivo',
      tarjeta: 'Tarjeta',
      vale: 'Vale',
    };
    doc.text(`Pago: ${paymentLabels[sale.paymentMethod]}`, 5, yPos);
    yPos += 4;

    if (sale.paymentMethod === 'efectivo') {
      doc.text(`Recibido: $${sale.amountPaid.toFixed(2)}`, 5, yPos);
      yPos += 4;
      doc.text(`Cambio: $${sale.change.toFixed(2)}`, 5, yPos);
      yPos += 4;
    }

    doc.line(5, yPos + 2, 75, yPos + 2);
    yPos += 7;

    if (storeConfig.ticketFooter) {
      const lines = storeConfig.ticketFooter.split('\n');
      lines.forEach((line) => {
        doc.text(line, 40, yPos, { align: 'center' });
        yPos += 4;
      });
    }

    doc.save(`ticket-${sale.ticketNumber}.pdf`);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
          onClick={onClose}
        />

        {/* Modal */}
        <div className="relative bg-[#1d1d1d] border border-white/10 rounded-xl shadow-2xl w-full max-w-md transform transition-all animate-scale-in">
          {/* Header */}
          <div className="flex items-center justify-between p-5 border-b border-white/10">
            <h2 className="text-lg uppercase tracking-[0.15em] text-white font-medium">Ticket de Venta</h2>
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-white/40 hover:text-white/60 hover:bg-white/5 transition-all duration-300"
            >
              <FiX size={20} />
            </button>
          </div>

          {/* Content */}
          <div className="p-5 space-y-5">
            {/* Ticket Preview */}
            <div
              ref={ticketRef}
              className="bg-white border border-white/20 rounded-lg p-4 font-mono text-sm text-gray-900"
            >
              {/* Header */}
              <div className="text-center mb-4">
                <h3 className="font-bold text-base">{storeConfig.name}</h3>
                <p className="text-gray-600 text-xs">{storeConfig.address}</p>
                <p className="text-gray-600 text-xs">Tel: {storeConfig.phone}</p>
                {storeConfig.rfc && (
                  <p className="text-gray-600 text-xs">RFC: {storeConfig.rfc}</p>
                )}
              </div>

              <div className="border-t border-dashed border-gray-300 my-2" />

              {/* Ticket Info */}
              <div className="flex justify-between text-xs mb-2">
                <span>Ticket: {sale.ticketNumber}</span>
                <span>
                  {format(new Date(sale.createdAt), 'dd/MM/yyyy HH:mm', { locale: es })}
                </span>
              </div>

              <div className="border-t border-dashed border-gray-300 my-2" />

              {/* Items */}
              <div className="space-y-1 mb-2">
                {sale.items.map((item, index) => (
                  <div key={index} className="flex justify-between text-xs">
                    <span className="flex-1">
                      {item.quantity} x {item.productName}
                    </span>
                    <span className="ml-2">
                      ${item.subtotal.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                ))}
              </div>

              <div className="border-t border-dashed border-gray-300 my-2" />

              {/* Totals */}
              <div className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>${sale.subtotal.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
                </div>
                {sale.discount > 0 && (
                  <div className="flex justify-between text-red-600">
                    <span>Descuento:</span>
                    <span>-${sale.discount.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-sm pt-1">
                  <span>TOTAL:</span>
                  <span>${sale.total.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
                </div>
              </div>

              <div className="border-t border-dashed border-gray-300 my-2" />

              {/* Payment Info */}
              <div className="text-xs space-y-0.5">
                <p>
                  Pago:{' '}
                  {sale.paymentMethod === 'efectivo'
                    ? 'Efectivo'
                    : sale.paymentMethod === 'tarjeta'
                    ? 'Tarjeta'
                    : 'Vale'}
                </p>
                {sale.paymentMethod === 'efectivo' && (
                  <>
                    <p>Recibido: ${sale.amountPaid.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</p>
                    <p>Cambio: ${sale.change.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</p>
                  </>
                )}
              </div>

              <div className="border-t border-dashed border-gray-300 my-2" />

              {/* Footer */}
              {storeConfig.ticketFooter && (
                <div className="text-center text-xs text-gray-500 whitespace-pre-line">
                  {storeConfig.ticketFooter}
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 py-3 flex items-center justify-center gap-2 rounded-lg
                  bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20
                  text-white/60 hover:text-white text-sm uppercase tracking-[0.1em]
                  transition-all duration-300"
              >
                <FiX size={16} />
                <span>Cerrar</span>
              </button>
              <button
                onClick={handlePrint}
                className="flex-1 py-3 flex items-center justify-center gap-2 rounded-lg
                  bg-blue-500/20 hover:bg-blue-500/30 border border-blue-400/30 hover:border-blue-400/50
                  text-blue-400 text-sm uppercase tracking-[0.1em]
                  transition-all duration-300"
              >
                <FiPrinter size={16} />
                <span>Imprimir</span>
              </button>
              <button
                onClick={handleDownloadPDF}
                className="flex-1 py-3 flex items-center justify-center gap-2 rounded-lg
                  bg-green-500 hover:bg-green-400 border border-green-400/50
                  text-white text-sm uppercase tracking-[0.1em]
                  shadow-lg shadow-green-500/20 transition-all duration-300"
              >
                <FiDownload size={16} />
                <span>PDF</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
