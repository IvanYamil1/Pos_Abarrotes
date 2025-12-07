'use client';

import React, { useEffect } from 'react';
import { FiX } from 'react-icons/fi';
import { useThemeStore } from '../../stores/themeStore';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showCloseButton?: boolean;
}

export function Modal({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  showCloseButton = true,
}: ModalProps) {
  const { colors } = useThemeStore();

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sizes = {
    sm: '400px',
    md: '500px',
    lg: '600px',
    xl: '700px',
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 50,
      overflowY: 'auto'
    }}>
      <div style={{
        display: 'flex',
        minHeight: '100vh',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px'
      }}>
        {/* Backdrop */}
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.7)',
            backdropFilter: 'blur(4px)',
            transition: 'opacity 0.3s ease'
          }}
          onClick={onClose}
        />

        {/* Modal */}
        <div
          style={{
            position: 'relative',
            background: colors.bgSecondary,
            border: `1px solid ${colors.borderColor}`,
            borderRadius: '12px',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            width: '100%',
            maxWidth: sizes[size],
            transform: 'scale(1)',
            transition: 'all 0.3s ease'
          }}
        >
          {/* Header */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '20px',
            borderBottom: `1px solid ${colors.borderColor}`
          }}>
            <h2 style={{
              fontSize: '18px',
              textTransform: 'uppercase',
              letterSpacing: '0.15em',
              color: colors.textPrimary,
              fontWeight: '500'
            }}>{title}</h2>
            {showCloseButton && (
              <button
                onClick={onClose}
                style={{
                  padding: '8px',
                  borderRadius: '8px',
                  color: colors.textMuted,
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = colors.textSecondary;
                  e.currentTarget.style.background = colors.bgTertiary;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = colors.textMuted;
                  e.currentTarget.style.background = 'transparent';
                }}
              >
                <FiX size={20} />
              </button>
            )}
          </div>

          {/* Content */}
          <div style={{ padding: '20px' }}>{children}</div>
        </div>
      </div>
    </div>
  );
}
