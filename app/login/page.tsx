'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FiUser, FiLock } from 'react-icons/fi';
import { useAuthStore } from '../stores/authStore';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import toast, { Toaster } from 'react-hot-toast';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuthStore();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    await new Promise((resolve) => setTimeout(resolve, 500));

    const success = login(username, password);

    if (success) {
      toast.success('Bienvenido al sistema');
      router.push('/dashboard');
    } else {
      toast.error('Usuario o contraseña incorrectos');
    }

    setIsLoading(false);
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '16px',
      background: 'linear-gradient(to bottom right, #0f172a, #1e293b)',
      position: 'relative',
      overflow: 'hidden'
    }}>
      <Toaster position="top-center" />

      {/* Fondo con efecto de luz */}
      <div style={{
        position: 'absolute',
        top: '0',
        left: '50%',
        transform: 'translateX(-50%)',
        width: '800px',
        height: '800px',
        background: 'radial-gradient(circle, rgba(59, 130, 246, 0.1) 0%, transparent 70%)',
        pointerEvents: 'none'
      }} />

      <div style={{
        width: '100%',
        maxWidth: '420px',
        position: 'relative',
        zIndex: 10
      }}>
        {/* Tarjeta principal */}
        <div style={{
          background: 'white',
          borderRadius: '24px',
          padding: '40px 36px',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.3), 0 10px 10px -5px rgba(0, 0, 0, 0.2)'
        }}>

          {/* Header */}
          <div style={{ marginBottom: '32px', textAlign: 'left' }}>
            {/* Logo */}
            <div style={{
              width: '56px',
              height: '56px',
              background: 'linear-gradient(135deg, #3b82f6 0%, #1e40af 100%)',
              borderRadius: '16px',
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 10px 20px rgba(59, 130, 246, 0.3)'
            }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="9" cy="21" r="1"/>
                <circle cx="20" cy="21" r="1"/>
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
              </svg>
            </div>

            <h1 style={{
              fontSize: '28px',
              fontWeight: '700',
              color: '#0f172a',
              marginBottom: '6px',
              letterSpacing: '-0.025em'
            }}>
              Bienvenido
            </h1>
            <p style={{
              color: '#64748b',
              fontSize: '14px',
              fontWeight: '400'
            }}>
              Ingresa tus credenciales para continuar
            </p>
          </div>

          {/* Formulario */}
          <form onSubmit={handleLogin} style={{ marginBottom: '28px' }}>
            <div style={{ marginBottom: '16px' }}>
              <Input
                label="Usuario"
                type="text"
                placeholder="Ingresa tu usuario"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                icon={<FiUser size={18} />}
                required
                autoFocus
              />
            </div>

            <div style={{ marginBottom: '24px' }}>
              <Input
                label="Contraseña"
                type="password"
                placeholder="Ingresa tu contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                icon={<FiLock size={18} />}
                required
              />
            </div>

            <Button
              type="submit"
              size="lg"
              isLoading={isLoading}
              style={{
                width: '100%',
                height: '48px',
                background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                border: 'none',
                boxShadow: '0 4px 14px rgba(59, 130, 246, 0.4)',
                color: 'white',
                fontWeight: '600',
                fontSize: '15px',
                borderRadius: '12px',
                cursor: 'pointer',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 8px 20px rgba(59, 130, 246, 0.5)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 14px rgba(59, 130, 246, 0.4)';
              }}
            >
              Iniciar Sesión
            </Button>
          </form>

          {/* Divider */}
          <div style={{
            position: 'relative',
            marginBottom: '24px'
          }}>
            <div style={{
              borderTop: '1px solid #e2e8f0'
            }} />
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              background: 'white',
              padding: '0 12px',
              fontSize: '11px',
              color: '#94a3b8',
              fontWeight: '600',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>
              Credenciales de prueba
            </div>
          </div>

          {/* Credenciales */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '12px'
          }}>
            <button
              type="button"
              onClick={() => {
                setUsername('admin');
                setPassword('admin123');
              }}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '14px 16px',
                background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
                border: '1px solid #e2e8f0',
                borderRadius: '12px',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#cbd5e1';
                e.currentTarget.style.transform = 'translateY(-1px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#e2e8f0';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '32px',
                  height: '32px',
                  background: 'linear-gradient(135deg, #dbeafe, #bfdbfe)',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <FiUser size={16} color="#3b82f6" />
                </div>
                <div style={{ textAlign: 'left' }}>
                  <div style={{
                    fontSize: '13px',
                    fontWeight: '600',
                    color: '#1e293b',
                    marginBottom: '2px'
                  }}>
                    Administrador
                  </div>
                  <div style={{
                    fontSize: '11px',
                    color: '#64748b',
                    fontFamily: 'monospace'
                  }}>
                    admin / admin123
                  </div>
                </div>
              </div>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2">
                <polyline points="9 18 15 12 9 6"/>
              </svg>
            </button>

            <button
              type="button"
              onClick={() => {
                setUsername('cajero');
                setPassword('cajero123');
              }}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '14px 16px',
                background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
                border: '1px solid #e2e8f0',
                borderRadius: '12px',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#cbd5e1';
                e.currentTarget.style.transform = 'translateY(-1px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#e2e8f0';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '32px',
                  height: '32px',
                  background: 'linear-gradient(135deg, #d1fae5, #a7f3d0)',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <FiUser size={16} color="#10b981" />
                </div>
                <div style={{ textAlign: 'left' }}>
                  <div style={{
                    fontSize: '13px',
                    fontWeight: '600',
                    color: '#1e293b',
                    marginBottom: '2px'
                  }}>
                    Cajero
                  </div>
                  <div style={{
                    fontSize: '11px',
                    color: '#64748b',
                    fontFamily: 'monospace'
                  }}>
                    cajero / cajero123
                  </div>
                </div>
              </div>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2">
                <polyline points="9 18 15 12 9 6"/>
              </svg>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div style={{
          textAlign: 'center',
          marginTop: '24px',
          paddingBottom: '20px'
        }}>
          <p style={{
            color: 'rgba(255, 255, 255, 0.5)',
            fontSize: '13px',
            fontWeight: '500'
          }}>
            Desarrollado por{' '}
            <span style={{
              color: 'rgba(255, 255, 255, 0.9)',
              fontWeight: '700'
            }}>
              Syllet
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}
