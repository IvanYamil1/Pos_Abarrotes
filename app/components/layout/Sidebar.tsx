'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  FiHome,
  FiShoppingCart,
  FiPackage,
  FiDollarSign,
  FiBarChart2,
  FiSettings,
  FiLogOut,
} from 'react-icons/fi';
import { useAuthStore } from '../../stores/authStore';
import { useRouter } from 'next/navigation';

const menuItems = [
  { href: '/dashboard', icon: FiHome, label: 'Dashboard' },
  { href: '/ventas', icon: FiShoppingCart, label: 'Ventas' },
  { href: '/inventario', icon: FiPackage, label: 'Inventario' },
  { href: '/caja', icon: FiDollarSign, label: 'Caja' },
  { href: '/reportes', icon: FiBarChart2, label: 'Reportes' },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuthStore();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <aside style={{
      position: 'fixed',
      left: 0,
      top: 0,
      height: '100vh',
      width: '260px',
      background: '#030712',
      display: 'flex',
      flexDirection: 'column',
      borderRight: '1px solid rgba(255, 255, 255, 0.1)',
      zIndex: 40
    }}>
      {/* Logo estilo Syllet */}
      <div style={{
        padding: '32px 24px',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
      }}>
        <h1 style={{
          fontWeight: '500',
          fontSize: '13px',
          color: 'white',
          letterSpacing: '0.15em',
          textTransform: 'uppercase',
          marginBottom: '4px'
        }}>
          POS Abarrotes
        </h1>
        <p style={{
          fontSize: '11px',
          color: 'rgba(255, 255, 255, 0.4)',
          fontWeight: '300',
          letterSpacing: '0.05em'
        }}>
          by Syllet
        </p>
      </div>

      {/* Navigation */}
      <nav style={{ flex: 1, padding: '20px 24px', overflowY: 'auto' }}>
        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <li key={item.href} style={{ marginBottom: '8px' }}>
                <Link
                  href={item.href}
                  style={{
                    display: 'block',
                    padding: '12px 0',
                    textDecoration: 'none',
                    transition: 'all 0.3s ease',
                    color: isActive ? 'white' : 'rgba(255, 255, 255, 0.5)',
                    fontWeight: '400',
                    fontSize: '14px',
                    letterSpacing: '0.02em',
                    borderBottom: isActive ? '1px solid rgba(59, 130, 246, 0.5)' : '1px solid transparent'
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.color = 'rgba(255, 255, 255, 0.8)';
                      e.currentTarget.style.borderBottomColor = 'rgba(255, 255, 255, 0.2)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.color = 'rgba(255, 255, 255, 0.5)';
                      e.currentTarget.style.borderBottomColor = 'transparent';
                    }
                  }}
                >
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>

        {/* Admin Settings */}
        {user?.role === 'admin' && (
          <div style={{
            marginTop: '24px',
            paddingTop: '24px',
            borderTop: '1px solid rgba(255, 255, 255, 0.1)'
          }}>
            <Link
              href="/configuracion"
              style={{
                display: 'block',
                padding: '12px 0',
                textDecoration: 'none',
                transition: 'all 0.3s ease',
                color: pathname === '/configuracion' ? 'white' : 'rgba(255, 255, 255, 0.5)',
                fontWeight: '400',
                fontSize: '14px',
                letterSpacing: '0.02em',
                borderBottom: pathname === '/configuracion' ? '1px solid rgba(59, 130, 246, 0.5)' : '1px solid transparent'
              }}
              onMouseEnter={(e) => {
                if (pathname !== '/configuracion') {
                  e.currentTarget.style.color = 'rgba(255, 255, 255, 0.8)';
                  e.currentTarget.style.borderBottomColor = 'rgba(255, 255, 255, 0.2)';
                }
              }}
              onMouseLeave={(e) => {
                if (pathname !== '/configuracion') {
                  e.currentTarget.style.color = 'rgba(255, 255, 255, 0.5)';
                  e.currentTarget.style.borderBottomColor = 'transparent';
                }
              }}
            >
              Configuración
            </Link>
          </div>
        )}
      </nav>

      {/* User Info */}
      <div style={{
        padding: '24px',
        borderTop: '1px solid rgba(255, 255, 255, 0.1)'
      }}>
        <div style={{
          marginBottom: '16px'
        }}>
          <p style={{
            fontWeight: '400',
            fontSize: '14px',
            color: 'white',
            marginBottom: '4px',
            letterSpacing: '0.01em'
          }}>
            {user?.name}
          </p>
          <p style={{
            fontSize: '11px',
            color: 'rgba(255, 255, 255, 0.4)',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            fontWeight: '500'
          }}>
            {user?.role}
          </p>
        </div>
        <button
          onClick={handleLogout}
          style={{
            width: '100%',
            padding: '10px 0',
            color: 'rgba(255, 255, 255, 0.5)',
            background: 'transparent',
            border: 'none',
            borderTop: '1px solid rgba(255, 255, 255, 0.1)',
            fontSize: '12px',
            fontWeight: '500',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            letterSpacing: '0.05em',
            textTransform: 'uppercase'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = 'rgba(239, 68, 68, 0.9)';
            e.currentTarget.style.borderTopColor = 'rgba(239, 68, 68, 0.3)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = 'rgba(255, 255, 255, 0.5)';
            e.currentTarget.style.borderTopColor = 'rgba(255, 255, 255, 0.1)';
          }}
        >
          Cerrar Sesión
        </button>
      </div>
    </aside>
  );
}
