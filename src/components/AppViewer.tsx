import { Canvas } from "@react-three/fiber";
import { Environment, OrbitControls } from "@react-three/drei";
import { useEffect, useMemo, useRef } from "react";
import type { OrbitControls as OrbitControlsImpl } from "three/examples/jsm/controls/OrbitControls.js";

import { useInitializePanel } from "@/hooks/useInitializePanel";
import { usePanelMesh } from "@/hooks/usePanelMesh";
import PanelMesh from "@/models/PanelMesh";
import EdgesLayer from "@/components/EdgesLayer";
import AxesHelper from "@/components/AxesHelper";
import { DEFAULT_DIMENSIONS } from "@/models/Panel";   // ← dimensions par défaut
import type { EdgeDTO } from "@/models/EdgeDTO";

export default function AppViewer() {
  /* 1. Injecte le resize par défaut au montage */
  useInitializePanel();

  /* 2. Récupère mesh & arêtes calculés par le worker */
  const { mesh, edges } = usePanelMesh();

  const controlsRef = useRef<OrbitControlsImpl | null>(null);

  /* 3. Rayon de bounding-sphere dérivé des dimensions par défaut */
  const bounding = useMemo(() => {
    const { width: w, height: h, thickness: t } = DEFAULT_DIMENSIONS;
    const r = Math.sqrt(w ** 2 + h ** 2 + t ** 2) / 2;
    return { r, w, h, t };
  }, []);

  const cameraProps = useMemo(
    () => ({
      position: [bounding.r * 2, bounding.r * 2, bounding.r * 2] as [
        number,
        number,
        number
      ],
      fov: 50,
      near: 0.1,
      far: bounding.r * 10,
    }),
    [bounding]
  );

  /* centre la cible Orbit sur le panneau */
  useEffect(() => {
    controlsRef.current?.target.set(0, 0, -bounding.t / 2);
    controlsRef.current?.update();
  }, [bounding]);

  return (
    <Canvas camera={cameraProps} shadows className="h-full w-full">
      {/* Lumières & environnement */}
      <ambientLight intensity={0.7} />
      <directionalLight position={[5, 5, 5]} intensity={0.7} castShadow />
      <Environment preset="city" />

      {/* Mesh temps-réel */}
      {mesh && <PanelMesh mesh={mesh} />}

      {/* Arêtes interactives */}
      {edges && <EdgesLayer edges={edges} position={[0, 0, 0]} />}

      {/* Axes de repère */}
      <AxesHelper
        size={1}
        scale={[
          bounding.w * 0.6,
          bounding.h * 0.6,
          bounding.r * 0.3,
        ]}
      />

      {/* Contrôles caméra */}
      <OrbitControls
        ref={controlsRef}
        makeDefault
        enablePan
        enableZoom
        enableRotate
        minDistance={bounding.r * 1.1}
        maxDistance={bounding.r * 3}
      />
    </Canvas>
  );
}
