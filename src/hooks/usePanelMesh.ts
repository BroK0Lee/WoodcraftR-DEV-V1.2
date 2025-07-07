/**
 * src/hooks/usePanelMesh.ts
 * (Clone mis à jour – version finale Phase 2)
 */

import { useEffect, useState } from 'react';
import { useCadInput } from '@/hooks/useCadInput';
import { postCad } from '@/engine/cadWorker';
import { debounce } from '@/utils/debounce';
import { edgesFromIndices } from '@/utils/edgesFromIndices';
import type { CadOut } from '@/engine/cadTypes';
import type { EdgeDTO } from '@/models/EdgeDTO';

/** Convertit des paires d'indices [i, j] venant du worker en EdgeDTO[] */
const pairsToDTO = (
  pairs: [number, number][],
  positions: Float32Array,
): EdgeDTO[] =>
  pairs.map(([a, b], id) => ({
    id,
    xyz: new Float32Array([
      positions[a * 3],
      positions[a * 3 + 1],
      positions[a * 3 + 2],
      positions[b * 3],
      positions[b * 3 + 1],
      positions[b * 3 + 2],
    ]),
  }));

export function usePanelMesh() {
  const { operations } = useCadInput();
  const [mesh, setMesh] = useState<CadOut['mesh'] | null>(null);
  const [edges, setEdges] = useState<EdgeDTO[] | null>(null);

  const send = debounce((ops) => {
    postCad(ops).then((out) => {
      if (out.error) {
        console.error(out.error); // TODO toast UI
        return;
      }
      if (!out.mesh) return;

      setMesh(out.mesh);

      if (out.edges?.length) {
        setEdges(pairsToDTO(out.edges, out.mesh.positions));
      } else {
        setEdges(edgesFromIndices(out.mesh.positions, out.mesh.indices));
      }
    });
  }, 200);

  useEffect(() => {
    send(operations);
  }, [operations]);

  return { mesh, edges };
}
