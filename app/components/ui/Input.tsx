'use client';

import React, { forwardRef } from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, icon, rightIcon, className = '', ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-xs uppercase tracking-[0.15em] text-white/50 mb-2 font-medium">
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="absolute top-1/2 left-4 -translate-y-1/2 pointer-events-none text-white/40 flex items-center">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            className={`w-full bg-transparent border ${error ? 'border-red-400/50' : 'border-white/20'}
              focus:border-blue-400/70 py-3 ${icon ? 'pl-12' : 'px-4'} ${rightIcon ? 'pr-12' : 'pr-4'}
              text-white placeholder-white/30 font-light rounded-lg
              transition-all duration-300 outline-none
              disabled:opacity-50 disabled:cursor-not-allowed
              ${className}`}
            {...props}
          />
          {rightIcon && (
            <div className="absolute top-1/2 right-4 -translate-y-1/2 text-white/40 flex items-center">
              {rightIcon}
            </div>
          )}
        </div>
        {error && (
          <p className="mt-2 text-xs text-red-400 font-light">
            {error}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
