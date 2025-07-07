import { useEffect } from 'react';
import { useOperationsStore } from '@/store/operationsStore';
import { DEFAULT_DIMENSIONS } from '@/models/Panel';

export function useInitializePanel() {
  const addOp   = useOperationsStore((s) => s.addOp);
  const hasOp   = useOperationsStore((s) => s.operations.length > 0);

  useEffect(() => {
    if (!hasOp) {
      addOp({ type: 'resize', ...DEFAULT_DIMENSIONS });
    }
    // exécution unique au montage
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
