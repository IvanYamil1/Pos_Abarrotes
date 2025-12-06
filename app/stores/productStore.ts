import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Product, ProductCategory, InventoryMovement, StockAlert } from '../types';
import { v4 as uuidv4 } from 'uuid';

interface ProductState {
  products: Product[];
  movements: InventoryMovement[];

  // Acciones de productos
  addProduct: (product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => Product;
  updateProduct: (id: string, data: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  getProductByBarcode: (barcode: string) => Product | undefined;
  getProductById: (id: string) => Product | undefined;
  searchProducts: (query: string) => Product[];
  getProductsByCategory: (category: ProductCategory) => Product[];

  // Acciones de inventario
  updateStock: (productId: string, quantity: number, type: InventoryMovement['type'], reason?: string, reference?: string, userId?: string) => void;
  getStockAlerts: () => StockAlert[];
  getMovementsByProduct: (productId: string) => InventoryMovement[];

  // Inicializar con datos de ejemplo
  initializeSampleData: () => void;
}

export const useProductStore = create<ProductState>()(
  persist(
    (set, get) => ({
      products: [],
      movements: [],

      addProduct: (productData) => {
        const newProduct: Product = {
          ...productData,
          id: uuidv4(),
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        set((state) => ({
          products: [...state.products, newProduct],
        }));
        return newProduct;
      },

      updateProduct: (id, data) => {
        set((state) => ({
          products: state.products.map((p) =>
            p.id === id ? { ...p, ...data, updatedAt: new Date() } : p
          ),
        }));
      },

      deleteProduct: (id) => {
        set((state) => ({
          products: state.products.map((p) =>
            p.id === id ? { ...p, isActive: false } : p
          ),
        }));
      },

      getProductByBarcode: (barcode) => {
        return get().products.find((p) => p.barcode === barcode && p.isActive);
      },

      getProductById: (id) => {
        return get().products.find((p) => p.id === id);
      },

      searchProducts: (query) => {
        const lowerQuery = query.toLowerCase();
        return get().products.filter(
          (p) =>
            p.isActive &&
            (p.name.toLowerCase().includes(lowerQuery) ||
              p.barcode.includes(query) ||
              p.category.includes(lowerQuery))
        );
      },

      getProductsByCategory: (category) => {
        return get().products.filter((p) => p.category === category && p.isActive);
      },

      updateStock: (productId, quantity, type, reason, reference, userId = '1') => {
        const product = get().getProductById(productId);
        if (!product) return;

        const previousStock = product.stock;
        let newStock = previousStock;

        switch (type) {
          case 'entrada':
          case 'devolucion':
            newStock = previousStock + quantity;
            break;
          case 'salida':
          case 'venta':
            newStock = previousStock - quantity;
            break;
          case 'ajuste':
            newStock = quantity;
            break;
        }

        // Actualizar stock del producto
        set((state) => ({
          products: state.products.map((p) =>
            p.id === productId ? { ...p, stock: newStock, updatedAt: new Date() } : p
          ),
        }));

        // Registrar movimiento en Kardex
        const movement: InventoryMovement = {
          id: uuidv4(),
          productId,
          productName: product.name,
          type,
          quantity,
          previousStock,
          newStock,
          reason,
          reference,
          userId,
          createdAt: new Date(),
        };

        set((state) => ({
          movements: [...state.movements, movement],
        }));
      },

      getStockAlerts: () => {
        return get()
          .products.filter((p) => p.isActive && p.stock <= p.minStock)
          .map((p) => ({
            productId: p.id,
            productName: p.name,
            currentStock: p.stock,
            minStock: p.minStock,
            category: p.category,
          }));
      },

      getMovementsByProduct: (productId) => {
        return get()
          .movements.filter((m) => m.productId === productId)
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      },

      initializeSampleData: () => {
        const existingProducts = get().products;
        if (existingProducts.length > 0) return;

        const sampleProducts: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>[] = [
          {
            barcode: '7501000111111',
            name: 'Coca-Cola 600ml',
            category: 'bebidas',
            unit: 'pieza',
            purchasePrice: 12,
            salePrice: 18,
            stock: 48,
            minStock: 12,
            isActive: true,
          },
          {
            barcode: '7501000222222',
            name: 'Sabritas Original 45g',
            category: 'botanas',
            unit: 'pieza',
            purchasePrice: 10,
            salePrice: 16,
            packagePrice: 150,
            packageQuantity: 12,
            stock: 36,
            minStock: 12,
            isActive: true,
          },
          {
            barcode: '7501000333333',
            name: 'Leche Lala Entera 1L',
            category: 'lacteos',
            unit: 'pieza',
            purchasePrice: 22,
            salePrice: 28,
            stock: 24,
            minStock: 10,
            isActive: true,
          },
          {
            barcode: '7501000444444',
            name: 'Pan Bimbo Grande',
            category: 'panaderia',
            unit: 'pieza',
            purchasePrice: 35,
            salePrice: 45,
            stock: 15,
            minStock: 5,
            isActive: true,
          },
          {
            barcode: '7501000555555',
            name: 'Arroz SOS 1kg',
            category: 'abarrotes',
            unit: 'pieza',
            purchasePrice: 25,
            salePrice: 35,
            stock: 30,
            minStock: 10,
            isActive: true,
          },
          {
            barcode: '7501000666666',
            name: 'Frijol Negro 1kg',
            category: 'abarrotes',
            unit: 'kilo',
            purchasePrice: 28,
            salePrice: 38,
            stock: 25,
            minStock: 8,
            isActive: true,
          },
          {
            barcode: '7501000777777',
            name: 'Aceite 123 1L',
            category: 'abarrotes',
            unit: 'litro',
            purchasePrice: 35,
            salePrice: 48,
            stock: 20,
            minStock: 6,
            isActive: true,
          },
          {
            barcode: '7501000888888',
            name: 'Jabón Zote',
            category: 'limpieza',
            unit: 'pieza',
            purchasePrice: 18,
            salePrice: 25,
            stock: 40,
            minStock: 10,
            isActive: true,
          },
          {
            barcode: '7501000999999',
            name: 'Papel Higiénico Pétalo 4pk',
            category: 'higiene',
            unit: 'paquete',
            purchasePrice: 35,
            salePrice: 48,
            stock: 25,
            minStock: 8,
            isActive: true,
          },
          {
            barcode: '7501001000000',
            name: 'Mazapán De la Rosa',
            category: 'dulces',
            unit: 'pieza',
            purchasePrice: 3,
            salePrice: 5,
            packagePrice: 55,
            packageQuantity: 20,
            stock: 100,
            minStock: 20,
            isActive: true,
          },
          {
            barcode: '7501001111111',
            name: 'Azúcar Morena 1kg',
            category: 'abarrotes',
            unit: 'kilo',
            purchasePrice: 30,
            salePrice: 40,
            stock: 5,
            minStock: 10,
            isActive: true,
          },
          {
            barcode: '7501001222222',
            name: 'Huevo Blanco (kilo)',
            category: 'lacteos',
            unit: 'kilo',
            purchasePrice: 45,
            salePrice: 55,
            stock: 10,
            minStock: 5,
            isActive: true,
          },
        ];

        sampleProducts.forEach((product) => {
          get().addProduct(product);
        });
      },
    }),
    {
      name: 'pos-products-storage',
    }
  )
);
