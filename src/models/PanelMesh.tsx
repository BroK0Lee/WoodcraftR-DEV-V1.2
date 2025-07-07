/**
 * src/models/PanelMesh.tsx
 * -------------------------------------------------------------
 * Affiche la g�om�trie calcul�e par le worker OpenCascade.js
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

/** Donn�es de maillage brutes renvoy�es par le worker */
export interface WorkerMesh {
  positions: Float32Array;
  indices: Uint32Array;
}

/**
 * Composant d�affichage.
 * @param mesh  positions / indices transf�r�s par postMessage
 * @param color couleur facultative (d�faut 0x888888)
 */
export default function PanelMesh({
  mesh,
  color = 0x888888,
}: {
  mesh: WorkerMesh;
  color?: number;
}) {
  // Construit / m�morise la g�om�trie Three.js
  const geometry = useMemo(() => {
    const g = new BufferGeometry();
    g.setAttribute("position", new BufferAttribute(mesh.positions, 3));
    g.setIndex(new BufferAttribute(mesh.indices, 1));
    g.computeVertexNormals();
    return g;
  }, [mesh]);

  // Mat�riau gris par d�faut
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
