/**
 * edgesFromIndices.ts
 *
 * Construit un tableau `EdgeDTO` à partir des positions et indices d'un mesh
 * triangulé. Garantit l'unicité des arêtes et fournit les coordonnées xyz sous
 * forme de Float32Array [x1,y1,z1,x2,y2,z2].
 */

import type { EdgeDTO } from '@/models/EdgeDTO';

/**
 * Génère un tableau d'arêtes à partir de la géométrie brute.
 * @param positions Float32Array des sommets (x,y,z).
 * @param indices   Uint32Array ou Uint16Array des indices (triplets de triangles).
 */
export function edgesFromIndices(
  positions: Float32Array,
  indices: Uint32Array | Uint16Array,
): EdgeDTO[] {
  const seen = new Map<string, number>(); // key "iMin-iMax" -> edgeId
  const edges: EdgeDTO[] = [];

  const addEdge = (a: number, b: number) => {
    const key = a < b ? `${a}-${b}` : `${b}-${a}`;
    if (!seen.has(key)) {
      const id = edges.length;
      seen.set(key, id);
      edges.push({
        id,
        xyz: new Float32Array([
          positions[a * 3],
          positions[a * 3 + 1],
          positions[a * 3 + 2],
          positions[b * 3],
          positions[b * 3 + 1],
          positions[b * 3 + 2],
        ]),
      });
    }
  };

  for (let i = 0; i < indices.length; i += 3) {
    const i0 = indices[i];
    const i1 = indices[i + 1];
    const i2 = indices[i + 2];
    addEdge(i0, i1);
    addEdge(i1, i2);
    addEdge(i2, i0);
  }

  return edges;
}
