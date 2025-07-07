/**
 * src/helpers/initOcc.ts
 * ------------------------------------------------------------
 * Initialise OpenCascade.js (chargement dynamique du module WASM)
 * et renvoie toujours la même instance (mémoïsation).
 * ------------------------------------------------------------
 */

import type { OpenCascadeInstance } from 'opencascade.js';

/** Promesse partagée pour garantir une seule instance OCCT par thread */
let ocPromise: Promise<OpenCascadeInstance> | null = null;

/**
 * Charge (au premier appel) puis renvoie l'instance OpenCascade.
 * L'import dynamique évite tout besoin de top-level await.
 */
export async function initOcc(): Promise<OpenCascadeInstance> {
  if (!ocPromise) {
    ocPromise = import('opencascade.js').then(({ default: createOc }) =>
      // `createOc()` retourne une Promise<OpenCascadeInstance>
      createOc()
    );
  }
  return ocPromise;
}
