'use client';

import React, { forwardRef } from 'react';
import { useThemeStore } from '../../stores/themeStore';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, options, className = '', style, ...props }, ref) => {
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
        <select
          ref={ref}
          style={{
            width: '100%',
            borderRadius: '8px',
            border: `1px solid ${error ? colors.error : colors.borderColor}`,
            background: colors.bgTertiary,
            padding: '12px 16px',
            color: colors.textPrimary,
            fontSize: '14px',
            transition: 'all 0.3s ease',
            outline: 'none',
            cursor: 'pointer',
            ...style
          }}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = colors.accent;
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = error ? colors.error : colors.borderColor;
          }}
          {...props}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value} style={{
              background: colors.bgSecondary,
              color: colors.textPrimary
            }}>
              {option.label}
            </option>
          ))}
        </select>
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

Select.displayName = 'Select';
