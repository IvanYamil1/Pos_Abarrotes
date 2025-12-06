import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { StoreConfig } from '../types';

interface StoreConfigState {
  config: StoreConfig;
  updateConfig: (data: Partial<StoreConfig>) => void;
}

const defaultConfig: StoreConfig = {
  name: 'Mi Tienda de Abarrotes',
  address: 'Calle Principal #123, Col. Centro',
  phone: '555-123-4567',
  rfc: 'XAXX010101000',
  ticketFooter: '¡Gracias por su compra!\nVuelva pronto',
};

export const useStoreConfigStore = create<StoreConfigState>()(
  persist(
    (set) => ({
      config: defaultConfig,

      updateConfig: (data) => {
        set((state) => ({
          config: { ...state.config, ...data },
        }));
      },
    }),
    {
      name: 'pos-store-config',
    }
  )
);
