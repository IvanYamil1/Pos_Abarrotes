'use client';

import React, { useState } from 'react';
import { MainLayout } from '../components/layout/MainLayout';
import { Card, CardHeader } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Modal } from '../components/ui/Modal';
import { Badge } from '../components/ui/Badge';
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
} from 'react-icons/fi';

export default function CajaPage() {
  const { user } = useAuthStore();
  const {
    currentRegister,
    registers,
    expenses,
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
    { value: 'servicios', label: 'Servicios (agua, luz, etc.)' },
    { value: 'proveedores', label: 'Pago a proveedores' },
    { value: 'suministros', label: 'Suministros de tienda' },
    { value: 'personal', label: 'Personal/Nómina' },
    { value: 'otros', label: 'Otros' },
  ];

  return (
    <MainLayout>
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Caja</h1>
            <p className="text-gray-500">
              {format(new Date(), "EEEE, d 'de' MMMM yyyy", { locale: es })}
            </p>
          </div>
          <div className="flex gap-3">
            <Button
              variant="secondary"
              icon={<FiList />}
              onClick={() => setHistoryModalOpen(true)}
            >
              Historial
            </Button>
            {!currentRegister ? (
              <Button
                variant="success"
                icon={<FiUnlock />}
                onClick={() => setOpenCashModalOpen(true)}
              >
                Abrir Caja
              </Button>
            ) : (
              <Button
                variant="danger"
                icon={<FiLock />}
                onClick={() => setCloseCashModalOpen(true)}
              >
                Cerrar Caja
              </Button>
            )}
          </div>
        </div>

        {/* Cash Status */}
        {!currentRegister ? (
          <Card className="mb-6">
            <div className="text-center py-12">
              <FiLock className="w-16 h-16 mx-auto text-gray-300 mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Caja Cerrada
              </h2>
              <p className="text-gray-500 mb-4">
                Abre la caja para comenzar a registrar ventas
              </p>
              <Button
                variant="success"
                size="lg"
                icon={<FiUnlock />}
                onClick={() => setOpenCashModalOpen(true)}
              >
                Abrir Caja
              </Button>
            </div>
          </Card>
        ) : (
          <>
            {/* Cash Summary */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
              <Card>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                    <FiDollarSign className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Monto de Apertura</p>
                    <p className="text-2xl font-bold text-gray-900">
                      ${currentRegister.openingAmount.toFixed(2)}
                    </p>
                  </div>
                </div>
              </Card>

              <Card>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                    <FiTrendingUp className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Ventas del Turno</p>
                    <p className="text-2xl font-bold text-green-600">
                      ${currentRegister.salesTotal.toFixed(2)}
                    </p>
                  </div>
                </div>
              </Card>

              <Card>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                    <FiTrendingDown className="w-6 h-6 text-red-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Gastos</p>
                    <p className="text-2xl font-bold text-red-600">
                      ${currentRegister.expensesTotal.toFixed(2)}
                    </p>
                  </div>
                </div>
              </Card>

              <Card>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                    <FiDollarSign className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Efectivo Esperado</p>
                    <p className="text-2xl font-bold text-purple-600">
                      ${currentRegister.expectedAmount.toFixed(2)}
                    </p>
                  </div>
                </div>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Sales Breakdown */}
              <Card>
                <CardHeader title="Desglose de Ventas" subtitle="Por método de pago" />
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                        <FiDollarSign className="text-green-600" />
                      </div>
                      <span className="font-medium">Efectivo</span>
                    </div>
                    <span className="text-lg font-bold text-gray-900">
                      ${cashSales.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <FiDollarSign className="text-blue-600" />
                      </div>
                      <span className="font-medium">Tarjeta</span>
                    </div>
                    <span className="text-lg font-bold text-gray-900">
                      ${cardSales.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                        <FiDollarSign className="text-orange-600" />
                      </div>
                      <span className="font-medium">Vales</span>
                    </div>
                    <span className="text-lg font-bold text-gray-900">
                      ${voucherSales.toFixed(2)}
                    </span>
                  </div>
                </div>
              </Card>

              {/* Expenses */}
              <Card>
                <CardHeader
                  title="Gastos del Turno"
                  action={
                    <Button
                      variant="ghost"
                      size="sm"
                      icon={<FiPlus />}
                      onClick={() => setExpenseModalOpen(true)}
                    >
                      Agregar
                    </Button>
                  }
                />
                {currentExpenses.length === 0 ? (
                  <div className="text-center py-8 text-gray-400">
                    <p>No hay gastos registrados</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {currentExpenses.map((expense) => (
                      <div
                        key={expense.id}
                        className="flex items-center justify-between p-3 bg-red-50 rounded-lg"
                      >
                        <div>
                          <p className="font-medium text-gray-900">
                            {expense.description}
                          </p>
                          <p className="text-xs text-gray-500">
                            {expense.category} •{' '}
                            {format(new Date(expense.createdAt), 'HH:mm')}
                          </p>
                        </div>
                        <span className="font-bold text-red-600">
                          -${expense.amount.toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            </div>

            {/* Cash Register Info */}
            <Card className="mt-6">
              <div className="flex items-center gap-2 text-gray-500 text-sm">
                <FiClock />
                <span>
                  Caja abierta:{' '}
                  {format(new Date(currentRegister.openedAt), "dd/MM/yyyy 'a las' HH:mm", {
                    locale: es,
                  })}
                </span>
                <Badge variant="success">Activa</Badge>
              </div>
            </Card>
          </>
        )}
      </div>

      {/* Open Cash Modal */}
      <Modal
        isOpen={openCashModalOpen}
        onClose={() => setOpenCashModalOpen(false)}
        title="Abrir Caja"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            Ingresa el monto inicial con el que abres la caja.
          </p>
          <Input
            label="Monto de Apertura"
            type="number"
            value={openingAmount}
            onChange={(e) => setOpeningAmount(e.target.value)}
            placeholder="0.00"
            icon={<FiDollarSign />}
            step="0.01"
            min="0"
          />
          <div className="flex gap-3">
            <Button
              variant="secondary"
              onClick={() => setOpenCashModalOpen(false)}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              variant="success"
              onClick={handleOpenRegister}
              className="flex-1"
              icon={<FiUnlock />}
            >
              Abrir Caja
            </Button>
          </div>
        </div>
      </Modal>

      {/* Close Cash Modal */}
      <Modal
        isOpen={closeCashModalOpen}
        onClose={() => setCloseCashModalOpen(false)}
        title="Cerrar Caja"
        size="lg"
      >
        <div className="space-y-4">
          {currentRegister && (
            <div className="p-4 bg-gray-50 rounded-lg space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Monto de apertura:</span>
                <span className="font-medium">
                  ${currentRegister.openingAmount.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Ventas en efectivo:</span>
                <span className="font-medium text-green-600">
                  +${cashSales.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Gastos:</span>
                <span className="font-medium text-red-600">
                  -${totalExpenses.toFixed(2)}
                </span>
              </div>
              <div className="border-t pt-2 flex justify-between">
                <span className="font-semibold">Efectivo esperado:</span>
                <span className="font-bold text-lg">
                  ${currentRegister.expectedAmount.toFixed(2)}
                </span>
              </div>
            </div>
          )}

          <Input
            label="Efectivo Real en Caja"
            type="number"
            value={closingAmount}
            onChange={(e) => setClosingAmount(e.target.value)}
            placeholder="Cuenta el efectivo físico"
            icon={<FiDollarSign />}
            step="0.01"
            min="0"
          />

          {closingAmount && currentRegister && (
            <div
              className={`p-4 rounded-lg ${
                parseFloat(closingAmount) > currentRegister.expectedAmount
                  ? 'bg-green-50'
                  : parseFloat(closingAmount) < currentRegister.expectedAmount
                  ? 'bg-red-50'
                  : 'bg-blue-50'
              }`}
            >
              <div className="flex items-center gap-2">
                {parseFloat(closingAmount) === currentRegister.expectedAmount ? (
                  <>
                    <FiCheck className="text-blue-600" />
                    <span className="font-medium text-blue-600">Caja cuadrada</span>
                  </>
                ) : parseFloat(closingAmount) > currentRegister.expectedAmount ? (
                  <>
                    <FiAlertCircle className="text-green-600" />
                    <span className="font-medium text-green-600">
                      Sobrante: $
                      {(parseFloat(closingAmount) - currentRegister.expectedAmount).toFixed(2)}
                    </span>
                  </>
                ) : (
                  <>
                    <FiAlertCircle className="text-red-600" />
                    <span className="font-medium text-red-600">
                      Faltante: $
                      {(currentRegister.expectedAmount - parseFloat(closingAmount)).toFixed(2)}
                    </span>
                  </>
                )}
              </div>
            </div>
          )}

          <div className="flex gap-3">
            <Button
              variant="secondary"
              onClick={() => setCloseCashModalOpen(false)}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              variant="danger"
              onClick={handleCloseRegister}
              className="flex-1"
              icon={<FiLock />}
            >
              Cerrar Caja
            </Button>
          </div>
        </div>
      </Modal>

      {/* Expense Modal */}
      <Modal
        isOpen={expenseModalOpen}
        onClose={() => setExpenseModalOpen(false)}
        title="Registrar Gasto"
      >
        <div className="space-y-4">
          <Input
            label="Descripción"
            value={expenseDescription}
            onChange={(e) => setExpenseDescription(e.target.value)}
            placeholder="Ej: Pago de luz"
          />
          <Input
            label="Monto"
            type="number"
            value={expenseAmount}
            onChange={(e) => setExpenseAmount(e.target.value)}
            placeholder="0.00"
            icon={<FiDollarSign />}
            step="0.01"
            min="0"
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Categoría
            </label>
            <div className="grid grid-cols-2 gap-2">
              {expenseCategories.map((cat) => (
                <button
                  key={cat.value}
                  onClick={() => setExpenseCategory(cat.value)}
                  className={`p-3 text-sm rounded-lg border-2 transition-all ${
                    expenseCategory === cat.value
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>
          <div className="flex gap-3">
            <Button
              variant="secondary"
              onClick={() => setExpenseModalOpen(false)}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              variant="primary"
              onClick={handleAddExpense}
              className="flex-1"
              icon={<FiMinus />}
            >
              Registrar Gasto
            </Button>
          </div>
        </div>
      </Modal>

      {/* History Modal */}
      <Modal
        isOpen={historyModalOpen}
        onClose={() => setHistoryModalOpen(false)}
        title="Historial de Cajas"
        size="xl"
      >
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {registers.length === 0 ? (
            <p className="text-center text-gray-500 py-8">
              No hay registros de caja
            </p>
          ) : (
            registers
              .slice()
              .reverse()
              .map((register) => (
                <div
                  key={register.id}
                  className={`p-4 rounded-lg border ${
                    register.status === 'abierta'
                      ? 'border-green-200 bg-green-50'
                      : 'border-gray-200 bg-gray-50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={register.status === 'abierta' ? 'success' : 'default'}
                      >
                        {register.status === 'abierta' ? 'Activa' : 'Cerrada'}
                      </Badge>
                      <span className="text-sm text-gray-500">
                        {format(new Date(register.openedAt), 'dd/MM/yyyy HH:mm', {
                          locale: es,
                        })}
                      </span>
                    </div>
                    {register.closedAt && (
                      <span className="text-sm text-gray-500">
                        Cerrada:{' '}
                        {format(new Date(register.closedAt), 'HH:mm', { locale: es })}
                      </span>
                    )}
                  </div>
                  <div className="grid grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500">Apertura</p>
                      <p className="font-medium">${register.openingAmount.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Ventas</p>
                      <p className="font-medium text-green-600">
                        +${register.salesTotal.toFixed(2)}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500">Gastos</p>
                      <p className="font-medium text-red-600">
                        -${register.expensesTotal.toFixed(2)}
                      </p>
                    </div>
                    {register.closingAmount !== undefined && (
                      <div>
                        <p className="text-gray-500">Diferencia</p>
                        <p
                          className={`font-medium ${
                            register.difference! > 0
                              ? 'text-green-600'
                              : register.difference! < 0
                              ? 'text-red-600'
                              : 'text-blue-600'
                          }`}
                        >
                          {register.difference! > 0 ? '+' : ''}
                          ${register.difference!.toFixed(2)}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ))
          )}
        </div>
      </Modal>
    </MainLayout>
  );
}
