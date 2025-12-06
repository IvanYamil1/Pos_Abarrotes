'use client';

import React, { useState, useMemo } from 'react';
import { MainLayout } from '../components/layout/MainLayout';
import { Card, CardHeader } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';
import { useSalesStore } from '../stores/salesStore';
import { useProductStore } from '../stores/productStore';
import { useCashRegisterStore } from '../stores/cashRegisterStore';
import { format, startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, subDays } from 'date-fns';
import { es } from 'date-fns/locale';
import {
  FiCalendar,
  FiTrendingUp,
  FiTrendingDown,
  FiDollarSign,
  FiPackage,
  FiShoppingCart,
  FiDownload,
  FiBarChart2,
} from 'react-icons/fi';
import { jsPDF } from 'jspdf';

type DateRange = 'today' | 'week' | 'month' | 'custom';

export default function ReportesPage() {
  const { sales } = useSalesStore();
  const { products } = useProductStore();
  const { registers, expenses } = useCashRegisterStore();

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
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Reportes</h1>
            <p className="text-gray-500">
              {format(start, "d 'de' MMMM", { locale: es })} -{' '}
              {format(end, "d 'de' MMMM yyyy", { locale: es })}
            </p>
          </div>
          <Button variant="primary" icon={<FiDownload />} onClick={exportToPDF}>
            Exportar PDF
          </Button>
        </div>

        {/* Date Range Selector */}
        <Card className="mb-6">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex gap-2">
              {dateRangeOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setDateRange(option.value as DateRange)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    dateRange === option.value
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>

            {dateRange === 'custom' && (
              <div className="flex gap-2 items-center">
                <Input
                  type="date"
                  value={customStartDate}
                  onChange={(e) => setCustomStartDate(e.target.value)}
                  className="w-40"
                />
                <span className="text-gray-400">a</span>
                <Input
                  type="date"
                  value={customEndDate}
                  onChange={(e) => setCustomEndDate(e.target.value)}
                  className="w-40"
                />
              </div>
            )}
          </div>
        </Card>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <Card>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <FiDollarSign className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Ventas Totales</p>
                <p className="text-2xl font-bold text-gray-900">
                  ${stats.totalSales.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                </p>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <FiTrendingUp className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Ganancia Bruta</p>
                <p className="text-2xl font-bold text-green-600">
                  ${stats.totalProfit.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                </p>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <FiShoppingCart className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Transacciones</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.totalTransactions}
                </p>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                <FiBarChart2 className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Ticket Promedio</p>
                <p className="text-2xl font-bold text-gray-900">
                  ${stats.averageTicket.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                </p>
              </div>
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Payment Methods */}
          <Card>
            <CardHeader title="Ventas por Método de Pago" />
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 bg-green-500 rounded"></div>
                  <span>Efectivo</span>
                </div>
                <div className="text-right">
                  <p className="font-bold text-gray-900">
                    ${stats.cashSales.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                  </p>
                  <p className="text-xs text-gray-500">
                    {stats.totalSales > 0
                      ? ((stats.cashSales / stats.totalSales) * 100).toFixed(1)
                      : 0}
                    %
                  </p>
                </div>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-green-500 h-2 rounded-full"
                  style={{
                    width: `${
                      stats.totalSales > 0
                        ? (stats.cashSales / stats.totalSales) * 100
                        : 0
                    }%`,
                  }}
                ></div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 bg-blue-500 rounded"></div>
                  <span>Tarjeta</span>
                </div>
                <div className="text-right">
                  <p className="font-bold text-gray-900">
                    ${stats.cardSales.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                  </p>
                  <p className="text-xs text-gray-500">
                    {stats.totalSales > 0
                      ? ((stats.cardSales / stats.totalSales) * 100).toFixed(1)
                      : 0}
                    %
                  </p>
                </div>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-500 h-2 rounded-full"
                  style={{
                    width: `${
                      stats.totalSales > 0
                        ? (stats.cardSales / stats.totalSales) * 100
                        : 0
                    }%`,
                  }}
                ></div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 bg-orange-500 rounded"></div>
                  <span>Vales</span>
                </div>
                <div className="text-right">
                  <p className="font-bold text-gray-900">
                    ${stats.voucherSales.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                  </p>
                  <p className="text-xs text-gray-500">
                    {stats.totalSales > 0
                      ? ((stats.voucherSales / stats.totalSales) * 100).toFixed(1)
                      : 0}
                    %
                  </p>
                </div>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-orange-500 h-2 rounded-full"
                  style={{
                    width: `${
                      stats.totalSales > 0
                        ? (stats.voucherSales / stats.totalSales) * 100
                        : 0
                    }%`,
                  }}
                ></div>
              </div>
            </div>
          </Card>

          {/* Profit Summary */}
          <Card>
            <CardHeader title="Resumen de Ganancias" />
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Ventas Totales</span>
                  <span className="font-bold text-gray-900">
                    ${stats.totalSales.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
              <div className="p-4 bg-red-50 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Costo de Productos</span>
                  <span className="font-bold text-red-600">
                    -${stats.totalCost.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
              <div className="p-4 bg-green-50 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Ganancia Bruta</span>
                  <span className="font-bold text-green-600">
                    ${stats.totalProfit.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
              <div className="p-4 bg-orange-50 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Gastos</span>
                  <span className="font-bold text-orange-600">
                    -${stats.totalExpenses.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
              <div className="p-4 bg-purple-100 rounded-lg border-2 border-purple-200">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold text-gray-900">
                    Ganancia Neta
                  </span>
                  <span
                    className={`text-2xl font-bold ${
                      stats.netProfit >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}
                  >
                    ${stats.netProfit.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Top Products */}
        <Card>
          <CardHeader title="Productos Más Vendidos" subtitle="Top 10 del período" />
          {stats.topProducts.length === 0 ? (
            <p className="text-center text-gray-500 py-8">
              No hay ventas en este período
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">
                      #
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">
                      Producto
                    </th>
                    <th className="px-4 py-3 text-right text-sm font-semibold text-gray-600">
                      Cantidad
                    </th>
                    <th className="px-4 py-3 text-right text-sm font-semibold text-gray-600">
                      Ingresos
                    </th>
                    <th className="px-4 py-3 text-right text-sm font-semibold text-gray-600">
                      Costo
                    </th>
                    <th className="px-4 py-3 text-right text-sm font-semibold text-gray-600">
                      Ganancia
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {stats.topProducts.map((product, index) => (
                    <tr key={product.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm">
                        <Badge
                          variant={
                            index === 0
                              ? 'success'
                              : index === 1
                              ? 'info'
                              : index === 2
                              ? 'warning'
                              : 'default'
                          }
                        >
                          {index + 1}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 font-medium text-gray-900">
                        {product.name}
                      </td>
                      <td className="px-4 py-3 text-right text-sm">
                        {product.quantity}
                      </td>
                      <td className="px-4 py-3 text-right text-sm font-medium">
                        ${product.revenue.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="px-4 py-3 text-right text-sm text-gray-500">
                        ${product.cost.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="px-4 py-3 text-right text-sm font-medium text-green-600">
                        ${product.profit.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
    </MainLayout>
  );
}
