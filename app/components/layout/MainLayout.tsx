'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Sidebar } from './Sidebar';
import { useAuthStore } from '../../stores/authStore';
import { useProductStore } from '../../stores/productStore';
import { useThemeStore } from '../../stores/themeStore';
import { Toaster } from 'react-hot-toast';

interface MainLayoutProps {
  children: React.ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const { initializeSampleData } = useProductStore();
  const { colors } = useThemeStore();
  const [isHydrated, setIsHydrated] = useState(false);

  // Esperar a que Zustand se hidrate desde localStorage
  useEffect(() => {
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    // Solo verificar autenticación después de la hidratación
    if (!isHydrated) return;

    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    // Inicializar datos de ejemplo
    initializeSampleData();
  }, [isHydrated, isAuthenticated, router, initializeSampleData]);

  // Mostrar loading mientras se hidrata o no está autenticado
  if (!isHydrated || !isAuthenticated) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: colors.bgPrimary
      }}>
        <div style={{
          width: '48px',
          height: '48px',
          border: `2px solid ${colors.accentBorder}`,
          borderTopColor: colors.accent,
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }} />
        <style>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: colors.bgPrimary }}>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: colors.bgSecondary,
            color: colors.textPrimary,
            border: `1px solid ${colors.borderColor}`,
            backdropFilter: 'blur(12px)',
          },
          success: {
            iconTheme: {
              primary: colors.accent,
              secondary: colors.textPrimary,
            },
          },
          error: {
            iconTheme: {
              primary: colors.error,
              secondary: colors.textPrimary,
            },
          },
        }}
      />
      <Sidebar />
      <main style={{ marginLeft: '260px', minHeight: '100vh' }}>
        {children}
      </main>
    </div>
  );
}
