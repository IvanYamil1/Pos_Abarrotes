'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Sidebar } from './Sidebar';
import { useAuthStore } from '../../stores/authStore';
import { useProductStore } from '../../stores/productStore';
import { Toaster } from 'react-hot-toast';

interface MainLayoutProps {
  children: React.ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const { initializeSampleData } = useProductStore();

  useEffect(() => {
    // Verificar autenticación
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    // Inicializar datos de ejemplo
    initializeSampleData();
  }, [isAuthenticated, router, initializeSampleData]);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#030712]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-400/70"></div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#030712' }}>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#1d1d1d',
            color: '#ffffff',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(12px)',
          },
          success: {
            iconTheme: {
              primary: '#3b82f6',
              secondary: '#ffffff',
            },
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: '#ffffff',
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
