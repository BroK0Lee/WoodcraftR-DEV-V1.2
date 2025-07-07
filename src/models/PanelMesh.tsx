/**
 * src/models/PanelMesh.tsx
 * -------------------------------------------------------------
 * Affiche la géométrie calculée par le worker OpenCascade.js
 * (positions + indices) sous forme de BufferGeometry Three.js.
 * -------------------------------------------------------------
 */

import { useMemo } from "react";
import {
  BufferAttribute,
  BufferGeometry,
  Mesh,
  MeshStandardMaterial,
} from "three";

/** Données de maillage brutes renvoyées par le worker */
export interface WorkerMesh {
  positions: Float32Array;
  indices: Uint32Array;
}

/**
 * Composant d’affichage.
 * @param mesh  positions / indices transférés par postMessage
 * @param color couleur facultative (défaut 0x888888)
 */
export default function PanelMesh({
  mesh,
  color = 0x888888,
}: {
  mesh: WorkerMesh;
  color?: number;
}) {
  // Construit / mémorise la géométrie Three.js
  const geometry = useMemo(() => {
    const g = new BufferGeometry();
    g.setAttribute("position", new BufferAttribute(mesh.positions, 3));
    g.setIndex(new BufferAttribute(mesh.indices, 1));
    g.computeVertexNormals();
    return g;
  }, [mesh]);

  // Matériau gris par défaut
  const material = useMemo(
    () =>
      new MeshStandardMaterial({
        color,
        roughness: 0.4,
        metalness: 0,
      }),
    [color]
  );

  return <Mesh geometry={geometry} material={material} castShadow receiveShadow />;
}
