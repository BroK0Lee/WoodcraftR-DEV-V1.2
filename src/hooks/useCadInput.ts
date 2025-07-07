/**
 * src/hooks/useCadInput.ts
 *
 * Sélecteur personnalisé pour extraire l'état minimal à envoyer au worker CAD.
 * Il retourne uniquement les opérations "actives" (celles dont l'index est
 * inférieur ou égal à `historyIndex`).
 */

import { useOperationsStore } from '@/store/operationsStore';

export const useCadInput = () => {
  const operations = useOperationsStore((s) =>
    s.operations.slice(0, s.historyIndex + 1)
  );
  return { operations };
};
