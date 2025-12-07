'use client';

import React from 'react';
import { MainLayout } from '../components/layout/MainLayout';
import {
  FiDollarSign,
  FiShoppingCart,
  FiPackage,
  FiAlertTriangle,
  FiTrendingUp,
  FiBarChart2,
} from 'react-icons/fi';
import { useSalesStore } from '../stores/salesStore';
import { useProductStore } from '../stores/productStore';
import { useCashRegisterStore } from '../stores/cashRegisterStore';
import { useThemeStore } from '../stores/themeStore';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export default function DashboardPage() {
  const { getSalesToday, getDailySalesTotal, sales } = useSalesStore();
  const { products, getStockAlerts } = useProductStore();
  const { currentRegister } = useCashRegisterStore();
  const { colors } = useThemeStore();

  const todaySales = getSalesToday();
  const dailyTotal = getDailySalesTotal();
  const stockAlerts = getStockAlerts();
  const activeProducts = products.filter((p) => p.isActive);

  const recentSales = [...sales]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  const stats = [
    {
      title: 'Ventas de Hoy',
      value: `$${dailyTotal.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`,
      icon: FiDollarSign,
      iconColor: colors.success,
      change: `${todaySales.length} transacciones`,
    },
    {
      title: 'Productos Activos',
      value: activeProducts.length.toString(),
      icon: FiPackage,
      iconColor: colors.accent,
      change: `${activeProducts.filter((p) => p.stock > 0).length} con stock`,
    },
    {
      title: 'Ticket Promedio',
      value:
        todaySales.length > 0
          ? `$${(dailyTotal / todaySales.length).toLocaleString('es-MX', { minimumFractionDigits: 2 })}`
          : '$0.00',
      icon: FiTrendingUp,
      iconColor: '#8b5cf6',
      change: 'Promedio del día',
    },
    {
      title: 'Alertas de Stock',
      value: stockAlerts.length.toString(),
      icon: FiAlertTriangle,
      iconColor: stockAlerts.length > 0 ? colors.error : colors.textMuted,
      change: stockAlerts.length > 0 ? 'Productos bajos' : 'Todo en orden',
    },
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
              Dashboard
            </h1>
            <p style={{
              color: colors.textMuted,
              fontSize: '14px',
              fontWeight: '300',
              letterSpacing: '0.02em'
            }}>
              {format(new Date(), "EEEE, d 'de' MMMM yyyy", { locale: es })}
            </p>
          </div>
          {currentRegister && (
            <div style={{
              padding: '8px 16px',
              background: colors.accentBg,
              border: `1px solid ${colors.accentBorder}`,
              borderRadius: '4px',
              color: colors.accent,
              fontSize: '12px',
              fontWeight: '500',
              letterSpacing: '0.05em',
              textTransform: 'uppercase'
            }}>
              Caja Abierta
            </div>
          )}
        </div>

        {/* Caja Warning */}
        {!currentRegister && (
          <div style={{
            marginBottom: '32px',
            padding: '16px 24px',
            background: colors.warningBg,
            border: `1px solid ${colors.warningBorder}`,
            borderRadius: '2px'
          }}>
            <p style={{ color: colors.warning, fontSize: '13px', fontWeight: '400', letterSpacing: '0.02em' }}>
              La caja no está abierta. Ve a{' '}
              <a href="/caja" style={{ fontWeight: '500', borderBottom: `1px solid ${colors.warningBorder}`, color: colors.warning }}>
                Caja
              </a>{' '}
              para iniciar el turno.
            </p>
          </div>
        )}

        {/* Stats Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '24px',
          marginBottom: '48px'
        }}>
          {stats.map((stat) => (
            <div
              key={stat.title}
              style={{
                background: colors.bgSecondary,
                borderRadius: '2px',
                padding: '24px',
                border: `1px solid ${colors.borderColor}`,
                transition: 'all 0.3s ease',
                position: 'relative'
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
                color: colors.textPrimary,
                marginBottom: '8px',
                letterSpacing: '-0.02em',
                lineHeight: '1'
              }}>
                {stat.value}
              </p>

              <p style={{
                fontSize: '12px',
                color: colors.textMuted,
                fontWeight: '400',
                letterSpacing: '0.02em'
              }}>
                {stat.change}
              </p>
            </div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' }}>
          {/* Ventas Recientes */}
          <div style={{
            background: colors.bgSecondary,
            borderRadius: '2px',
            padding: '24px',
            border: `1px solid ${colors.borderColor}`
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', paddingBottom: '16px', borderBottom: `1px solid ${colors.borderColor}` }}>
              <h2 style={{ fontSize: '11px', fontWeight: '500', color: colors.textMuted, letterSpacing: '0.15em', textTransform: 'uppercase' }}>
                Ventas Recientes
              </h2>
              <a
                href="/ventas"
                style={{
                  fontSize: '11px',
                  color: colors.accent,
                  fontWeight: '500',
                  textDecoration: 'none',
                  transition: 'color 0.3s ease',
                  letterSpacing: '0.05em',
                  textTransform: 'uppercase',
                  opacity: 0.7
                }}
                onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
                onMouseLeave={(e) => e.currentTarget.style.opacity = '0.7'}
              >
                Ver todas
              </a>
            </div>
            {recentSales.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 20px', color: colors.textMuted }}>
                <p style={{ fontSize: '13px', fontWeight: '300', letterSpacing: '0.02em' }}>No hay ventas registradas</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {recentSales.map((sale) => (
                  <div
                    key={sale.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '12px 0',
                      borderBottom: `1px solid ${colors.borderColor}`,
                      transition: 'all 0.3s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderBottomColor = colors.borderHover;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderBottomColor = colors.borderColor;
                    }}
                  >
                    <div>
                      <p style={{ fontWeight: '400', color: colors.textPrimary, fontSize: '14px', marginBottom: '4px', letterSpacing: '0.01em' }}>
                        {sale.ticketNumber}
                      </p>
                      <p style={{ fontSize: '11px', color: colors.textMuted, fontWeight: '300', letterSpacing: '0.02em' }}>
                        {sale.items.length} productos • {format(new Date(sale.createdAt), 'HH:mm')}
                      </p>
                    </div>
                    <p style={{ fontWeight: '300', color: colors.textPrimary, fontSize: '16px', letterSpacing: '0.01em' }}>
                      ${sale.total.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Alertas de Stock */}
          <div style={{
            background: colors.bgSecondary,
            borderRadius: '2px',
            padding: '24px',
            border: `1px solid ${colors.borderColor}`
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', paddingBottom: '16px', borderBottom: `1px solid ${colors.borderColor}` }}>
              <h2 style={{ fontSize: '11px', fontWeight: '500', color: colors.textMuted, letterSpacing: '0.15em', textTransform: 'uppercase' }}>
                Alertas de Stock
              </h2>
              <span style={{
                padding: '4px 12px',
                background: stockAlerts.length > 0 ? colors.errorBg : colors.successBg,
                color: stockAlerts.length > 0 ? colors.error : colors.success,
                fontSize: '11px',
                fontWeight: '500',
                letterSpacing: '0.05em',
                border: `1px solid ${stockAlerts.length > 0 ? colors.errorBorder : colors.successBorder}`
              }}>
                {stockAlerts.length}
              </span>
            </div>
            {stockAlerts.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 20px', color: colors.textMuted }}>
                <p style={{ fontSize: '13px', fontWeight: '300', letterSpacing: '0.02em' }}>Todo el stock en orden</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {stockAlerts.slice(0, 5).map((alert) => (
                  <div
                    key={alert.productId}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '12px 0',
                      borderBottom: `1px solid ${colors.borderColor}`
                    }}
                  >
                    <div>
                      <p style={{ fontWeight: '400', color: colors.textPrimary, fontSize: '14px', marginBottom: '4px', letterSpacing: '0.01em' }}>
                        {alert.productName}
                      </p>
                      <p style={{ fontSize: '11px', color: colors.textMuted, fontWeight: '300', textTransform: 'capitalize', letterSpacing: '0.02em' }}>
                        {alert.category.replace('_', ' ')}
                      </p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <p style={{ color: colors.error, fontWeight: '400', fontSize: '14px', marginBottom: '4px' }}>
                        {alert.currentStock} uds
                      </p>
                      <p style={{ fontSize: '11px', color: colors.textMuted, fontWeight: '300', letterSpacing: '0.02em' }}>
                        mín {alert.minStock}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div style={{
          background: colors.bgSecondary,
          borderRadius: '2px',
          padding: '24px',
          border: `1px solid ${colors.borderColor}`
        }}>
          <h2 style={{ fontSize: '11px', fontWeight: '500', color: colors.textMuted, marginBottom: '20px', letterSpacing: '0.15em', textTransform: 'uppercase', paddingBottom: '16px', borderBottom: `1px solid ${colors.borderColor}` }}>
            Accesos Rápidos
          </h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '16px'
          }}>
            {[
              { href: '/ventas', label: 'Nueva Venta', color: colors.accent, icon: FiShoppingCart },
              { href: '/inventario', label: 'Inventario', color: colors.success, icon: FiPackage },
              { href: '/caja', label: 'Caja', color: '#8b5cf6', icon: FiDollarSign },
              { href: '/reportes', label: 'Reportes', color: colors.warning, icon: FiBarChart2 }
            ].map((action) => (
              <a
                key={action.href}
                href={action.href}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                  justifyContent: 'space-between',
                  padding: '20px',
                  background: colors.bgTertiary,
                  borderRadius: '2px',
                  textDecoration: 'none',
                  transition: 'all 0.3s ease',
                  border: `1px solid ${colors.borderColor}`,
                  position: 'relative',
                  minHeight: '110px'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = `${action.color}80`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = colors.borderColor;
                }}
              >
                <action.icon
                  size={20}
                  style={{
                    color: action.color,
                    opacity: 0.6,
                    marginBottom: '12px'
                  }}
                />
                <span style={{ fontWeight: '400', color: colors.textPrimary, fontSize: '13px', letterSpacing: '0.02em' }}>
                  {action.label}
                </span>
              </a>
            ))}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
