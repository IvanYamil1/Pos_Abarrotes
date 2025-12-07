'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FiUser, FiLock, FiShoppingCart, FiSun, FiMoon } from 'react-icons/fi';
import { useAuthStore } from '../stores/authStore';
import { useThemeStore } from '../stores/themeStore';
import toast, { Toaster } from 'react-hot-toast';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuthStore();
  const { mode, colors, toggleTheme } = useThemeStore();
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
      padding: '20px',
      background: colors.bgPrimary,
      position: 'relative',
      overflow: 'hidden'
    }}>
      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            background: colors.bgSecondary,
            color: colors.textPrimary,
            border: `1px solid ${colors.borderColor}`,
          },
        }}
      />

      {/* Theme Toggle Button */}
      <button
        onClick={toggleTheme}
        style={{
          position: 'absolute',
          top: '20px',
          right: '20px',
          width: '44px',
          height: '44px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: colors.bgSecondary,
          border: `1px solid ${colors.borderColor}`,
          borderRadius: '2px',
          color: colors.textSecondary,
          cursor: 'pointer',
          transition: 'all 0.3s ease',
          zIndex: 20
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = colors.borderHover;
          e.currentTarget.style.color = colors.accent;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = colors.borderColor;
          e.currentTarget.style.color = colors.textSecondary;
        }}
      >
        {mode === 'dark' ? <FiSun size={20} /> : <FiMoon size={20} />}
      </button>

      {/* Fondo con efecto de luz sutil */}
      <div style={{
        position: 'absolute',
        top: '-200px',
        left: '50%',
        transform: 'translateX(-50%)',
        width: '600px',
        height: '600px',
        background: `radial-gradient(circle, ${colors.accentBg} 0%, transparent 70%)`,
        pointerEvents: 'none'
      }} />

      <div style={{
        width: '100%',
        maxWidth: '400px',
        position: 'relative',
        zIndex: 10
      }}>
        {/* Card principal */}
        <div style={{
          background: colors.bgSecondary,
          borderRadius: '2px',
          padding: '40px 32px',
          border: `1px solid ${colors.borderColor}`
        }}>

          {/* Header */}
          <div style={{ marginBottom: '40px' }}>
            {/* Logo */}
            <div style={{
              width: '48px',
              height: '48px',
              background: colors.accentBg,
              border: `1px solid ${colors.accentBorder}`,
              borderRadius: '2px',
              marginBottom: '24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <FiShoppingCart size={24} style={{ color: colors.accent }} />
            </div>

            <h1 style={{
              fontSize: '11px',
              fontWeight: '500',
              color: colors.textMuted,
              marginBottom: '8px',
              letterSpacing: '0.15em',
              textTransform: 'uppercase'
            }}>
              Sistema POS
            </h1>
            <p style={{
              fontSize: '24px',
              fontWeight: '300',
              color: colors.textPrimary,
              letterSpacing: '-0.02em'
            }}>
              Iniciar Sesión
            </p>
          </div>

          {/* Formulario */}
          <form onSubmit={handleLogin}>
            <div style={{ marginBottom: '20px' }}>
              <label style={{
                display: 'block',
                fontSize: '11px',
                fontWeight: '500',
                color: colors.textMuted,
                marginBottom: '8px',
                letterSpacing: '0.1em',
                textTransform: 'uppercase'
              }}>
                Usuario
              </label>
              <div style={{ position: 'relative' }}>
                <FiUser
                  size={18}
                  style={{
                    position: 'absolute',
                    left: '14px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: colors.accent,
                    pointerEvents: 'none',
                    zIndex: 1
                  }}
                />
                <input
                  type="text"
                  placeholder="Ingresa tu usuario"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  autoFocus
                  style={{
                    width: '100%',
                    padding: '14px 14px 14px 42px',
                    background: colors.bgTertiary,
                    border: `1px solid ${colors.borderColor}`,
                    borderRadius: '2px',
                    color: colors.textPrimary,
                    fontSize: '14px',
                    transition: 'border-color 0.3s ease'
                  }}
                />
              </div>
            </div>

            <div style={{ marginBottom: '32px' }}>
              <label style={{
                display: 'block',
                fontSize: '11px',
                fontWeight: '500',
                color: colors.textMuted,
                marginBottom: '8px',
                letterSpacing: '0.1em',
                textTransform: 'uppercase'
              }}>
                Contraseña
              </label>
              <div style={{ position: 'relative' }}>
                <FiLock
                  size={18}
                  style={{
                    position: 'absolute',
                    left: '14px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: colors.accent,
                    pointerEvents: 'none',
                    zIndex: 1
                  }}
                />
                <input
                  type="password"
                  placeholder="Ingresa tu contraseña"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    padding: '14px 14px 14px 42px',
                    background: colors.bgTertiary,
                    border: `1px solid ${colors.borderColor}`,
                    borderRadius: '2px',
                    color: colors.textPrimary,
                    fontSize: '14px',
                    transition: 'border-color 0.3s ease'
                  }}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              style={{
                width: '100%',
                padding: '14px',
                background: colors.accent,
                border: 'none',
                borderRadius: '2px',
                color: 'white',
                fontSize: '13px',
                fontWeight: '500',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                letterSpacing: '0.02em',
                transition: 'all 0.3s ease',
                opacity: isLoading ? 0.7 : 1
              }}
              onMouseEnter={(e) => {
                if (!isLoading) {
                  e.currentTarget.style.background = colors.accentHover;
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = colors.accent;
              }}
            >
              {isLoading ? 'Ingresando...' : 'Iniciar Sesión'}
            </button>
          </form>

        </div>

        {/* Footer */}
        <div style={{
          textAlign: 'center',
          marginTop: '24px'
        }}>
          <p style={{
            color: colors.textMuted,
            fontSize: '12px',
            fontWeight: '400',
            letterSpacing: '0.02em'
          }}>
            Desarrollado por{' '}
            <span style={{
              color: colors.textSecondary,
              fontWeight: '500'
            }}>
              Syllet
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}
