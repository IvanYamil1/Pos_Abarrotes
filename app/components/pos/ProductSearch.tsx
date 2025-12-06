'use client';

import { Product } from '../../types';
import { FiPackage } from 'react-icons/fi';

interface ProductSearchProps {
  products: Product[];
  onSelectProduct: (product: Product, isPackage?: boolean) => void;
  viewMode?: 'grid' | 'list';
}

export function ProductSearch({ products, onSelectProduct, viewMode = 'grid' }: ProductSearchProps) {
  if (products.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center py-16">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
            <FiPackage className="w-8 h-8 text-white/30" />
          </div>
          <p className="text-white/40 text-sm uppercase tracking-[0.15em]">No se encontraron productos</p>
        </div>
      </div>
    );
  }

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      abarrotes: 'Abarrotes',
      bebidas: 'Bebidas',
      lacteos: 'Lácteos',
      carnes: 'Carnes',
      frutas_verduras: 'Frutas/Verduras',
      limpieza: 'Limpieza',
      higiene: 'Higiene',
      dulces: 'Dulces',
      botanas: 'Botanas',
      panaderia: 'Panadería',
      otros: 'Otros',
    };
    return labels[category] || category;
  };

  const getUnitLabel = (unit: string) => {
    const labels: Record<string, string> = {
      pieza: 'pza',
      kilo: 'kg',
      litro: 'L',
      paquete: 'paq',
      granel: 'granel',
    };
    return labels[unit] || unit;
  };

  if (viewMode === 'list') {
    return (
      <div className="space-y-2">
        {products.map((product) => (
          <div
            key={product.id}
            className="bg-[#1d1d1d] border border-white/10 rounded-lg p-3 sm:p-4
              hover:bg-[#2a2a2a] hover:border-white/20 transition-all duration-300 cursor-pointer
              flex items-center gap-4"
            onClick={() => onSelectProduct(product)}
          >
            {/* Product Image or Icon */}
            <div className="w-12 h-12 sm:w-14 sm:h-14 bg-white/5 border border-white/10 rounded-lg flex items-center justify-center flex-shrink-0">
              {product.image ? (
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover rounded-lg"
                />
              ) : (
                <FiPackage className="w-6 h-6 text-white/30" />
              )}
            </div>

            {/* Product Info */}
            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-white text-sm sm:text-base truncate mb-1">
                {product.name}
              </h4>
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase tracking-[0.1em] px-2 py-0.5 bg-white/5 border border-white/20 rounded text-white/50">
                  {getCategoryLabel(product.category)}
                </span>
                <span className="text-xs text-white/40">
                  {getUnitLabel(product.unit)}
                </span>
              </div>
            </div>

            {/* Price & Stock */}
            <div className="text-right flex-shrink-0">
              <p className="text-lg sm:text-xl font-extralight text-blue-400">
                ${product.salePrice.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
              </p>
              <span
                className={`text-xs ${
                  product.stock <= product.minStock
                    ? 'text-red-400/80'
                    : 'text-white/40'
                }`}
              >
                Stock: {product.stock}
              </span>
            </div>

            {/* Package Button */}
            {product.packagePrice && product.packageQuantity && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectProduct(product, true);
                }}
                className="px-3 py-2 text-xs uppercase tracking-[0.1em] bg-green-500/10 text-green-400
                  border border-green-500/30 rounded-lg hover:bg-green-500/20 hover:border-green-500/50
                  transition-all duration-300 flex-shrink-0"
              >
                Paq ${product.packagePrice}
              </button>
            )}
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
      {products.map((product) => (
        <div
          key={product.id}
          className="bg-[#1d1d1d] border border-white/10 rounded-xl p-3 sm:p-4
            hover:bg-[#2a2a2a] hover:border-white/20 transition-all duration-300 cursor-pointer
            group"
          onClick={() => onSelectProduct(product)}
        >
          {/* Product Image or Icon */}
          <div className="w-full h-16 sm:h-20 bg-white/5 border border-white/10 rounded-lg flex items-center justify-center mb-3
            group-hover:border-white/20 transition-all duration-300">
            {product.image ? (
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover rounded-lg"
              />
            ) : (
              <FiPackage className="w-8 h-8 sm:w-10 sm:h-10 text-white/30 group-hover:text-white/40 transition-all duration-300" />
            )}
          </div>

          {/* Product Info */}
          <h4 className="font-medium text-white text-sm truncate mb-1.5">
            {product.name}
          </h4>
          <div className="flex items-center gap-1.5 mb-2 sm:mb-3">
            <span className="text-[10px] uppercase tracking-[0.1em] px-1.5 py-0.5 bg-white/5 border border-white/20 rounded text-white/50">
              {getCategoryLabel(product.category)}
            </span>
            <span className="text-[10px] text-white/40">
              {getUnitLabel(product.unit)}
            </span>
          </div>

          {/* Price */}
          <div className="flex items-center justify-between mb-2">
            <p className="text-lg sm:text-xl font-extralight text-blue-400">
              ${product.salePrice.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
            </p>
            <span
              className={`text-[10px] ${
                product.stock <= product.minStock
                  ? 'text-red-400/80'
                  : 'text-white/40'
              }`}
            >
              {product.stock}
            </span>
          </div>

          {/* Package Price Button */}
          {product.packagePrice && product.packageQuantity && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onSelectProduct(product, true);
              }}
              className="mt-1 w-full py-1.5 sm:py-2 text-[10px] sm:text-xs uppercase tracking-[0.1em]
                bg-green-500/10 text-green-400 border border-green-500/30 rounded-lg
                hover:bg-green-500/20 hover:border-green-500/50 transition-all duration-300"
            >
              Paquete ({product.packageQuantity}) - ${product.packagePrice}
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
