'use client';

import { useState, useEffect } from 'react';
import { Product } from '../../types';
import { FiPackage, FiCheck, FiX } from 'react-icons/fi';

interface QuantityModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
  onConfirm: (quantity: number, isPackage: boolean) => void;
}

export function QuantityModal({
  isOpen,
  onClose,
  product,
  onConfirm,
}: QuantityModalProps) {
  const [quantity, setQuantity] = useState('1');
  const [isPackage, setIsPackage] = useState(false);

  useEffect(() => {
    if (isOpen && product) {
      setQuantity(product.unit === 'kilo' || product.unit === 'granel' ? '0.5' : '1');
      setIsPackage(false);
    }
  }, [isOpen, product]);

  if (!isOpen || !product) return null;

  const handleConfirm = () => {
    const qty = parseFloat(quantity);
    if (!isNaN(qty) && qty > 0) {
      onConfirm(qty, isPackage);
      onClose();
    }
  };

  const getPrice = () => {
    if (isPackage && product.packagePrice) {
      return product.packagePrice;
    }
    return product.salePrice;
  };

  const getTotal = () => {
    const qty = parseFloat(quantity) || 0;
    return qty * getPrice();
  };

  const quickQuantities =
    product.unit === 'kilo' || product.unit === 'granel'
      ? [0.25, 0.5, 1, 1.5, 2]
      : [1, 2, 3, 5, 10];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
          onClick={onClose}
        />

        {/* Modal */}
        <div className="relative bg-[#1d1d1d] border border-white/10 rounded-xl shadow-2xl w-full max-w-md transform transition-all animate-scale-in">
          {/* Header */}
          <div className="flex items-center justify-between p-5 border-b border-white/10">
            <h2 className="text-lg uppercase tracking-[0.15em] text-white font-medium">Cantidad</h2>
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-white/40 hover:text-white/60 hover:bg-white/5 transition-all duration-300"
            >
              <FiX size={20} />
            </button>
          </div>

          {/* Content */}
          <div className="p-5 space-y-5">
            {/* Product Info */}
            <div className="p-4 bg-white/5 border border-white/10 rounded-lg">
              <h3 className="font-medium text-white mb-2">{product.name}</h3>
              <div className="flex items-center gap-3">
                <span className="text-lg font-light text-blue-400">
                  ${product.salePrice.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                </span>
                <span className="text-xs text-white/40">
                  / {product.unit === 'kilo' ? 'kg' : product.unit === 'litro' ? 'L' : 'pza'}
                </span>
              </div>
              {product.packagePrice && product.packageQuantity && (
                <p className="text-sm text-green-400/80 mt-2">
                  Paquete ({product.packageQuantity} pzs): ${product.packagePrice}
                </p>
              )}
            </div>

            {/* Package Toggle */}
            {product.packagePrice && product.packageQuantity && (
              <div className="flex gap-2">
                <button
                  onClick={() => setIsPackage(false)}
                  className={`flex-1 p-3 rounded-lg border transition-all duration-300 ${
                    !isPackage
                      ? 'border-blue-400/50 bg-blue-500/10'
                      : 'border-white/10 hover:border-white/20 bg-white/5'
                  }`}
                >
                  <span className={`text-sm uppercase tracking-[0.1em] ${!isPackage ? 'text-blue-400' : 'text-white/50'}`}>
                    Por Pieza
                  </span>
                </button>
                <button
                  onClick={() => setIsPackage(true)}
                  className={`flex-1 p-3 rounded-lg border transition-all duration-300 flex items-center justify-center gap-2 ${
                    isPackage
                      ? 'border-green-500/50 bg-green-500/10'
                      : 'border-white/10 hover:border-white/20 bg-white/5'
                  }`}
                >
                  <FiPackage className={`${isPackage ? 'text-green-400' : 'text-white/40'}`} />
                  <span className={`text-sm uppercase tracking-[0.1em] ${isPackage ? 'text-green-400' : 'text-white/50'}`}>
                    Por Paquete
                  </span>
                </button>
              </div>
            )}

            {/* Quantity Input */}
            <div>
              <label className="block text-xs uppercase tracking-[0.15em] text-white/50 mb-3">
                Cantidad {product.unit === 'kilo' && '(kg)'} {product.unit === 'litro' && '(L)'}
              </label>
              <input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                step={product.unit === 'kilo' || product.unit === 'granel' ? '0.01' : '1'}
                min="0"
                className="w-full bg-transparent border border-white/20 focus:border-blue-400/70
                  py-3 px-4 text-2xl text-center text-white font-light
                  rounded-lg transition-all duration-300 outline-none"
              />
            </div>

            {/* Quick Quantity Buttons */}
            <div className="flex flex-wrap gap-2">
              {quickQuantities.map((qty) => (
                <button
                  key={qty}
                  onClick={() => setQuantity(qty.toString())}
                  className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20
                    rounded-lg text-sm text-white/60 hover:text-white transition-all duration-300"
                >
                  {qty} {product.unit === 'kilo' ? 'kg' : product.unit === 'litro' ? 'L' : ''}
                </button>
              ))}
            </div>

            {/* Total Preview */}
            <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl">
              <div className="flex justify-between items-center">
                <span className="text-xs uppercase tracking-[0.15em] text-white/50">Total</span>
                <span className="text-2xl sm:text-3xl font-extralight text-blue-400">
                  ${getTotal().toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <button
                onClick={onClose}
                className="flex-1 py-3 flex items-center justify-center gap-2 rounded-lg
                  bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20
                  text-white/60 hover:text-white text-sm uppercase tracking-[0.1em]
                  transition-all duration-300"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirm}
                disabled={!quantity || parseFloat(quantity) <= 0}
                className={`flex-1 py-3 flex items-center justify-center gap-2 rounded-lg
                  text-sm uppercase tracking-[0.1em] transition-all duration-300 ${
                    !quantity || parseFloat(quantity) <= 0
                      ? 'bg-white/5 text-white/30 cursor-not-allowed border border-white/10'
                      : 'bg-blue-500 hover:bg-blue-400 text-white border border-blue-400/50 shadow-lg shadow-blue-500/20'
                  }`}
              >
                <FiCheck size={18} />
                <span>Agregar</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
