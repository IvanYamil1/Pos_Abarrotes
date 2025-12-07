'use client';

import React, { forwardRef } from 'react';
import { useThemeStore } from '../../stores/themeStore';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, icon, rightIcon, className = '', style, ...props }, ref) => {
    const { colors } = useThemeStore();

    return (
      <div style={{ width: '100%' }}>
        {label && (
          <label style={{
            display: 'block',
            fontSize: '11px',
            textTransform: 'uppercase',
            letterSpacing: '0.15em',
            color: colors.textMuted,
            marginBottom: '8px',
            fontWeight: '500'
          }}>
            {label}
          </label>
        )}
        <div style={{ position: 'relative' }}>
          {icon && (
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '16px',
              transform: 'translateY(-50%)',
              pointerEvents: 'none',
              color: colors.textMuted,
              display: 'flex',
              alignItems: 'center'
            }}>
              {icon}
            </div>
          )}
          <input
            ref={ref}
            style={{
              width: '100%',
              background: colors.bgTertiary,
              border: `1px solid ${error ? colors.error : colors.borderColor}`,
              padding: `12px ${rightIcon ? '48px' : '16px'} 12px ${icon ? '48px' : '16px'}`,
              color: colors.textPrimary,
              fontSize: '14px',
              fontWeight: '300',
              borderRadius: '8px',
              transition: 'all 0.3s ease',
              outline: 'none',
              ...style
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = colors.accent;
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = error ? colors.error : colors.borderColor;
            }}
            {...props}
          />
          {rightIcon && (
            <div style={{
              position: 'absolute',
              top: '50%',
              right: '16px',
              transform: 'translateY(-50%)',
              color: colors.textMuted,
              display: 'flex',
              alignItems: 'center'
            }}>
              {rightIcon}
            </div>
          )}
        </div>
        {error && (
          <p style={{
            marginTop: '8px',
            fontSize: '12px',
            color: colors.error,
            fontWeight: '300'
          }}>
            {error}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
