/**
 * Déclarations de types partagés entre React et le worker CAD.
 */

import type { Operation } from '@/models/Operation';

/** Message d'entrée pour le worker CAD */
export interface CadIn {
  operations: Operation[]; // liste d'opérations actives
  version: string; // hash de ces opérations
}

/** Structure des arêtes renvoyées (indices de sommets) */
export type EdgeIndices = [number, number][];

/** Message de sortie du worker CAD */
export interface CadOut {
  mesh?: {
    positions: Float32Array;
    indices: Uint32Array;
    normals?: Float32Array;
  };
  edges?: EdgeIndices;
  version: string;
  error?: string;
}
