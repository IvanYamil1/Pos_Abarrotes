'use client';

import React, { useEffect } from 'react';
import { FiX } from 'react-icons/fi';

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
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
          onClick={onClose}
        />

        {/* Modal */}
        <div
          className={`relative bg-[#1d1d1d] border border-white/10 rounded-xl shadow-2xl w-full ${sizes[size]} transform transition-all animate-scale-in`}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-5 border-b border-white/10">
            <h2 className="text-lg uppercase tracking-[0.15em] text-white font-medium">{title}</h2>
            {showCloseButton && (
              <button
                onClick={onClose}
                className="p-2 rounded-lg text-white/40 hover:text-white/60 hover:bg-white/5 transition-all duration-300"
              >
                <FiX size={20} />
              </button>
            )}
          </div>

          {/* Content */}
          <div className="p-5">{children}</div>
        </div>
      </div>
    </div>
  );
}
