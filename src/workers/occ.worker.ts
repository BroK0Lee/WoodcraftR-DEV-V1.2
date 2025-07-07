/**
 * src/workers/occ.worker.ts
 *
 * Worker OpenCascade.js paramétrique.
 * Initialise OCCT via le helper `initOcc` (mémoïsé), traite la pile
 * d'opérations, triangule, extrait les arêtes et renvoie un CadOut.
 */

/* eslint-disable no-restricted-globals */

import { initOcc } from '../helpers/initOcc';
import { applyOp } from '../engine/applyOp';
import type { CadIn, CadOut, EdgeIndices } from '../engine/cadTypes';
import type { Operation } from '@/models/Operation';

// ---------------------------------------------------------------------------
// Chargement différé d'OpenCascade (WASM) – une seule instance par worker
// ---------------------------------------------------------------------------
let oc: Awaited<ReturnType<typeof initOcc>> | null = null;
const queue: CadIn[] = []; // messages reçus avant l'init d'OCCT

initOcc().then((_oc) => {
  oc = _oc;
  // Signale explicitement que la VM OCCT est prête
  self.postMessage({ type: 'ready' });
  queue.splice(0).forEach(handleCad); // flush messages en attente
});

self.addEventListener('message', (e: MessageEvent<CadIn>) => {
  if (!oc) {
    queue.push(e.data); // pas encore prêt → on empile
  } else {
    handleCad(e.data);
  }
});

// ---------------------------------------------------------------------------
// Pipeline principal : opérations → shape → mesh + edges
// ---------------------------------------------------------------------------
function handleCad({ operations, version }: CadIn) {
  try {
    if (!operations?.length) {
   // Rien à construire : renvoyer seulement "version"
   const out: CadOut = { version, mesh: null, edges: null };
   postMessage(out);
   return;
 }
    // 1. Reconstruire la forme "shape" à partir de la pile d'opérations
    let shape: OCCT.TopoDS_Shape | null = null;

    operations.forEach((op: Operation, idx) => {
      shape = idx === 0
        ? applyOp(new oc!.TopoDS_Shape(), op)
        : applyOp(shape!, op);
    });

    // 2. Trianguler la forme → buffers
    const { positions, indices } = triangulate(shape!);

    // 3. Extraire les arêtes (couples d'indices uniques)
    const edges = extractEdgePairs(indices);

    const out: CadOut = {
      mesh: { positions, indices },
      edges,
      version,
    };
    // postMessage transfère les ArrayBuffers sans copie
    // @ts-ignore
    self.postMessage(out, [positions.buffer, indices.buffer]);
  } catch (err: any) {
    const out: CadOut = { version, error: err?.message ?? String(err) };
    // @ts-ignore
    self.postMessage(out);
  }
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function triangulate(shape: OCCT.TopoDS_Shape) {
  // deflection 0.5 mm → ajustez si besoin
  const meshGen = new oc!.BRepMesh_IncrementalMesh(shape, 0.5);
  meshGen.Perform();

  const positions: number[] = [];
  const indices: number[] = [];
  let offset = 0;

  const expF = new oc!.TopExp_Explorer(shape, oc!.TopAbs_ShapeEnum.TopAbs_FACE);
  while (expF.More()) {
    const face = oc!.TopoDS.Face_1(expF.Current());
    const loc = new oc!.TopLoc_Location();
    const triang = oc!.BRep_Tool.Triangulation(face, loc);
    if (triang) {
      const verts = triang.Nodes();
      for (let i = 1; i <= verts.Length(); i++) {
        const p = verts.Value(i);
        positions.push(p.X(), p.Y(), p.Z());
      }
      const tris = triang.Triangles();
      for (let i = 1; i <= tris.Length(); i++) {
        const t = tris.Value(i);
        indices.push(
          offset + t.Value(1) - 1,
          offset + t.Value(2) - 1,
          offset + t.Value(3) - 1,
        );
      }
      offset += verts.Length();
    }
    expF.Next();
  }

  return {
    positions: new Float32Array(positions),
    indices: new Uint32Array(indices),
  };
}

function extractEdgePairs(indices: Uint32Array): EdgeIndices {
  const set = new Set<string>();
  const pairs: EdgeIndices = [];
  const push = (a: number, b: number) => {
    const key = a < b ? `${a}-${b}` : `${b}-${a}`;
    if (!set.has(key)) {
      set.add(key);
      pairs.push([a, b]);
    }
  };
  for (let i = 0; i < indices.length; i += 3) {
    const i0 = indices[i], i1 = indices[i + 1], i2 = indices[i + 2];
    push(i0, i1);
    push(i1, i2);
    push(i2, i0);
  }
  return pairs;
}
