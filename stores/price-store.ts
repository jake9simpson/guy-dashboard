import { create } from 'zustand';
import type { Price, Currency, PriceState } from '@/lib/types';

export const usePriceStore = create<PriceState>((set, get) => ({
  gold: null,
  silver: null,
  ratio: null,
  connected: false,
  currency: 'USD',

  setCurrency: (currency: Currency) => set({ currency }),

  updateGold: (update: Partial<Price>) =>
    set((state) => {
      const gold = state.gold
        ? { ...state.gold, ...update }
        : ({
            symbol: 'XAU/USD',
            price: 0,
            change: 0,
            changePercent: 0,
            high: 0,
            low: 0,
            open: 0,
            previousClose: 0,
            timestamp: Date.now(),
            ...update,
          } as Price);
      const silver = state.silver;
      const ratio = gold.price && silver?.price ? gold.price / silver.price : state.ratio;
      return { gold, ratio };
    }),

  updateSilver: (update: Partial<Price>) =>
    set((state) => {
      const silver = state.silver
        ? { ...state.silver, ...update }
        : ({
            symbol: 'XAG/USD',
            price: 0,
            change: 0,
            changePercent: 0,
            high: 0,
            low: 0,
            open: 0,
            previousClose: 0,
            timestamp: Date.now(),
            ...update,
          } as Price);
      const gold = state.gold;
      const ratio = gold?.price && silver.price ? gold.price / silver.price : state.ratio;
      return { silver, ratio };
    }),

  setConnected: (connected: boolean) => set({ connected }),
}));
