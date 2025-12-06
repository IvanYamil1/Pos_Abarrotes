'use client';

import { useRef, useEffect } from 'react';
import { FiSearch } from 'react-icons/fi';

interface BarcodeInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: (barcode: string) => void;
  placeholder?: string;
  autoFocus?: boolean;
}

export function BarcodeInput({
  value,
  onChange,
  onSubmit,
  placeholder = 'Escanear código de barras o buscar producto...',
  autoFocus = true,
}: BarcodeInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Mantener el foco en el input para lectura de códigos de barras
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocus]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (value.trim()) {
        onSubmit(value.trim());
        onChange('');
      }
    }
  };

  // Refocus cuando se pierde el foco (para mantener siempre la captura del lector)
  const handleBlur = () => {
    if (autoFocus) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  };

  return (
    <div className="relative">
      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40">
        <FiSearch size={20} />
      </div>
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
        placeholder={placeholder}
        className="w-full bg-transparent border-b border-white/30 focus:border-blue-400/70
          py-3 sm:py-4 pl-12 pr-24 text-base sm:text-lg text-white placeholder-white/30
          font-light tracking-wide transition-all duration-300 outline-none"
      />
      <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] uppercase tracking-[0.15em] text-white/30">
        Enter para buscar
      </div>
    </div>
  );
}
