'use client';

import React from 'react';
import { MainLayout } from '../components/layout/MainLayout';
import {
  FiDollarSign,
  FiShoppingCart,
  FiPackage,
  FiAlertTriangle,
  FiTrendingUp,
  FiClock,
  FiArrowRight,
  FiActivity,
  FiBarChart2,
} from 'react-icons/fi';
import { useSalesStore } from '../stores/salesStore';
import { useProductStore } from '../stores/productStore';
import { useCashRegisterStore } from '../stores/cashRegisterStore';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export default function DashboardPage() {
  const { getSalesToday, getDailySalesTotal, sales } = useSalesStore();
  const { products, getStockAlerts } = useProductStore();
  const { currentRegister } = useCashRegisterStore();

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
      gradient: ['#10b981', '#059669'],
      iconColor: '#10b981',
      change: `${todaySales.length} transacciones`,
    },
    {
      title: 'Productos Activos',
      value: activeProducts.length.toString(),
      icon: FiPackage,
      gradient: ['#3b82f6', '#2563eb'],
      iconColor: '#3b82f6',
      change: `${activeProducts.filter((p) => p.stock > 0).length} con stock`,
    },
    {
      title: 'Ticket Promedio',
      value:
        todaySales.length > 0
          ? `$${(dailyTotal / todaySales.length).toLocaleString('es-MX', { minimumFractionDigits: 2 })}`
          : '$0.00',
      icon: FiTrendingUp,
      gradient: ['#8b5cf6', '#7c3aed'],
      iconColor: '#8b5cf6',
      change: 'Promedio del día',
    },
    {
      title: 'Alertas de Stock',
      value: stockAlerts.length.toString(),
      icon: FiAlertTriangle,
      gradient: stockAlerts.length > 0 ? ['#ef4444', '#dc2626'] : ['#94a3b8', '#64748b'],
      iconColor: stockAlerts.length > 0 ? '#ef4444' : '#94a3b8',
      change: stockAlerts.length > 0 ? 'Productos bajos' : 'Todo en orden',
    },
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
              Dashboard
            </h1>
            <p style={{
              color: 'rgba(255, 255, 255, 0.4)',
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
              background: 'rgba(59, 130, 246, 0.1)',
              border: '1px solid rgba(59, 130, 246, 0.3)',
              borderRadius: '4px',
              color: '#3b82f6',
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
            background: 'rgba(251, 191, 36, 0.05)',
            border: '1px solid rgba(251, 191, 36, 0.2)',
            borderRadius: '2px'
          }}>
            <p style={{ color: 'rgba(251, 191, 36, 0.9)', fontSize: '13px', fontWeight: '400', letterSpacing: '0.02em' }}>
              La caja no está abierta. Ve a{' '}
              <a href="/caja" style={{ fontWeight: '500', borderBottom: '1px solid rgba(251, 191, 36, 0.5)', color: 'rgba(251, 191, 36, 0.9)' }}>
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
                background: '#1d1d1d',
                borderRadius: '2px',
                padding: '24px',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                transition: 'all 0.3s ease',
                position: 'relative'
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
                color: 'white',
                marginBottom: '8px',
                letterSpacing: '-0.02em',
                lineHeight: '1'
              }}>
                {stat.value}
              </p>

              <p style={{
                fontSize: '12px',
                color: 'rgba(255, 255, 255, 0.4)',
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
            background: '#1d1d1d',
            borderRadius: '2px',
            padding: '24px',
            border: '1px solid rgba(255, 255, 255, 0.1)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', paddingBottom: '16px', borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
              <h2 style={{ fontSize: '11px', fontWeight: '500', color: 'rgba(255, 255, 255, 0.5)', letterSpacing: '0.15em', textTransform: 'uppercase' }}>
                Ventas Recientes
              </h2>
              <a
                href="/ventas"
                style={{
                  fontSize: '11px',
                  color: 'rgba(59, 130, 246, 0.7)',
                  fontWeight: '500',
                  textDecoration: 'none',
                  transition: 'color 0.3s ease',
                  letterSpacing: '0.05em',
                  textTransform: 'uppercase'
                }}
                onMouseEnter={(e) => e.currentTarget.style.color = '#3b82f6'}
                onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(59, 130, 246, 0.7)'}
              >
                Ver todas
              </a>
            </div>
            {recentSales.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 20px', color: 'rgba(255, 255, 255, 0.3)' }}>
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
                      borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                      transition: 'all 0.3s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderBottomColor = 'rgba(59, 130, 246, 0.3)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderBottomColor = 'rgba(255, 255, 255, 0.05)';
                    }}
                  >
                    <div>
                      <p style={{ fontWeight: '400', color: 'white', fontSize: '14px', marginBottom: '4px', letterSpacing: '0.01em' }}>
                        {sale.ticketNumber}
                      </p>
                      <p style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.4)', fontWeight: '300', letterSpacing: '0.02em' }}>
                        {sale.items.length} productos • {format(new Date(sale.createdAt), 'HH:mm')}
                      </p>
                    </div>
                    <p style={{ fontWeight: '300', color: 'white', fontSize: '16px', letterSpacing: '0.01em' }}>
                      ${sale.total.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Alertas de Stock */}
          <div style={{
            background: '#1d1d1d',
            borderRadius: '2px',
            padding: '24px',
            border: '1px solid rgba(255, 255, 255, 0.1)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', paddingBottom: '16px', borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
              <h2 style={{ fontSize: '11px', fontWeight: '500', color: 'rgba(255, 255, 255, 0.5)', letterSpacing: '0.15em', textTransform: 'uppercase' }}>
                Alertas de Stock
              </h2>
              <span style={{
                padding: '4px 12px',
                background: stockAlerts.length > 0 ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                color: stockAlerts.length > 0 ? 'rgba(239, 68, 68, 0.9)' : 'rgba(16, 185, 129, 0.9)',
                fontSize: '11px',
                fontWeight: '500',
                letterSpacing: '0.05em',
                border: `1px solid ${stockAlerts.length > 0 ? 'rgba(239, 68, 68, 0.2)' : 'rgba(16, 185, 129, 0.2)'}`
              }}>
                {stockAlerts.length}
              </span>
            </div>
            {stockAlerts.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 20px', color: 'rgba(255, 255, 255, 0.3)' }}>
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
                      borderBottom: '1px solid rgba(255, 255, 255, 0.05)'
                    }}
                  >
                    <div>
                      <p style={{ fontWeight: '400', color: 'white', fontSize: '14px', marginBottom: '4px', letterSpacing: '0.01em' }}>
                        {alert.productName}
                      </p>
                      <p style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.4)', fontWeight: '300', textTransform: 'capitalize', letterSpacing: '0.02em' }}>
                        {alert.category.replace('_', ' ')}
                      </p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <p style={{ color: 'rgba(239, 68, 68, 0.9)', fontWeight: '400', fontSize: '14px', marginBottom: '4px' }}>
                        {alert.currentStock} uds
                      </p>
                      <p style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.3)', fontWeight: '300', letterSpacing: '0.02em' }}>
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
          background: '#1d1d1d',
          borderRadius: '2px',
          padding: '24px',
          border: '1px solid rgba(255, 255, 255, 0.1)'
        }}>
          <h2 style={{ fontSize: '11px', fontWeight: '500', color: 'rgba(255, 255, 255, 0.5)', marginBottom: '20px', letterSpacing: '0.15em', textTransform: 'uppercase', paddingBottom: '16px', borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
            Accesos Rápidos
          </h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '16px'
          }}>
            {[
              { href: '/ventas', label: 'Nueva Venta', color: '#3b82f6', icon: FiShoppingCart },
              { href: '/inventario', label: 'Inventario', color: '#10b981', icon: FiPackage },
              { href: '/caja', label: 'Caja', color: '#8b5cf6', icon: FiDollarSign },
              { href: '/reportes', label: 'Reportes', color: '#f59e0b', icon: FiBarChart2 }
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
                  background: '#2a2a2a',
                  borderRadius: '2px',
                  textDecoration: 'none',
                  transition: 'all 0.3s ease',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  position: 'relative',
                  minHeight: '110px'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = `${action.color}80`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
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
                <span style={{ fontWeight: '400', color: 'white', fontSize: '13px', letterSpacing: '0.02em' }}>
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
