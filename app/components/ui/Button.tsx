'use client';

import React from 'react';
import { useThemeStore } from '../../stores/themeStore';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  icon?: React.ReactNode;
  children: React.ReactNode;
}

export function Button({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  icon,
  children,
  className = '',
  disabled,
  style,
  ...props
}: ButtonProps) {
  const { colors } = useThemeStore();

  const getVariantStyles = () => {
    switch (variant) {
      case 'primary':
        return {
          background: colors.accent,
          color: 'white',
          border: `1px solid ${colors.accentBorder}`,
          boxShadow: '0 10px 15px -3px rgba(59, 130, 246, 0.2)'
        };
      case 'secondary':
        return {
          background: colors.bgTertiary,
          color: colors.textSecondary,
          border: `1px solid ${colors.borderColor}`
        };
      case 'danger':
        return {
          background: colors.error,
          color: 'white',
          border: `1px solid ${colors.errorBorder}`,
          boxShadow: '0 10px 15px -3px rgba(239, 68, 68, 0.2)'
        };
      case 'success':
        return {
          background: colors.success,
          color: 'white',
          border: `1px solid ${colors.successBorder}`,
          boxShadow: '0 10px 15px -3px rgba(34, 197, 94, 0.2)'
        };
      case 'ghost':
        return {
          background: 'transparent',
          color: colors.textSecondary,
          border: '1px solid transparent'
        };
      default:
        return {};
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return { padding: '6px 12px', fontSize: '12px', gap: '6px' };
      case 'md':
        return { padding: '8px 16px', fontSize: '14px', gap: '8px' };
      case 'lg':
        return { padding: '12px 24px', fontSize: '14px', gap: '10px' };
      default:
        return {};
    }
  };

  return (
    <button
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: '500',
        borderRadius: '8px',
        transition: 'all 0.3s ease',
        outline: 'none',
        textTransform: 'uppercase',
        letterSpacing: '0.1em',
        cursor: disabled || isLoading ? 'not-allowed' : 'pointer',
        opacity: disabled || isLoading ? 0.5 : 1,
        ...getVariantStyles(),
        ...getSizeStyles(),
        ...style
      }}
      disabled={disabled || isLoading}
      onMouseEnter={(e) => {
        if (!disabled && !isLoading) {
          e.currentTarget.style.opacity = '0.85';
        }
      }}
      onMouseLeave={(e) => {
        if (!disabled && !isLoading) {
          e.currentTarget.style.opacity = '1';
        }
      }}
      {...props}
    >
      {isLoading ? (
        <svg
          style={{ animation: 'spin 1s linear infinite', height: '20px', width: '20px' }}
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            style={{ opacity: 0.25 }}
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            style={{ opacity: 0.75 }}
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      ) : icon ? (
        <span style={{ flexShrink: 0 }}>{icon}</span>
      ) : null}
      {children}
    </button>
  );
}
