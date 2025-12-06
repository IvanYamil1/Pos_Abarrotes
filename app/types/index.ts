// ==========================================
// TIPOS PRINCIPALES DEL SISTEMA POS
// ==========================================

// Unidades de medida para productos de abarrotes
export type UnitType = 'pieza' | 'kilo' | 'litro' | 'paquete' | 'granel';

// Métodos de pago disponibles
export type PaymentMethod = 'efectivo' | 'tarjeta' | 'vale' | 'mixto';

// Estados de la caja
export type CashRegisterStatus = 'abierta' | 'cerrada';

// Categorías comunes en abarrotes
export type ProductCategory =
  | 'abarrotes'
  | 'bebidas'
  | 'lacteos'
  | 'carnes'
  | 'frutas_verduras'
  | 'limpieza'
  | 'higiene'
  | 'dulces'
  | 'botanas'
  | 'panaderia'
  | 'otros';

// ==========================================
// PRODUCTO
// ==========================================
export interface Product {
  id: string;
  barcode: string;
  name: string;
  description?: string;
  category: ProductCategory;
  unit: UnitType;
  purchasePrice: number;      // Precio de compra
  salePrice: number;          // Precio de venta público
  packagePrice?: number;      // Precio por paquete (opcional)
  packageQuantity?: number;   // Cantidad en paquete
  stock: number;
  minStock: number;           // Stock mínimo para alertas
  image?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// ==========================================
// ITEM EN CARRITO DE VENTA
// ==========================================
export interface CartItem {
  product: Product;
  quantity: number;
  subtotal: number;
  isPackage?: boolean;        // Si se vende como paquete
  priceUsed: number;          // Precio aplicado (pieza o paquete)
}

// ==========================================
// VENTA
// ==========================================
export interface Sale {
  id: string;
  ticketNumber: string;
  items: SaleItem[];
  subtotal: number;
  discount: number;
  total: number;
  paymentMethod: PaymentMethod;
  amountPaid: number;
  change: number;
  customerId?: string;
  customerName?: string;
  cashRegisterId: string;
  userId: string;
  createdAt: Date;
}

export interface SaleItem {
  productId: string;
  productName: string;
  barcode: string;
  quantity: number;
  unit: UnitType;
  unitPrice: number;
  subtotal: number;
  isPackage?: boolean;
}

// ==========================================
// CLIENTE (opcional)
// ==========================================
export interface Customer {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  address?: string;
  createdAt: Date;
}

// ==========================================
// CAJA REGISTRADORA
// ==========================================
export interface CashRegister {
  id: string;
  status: CashRegisterStatus;
  openingAmount: number;      // Monto de apertura
  currentAmount: number;      // Monto actual
  expectedAmount: number;     // Monto esperado
  closingAmount?: number;     // Monto de cierre
  difference?: number;        // Diferencia (faltante/sobrante)
  salesTotal: number;         // Total de ventas
  expensesTotal: number;      // Total de gastos
  userId: string;
  openedAt: Date;
  closedAt?: Date;
}

// ==========================================
// GASTOS
// ==========================================
export interface Expense {
  id: string;
  description: string;
  amount: number;
  category: string;
  cashRegisterId: string;
  userId: string;
  createdAt: Date;
}

// ==========================================
// MOVIMIENTOS DE INVENTARIO (KARDEX)
// ==========================================
export type MovementType = 'entrada' | 'salida' | 'ajuste' | 'venta' | 'devolucion';

export interface InventoryMovement {
  id: string;
  productId: string;
  productName: string;
  type: MovementType;
  quantity: number;
  previousStock: number;
  newStock: number;
  reason?: string;
  reference?: string;         // Número de ticket o factura
  userId: string;
  createdAt: Date;
}

// ==========================================
// USUARIO
// ==========================================
export type UserRole = 'admin' | 'cajero';

export interface User {
  id: string;
  username: string;
  name: string;
  role: UserRole;
  isActive: boolean;
  createdAt: Date;
}

// ==========================================
// REPORTES
// ==========================================
export interface DailySalesReport {
  date: Date;
  totalSales: number;
  totalTransactions: number;
  totalItems: number;
  averageTicket: number;
  paymentBreakdown: {
    efectivo: number;
    tarjeta: number;
    vale: number;
  };
}

export interface ProductSalesReport {
  productId: string;
  productName: string;
  category: ProductCategory;
  quantitySold: number;
  totalRevenue: number;
  totalProfit: number;
}

// ==========================================
// ALERTAS
// ==========================================
export interface StockAlert {
  productId: string;
  productName: string;
  currentStock: number;
  minStock: number;
  category: ProductCategory;
}

// ==========================================
// CONFIGURACIÓN DE TIENDA
// ==========================================
export interface StoreConfig {
  name: string;
  address: string;
  phone: string;
  rfc?: string;
  logo?: string;
  ticketFooter?: string;
}
