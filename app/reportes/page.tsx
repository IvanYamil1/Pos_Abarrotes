'use client';

import React, { useState, useMemo } from 'react';
import { MainLayout } from '../components/layout/MainLayout';
import { useSalesStore } from '../stores/salesStore';
import { useProductStore } from '../stores/productStore';
import { useCashRegisterStore } from '../stores/cashRegisterStore';
import { useThemeStore } from '../stores/themeStore';
import { format, startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, subDays } from 'date-fns';
import { es } from 'date-fns/locale';
import {
  FiDollarSign,
  FiTrendingUp,
  FiShoppingCart,
  FiDownload,
  FiBarChart2,
} from 'react-icons/fi';
import { jsPDF } from 'jspdf';

type DateRange = 'today' | 'week' | 'month' | 'custom';

export default function ReportesPage() {
  const { sales } = useSalesStore();
  const { products } = useProductStore();
  const { expenses } = useCashRegisterStore();
  const { colors } = useThemeStore();

  const [dateRange, setDateRange] = useState<DateRange>('today');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');

  // Get date range
  const getDateRange = (): { start: Date; end: Date } => {
    const now = new Date();
    switch (dateRange) {
      case 'today':
        return { start: startOfDay(now), end: endOfDay(now) };
      case 'week':
        return { start: startOfWeek(now, { locale: es }), end: endOfWeek(now, { locale: es }) };
      case 'month':
        return { start: startOfMonth(now), end: endOfMonth(now) };
      case 'custom':
        return {
          start: customStartDate ? startOfDay(new Date(customStartDate)) : subDays(now, 7),
          end: customEndDate ? endOfDay(new Date(customEndDate)) : now,
        };
      default:
        return { start: startOfDay(now), end: endOfDay(now) };
    }
  };

  const { start, end } = getDateRange();

  // Filter sales by date range
  const filteredSales = useMemo(() => {
    return sales.filter((sale) => {
      const saleDate = new Date(sale.createdAt);
      return saleDate >= start && saleDate <= end;
    });
  }, [sales, start, end]);

  // Calculate stats
  const stats = useMemo(() => {
    const totalSales = filteredSales.reduce((sum, sale) => sum + sale.total, 0);
    const totalTransactions = filteredSales.length;
    const averageTicket = totalTransactions > 0 ? totalSales / totalTransactions : 0;

    const cashSales = filteredSales
      .filter((s) => s.paymentMethod === 'efectivo')
      .reduce((sum, s) => sum + s.total, 0);
    const cardSales = filteredSales
      .filter((s) => s.paymentMethod === 'tarjeta')
      .reduce((sum, s) => sum + s.total, 0);
    const voucherSales = filteredSales
      .filter((s) => s.paymentMethod === 'vale')
      .reduce((sum, s) => sum + s.total, 0);

    // Calculate product sales
    const productSales: Record<string, { name: string; quantity: number; revenue: number; cost: number }> = {};

    filteredSales.forEach((sale) => {
      sale.items.forEach((item) => {
        const product = products.find((p) => p.id === item.productId);
        if (!productSales[item.productId]) {
          productSales[item.productId] = {
            name: item.productName,
            quantity: 0,
            revenue: 0,
            cost: 0,
          };
        }
        productSales[item.productId].quantity += item.quantity;
        productSales[item.productId].revenue += item.subtotal;
        if (product) {
          productSales[item.productId].cost += product.purchasePrice * item.quantity;
        }
      });
    });

    const topProducts = Object.entries(productSales)
      .map(([id, data]) => ({
        id,
        ...data,
        profit: data.revenue - data.cost,
      }))
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 10);

    // Calculate total costs for profit calculation
    const totalCost = Object.values(productSales).reduce((sum, p) => sum + p.cost, 0);
    const totalProfit = totalSales - totalCost;

    // Filter expenses by date range
    const filteredExpenses = expenses.filter((expense) => {
      const expenseDate = new Date(expense.createdAt);
      return expenseDate >= start && expenseDate <= end;
    });
    const totalExpenses = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);

    return {
      totalSales,
      totalTransactions,
      averageTicket,
      cashSales,
      cardSales,
      voucherSales,
      topProducts,
      totalProfit,
      totalCost,
      totalExpenses,
      netProfit: totalProfit - totalExpenses,
    };
  }, [filteredSales, products, expenses, start, end]);

  // Export to PDF - Minimal style matching the app
  const exportToPDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 20;
    const contentWidth = pageWidth - (margin * 2);

    // Minimal color palette
    const textPrimary: [number, number, number] = [30, 30, 30];
    const textMuted: [number, number, number] = [120, 120, 120];
    const borderColor: [number, number, number] = [220, 220, 220];
    const accent: [number, number, number] = [59, 130, 246];
    const success: [number, number, number] = [34, 197, 94];
    const error: [number, number, number] = [239, 68, 68];
    const warning: [number, number, number] = [245, 158, 11];

    let yPos = margin;

    // Header - minimal style
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...textMuted);
    doc.text('REPORTES', margin, yPos);

    yPos += 12;

    // Date range - large and light
    doc.setFontSize(12);
    doc.setTextColor(...textPrimary);
    doc.text(`${format(start, "d 'de' MMMM", { locale: es })} - ${format(end, "d 'de' MMMM yyyy", { locale: es })}`, margin, yPos);

    // Generation date on the right
    doc.setFontSize(8);
    doc.setTextColor(...textMuted);
    doc.text(`Generado: ${format(new Date(), "dd/MM/yyyy HH:mm")}`, pageWidth - margin, yPos, { align: 'right' });

    yPos += 20;

    // Divider line
    doc.setDrawColor(...borderColor);
    doc.setLineWidth(0.3);
    doc.line(margin, yPos, pageWidth - margin, yPos);

    yPos += 20;

    // Stats - 2x2 grid, minimal style
    const statBoxWidth = (contentWidth - 16) / 2;
    const statsData = [
      { label: 'VENTAS TOTALES', value: `$${stats.totalSales.toLocaleString('es-MX', { minimumFractionDigits: 2 })}` },
      { label: 'GANANCIA BRUTA', value: `$${stats.totalProfit.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`, color: success },
      { label: 'TRANSACCIONES', value: stats.totalTransactions.toString() },
      { label: 'TICKET PROMEDIO', value: `$${stats.averageTicket.toLocaleString('es-MX', { minimumFractionDigits: 2 })}` },
    ];

    statsData.forEach((stat, index) => {
      const col = index % 2;
      const row = Math.floor(index / 2);
      const x = margin + (col * (statBoxWidth + 16));
      const y = yPos + (row * 28);

      // Label
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...textMuted);
      doc.text(stat.label, x, y);

      // Value
      doc.setFontSize(22);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...(stat.color || textPrimary));
      doc.text(stat.value, x, y + 14);
    });

    yPos += 65;

    // Section divider
    doc.setDrawColor(...borderColor);
    doc.line(margin, yPos, pageWidth - margin, yPos);

    yPos += 16;

    // Two columns layout
    const colWidth = (contentWidth - 20) / 2;

    // Left: Payment Methods
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...textMuted);
    doc.text('VENTAS POR METODO DE PAGO', margin, yPos);

    const paymentMethods = [
      { label: 'Efectivo', value: stats.cashSales, color: success },
      { label: 'Tarjeta', value: stats.cardSales, color: accent },
      { label: 'Vales', value: stats.voucherSales, color: warning },
    ];

    let paymentY = yPos + 12;
    paymentMethods.forEach((method) => {
      const percent = stats.totalSales > 0 ? ((method.value / stats.totalSales) * 100).toFixed(1) : '0';

      doc.setFontSize(10);
      doc.setTextColor(...textPrimary);
      doc.text(method.label, margin, paymentY);

      doc.setTextColor(...textMuted);
      doc.text(`$${method.value.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`, margin + colWidth - 30, paymentY, { align: 'right' });

      doc.setFontSize(9);
      doc.setTextColor(...method.color);
      doc.text(`${percent}%`, margin + colWidth, paymentY, { align: 'right' });

      paymentY += 10;
    });

    // Right: Profit Summary
    const rightX = margin + colWidth + 20;
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...textMuted);
    doc.text('RESUMEN DE GANANCIAS', rightX, yPos);

    const profitItems = [
      { label: 'Ventas Totales', value: stats.totalSales, color: textPrimary },
      { label: 'Costo de Productos', value: -stats.totalCost, color: error },
      { label: 'Gastos', value: -stats.totalExpenses, color: warning },
    ];

    let profitY = yPos + 12;
    profitItems.forEach((item) => {
      doc.setFontSize(10);
      doc.setTextColor(...textPrimary);
      doc.text(item.label, rightX, profitY);

      doc.setTextColor(...item.color);
      const prefix = item.value < 0 ? '-' : '';
      doc.text(`${prefix}$${Math.abs(item.value).toLocaleString('es-MX', { minimumFractionDigits: 2 })}`, rightX + colWidth, profitY, { align: 'right' });

      profitY += 10;
    });

    // Net Profit - emphasized
    profitY += 4;
    doc.setDrawColor(...borderColor);
    doc.line(rightX, profitY - 2, rightX + colWidth, profitY - 2);

    doc.setFontSize(10);
    doc.setTextColor(...textPrimary);
    doc.text('Ganancia Neta', rightX, profitY + 6);

    doc.setFontSize(14);
    doc.setTextColor(...(stats.netProfit >= 0 ? success : error));
    doc.text(`$${stats.netProfit.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`, rightX + colWidth, profitY + 6, { align: 'right' });

    yPos = Math.max(paymentY, profitY) + 20;

    // Section divider
    doc.setDrawColor(...borderColor);
    doc.line(margin, yPos, pageWidth - margin, yPos);

    yPos += 16;

    // Top Products header
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...textMuted);
    doc.text('PRODUCTOS MAS VENDIDOS', margin, yPos);
    doc.text('Top 10 del periodo', margin + 60, yPos);

    yPos += 14;

    // Table header
    doc.setFontSize(8);
    doc.setTextColor(...textMuted);
    doc.text('#', margin, yPos);
    doc.text('PRODUCTO', margin + 12, yPos);
    doc.text('CANT', margin + 85, yPos, { align: 'right' });
    doc.text('INGRESOS', margin + 115, yPos, { align: 'right' });
    doc.text('COSTO', margin + 140, yPos, { align: 'right' });
    doc.text('GANANCIA', contentWidth + margin, yPos, { align: 'right' });

    yPos += 4;
    doc.setDrawColor(...borderColor);
    doc.line(margin, yPos, pageWidth - margin, yPos);
    yPos += 8;

    const footerHeight = 30; // Espacio reservado para el footer
    const maxYBeforeFooter = pageHeight - footerHeight;

    if (stats.topProducts.length === 0) {
      doc.setFontSize(10);
      doc.setTextColor(...textMuted);
      doc.text('No hay ventas en este periodo', pageWidth / 2, yPos + 10, { align: 'center' });
      yPos += 20;
    } else {
      stats.topProducts.forEach((product, index) => {
        // Rank
        doc.setFontSize(9);
        if (index < 3) {
          doc.setTextColor(...(index === 0 ? success : index === 1 ? accent : warning));
        } else {
          doc.setTextColor(...textMuted);
        }
        doc.text((index + 1).toString(), margin + 4, yPos, { align: 'center' });

        // Product name
        doc.setTextColor(...textPrimary);
        const productName = product.name.length > 32 ? product.name.substring(0, 30) + '...' : product.name;
        doc.text(productName, margin + 12, yPos);

        // Quantity
        doc.setTextColor(...textMuted);
        doc.text(product.quantity.toString(), margin + 85, yPos, { align: 'right' });

        // Revenue
        doc.setTextColor(...textPrimary);
        doc.text(`$${product.revenue.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`, margin + 115, yPos, { align: 'right' });

        // Cost
        doc.setTextColor(...textMuted);
        doc.text(`$${product.cost.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`, margin + 140, yPos, { align: 'right' });

        // Profit
        doc.setTextColor(...success);
        doc.text(`$${product.profit.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`, contentWidth + margin, yPos, { align: 'right' });

        yPos += 9;

        // Row separator
        if (index < stats.topProducts.length - 1) {
          doc.setDrawColor(240, 240, 240);
          doc.line(margin, yPos - 3, pageWidth - margin, yPos - 3);
        }
      });
    }

    // Footer - posicionado dinámicamente para no sobreponerse con el contenido
    const footerY = Math.max(yPos + 20, maxYBeforeFooter);

    doc.setDrawColor(...borderColor);
    doc.line(margin, footerY, pageWidth - margin, footerY);

    doc.setFontSize(8);
    doc.setTextColor(...textMuted);
    doc.text('POS Abarrotes', margin, footerY + 8);
    doc.text('1 / 1', pageWidth - margin, footerY + 8, { align: 'right' });

    doc.save(`reporte-ventas-${format(new Date(), 'yyyy-MM-dd')}.pdf`);
  };

  const dateRangeOptions = [
    { value: 'today', label: 'Hoy' },
    { value: 'week', label: 'Esta Semana' },
    { value: 'month', label: 'Este Mes' },
    { value: 'custom', label: 'Personalizado' },
  ];

  return (
    <MainLayout>
      <div style={{ padding: '20px', background: colors.bgPrimary, minHeight: '100vh' }}>
        {/* Header */}
        <div style={{ marginBottom: '48px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h1 style={{
              fontSize: '14px',
              fontWeight: '500',
              color: colors.textSecondary,
              marginBottom: '12px',
              letterSpacing: '0.15em',
              textTransform: 'uppercase'
            }}>
              Reportes
            </h1>
            <p style={{
              color: colors.textMuted,
              fontSize: '14px',
              fontWeight: '300',
              letterSpacing: '0.02em'
            }}>
              {format(start, "d 'de' MMMM", { locale: es })} - {format(end, "d 'de' MMMM yyyy", { locale: es })}
            </p>
          </div>
          <button
            onClick={exportToPDF}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 20px',
              background: colors.accent,
              border: 'none',
              borderRadius: '2px',
              color: 'white',
              fontSize: '13px',
              fontWeight: '500',
              cursor: 'pointer',
              letterSpacing: '0.02em',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(59, 130, 246, 0.8)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#3b82f6';
            }}
          >
            <FiDownload size={16} />
            Exportar PDF
          </button>
        </div>

        {/* Date Range Selector */}
        <div style={{
          background: colors.bgSecondary,
          border: `1px solid ${colors.borderColor}`,
          borderRadius: '2px',
          padding: '20px',
          marginBottom: '32px'
        }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '16px' }}>
            <div style={{ display: 'flex', gap: '8px' }}>
              {dateRangeOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setDateRange(option.value as DateRange)}
                  style={{
                    padding: '10px 20px',
                    background: dateRange === option.value ? colors.accent : colors.bgTertiary,
                    border: '1px solid',
                    borderColor: dateRange === option.value ? colors.accent : colors.borderColor,
                    borderRadius: '2px',
                    color: dateRange === option.value ? 'white' : colors.textSecondary,
                    fontSize: '13px',
                    fontWeight: '500',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    letterSpacing: '0.02em'
                  }}
                >
                  {option.label}
                </button>
              ))}
            </div>

            {dateRange === 'custom' && (
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <input
                  type="date"
                  value={customStartDate}
                  onChange={(e) => setCustomStartDate(e.target.value)}
                  style={{
                    padding: '10px 14px',
                    background: colors.bgTertiary,
                    border: `1px solid ${colors.borderColor}`,
                    borderRadius: '2px',
                    color: colors.textPrimary,
                    fontSize: '13px',
                    width: '160px'
                  }}
                />
                <span style={{ color: colors.textMuted, fontSize: '13px' }}>a</span>
                <input
                  type="date"
                  value={customEndDate}
                  onChange={(e) => setCustomEndDate(e.target.value)}
                  style={{
                    padding: '10px 14px',
                    background: colors.bgTertiary,
                    border: `1px solid ${colors.borderColor}`,
                    borderRadius: '2px',
                    color: colors.textPrimary,
                    fontSize: '13px',
                    width: '160px'
                  }}
                />
              </div>
            )}
          </div>
        </div>

        {/* Stats Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '24px',
          marginBottom: '32px'
        }}>
          {[
            {
              title: 'Ventas Totales',
              value: `$${stats.totalSales.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`,
              icon: FiDollarSign,
              iconColor: colors.accent
            },
            {
              title: 'Ganancia Bruta',
              value: `$${stats.totalProfit.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`,
              icon: FiTrendingUp,
              iconColor: colors.success,
              valueColor: colors.success
            },
            {
              title: 'Transacciones',
              value: stats.totalTransactions.toString(),
              icon: FiShoppingCart,
              iconColor: '#8b5cf6'
            },
            {
              title: 'Ticket Promedio',
              value: `$${stats.averageTicket.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`,
              icon: FiBarChart2,
              iconColor: colors.warning
            }
          ].map((stat) => (
            <div
              key={stat.title}
              style={{
                background: colors.bgSecondary,
                borderRadius: '2px',
                padding: '24px',
                border: `1px solid ${colors.borderColor}`,
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = colors.borderHover;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = colors.borderColor;
              }}
            >
              <p style={{
                fontSize: '11px',
                fontWeight: '500',
                color: colors.textMuted,
                textTransform: 'uppercase',
                letterSpacing: '0.15em',
                marginBottom: '16px'
              }}>
                {stat.title}
              </p>
              <p style={{
                fontSize: '36px',
                fontWeight: '300',
                color: stat.valueColor || colors.textPrimary,
                marginBottom: '8px',
                letterSpacing: '-0.02em',
                lineHeight: '1'
              }}>
                {stat.value}
              </p>
            </div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '32px' }}>
          {/* Payment Methods */}
          <div style={{
            background: colors.bgSecondary,
            borderRadius: '2px',
            padding: '24px',
            border: `1px solid ${colors.borderColor}`
          }}>
            <h2 style={{
              fontSize: '11px',
              fontWeight: '500',
              color: colors.textMuted,
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              marginBottom: '24px',
              paddingBottom: '16px',
              borderBottom: `1px solid ${colors.borderColor}`
            }}>
              Ventas por Método de Pago
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Efectivo */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '12px', height: '12px', background: colors.success, borderRadius: '2px' }}></div>
                    <span style={{ color: colors.textSecondary, fontSize: '14px', fontWeight: '400' }}>Efectivo</span>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ fontWeight: '400', color: colors.textPrimary, fontSize: '14px' }}>
                      ${stats.cashSales.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                    </p>
                    <p style={{ fontSize: '11px', color: colors.textMuted }}>
                      {stats.totalSales > 0 ? ((stats.cashSales / stats.totalSales) * 100).toFixed(1) : 0}%
                    </p>
                  </div>
                </div>
                <div style={{ width: '100%', background: colors.borderColor, borderRadius: '2px', height: '6px' }}>
                  <div style={{
                    background: colors.success,
                    height: '6px',
                    borderRadius: '2px',
                    width: `${stats.totalSales > 0 ? (stats.cashSales / stats.totalSales) * 100 : 0}%`,
                    transition: 'width 0.3s ease'
                  }}></div>
                </div>
              </div>

              {/* Tarjeta */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '12px', height: '12px', background: colors.accent, borderRadius: '2px' }}></div>
                    <span style={{ color: colors.textSecondary, fontSize: '14px', fontWeight: '400' }}>Tarjeta</span>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ fontWeight: '400', color: colors.textPrimary, fontSize: '14px' }}>
                      ${stats.cardSales.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                    </p>
                    <p style={{ fontSize: '11px', color: colors.textMuted }}>
                      {stats.totalSales > 0 ? ((stats.cardSales / stats.totalSales) * 100).toFixed(1) : 0}%
                    </p>
                  </div>
                </div>
                <div style={{ width: '100%', background: colors.borderColor, borderRadius: '2px', height: '6px' }}>
                  <div style={{
                    background: colors.accent,
                    height: '6px',
                    borderRadius: '2px',
                    width: `${stats.totalSales > 0 ? (stats.cardSales / stats.totalSales) * 100 : 0}%`,
                    transition: 'width 0.3s ease'
                  }}></div>
                </div>
              </div>

              {/* Vales */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '12px', height: '12px', background: colors.warning, borderRadius: '2px' }}></div>
                    <span style={{ color: colors.textSecondary, fontSize: '14px', fontWeight: '400' }}>Vales</span>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ fontWeight: '400', color: colors.textPrimary, fontSize: '14px' }}>
                      ${stats.voucherSales.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                    </p>
                    <p style={{ fontSize: '11px', color: colors.textMuted }}>
                      {stats.totalSales > 0 ? ((stats.voucherSales / stats.totalSales) * 100).toFixed(1) : 0}%
                    </p>
                  </div>
                </div>
                <div style={{ width: '100%', background: colors.borderColor, borderRadius: '2px', height: '6px' }}>
                  <div style={{
                    background: colors.warning,
                    height: '6px',
                    borderRadius: '2px',
                    width: `${stats.totalSales > 0 ? (stats.voucherSales / stats.totalSales) * 100 : 0}%`,
                    transition: 'width 0.3s ease'
                  }}></div>
                </div>
              </div>
            </div>
          </div>

          {/* Profit Summary */}
          <div style={{
            background: colors.bgSecondary,
            borderRadius: '2px',
            padding: '24px',
            border: `1px solid ${colors.borderColor}`
          }}>
            <h2 style={{
              fontSize: '11px',
              fontWeight: '500',
              color: colors.textMuted,
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              marginBottom: '24px',
              paddingBottom: '16px',
              borderBottom: `1px solid ${colors.borderColor}`
            }}>
              Resumen de Ganancias
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{
                padding: '16px',
                background: colors.accentBg,
                border: `1px solid ${colors.accentBorder}`,
                borderRadius: '2px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: colors.textSecondary, fontSize: '13px' }}>Ventas Totales</span>
                  <span style={{ fontWeight: '400', color: colors.textPrimary, fontSize: '14px' }}>
                    ${stats.totalSales.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>

              <div style={{
                padding: '16px',
                background: colors.errorBg,
                border: `1px solid ${colors.errorBorder}`,
                borderRadius: '2px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: colors.textSecondary, fontSize: '13px' }}>Costo de Productos</span>
                  <span style={{ fontWeight: '400', color: colors.error, fontSize: '14px' }}>
                    -${stats.totalCost.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>

              <div style={{
                padding: '16px',
                background: colors.successBg,
                border: `1px solid ${colors.successBorder}`,
                borderRadius: '2px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: colors.textSecondary, fontSize: '13px' }}>Ganancia Bruta</span>
                  <span style={{ fontWeight: '400', color: colors.success, fontSize: '14px' }}>
                    ${stats.totalProfit.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>

              <div style={{
                padding: '16px',
                background: colors.warningBg,
                border: `1px solid ${colors.warningBorder}`,
                borderRadius: '2px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: colors.textSecondary, fontSize: '13px' }}>Gastos</span>
                  <span style={{ fontWeight: '400', color: colors.warning, fontSize: '14px' }}>
                    -${stats.totalExpenses.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>

              <div style={{
                padding: '20px',
                background: 'rgba(139, 92, 246, 0.1)',
                border: '1px solid rgba(139, 92, 246, 0.3)',
                borderRadius: '2px',
                marginTop: '8px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: colors.textPrimary, fontSize: '14px', fontWeight: '500' }}>Ganancia Neta</span>
                  <span style={{
                    fontWeight: '300',
                    color: stats.netProfit >= 0 ? colors.success : colors.error,
                    fontSize: '24px',
                    letterSpacing: '-0.02em'
                  }}>
                    ${stats.netProfit.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Top Products */}
        <div style={{
          background: colors.bgSecondary,
          borderRadius: '2px',
          padding: '24px',
          border: `1px solid ${colors.borderColor}`
        }}>
          <div style={{ marginBottom: '24px', paddingBottom: '16px', borderBottom: `1px solid ${colors.borderColor}` }}>
            <h2 style={{
              fontSize: '11px',
              fontWeight: '500',
              color: colors.textMuted,
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              marginBottom: '4px'
            }}>
              Productos Más Vendidos
            </h2>
            <p style={{ fontSize: '12px', color: colors.textMuted }}>Top 10 del período</p>
          </div>

          {stats.topProducts.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: colors.textMuted }}>
              <p style={{ fontSize: '13px', fontWeight: '300', letterSpacing: '0.02em' }}>No hay ventas en este período</p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: `1px solid ${colors.borderColor}` }}>
                    <th style={{
                      padding: '12px 16px',
                      textAlign: 'left',
                      fontSize: '11px',
                      fontWeight: '500',
                      color: colors.textMuted,
                      textTransform: 'uppercase',
                      letterSpacing: '0.1em'
                    }}>#</th>
                    <th style={{
                      padding: '12px 16px',
                      textAlign: 'left',
                      fontSize: '11px',
                      fontWeight: '500',
                      color: colors.textMuted,
                      textTransform: 'uppercase',
                      letterSpacing: '0.1em'
                    }}>Producto</th>
                    <th style={{
                      padding: '12px 16px',
                      textAlign: 'right',
                      fontSize: '11px',
                      fontWeight: '500',
                      color: colors.textMuted,
                      textTransform: 'uppercase',
                      letterSpacing: '0.1em'
                    }}>Cantidad</th>
                    <th style={{
                      padding: '12px 16px',
                      textAlign: 'right',
                      fontSize: '11px',
                      fontWeight: '500',
                      color: colors.textMuted,
                      textTransform: 'uppercase',
                      letterSpacing: '0.1em'
                    }}>Ingresos</th>
                    <th style={{
                      padding: '12px 16px',
                      textAlign: 'right',
                      fontSize: '11px',
                      fontWeight: '500',
                      color: colors.textMuted,
                      textTransform: 'uppercase',
                      letterSpacing: '0.1em'
                    }}>Costo</th>
                    <th style={{
                      padding: '12px 16px',
                      textAlign: 'right',
                      fontSize: '11px',
                      fontWeight: '500',
                      color: colors.textMuted,
                      textTransform: 'uppercase',
                      letterSpacing: '0.1em'
                    }}>Ganancia</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.topProducts.map((product, index) => (
                    <tr
                      key={product.id}
                      style={{
                        borderBottom: `1px solid ${colors.borderColor}`,
                        transition: 'all 0.3s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = colors.bgTertiary;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'transparent';
                      }}
                    >
                      <td style={{ padding: '16px' }}>
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          width: '24px',
                          height: '24px',
                          borderRadius: '2px',
                          fontSize: '11px',
                          fontWeight: '500',
                          background: index === 0 ? colors.successBg :
                                     index === 1 ? colors.accentBg :
                                     index === 2 ? colors.warningBg :
                                     colors.bgTertiary,
                          color: index === 0 ? colors.success :
                                index === 1 ? colors.accent :
                                index === 2 ? colors.warning :
                                colors.textMuted,
                          border: `1px solid ${
                            index === 0 ? colors.successBorder :
                            index === 1 ? colors.accentBorder :
                            index === 2 ? colors.warningBorder :
                            colors.borderColor
                          }`
                        }}>
                          {index + 1}
                        </span>
                      </td>
                      <td style={{ padding: '16px', color: colors.textPrimary, fontSize: '14px', fontWeight: '400' }}>
                        {product.name}
                      </td>
                      <td style={{ padding: '16px', textAlign: 'right', color: colors.textSecondary, fontSize: '14px' }}>
                        {product.quantity}
                      </td>
                      <td style={{ padding: '16px', textAlign: 'right', color: colors.textPrimary, fontSize: '14px', fontWeight: '400' }}>
                        ${product.revenue.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                      </td>
                      <td style={{ padding: '16px', textAlign: 'right', color: colors.textMuted, fontSize: '14px' }}>
                        ${product.cost.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                      </td>
                      <td style={{ padding: '16px', textAlign: 'right', color: colors.success, fontSize: '14px', fontWeight: '400' }}>
                        ${product.profit.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
