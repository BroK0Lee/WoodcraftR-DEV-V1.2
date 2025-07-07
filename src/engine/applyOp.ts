/**
 * applyOp.ts
 *
 * Transforme une TopoDS_Shape en appliquant une opération paramétrique.
 * Ce module est exécuté dans le worker (OpenCascade.js).
 */

// @ts-ignore : import d'OCCT via wasm initialisé dans le worker
import oc from 'opencascade.js';
import type { Operation, ResizeOp, RectCutOp, CircleCutOp } from '@/models/Operation';

export function applyOp(shape: OCCT.TopoDS_Shape, op: Operation): OCCT.TopoDS_Shape {
  switch (op.type) {
    case 'resize': {
      const { w, h, t } = op as ResizeOp;
      return oc.BRepPrimAPI_MakeBox(w, h, t).Shape();
    }

    case 'rectCut': {
      const { x, y, w, h, depth } = op as RectCutOp;
      const holeDepth = depth ?? 1e6; // traverse par défaut
      const cuttingBox = oc.BRepPrimAPI_MakeBox(w, h, holeDepth).Shape();
      const trsf = new oc.gp_Trsf();
      trsf.SetTranslation(new oc.gp_Vec(x, y, 0));
      const movedCut = oc.BRepBuilderAPI_Transform(cuttingBox, trsf, true).Shape();
      return oc.BRepAlgoAPI_Cut(shape, movedCut).Shape();
    }

    case 'circleCut': {
      const { cx, cy, r, depth } = op as CircleCutOp;
      const holeDepth = depth ?? 1e6;
      const cyl = oc.BRepPrimAPI_MakeCylinder(r, holeDepth).Shape();
      const trsf = new oc.gp_Trsf();
      trsf.SetTranslation(new oc.gp_Vec(cx, cy, 0));
      const movedCyl = oc.BRepBuilderAPI_Transform(cyl, trsf, true).Shape();
      return oc.BRepAlgoAPI_Cut(shape, movedCyl).Shape();
    }

    default:
      console.warn('applyOp: unsupported op', op);
      return shape;
  }
}
