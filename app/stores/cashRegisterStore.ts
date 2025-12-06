import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CashRegister, Expense } from '../types';
import { v4 as uuidv4 } from 'uuid';

interface CashRegisterState {
  currentRegister: CashRegister | null;
  registers: CashRegister[];
  expenses: Expense[];

  // Acciones de caja
  openRegister: (openingAmount: number, userId: string) => CashRegister;
  closeRegister: (closingAmount: number) => CashRegister | null;
  getCurrentRegister: () => CashRegister | null;
  isRegisterOpen: () => boolean;

  // Actualizar montos de la caja
  addSaleToRegister: (amount: number) => void;
  addExpenseToRegister: (description: string, amount: number, category: string, userId: string) => Expense | null;

  // Consultas
  getRegistersByDateRange: (startDate: Date, endDate: Date) => CashRegister[];
  getExpensesByRegister: (registerId: string) => Expense[];
  getTodayExpenses: () => Expense[];
}

export const useCashRegisterStore = create<CashRegisterState>()(
  persist(
    (set, get) => ({
      currentRegister: null,
      registers: [],
      expenses: [],

      openRegister: (openingAmount, userId) => {
        const newRegister: CashRegister = {
          id: uuidv4(),
          status: 'abierta',
          openingAmount,
          currentAmount: openingAmount,
          expectedAmount: openingAmount,
          salesTotal: 0,
          expensesTotal: 0,
          userId,
          openedAt: new Date(),
        };

        set((state) => ({
          currentRegister: newRegister,
          registers: [...state.registers, newRegister],
        }));

        return newRegister;
      },

      closeRegister: (closingAmount) => {
        const currentRegister = get().currentRegister;
        if (!currentRegister) return null;

        const expectedAmount = currentRegister.expectedAmount;
        const difference = closingAmount - expectedAmount;

        const closedRegister: CashRegister = {
          ...currentRegister,
          status: 'cerrada',
          closingAmount,
          difference,
          closedAt: new Date(),
        };

        set((state) => ({
          currentRegister: null,
          registers: state.registers.map((r) =>
            r.id === closedRegister.id ? closedRegister : r
          ),
        }));

        return closedRegister;
      },

      getCurrentRegister: () => {
        return get().currentRegister;
      },

      isRegisterOpen: () => {
        return get().currentRegister !== null && get().currentRegister?.status === 'abierta';
      },

      addSaleToRegister: (amount) => {
        const currentRegister = get().currentRegister;
        if (!currentRegister) return;

        set((state) => ({
          currentRegister: state.currentRegister
            ? {
                ...state.currentRegister,
                currentAmount: state.currentRegister.currentAmount + amount,
                expectedAmount: state.currentRegister.expectedAmount + amount,
                salesTotal: state.currentRegister.salesTotal + amount,
              }
            : null,
          registers: state.registers.map((r) =>
            r.id === currentRegister.id
              ? {
                  ...r,
                  currentAmount: r.currentAmount + amount,
                  expectedAmount: r.expectedAmount + amount,
                  salesTotal: r.salesTotal + amount,
                }
              : r
          ),
        }));
      },

      addExpenseToRegister: (description, amount, category, userId) => {
        const currentRegister = get().currentRegister;
        if (!currentRegister) return null;

        const expense: Expense = {
          id: uuidv4(),
          description,
          amount,
          category,
          cashRegisterId: currentRegister.id,
          userId,
          createdAt: new Date(),
        };

        set((state) => ({
          expenses: [...state.expenses, expense],
          currentRegister: state.currentRegister
            ? {
                ...state.currentRegister,
                currentAmount: state.currentRegister.currentAmount - amount,
                expectedAmount: state.currentRegister.expectedAmount - amount,
                expensesTotal: state.currentRegister.expensesTotal + amount,
              }
            : null,
          registers: state.registers.map((r) =>
            r.id === currentRegister.id
              ? {
                  ...r,
                  currentAmount: r.currentAmount - amount,
                  expectedAmount: r.expectedAmount - amount,
                  expensesTotal: r.expensesTotal + amount,
                }
              : r
          ),
        }));

        return expense;
      },

      getRegistersByDateRange: (startDate, endDate) => {
        return get().registers.filter((r) => {
          const openedAt = new Date(r.openedAt);
          return openedAt >= startDate && openedAt <= endDate;
        });
      },

      getExpensesByRegister: (registerId) => {
        return get().expenses.filter((e) => e.cashRegisterId === registerId);
      },

      getTodayExpenses: () => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        return get().expenses.filter((e) => {
          const expenseDate = new Date(e.createdAt);
          return expenseDate >= today && expenseDate < tomorrow;
        });
      },
    }),
    {
      name: 'pos-cash-register-storage',
    }
  )
);
