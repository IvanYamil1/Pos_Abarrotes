'use client';

import React, { useState } from 'react';
import { MainLayout } from '../components/layout/MainLayout';
import { useCashRegisterStore } from '../stores/cashRegisterStore';
import { useSalesStore } from '../stores/salesStore';
import { useAuthStore } from '../stores/authStore';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import toast from 'react-hot-toast';
import {
  FiDollarSign,
  FiLock,
  FiUnlock,
  FiTrendingUp,
  FiTrendingDown,
  FiClock,
  FiPlus,
  FiMinus,
  FiAlertCircle,
  FiCheck,
  FiList,
  FiX,
  FiCreditCard,
  FiGift,
} from 'react-icons/fi';

export default function CajaPage() {
  const { user } = useAuthStore();
  const {
    currentRegister,
    registers,
    openRegister,
    closeRegister,
    addExpenseToRegister,
    getExpensesByRegister,
  } = useCashRegisterStore();
  const { getSalesToday } = useSalesStore();

  // Modal states
  const [openCashModalOpen, setOpenCashModalOpen] = useState(false);
  const [closeCashModalOpen, setCloseCashModalOpen] = useState(false);
  const [expenseModalOpen, setExpenseModalOpen] = useState(false);
  const [historyModalOpen, setHistoryModalOpen] = useState(false);

  // Form states
  const [openingAmount, setOpeningAmount] = useState('');
  const [closingAmount, setClosingAmount] = useState('');
  const [expenseDescription, setExpenseDescription] = useState('');
  const [expenseAmount, setExpenseAmount] = useState('');
  const [expenseCategory, setExpenseCategory] = useState('');

  const todaySales = getSalesToday();
  const currentExpenses = currentRegister
    ? getExpensesByRegister(currentRegister.id)
    : [];

  const handleOpenRegister = () => {
    const amount = parseFloat(openingAmount);
    if (isNaN(amount) || amount < 0) {
      toast.error('Ingresa un monto válido');
      return;
    }

    openRegister(amount, user?.id || '1');
    toast.success('Caja abierta correctamente');
    setOpenCashModalOpen(false);
    setOpeningAmount('');
  };

  const handleCloseRegister = () => {
    const amount = parseFloat(closingAmount);
    if (isNaN(amount) || amount < 0) {
      toast.error('Ingresa un monto válido');
      return;
    }

    const result = closeRegister(amount);
    if (result) {
      const diffLabel =
        result.difference! > 0
          ? 'Sobrante'
          : result.difference! < 0
          ? 'Faltante'
          : 'Exacto';
      toast.success(`Caja cerrada. ${diffLabel}: $${Math.abs(result.difference!).toFixed(2)}`);
    }
    setCloseCashModalOpen(false);
    setClosingAmount('');
  };

  const handleAddExpense = () => {
    if (!expenseDescription.trim() || !expenseAmount || !expenseCategory) {
      toast.error('Completa todos los campos');
      return;
    }

    const amount = parseFloat(expenseAmount);
    if (isNaN(amount) || amount <= 0) {
      toast.error('Monto inválido');
      return;
    }

    addExpenseToRegister(expenseDescription, amount, expenseCategory, user?.id || '1');
    toast.success('Gasto registrado');
    setExpenseModalOpen(false);
    setExpenseDescription('');
    setExpenseAmount('');
    setExpenseCategory('');
  };

  // Calculate stats
  const cashSales = todaySales
    .filter((s) => s.paymentMethod === 'efectivo')
    .reduce((sum, s) => sum + s.total, 0);

  const cardSales = todaySales
    .filter((s) => s.paymentMethod === 'tarjeta')
    .reduce((sum, s) => sum + s.total, 0);

  const voucherSales = todaySales
    .filter((s) => s.paymentMethod === 'vale')
    .reduce((sum, s) => sum + s.total, 0);

  const totalExpenses = currentExpenses.reduce((sum, e) => sum + e.amount, 0);

  const expenseCategories = [
    { value: 'servicios', label: 'Servicios' },
    { value: 'proveedores', label: 'Proveedores' },
    { value: 'suministros', label: 'Suministros' },
    { value: 'personal', label: 'Personal' },
    { value: 'otros', label: 'Otros' },
  ];

  return (
    <MainLayout>
      <div style={{ padding: '20px', background: '#030712', minHeight: '100vh' }}>
        {/* Header */}
        <div style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h1 style={{
              fontSize: '14px',
              fontWeight: '500',
              color: 'rgba(255, 255, 255, 0.6)',
              marginBottom: '12px',
              letterSpacing: '0.15em',
              textTransform: 'uppercase'
            }}>
              Caja
            </h1>
            <p style={{
              color: 'rgba(255, 255, 255, 0.4)',
              fontSize: '14px',
              fontWeight: '300',
              letterSpacing: '0.02em'
            }}>
              {format(new Date(), "EEEE, d 'de' MMMM yyyy", { locale: es })}
            </p>
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={() => setHistoryModalOpen(true)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 20px',
                background: '#2a2a2a',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '2px',
                color: 'rgba(255, 255, 255, 0.6)',
                fontSize: '12px',
                fontWeight: '500',
                cursor: 'pointer',
                letterSpacing: '0.05em',
                textTransform: 'uppercase'
              }}
            >
              <FiList size={16} />
              Historial
            </button>
            {!currentRegister ? (
              <button
                onClick={() => setOpenCashModalOpen(true)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '12px 20px',
                  background: '#10b981',
                  border: '1px solid rgba(16, 185, 129, 0.5)',
                  borderRadius: '2px',
                  color: 'white',
                  fontSize: '12px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  letterSpacing: '0.05em',
                  textTransform: 'uppercase'
                }}
              >
                <FiUnlock size={16} />
                Abrir Caja
              </button>
            ) : (
              <button
                onClick={() => setCloseCashModalOpen(true)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '12px 20px',
                  background: 'rgba(239, 68, 68, 0.1)',
                  border: '1px solid rgba(239, 68, 68, 0.5)',
                  borderRadius: '2px',
                  color: '#ef4444',
                  fontSize: '12px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  letterSpacing: '0.05em',
                  textTransform: 'uppercase'
                }}
              >
                <FiLock size={16} />
                Cerrar Caja
              </button>
            )}
          </div>
        </div>

        {/* Cash Status */}
        {!currentRegister ? (
          <div style={{
            background: '#1d1d1d',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '2px',
            padding: '60px 20px',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <FiLock size={48} style={{ color: 'rgba(255, 255, 255, 0.2)', marginBottom: '20px' }} />
            <h2 style={{
              fontSize: '18px',
              fontWeight: '400',
              color: 'white',
              marginBottom: '8px'
            }}>
              Caja Cerrada
            </h2>
            <p style={{
              color: 'rgba(255, 255, 255, 0.4)',
              fontSize: '13px',
              fontWeight: '300',
              marginBottom: '24px'
            }}>
              Abre la caja para comenzar a registrar ventas
            </p>
            <button
              onClick={() => setOpenCashModalOpen(true)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '14px 28px',
                background: '#10b981',
                border: '1px solid rgba(16, 185, 129, 0.5)',
                borderRadius: '2px',
                color: 'white',
                fontSize: '13px',
                fontWeight: '500',
                cursor: 'pointer',
                letterSpacing: '0.05em',
                textTransform: 'uppercase'
              }}
            >
              <FiUnlock size={18} />
              Abrir Caja
            </button>
          </div>
        ) : (
          <>
            {/* Cash Summary */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '16px',
              marginBottom: '24px'
            }}>
              {[
                { label: 'Monto de Apertura', value: currentRegister.openingAmount, color: '#3b82f6', icon: FiDollarSign },
                { label: 'Ventas del Turno', value: currentRegister.salesTotal, color: '#10b981', icon: FiTrendingUp },
                { label: 'Gastos', value: currentRegister.expensesTotal, color: '#ef4444', icon: FiTrendingDown },
                { label: 'Efectivo Esperado', value: currentRegister.expectedAmount, color: '#8b5cf6', icon: FiDollarSign },
              ].map((stat) => (
                <div
                  key={stat.label}
                  style={{
                    background: '#1d1d1d',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '2px',
                    padding: '20px',
                    transition: 'border-color 0.3s ease'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.borderColor = 'rgba(59, 130, 246, 0.5)'}
                  onMouseLeave={(e) => e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)'}
                >
                  <p style={{
                    fontSize: '11px',
                    fontWeight: '500',
                    color: 'rgba(255, 255, 255, 0.5)',
                    letterSpacing: '0.15em',
                    textTransform: 'uppercase',
                    marginBottom: '12px'
                  }}>
                    {stat.label}
                  </p>
                  <p style={{
                    fontSize: '28px',
                    fontWeight: '300',
                    color: stat.color,
                    letterSpacing: '-0.02em'
                  }}>
                    ${stat.value.toFixed(2)}
                  </p>
                </div>
              ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
              {/* Sales Breakdown */}
              <div style={{
                background: '#1d1d1d',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '2px',
                padding: '20px'
              }}>
                <div style={{
                  marginBottom: '20px',
                  paddingBottom: '16px',
                  borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
                }}>
                  <h3 style={{
                    fontSize: '11px',
                    fontWeight: '500',
                    color: 'rgba(255, 255, 255, 0.5)',
                    letterSpacing: '0.15em',
                    textTransform: 'uppercase'
                  }}>
                    Desglose de Ventas
                  </h3>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {[
                    { label: 'Efectivo', value: cashSales, color: '#10b981', icon: FiDollarSign },
                    { label: 'Tarjeta', value: cardSales, color: '#3b82f6', icon: FiCreditCard },
                    { label: 'Vales', value: voucherSales, color: '#f59e0b', icon: FiGift },
                  ].map((item) => (
                    <div
                      key={item.label}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '12px',
                        background: '#2a2a2a',
                        borderRadius: '2px'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{
                          width: '36px',
                          height: '36px',
                          background: `${item.color}15`,
                          borderRadius: '2px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          <item.icon size={16} style={{ color: item.color }} />
                        </div>
                        <span style={{ fontSize: '13px', color: 'white', fontWeight: '400' }}>
                          {item.label}
                        </span>
                      </div>
                      <span style={{ fontSize: '15px', fontWeight: '300', color: 'white' }}>
                        ${item.value.toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Expenses */}
              <div style={{
                background: '#1d1d1d',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '2px',
                padding: '20px'
              }}>
                <div style={{
                  marginBottom: '20px',
                  paddingBottom: '16px',
                  borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <h3 style={{
                    fontSize: '11px',
                    fontWeight: '500',
                    color: 'rgba(255, 255, 255, 0.5)',
                    letterSpacing: '0.15em',
                    textTransform: 'uppercase'
                  }}>
                    Gastos del Turno
                  </h3>
                  <button
                    onClick={() => setExpenseModalOpen(true)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '6px 12px',
                      background: 'transparent',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '2px',
                      color: 'rgba(255, 255, 255, 0.5)',
                      fontSize: '11px',
                      cursor: 'pointer',
                      letterSpacing: '0.05em',
                      textTransform: 'uppercase'
                    }}
                  >
                    <FiPlus size={12} />
                    Agregar
                  </button>
                </div>

                {currentExpenses.length === 0 ? (
                  <div style={{
                    textAlign: 'center',
                    padding: '40px 20px',
                    color: 'rgba(255, 255, 255, 0.3)'
                  }}>
                    <p style={{ fontSize: '13px', fontWeight: '300' }}>No hay gastos registrados</p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {currentExpenses.map((expense) => (
                      <div
                        key={expense.id}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '12px',
                          background: 'rgba(239, 68, 68, 0.05)',
                          border: '1px solid rgba(239, 68, 68, 0.1)',
                          borderRadius: '2px'
                        }}
                      >
                        <div>
                          <p style={{ fontSize: '13px', color: 'white', fontWeight: '400', marginBottom: '2px' }}>
                            {expense.description}
                          </p>
                          <p style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.4)' }}>
                            {expense.category} • {format(new Date(expense.createdAt), 'HH:mm')}
                          </p>
                        </div>
                        <span style={{ fontSize: '14px', fontWeight: '400', color: '#ef4444' }}>
                          -${expense.amount.toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Cash Register Info */}
            <div style={{
              background: '#1d1d1d',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '2px',
              padding: '16px 20px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}>
              <FiClock size={16} style={{ color: 'rgba(255, 255, 255, 0.4)' }} />
              <span style={{ fontSize: '13px', color: 'rgba(255, 255, 255, 0.5)' }}>
                Caja abierta: {format(new Date(currentRegister.openedAt), "dd/MM/yyyy 'a las' HH:mm", { locale: es })}
              </span>
              <span style={{
                padding: '4px 10px',
                background: 'rgba(16, 185, 129, 0.1)',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                borderRadius: '2px',
                color: '#10b981',
                fontSize: '10px',
                fontWeight: '500',
                letterSpacing: '0.05em',
                textTransform: 'uppercase'
              }}>
                Activa
              </span>
            </div>
          </>
        )}
      </div>

      {/* Open Cash Modal */}
      {openCashModalOpen && (
        <div style={{
          position: 'fixed',
          inset: 0,
          zIndex: 50,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px'
        }}>
          <div
            style={{ position: 'fixed', inset: 0, background: 'rgba(0, 0, 0, 0.8)', backdropFilter: 'blur(4px)' }}
            onClick={() => setOpenCashModalOpen(false)}
          />
          <div style={{
            position: 'relative',
            background: '#1d1d1d',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '2px',
            width: '100%',
            maxWidth: '400px'
          }}>
            <div style={{
              padding: '20px',
              borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <span style={{ fontSize: '11px', fontWeight: '500', color: 'rgba(255, 255, 255, 0.5)', letterSpacing: '0.15em', textTransform: 'uppercase' }}>
                Abrir Caja
              </span>
              <button
                onClick={() => setOpenCashModalOpen(false)}
                style={{ background: 'none', border: 'none', color: 'rgba(255, 255, 255, 0.4)', cursor: 'pointer' }}
              >
                <FiX size={20} />
              </button>
            </div>

            <div style={{ padding: '24px' }}>
              <p style={{ fontSize: '13px', color: 'rgba(255, 255, 255, 0.5)', marginBottom: '20px' }}>
                Ingresa el monto inicial con el que abres la caja.
              </p>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '11px', color: 'rgba(255, 255, 255, 0.5)', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '8px' }}>
                  Monto de Apertura
                </label>
                <div style={{ position: 'relative' }}>
                  <FiDollarSign style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255, 255, 255, 0.4)' }} />
                  <input
                    type="number"
                    value={openingAmount}
                    onChange={(e) => setOpeningAmount(e.target.value)}
                    placeholder="0.00"
                    style={{
                      width: '100%',
                      padding: '12px 14px 12px 42px',
                      background: '#2a2a2a',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '2px',
                      color: 'white',
                      fontSize: '16px',
                      fontWeight: '300',
                      outline: 'none'
                    }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  onClick={() => setOpenCashModalOpen(false)}
                  style={{
                    flex: 1,
                    padding: '12px',
                    background: '#2a2a2a',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '2px',
                    color: 'rgba(255, 255, 255, 0.6)',
                    fontSize: '12px',
                    cursor: 'pointer',
                    letterSpacing: '0.05em',
                    textTransform: 'uppercase'
                  }}
                >
                  Cancelar
                </button>
                <button
                  onClick={handleOpenRegister}
                  style={{
                    flex: 1,
                    padding: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    background: '#10b981',
                    border: '1px solid rgba(16, 185, 129, 0.5)',
                    borderRadius: '2px',
                    color: 'white',
                    fontSize: '12px',
                    cursor: 'pointer',
                    letterSpacing: '0.05em',
                    textTransform: 'uppercase'
                  }}
                >
                  <FiUnlock size={14} />
                  Abrir Caja
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Close Cash Modal */}
      {closeCashModalOpen && currentRegister && (
        <div style={{
          position: 'fixed',
          inset: 0,
          zIndex: 50,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px'
        }}>
          <div
            style={{ position: 'fixed', inset: 0, background: 'rgba(0, 0, 0, 0.8)', backdropFilter: 'blur(4px)' }}
            onClick={() => setCloseCashModalOpen(false)}
          />
          <div style={{
            position: 'relative',
            background: '#1d1d1d',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '2px',
            width: '100%',
            maxWidth: '480px'
          }}>
            <div style={{
              padding: '20px',
              borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <span style={{ fontSize: '11px', fontWeight: '500', color: 'rgba(255, 255, 255, 0.5)', letterSpacing: '0.15em', textTransform: 'uppercase' }}>
                Cerrar Caja
              </span>
              <button
                onClick={() => setCloseCashModalOpen(false)}
                style={{ background: 'none', border: 'none', color: 'rgba(255, 255, 255, 0.4)', cursor: 'pointer' }}
              >
                <FiX size={20} />
              </button>
            </div>

            <div style={{ padding: '24px' }}>
              {/* Summary */}
              <div style={{
                background: '#2a2a2a',
                borderRadius: '2px',
                padding: '16px',
                marginBottom: '20px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <span style={{ fontSize: '13px', color: 'rgba(255, 255, 255, 0.5)' }}>Monto de apertura:</span>
                  <span style={{ fontSize: '13px', color: 'white' }}>${currentRegister.openingAmount.toFixed(2)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <span style={{ fontSize: '13px', color: 'rgba(255, 255, 255, 0.5)' }}>Ventas en efectivo:</span>
                  <span style={{ fontSize: '13px', color: '#10b981' }}>+${cashSales.toFixed(2)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <span style={{ fontSize: '13px', color: 'rgba(255, 255, 255, 0.5)' }}>Gastos:</span>
                  <span style={{ fontSize: '13px', color: '#ef4444' }}>-${totalExpenses.toFixed(2)}</span>
                </div>
                <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.1)', paddingTop: '12px', display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '13px', fontWeight: '500', color: 'white' }}>Efectivo esperado:</span>
                  <span style={{ fontSize: '16px', fontWeight: '400', color: 'white' }}>${currentRegister.expectedAmount.toFixed(2)}</span>
                </div>
              </div>

              {/* Input */}
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '11px', color: 'rgba(255, 255, 255, 0.5)', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '8px' }}>
                  Efectivo Real en Caja
                </label>
                <div style={{ position: 'relative' }}>
                  <FiDollarSign style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255, 255, 255, 0.4)' }} />
                  <input
                    type="number"
                    value={closingAmount}
                    onChange={(e) => setClosingAmount(e.target.value)}
                    placeholder="Cuenta el efectivo físico"
                    style={{
                      width: '100%',
                      padding: '12px 14px 12px 42px',
                      background: '#2a2a2a',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '2px',
                      color: 'white',
                      fontSize: '16px',
                      fontWeight: '300',
                      outline: 'none'
                    }}
                  />
                </div>
              </div>

              {/* Difference Display */}
              {closingAmount && (
                <div style={{
                  padding: '16px',
                  borderRadius: '2px',
                  marginBottom: '20px',
                  background: parseFloat(closingAmount) === currentRegister.expectedAmount
                    ? 'rgba(59, 130, 246, 0.1)'
                    : parseFloat(closingAmount) > currentRegister.expectedAmount
                    ? 'rgba(16, 185, 129, 0.1)'
                    : 'rgba(239, 68, 68, 0.1)',
                  border: `1px solid ${
                    parseFloat(closingAmount) === currentRegister.expectedAmount
                      ? 'rgba(59, 130, 246, 0.3)'
                      : parseFloat(closingAmount) > currentRegister.expectedAmount
                      ? 'rgba(16, 185, 129, 0.3)'
                      : 'rgba(239, 68, 68, 0.3)'
                  }`
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {parseFloat(closingAmount) === currentRegister.expectedAmount ? (
                      <>
                        <FiCheck style={{ color: '#3b82f6' }} />
                        <span style={{ fontSize: '13px', fontWeight: '500', color: '#3b82f6' }}>Caja cuadrada</span>
                      </>
                    ) : parseFloat(closingAmount) > currentRegister.expectedAmount ? (
                      <>
                        <FiAlertCircle style={{ color: '#10b981' }} />
                        <span style={{ fontSize: '13px', fontWeight: '500', color: '#10b981' }}>
                          Sobrante: ${(parseFloat(closingAmount) - currentRegister.expectedAmount).toFixed(2)}
                        </span>
                      </>
                    ) : (
                      <>
                        <FiAlertCircle style={{ color: '#ef4444' }} />
                        <span style={{ fontSize: '13px', fontWeight: '500', color: '#ef4444' }}>
                          Faltante: ${(currentRegister.expectedAmount - parseFloat(closingAmount)).toFixed(2)}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  onClick={() => setCloseCashModalOpen(false)}
                  style={{
                    flex: 1,
                    padding: '12px',
                    background: '#2a2a2a',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '2px',
                    color: 'rgba(255, 255, 255, 0.6)',
                    fontSize: '12px',
                    cursor: 'pointer',
                    letterSpacing: '0.05em',
                    textTransform: 'uppercase'
                  }}
                >
                  Cancelar
                </button>
                <button
                  onClick={handleCloseRegister}
                  style={{
                    flex: 1,
                    padding: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    background: 'rgba(239, 68, 68, 0.1)',
                    border: '1px solid rgba(239, 68, 68, 0.5)',
                    borderRadius: '2px',
                    color: '#ef4444',
                    fontSize: '12px',
                    cursor: 'pointer',
                    letterSpacing: '0.05em',
                    textTransform: 'uppercase'
                  }}
                >
                  <FiLock size={14} />
                  Cerrar Caja
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Expense Modal */}
      {expenseModalOpen && (
        <div style={{
          position: 'fixed',
          inset: 0,
          zIndex: 50,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px'
        }}>
          <div
            style={{ position: 'fixed', inset: 0, background: 'rgba(0, 0, 0, 0.8)', backdropFilter: 'blur(4px)' }}
            onClick={() => setExpenseModalOpen(false)}
          />
          <div style={{
            position: 'relative',
            background: '#1d1d1d',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '2px',
            width: '100%',
            maxWidth: '440px'
          }}>
            <div style={{
              padding: '20px',
              borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <span style={{ fontSize: '11px', fontWeight: '500', color: 'rgba(255, 255, 255, 0.5)', letterSpacing: '0.15em', textTransform: 'uppercase' }}>
                Registrar Gasto
              </span>
              <button
                onClick={() => setExpenseModalOpen(false)}
                style={{ background: 'none', border: 'none', color: 'rgba(255, 255, 255, 0.4)', cursor: 'pointer' }}
              >
                <FiX size={20} />
              </button>
            </div>

            <div style={{ padding: '24px' }}>
              {/* Description */}
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '11px', color: 'rgba(255, 255, 255, 0.5)', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '8px' }}>
                  Descripción
                </label>
                <input
                  type="text"
                  value={expenseDescription}
                  onChange={(e) => setExpenseDescription(e.target.value)}
                  placeholder="Ej: Pago de luz"
                  style={{
                    width: '100%',
                    padding: '12px 14px',
                    background: '#2a2a2a',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '2px',
                    color: 'white',
                    fontSize: '13px',
                    fontWeight: '300',
                    outline: 'none'
                  }}
                />
              </div>

              {/* Amount */}
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '11px', color: 'rgba(255, 255, 255, 0.5)', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '8px' }}>
                  Monto
                </label>
                <div style={{ position: 'relative' }}>
                  <FiDollarSign style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255, 255, 255, 0.4)' }} />
                  <input
                    type="number"
                    value={expenseAmount}
                    onChange={(e) => setExpenseAmount(e.target.value)}
                    placeholder="0.00"
                    style={{
                      width: '100%',
                      padding: '12px 14px 12px 42px',
                      background: '#2a2a2a',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '2px',
                      color: 'white',
                      fontSize: '13px',
                      fontWeight: '300',
                      outline: 'none'
                    }}
                  />
                </div>
              </div>

              {/* Category */}
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '11px', color: 'rgba(255, 255, 255, 0.5)', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '8px' }}>
                  Categoría
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                  {expenseCategories.map((cat) => (
                    <button
                      key={cat.value}
                      onClick={() => setExpenseCategory(cat.value)}
                      style={{
                        padding: '10px',
                        background: expenseCategory === cat.value ? 'rgba(59, 130, 246, 0.1)' : '#2a2a2a',
                        border: '1px solid',
                        borderColor: expenseCategory === cat.value ? 'rgba(59, 130, 246, 0.5)' : 'rgba(255, 255, 255, 0.1)',
                        borderRadius: '2px',
                        color: expenseCategory === cat.value ? '#3b82f6' : 'rgba(255, 255, 255, 0.6)',
                        fontSize: '11px',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  onClick={() => setExpenseModalOpen(false)}
                  style={{
                    flex: 1,
                    padding: '12px',
                    background: '#2a2a2a',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '2px',
                    color: 'rgba(255, 255, 255, 0.6)',
                    fontSize: '12px',
                    cursor: 'pointer',
                    letterSpacing: '0.05em',
                    textTransform: 'uppercase'
                  }}
                >
                  Cancelar
                </button>
                <button
                  onClick={handleAddExpense}
                  style={{
                    flex: 1,
                    padding: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    background: '#3b82f6',
                    border: '1px solid rgba(59, 130, 246, 0.5)',
                    borderRadius: '2px',
                    color: 'white',
                    fontSize: '12px',
                    cursor: 'pointer',
                    letterSpacing: '0.05em',
                    textTransform: 'uppercase'
                  }}
                >
                  <FiMinus size={14} />
                  Registrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* History Modal */}
      {historyModalOpen && (
        <div style={{
          position: 'fixed',
          inset: 0,
          zIndex: 50,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px'
        }}>
          <div
            style={{ position: 'fixed', inset: 0, background: 'rgba(0, 0, 0, 0.8)', backdropFilter: 'blur(4px)' }}
            onClick={() => setHistoryModalOpen(false)}
          />
          <div style={{
            position: 'relative',
            background: '#1d1d1d',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '2px',
            width: '100%',
            maxWidth: '700px',
            maxHeight: '80vh',
            display: 'flex',
            flexDirection: 'column'
          }}>
            <div style={{
              padding: '20px',
              borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <span style={{ fontSize: '11px', fontWeight: '500', color: 'rgba(255, 255, 255, 0.5)', letterSpacing: '0.15em', textTransform: 'uppercase' }}>
                Historial de Cajas
              </span>
              <button
                onClick={() => setHistoryModalOpen(false)}
                style={{ background: 'none', border: 'none', color: 'rgba(255, 255, 255, 0.4)', cursor: 'pointer' }}
              >
                <FiX size={20} />
              </button>
            </div>

            <div style={{ padding: '24px', overflowY: 'auto', flex: 1 }}>
              {registers.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 20px', color: 'rgba(255, 255, 255, 0.3)' }}>
                  <p style={{ fontSize: '13px', fontWeight: '300' }}>No hay registros de caja</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {registers.slice().reverse().map((register) => (
                    <div
                      key={register.id}
                      style={{
                        padding: '16px',
                        background: register.status === 'abierta' ? 'rgba(16, 185, 129, 0.05)' : '#2a2a2a',
                        border: '1px solid',
                        borderColor: register.status === 'abierta' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                        borderRadius: '2px'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <span style={{
                            padding: '3px 8px',
                            background: register.status === 'abierta' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(255, 255, 255, 0.05)',
                            border: '1px solid',
                            borderColor: register.status === 'abierta' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(255, 255, 255, 0.1)',
                            borderRadius: '2px',
                            color: register.status === 'abierta' ? '#10b981' : 'rgba(255, 255, 255, 0.5)',
                            fontSize: '10px',
                            fontWeight: '500',
                            letterSpacing: '0.05em',
                            textTransform: 'uppercase'
                          }}>
                            {register.status === 'abierta' ? 'Activa' : 'Cerrada'}
                          </span>
                          <span style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.4)' }}>
                            {format(new Date(register.openedAt), 'dd/MM/yyyy HH:mm', { locale: es })}
                          </span>
                        </div>
                        {register.closedAt && (
                          <span style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.4)' }}>
                            Cerrada: {format(new Date(register.closedAt), 'HH:mm', { locale: es })}
                          </span>
                        )}
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
                        <div>
                          <p style={{ fontSize: '10px', color: 'rgba(255, 255, 255, 0.4)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '4px' }}>Apertura</p>
                          <p style={{ fontSize: '13px', color: 'white', fontWeight: '400' }}>${register.openingAmount.toFixed(2)}</p>
                        </div>
                        <div>
                          <p style={{ fontSize: '10px', color: 'rgba(255, 255, 255, 0.4)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '4px' }}>Ventas</p>
                          <p style={{ fontSize: '13px', color: '#10b981', fontWeight: '400' }}>+${register.salesTotal.toFixed(2)}</p>
                        </div>
                        <div>
                          <p style={{ fontSize: '10px', color: 'rgba(255, 255, 255, 0.4)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '4px' }}>Gastos</p>
                          <p style={{ fontSize: '13px', color: '#ef4444', fontWeight: '400' }}>-${register.expensesTotal.toFixed(2)}</p>
                        </div>
                        {register.closingAmount !== undefined && (
                          <div>
                            <p style={{ fontSize: '10px', color: 'rgba(255, 255, 255, 0.4)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '4px' }}>Diferencia</p>
                            <p style={{
                              fontSize: '13px',
                              fontWeight: '400',
                              color: register.difference! > 0 ? '#10b981' : register.difference! < 0 ? '#ef4444' : '#3b82f6'
                            }}>
                              {register.difference! > 0 ? '+' : ''}${register.difference!.toFixed(2)}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </MainLayout>
  );
}
