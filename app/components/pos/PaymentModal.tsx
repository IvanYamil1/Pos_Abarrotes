'use client';

import { useState, useEffect } from 'react';
import { PaymentMethod } from '../../types';
import {
  FiDollarSign,
  FiCreditCard,
  FiGift,
  FiCheck,
  FiX,
} from 'react-icons/fi';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  total: number;
  onConfirm: (method: PaymentMethod, amountPaid: number) => void;
}

export function PaymentModal({
  isOpen,
  onClose,
  total,
  onConfirm,
}: PaymentModalProps) {
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('efectivo');
  const [amountPaid, setAmountPaid] = useState('');
  const [change, setChange] = useState(0);

  useEffect(() => {
    if (isOpen) {
      setAmountPaid(total.toFixed(2));
      setChange(0);
      setPaymentMethod('efectivo');
    }
  }, [isOpen, total]);

  useEffect(() => {
    const paid = parseFloat(amountPaid) || 0;
    setChange(Math.max(0, paid - total));
  }, [amountPaid, total]);

  const handleConfirm = () => {
    const paid = parseFloat(amountPaid) || 0;
    if (paymentMethod === 'efectivo' && paid < total) {
      return;
    }
    onConfirm(paymentMethod, paid);
  };

  const quickAmounts = [20, 50, 100, 200, 500, 1000];

  const paymentMethods = [
    { value: 'efectivo' as PaymentMethod, label: 'Efectivo', icon: FiDollarSign },
    { value: 'tarjeta' as PaymentMethod, label: 'Tarjeta', icon: FiCreditCard },
    { value: 'vale' as PaymentMethod, label: 'Vale', icon: FiGift },
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
          onClick={onClose}
        />

        {/* Modal */}
        <div className="relative bg-[#1d1d1d] border border-white/10 rounded-xl shadow-2xl w-full max-w-lg transform transition-all animate-scale-in">
          {/* Header */}
          <div className="flex items-center justify-between p-5 border-b border-white/10">
            <h2 className="text-lg uppercase tracking-[0.15em] text-white font-medium">Procesar Pago</h2>
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-white/40 hover:text-white/60 hover:bg-white/5 transition-all duration-300"
            >
              <FiX size={20} />
            </button>
          </div>

          {/* Content */}
          <div className="p-5 space-y-6">
            {/* Total */}
            <div className="text-center p-5 bg-blue-500/10 border border-blue-500/20 rounded-xl">
              <p className="text-xs uppercase tracking-[0.2em] text-white/50 mb-2">Total a Pagar</p>
              <p className="text-4xl sm:text-5xl font-extralight text-blue-400 tracking-tight">
                ${total.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
              </p>
            </div>

            {/* Payment Method Selection */}
            <div>
              <label className="block text-xs uppercase tracking-[0.15em] text-white/50 mb-3">
                Método de Pago
              </label>
              <div className="grid grid-cols-3 gap-3">
                {paymentMethods.map((method) => (
                  <button
                    key={method.value}
                    onClick={() => setPaymentMethod(method.value)}
                    className={`flex flex-col items-center p-4 rounded-xl border transition-all duration-300 ${
                      paymentMethod === method.value
                        ? 'border-blue-400/50 bg-blue-500/10'
                        : 'border-white/10 hover:border-white/20 bg-white/5'
                    }`}
                  >
                    <method.icon
                      className={`w-6 h-6 mb-2 ${
                        paymentMethod === method.value
                          ? 'text-blue-400'
                          : 'text-white/40'
                      }`}
                    />
                    <span
                      className={`text-xs uppercase tracking-[0.1em] ${
                        paymentMethod === method.value
                          ? 'text-blue-400'
                          : 'text-white/50'
                      }`}
                    >
                      {method.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Cash Payment Options */}
            {paymentMethod === 'efectivo' && (
              <>
                <div>
                  <label className="block text-xs uppercase tracking-[0.15em] text-white/50 mb-3">
                    Cantidad Recibida
                  </label>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40">
                      <FiDollarSign size={20} />
                    </div>
                    <input
                      type="number"
                      value={amountPaid}
                      onChange={(e) => setAmountPaid(e.target.value)}
                      className="w-full bg-transparent border border-white/20 focus:border-blue-400/70
                        py-3 sm:py-4 pl-12 pr-4 text-xl sm:text-2xl text-white font-light
                        rounded-lg transition-all duration-300 outline-none"
                      step="0.01"
                      min="0"
                    />
                  </div>
                </div>

                {/* Quick Amount Buttons */}
                <div className="flex flex-wrap gap-2">
                  {quickAmounts.map((amount) => (
                    <button
                      key={amount}
                      onClick={() => setAmountPaid(amount.toFixed(2))}
                      className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20
                        rounded-lg text-sm text-white/60 hover:text-white transition-all duration-300"
                    >
                      ${amount}
                    </button>
                  ))}
                  <button
                    onClick={() => setAmountPaid(total.toFixed(2))}
                    className="px-4 py-2 bg-green-500/10 hover:bg-green-500/20 border border-green-500/30 hover:border-green-500/50
                      rounded-lg text-sm text-green-400 transition-all duration-300"
                  >
                    Exacto
                  </button>
                </div>

                {/* Change */}
                {change > 0 && (
                  <div className="p-5 bg-green-500/10 border border-green-500/20 rounded-xl">
                    <p className="text-xs uppercase tracking-[0.2em] text-white/50 mb-2">Cambio</p>
                    <p className="text-3xl sm:text-4xl font-extralight text-green-400 tracking-tight">
                      ${change.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                )}
              </>
            )}

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
                disabled={
                  paymentMethod === 'efectivo' &&
                  (parseFloat(amountPaid) || 0) < total
                }
                className={`flex-1 py-3 flex items-center justify-center gap-2 rounded-lg
                  text-sm uppercase tracking-[0.1em] transition-all duration-300 ${
                    paymentMethod === 'efectivo' && (parseFloat(amountPaid) || 0) < total
                      ? 'bg-white/5 text-white/30 cursor-not-allowed border border-white/10'
                      : 'bg-green-500 hover:bg-green-400 text-white border border-green-400/50 shadow-lg shadow-green-500/20'
                  }`}
              >
                <FiCheck size={18} />
                <span>Confirmar Pago</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
