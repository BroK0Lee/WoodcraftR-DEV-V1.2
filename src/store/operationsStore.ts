/**
 * src/store/operationsStore.ts
 *
 * Gère la pile d'opérations pour le configurateur 3D (feature-tree).
 * Utilise Zustand + Immer pour un store immuable et simple.
 *
 * TODO: lorsque panelStore sera complètement supprimé, vérifiez que tous les
 * composants utilisent `useCurrentPanelSize` pour lire les dimensions courantes.
 */

import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { Operation } from '@/models/Operation';
import { nanoid } from 'nanoid';

type State = {
  /** Pile d’opérations validées */
  operations: Operation[];
  /** Index de la dernière opération active (-1 : aucune) */
  historyIndex: number;
};

type Actions = {
  addOp: (op: Omit<Operation, 'id'>) => void;
  removeOp: (id: string) => void;
  updateOp: (id: string, patch: Partial<Operation>) => void;
  reorderOps: (start: number, end: number) => void;
  undo: () => void;
  redo: () => void;
  reset: () => void;
};

export const useOperationsStore = create<State & Actions>()(
  immer((set, get) => ({
    operations: [],
    historyIndex: -1,

    addOp(newOp) {
      set((s) => {
        // Couper les opérations "futures" si on ajoute après un undo
        if (s.historyIndex < s.operations.length - 1) {
          s.operations = s.operations.slice(0, s.historyIndex + 1);
        }
        s.operations.push({ ...newOp, id: nanoid() });
        s.historyIndex++;
      });
    },

    removeOp(id) {
      set((s) => {
        const idx = s.operations.findIndex((o) => o.id === id);
        if (idx === -1) return;
        s.operations.splice(idx, 1);
        if (s.historyIndex >= idx) s.historyIndex--;
      });
    },

    updateOp(id, patch) {
      set((s) => {
        const op = s.operations.find((o) => o.id === id);
        if (op) Object.assign(op, patch);
      });
    },

    reorderOps(start, end) {
      set((s) => {
        const [moved] = s.operations.splice(start, 1);
        s.operations.splice(end, 0, moved);
      });
    },

    undo() {
      set((s) => {
        if (s.historyIndex >= 0) s.historyIndex--;
      });
    },

    redo() {
      set((s) => {
        if (s.historyIndex < s.operations.length - 1) s.historyIndex++;
      });
    },

    reset() {
      set({ operations: [], historyIndex: -1 });
    },
  }))
);
