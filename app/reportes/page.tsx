'use client';

import React, { useState, useMemo } from 'react';
import { MainLayout } from '../components/layout/MainLayout';
import { useSalesStore } from '../stores/salesStore';
import { useProductStore } from '../stores/productStore';
import { useCashRegisterStore } from '../stores/cashRegisterStore';
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
            cost: product ? product.purchasePrice * item.quantity : 0,
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

  // Export to PDF
  const exportToPDF = () => {
    const doc = new jsPDF();

    doc.setFontSize(20);
    doc.text('Reporte de Ventas', 105, 20, { align: 'center' });

    doc.setFontSize(12);
    doc.text(`Período: ${format(start, 'dd/MM/yyyy')} - ${format(end, 'dd/MM/yyyy')}`, 105, 30, { align: 'center' });

    doc.setFontSize(14);
    doc.text('Resumen General', 20, 50);

    doc.setFontSize(10);
    let yPos = 60;
    doc.text(`Total de Ventas: $${stats.totalSales.toFixed(2)}`, 20, yPos);
    yPos += 8;
    doc.text(`Transacciones: ${stats.totalTransactions}`, 20, yPos);
    yPos += 8;
    doc.text(`Ticket Promedio: $${stats.averageTicket.toFixed(2)}`, 20, yPos);
    yPos += 8;
    doc.text(`Costo de Productos: $${stats.totalCost.toFixed(2)}`, 20, yPos);
    yPos += 8;
    doc.text(`Ganancia Bruta: $${stats.totalProfit.toFixed(2)}`, 20, yPos);
    yPos += 8;
    doc.text(`Gastos: $${stats.totalExpenses.toFixed(2)}`, 20, yPos);
    yPos += 8;
    doc.text(`Ganancia Neta: $${stats.netProfit.toFixed(2)}`, 20, yPos);

    yPos += 20;
    doc.setFontSize(14);
    doc.text('Desglose por Método de Pago', 20, yPos);

    yPos += 10;
    doc.setFontSize(10);
    doc.text(`Efectivo: $${stats.cashSales.toFixed(2)}`, 20, yPos);
    yPos += 8;
    doc.text(`Tarjeta: $${stats.cardSales.toFixed(2)}`, 20, yPos);
    yPos += 8;
    doc.text(`Vales: $${stats.voucherSales.toFixed(2)}`, 20, yPos);

    yPos += 20;
    doc.setFontSize(14);
    doc.text('Productos Más Vendidos', 20, yPos);

    yPos += 10;
    doc.setFontSize(10);
    stats.topProducts.slice(0, 5).forEach((product, index) => {
      doc.text(`${index + 1}. ${product.name} - ${product.quantity} unidades - $${product.revenue.toFixed(2)}`, 20, yPos);
      yPos += 8;
    });

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
      <div style={{ padding: '20px', background: '#030712', minHeight: '100vh' }}>
        {/* Header */}
        <div style={{ marginBottom: '48px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h1 style={{
              fontSize: '14px',
              fontWeight: '500',
              color: 'rgba(255, 255, 255, 0.6)',
              marginBottom: '12px',
              letterSpacing: '0.15em',
              textTransform: 'uppercase'
            }}>
              Reportes
            </h1>
            <p style={{
              color: 'rgba(255, 255, 255, 0.4)',
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
              background: '#3b82f6',
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
          background: '#1d1d1d',
          border: '1px solid rgba(255, 255, 255, 0.1)',
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
                    background: dateRange === option.value ? '#3b82f6' : '#2a2a2a',
                    border: '1px solid',
                    borderColor: dateRange === option.value ? '#3b82f6' : 'rgba(255, 255, 255, 0.1)',
                    borderRadius: '2px',
                    color: dateRange === option.value ? 'white' : 'rgba(255, 255, 255, 0.6)',
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
                    background: '#2a2a2a',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '2px',
                    color: 'white',
                    fontSize: '13px',
                    width: '160px'
                  }}
                />
                <span style={{ color: 'rgba(255, 255, 255, 0.4)', fontSize: '13px' }}>a</span>
                <input
                  type="date"
                  value={customEndDate}
                  onChange={(e) => setCustomEndDate(e.target.value)}
                  style={{
                    padding: '10px 14px',
                    background: '#2a2a2a',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '2px',
                    color: 'white',
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
              iconColor: '#3b82f6'
            },
            {
              title: 'Ganancia Bruta',
              value: `$${stats.totalProfit.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`,
              icon: FiTrendingUp,
              iconColor: '#10b981',
              valueColor: '#10b981'
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
              iconColor: '#f59e0b'
            }
          ].map((stat) => (
            <div
              key={stat.title}
              style={{
                background: '#1d1d1d',
                borderRadius: '2px',
                padding: '24px',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'rgba(59, 130, 246, 0.5)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
              }}
            >
              <p style={{
                fontSize: '11px',
                fontWeight: '500',
                color: 'rgba(255, 255, 255, 0.5)',
                textTransform: 'uppercase',
                letterSpacing: '0.15em',
                marginBottom: '16px'
              }}>
                {stat.title}
              </p>
              <p style={{
                fontSize: '36px',
                fontWeight: '300',
                color: stat.valueColor || 'white',
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
            background: '#1d1d1d',
            borderRadius: '2px',
            padding: '24px',
            border: '1px solid rgba(255, 255, 255, 0.1)'
          }}>
            <h2 style={{
              fontSize: '11px',
              fontWeight: '500',
              color: 'rgba(255, 255, 255, 0.5)',
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              marginBottom: '24px',
              paddingBottom: '16px',
              borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
            }}>
              Ventas por Método de Pago
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Efectivo */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '12px', height: '12px', background: '#10b981', borderRadius: '2px' }}></div>
                    <span style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '14px', fontWeight: '400' }}>Efectivo</span>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ fontWeight: '400', color: 'white', fontSize: '14px' }}>
                      ${stats.cashSales.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                    </p>
                    <p style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.4)' }}>
                      {stats.totalSales > 0 ? ((stats.cashSales / stats.totalSales) * 100).toFixed(1) : 0}%
                    </p>
                  </div>
                </div>
                <div style={{ width: '100%', background: 'rgba(255, 255, 255, 0.1)', borderRadius: '2px', height: '6px' }}>
                  <div style={{
                    background: '#10b981',
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
                    <div style={{ width: '12px', height: '12px', background: '#3b82f6', borderRadius: '2px' }}></div>
                    <span style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '14px', fontWeight: '400' }}>Tarjeta</span>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ fontWeight: '400', color: 'white', fontSize: '14px' }}>
                      ${stats.cardSales.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                    </p>
                    <p style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.4)' }}>
                      {stats.totalSales > 0 ? ((stats.cardSales / stats.totalSales) * 100).toFixed(1) : 0}%
                    </p>
                  </div>
                </div>
                <div style={{ width: '100%', background: 'rgba(255, 255, 255, 0.1)', borderRadius: '2px', height: '6px' }}>
                  <div style={{
                    background: '#3b82f6',
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
                    <div style={{ width: '12px', height: '12px', background: '#f59e0b', borderRadius: '2px' }}></div>
                    <span style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '14px', fontWeight: '400' }}>Vales</span>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ fontWeight: '400', color: 'white', fontSize: '14px' }}>
                      ${stats.voucherSales.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                    </p>
                    <p style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.4)' }}>
                      {stats.totalSales > 0 ? ((stats.voucherSales / stats.totalSales) * 100).toFixed(1) : 0}%
                    </p>
                  </div>
                </div>
                <div style={{ width: '100%', background: 'rgba(255, 255, 255, 0.1)', borderRadius: '2px', height: '6px' }}>
                  <div style={{
                    background: '#f59e0b',
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
            background: '#1d1d1d',
            borderRadius: '2px',
            padding: '24px',
            border: '1px solid rgba(255, 255, 255, 0.1)'
          }}>
            <h2 style={{
              fontSize: '11px',
              fontWeight: '500',
              color: 'rgba(255, 255, 255, 0.5)',
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              marginBottom: '24px',
              paddingBottom: '16px',
              borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
            }}>
              Resumen de Ganancias
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{
                padding: '16px',
                background: 'rgba(59, 130, 246, 0.1)',
                border: '1px solid rgba(59, 130, 246, 0.2)',
                borderRadius: '2px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '13px' }}>Ventas Totales</span>
                  <span style={{ fontWeight: '400', color: 'white', fontSize: '14px' }}>
                    ${stats.totalSales.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>

              <div style={{
                padding: '16px',
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.2)',
                borderRadius: '2px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '13px' }}>Costo de Productos</span>
                  <span style={{ fontWeight: '400', color: '#ef4444', fontSize: '14px' }}>
                    -${stats.totalCost.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>

              <div style={{
                padding: '16px',
                background: 'rgba(16, 185, 129, 0.1)',
                border: '1px solid rgba(16, 185, 129, 0.2)',
                borderRadius: '2px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '13px' }}>Ganancia Bruta</span>
                  <span style={{ fontWeight: '400', color: '#10b981', fontSize: '14px' }}>
                    ${stats.totalProfit.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>

              <div style={{
                padding: '16px',
                background: 'rgba(245, 158, 11, 0.1)',
                border: '1px solid rgba(245, 158, 11, 0.2)',
                borderRadius: '2px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '13px' }}>Gastos</span>
                  <span style={{ fontWeight: '400', color: '#f59e0b', fontSize: '14px' }}>
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
                  <span style={{ color: 'white', fontSize: '14px', fontWeight: '500' }}>Ganancia Neta</span>
                  <span style={{
                    fontWeight: '300',
                    color: stats.netProfit >= 0 ? '#10b981' : '#ef4444',
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
          background: '#1d1d1d',
          borderRadius: '2px',
          padding: '24px',
          border: '1px solid rgba(255, 255, 255, 0.1)'
        }}>
          <div style={{ marginBottom: '24px', paddingBottom: '16px', borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
            <h2 style={{
              fontSize: '11px',
              fontWeight: '500',
              color: 'rgba(255, 255, 255, 0.5)',
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              marginBottom: '4px'
            }}>
              Productos Más Vendidos
            </h2>
            <p style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.3)' }}>Top 10 del período</p>
          </div>

          {stats.topProducts.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: 'rgba(255, 255, 255, 0.3)' }}>
              <p style={{ fontSize: '13px', fontWeight: '300', letterSpacing: '0.02em' }}>No hay ventas en este período</p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
                    <th style={{
                      padding: '12px 16px',
                      textAlign: 'left',
                      fontSize: '11px',
                      fontWeight: '500',
                      color: 'rgba(255, 255, 255, 0.5)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.1em'
                    }}>#</th>
                    <th style={{
                      padding: '12px 16px',
                      textAlign: 'left',
                      fontSize: '11px',
                      fontWeight: '500',
                      color: 'rgba(255, 255, 255, 0.5)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.1em'
                    }}>Producto</th>
                    <th style={{
                      padding: '12px 16px',
                      textAlign: 'right',
                      fontSize: '11px',
                      fontWeight: '500',
                      color: 'rgba(255, 255, 255, 0.5)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.1em'
                    }}>Cantidad</th>
                    <th style={{
                      padding: '12px 16px',
                      textAlign: 'right',
                      fontSize: '11px',
                      fontWeight: '500',
                      color: 'rgba(255, 255, 255, 0.5)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.1em'
                    }}>Ingresos</th>
                    <th style={{
                      padding: '12px 16px',
                      textAlign: 'right',
                      fontSize: '11px',
                      fontWeight: '500',
                      color: 'rgba(255, 255, 255, 0.5)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.1em'
                    }}>Costo</th>
                    <th style={{
                      padding: '12px 16px',
                      textAlign: 'right',
                      fontSize: '11px',
                      fontWeight: '500',
                      color: 'rgba(255, 255, 255, 0.5)',
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
                        borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                        transition: 'all 0.3s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.02)';
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
                          background: index === 0 ? 'rgba(16, 185, 129, 0.2)' :
                                     index === 1 ? 'rgba(59, 130, 246, 0.2)' :
                                     index === 2 ? 'rgba(245, 158, 11, 0.2)' :
                                     'rgba(255, 255, 255, 0.1)',
                          color: index === 0 ? '#10b981' :
                                index === 1 ? '#3b82f6' :
                                index === 2 ? '#f59e0b' :
                                'rgba(255, 255, 255, 0.5)',
                          border: `1px solid ${
                            index === 0 ? 'rgba(16, 185, 129, 0.3)' :
                            index === 1 ? 'rgba(59, 130, 246, 0.3)' :
                            index === 2 ? 'rgba(245, 158, 11, 0.3)' :
                            'rgba(255, 255, 255, 0.2)'
                          }`
                        }}>
                          {index + 1}
                        </span>
                      </td>
                      <td style={{ padding: '16px', color: 'white', fontSize: '14px', fontWeight: '400' }}>
                        {product.name}
                      </td>
                      <td style={{ padding: '16px', textAlign: 'right', color: 'rgba(255, 255, 255, 0.6)', fontSize: '14px' }}>
                        {product.quantity}
                      </td>
                      <td style={{ padding: '16px', textAlign: 'right', color: 'white', fontSize: '14px', fontWeight: '400' }}>
                        ${product.revenue.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                      </td>
                      <td style={{ padding: '16px', textAlign: 'right', color: 'rgba(255, 255, 255, 0.4)', fontSize: '14px' }}>
                        ${product.cost.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                      </td>
                      <td style={{ padding: '16px', textAlign: 'right', color: '#10b981', fontSize: '14px', fontWeight: '400' }}>
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
