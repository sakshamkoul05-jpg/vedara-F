import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/**
 * Cottages the guest has picked out to compare.
 *
 * Only ids are kept, not whole cottage records: the Stays page already holds
 * the live rows with current pricing, and a stored copy would go stale the
 * moment a rate or a description changed.
 */

/** Three fits side by side on a laptop and still reads on a phone. */
export const MAX_COMPARE = 3;

interface CompareState {
  ids: string[];
  toggle: (id: string) => void;
  remove: (id: string) => void;
  clear: () => void;
  isSelected: (id: string) => boolean;
  isFull: () => boolean;
}

export const useCompareStore = create<CompareState>()(
  persist(
    (set, get) => ({
      ids: [],

      toggle: (id) =>
        set((state) => {
          if (state.ids.includes(id)) {
            return { ids: state.ids.filter((existing) => existing !== id) };
          }
          // Silently ignoring the click past the limit would look broken; the
          // card's own control is disabled instead, so this is just a guard.
          if (state.ids.length >= MAX_COMPARE) return state;
          return { ids: [...state.ids, id] };
        }),

      remove: (id) => set((state) => ({ ids: state.ids.filter((existing) => existing !== id) })),

      clear: () => set({ ids: [] }),

      isSelected: (id) => get().ids.includes(id),

      isFull: () => get().ids.length >= MAX_COMPARE,
    }),
    {
      name: 'vedara-compare',
      // A selection that survives a trip to a cottage's detail page and back is
      // the whole point; one that survives a week is just clutter, so only the
      // ids persist and any missing cottage is dropped on render.
      partialize: (state) => ({ ids: state.ids }),
    }
  )
);
