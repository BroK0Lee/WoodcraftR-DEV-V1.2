/**
 * src/hooks/useCurrentPanelSize.ts
 *
 * Fournit la taille actuelle du panneau (w, h, t) en se basant sur la dernière
 * opération `resize` active. Utile pendant la transition, tant que certains
 * composants ont encore besoin d'une valeur directe.
 *
 * TODO: supprimer ce hook une fois que tous les composants seront complètement
 * refactorisés pour utiliser la pile d'opérations plutôt qu'une valeur taille.
 */

import { useOperationsStore } from '@/store/operationsStore';
import type { ResizeOp } from '@/models/Operation';

export const useCurrentPanelSize = () =>
  useOperationsStore((s) => {
    const resize = s.operations
      .findLast(
        (o) => o.type === 'resize' && s.operations.indexOf(o) <= s.historyIndex
      ) as ResizeOp | undefined;

    return resize ?? { w: 0, h: 0, t: 0 };
  });
