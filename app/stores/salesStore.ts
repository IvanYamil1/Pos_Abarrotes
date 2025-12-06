import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Sale, CartItem, Product, PaymentMethod, SaleItem } from '../types';
import { v4 as uuidv4 } from 'uuid';

interface SalesState {
  // Carrito actual
  cart: CartItem[];
  currentCustomerId?: string;
  currentCustomerName?: string;

  // Historial de ventas
  sales: Sale[];

  // Acciones del carrito
  addToCart: (product: Product, quantity?: number, isPackage?: boolean) => void;
  removeFromCart: (productId: string) => void;
  updateCartItemQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  setCustomer: (id?: string, name?: string) => void;

  // Cálculos del carrito
  getCartTotal: () => number;
  getCartItemsCount: () => number;

  // Procesar venta
  processSale: (
    paymentMethod: PaymentMethod,
    amountPaid: number,
    discount?: number,
    cashRegisterId?: string,
    userId?: string
  ) => Sale | null;

  // Consultas de ventas
  getSalesByDateRange: (startDate: Date, endDate: Date) => Sale[];
  getSalesToday: () => Sale[];
  getDailySalesTotal: () => number;

  // Generar número de ticket
  generateTicketNumber: () => string;
}

export const useSalesStore = create<SalesState>()(
  persist(
    (set, get) => ({
      cart: [],
      currentCustomerId: undefined,
      currentCustomerName: undefined,
      sales: [],

      addToCart: (product, quantity = 1, isPackage = false) => {
        const cart = get().cart;
        const existingItem = cart.find(
          (item) => item.product.id === product.id && item.isPackage === isPackage
        );

        const priceUsed = isPackage && product.packagePrice
          ? product.packagePrice
          : product.salePrice;

        if (existingItem) {
          // Sumar cantidades automáticamente (para lecturas repetidas de código de barras)
          set((state) => ({
            cart: state.cart.map((item) =>
              item.product.id === product.id && item.isPackage === isPackage
                ? {
                    ...item,
                    quantity: item.quantity + quantity,
                    subtotal: (item.quantity + quantity) * priceUsed,
                  }
                : item
            ),
          }));
        } else {
          // Agregar nuevo item
          const newItem: CartItem = {
            product,
            quantity,
            subtotal: quantity * priceUsed,
            isPackage,
            priceUsed,
          };
          set((state) => ({
            cart: [...state.cart, newItem],
          }));
        }
      },

      removeFromCart: (productId) => {
        set((state) => ({
          cart: state.cart.filter((item) => item.product.id !== productId),
        }));
      },

      updateCartItemQuantity: (productId, quantity) => {
        if (quantity <= 0) {
          get().removeFromCart(productId);
          return;
        }

        set((state) => ({
          cart: state.cart.map((item) =>
            item.product.id === productId
              ? {
                  ...item,
                  quantity,
                  subtotal: quantity * item.priceUsed,
                }
              : item
          ),
        }));
      },

      clearCart: () => {
        set({
          cart: [],
          currentCustomerId: undefined,
          currentCustomerName: undefined,
        });
      },

      setCustomer: (id, name) => {
        set({
          currentCustomerId: id,
          currentCustomerName: name,
        });
      },

      getCartTotal: () => {
        return get().cart.reduce((total, item) => total + item.subtotal, 0);
      },

      getCartItemsCount: () => {
        return get().cart.reduce((count, item) => count + item.quantity, 0);
      },

      generateTicketNumber: () => {
        const today = new Date();
        const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '');
        const salesCount = get().sales.filter((sale) => {
          const saleDate = new Date(sale.createdAt);
          return saleDate.toDateString() === today.toDateString();
        }).length;
        return `T${dateStr}-${String(salesCount + 1).padStart(4, '0')}`;
      },

      processSale: (paymentMethod, amountPaid, discount = 0, cashRegisterId = '1', userId = '1') => {
        const cart = get().cart;
        if (cart.length === 0) return null;

        const subtotal = get().getCartTotal();
        const total = subtotal - discount;
        const change = paymentMethod === 'efectivo' ? amountPaid - total : 0;

        const saleItems: SaleItem[] = cart.map((item) => ({
          productId: item.product.id,
          productName: item.product.name,
          barcode: item.product.barcode,
          quantity: item.quantity,
          unit: item.product.unit,
          unitPrice: item.priceUsed,
          subtotal: item.subtotal,
          isPackage: item.isPackage,
        }));

        const sale: Sale = {
          id: uuidv4(),
          ticketNumber: get().generateTicketNumber(),
          items: saleItems,
          subtotal,
          discount,
          total,
          paymentMethod,
          amountPaid,
          change,
          customerId: get().currentCustomerId,
          customerName: get().currentCustomerName,
          cashRegisterId,
          userId,
          createdAt: new Date(),
        };

        set((state) => ({
          sales: [...state.sales, sale],
          cart: [],
          currentCustomerId: undefined,
          currentCustomerName: undefined,
        }));

        return sale;
      },

      getSalesByDateRange: (startDate, endDate) => {
        return get().sales.filter((sale) => {
          const saleDate = new Date(sale.createdAt);
          return saleDate >= startDate && saleDate <= endDate;
        });
      },

      getSalesToday: () => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        return get().getSalesByDateRange(today, tomorrow);
      },

      getDailySalesTotal: () => {
        return get()
          .getSalesToday()
          .reduce((total, sale) => total + sale.total, 0);
      },
    }),
    {
      name: 'pos-sales-storage',
    }
  )
);
