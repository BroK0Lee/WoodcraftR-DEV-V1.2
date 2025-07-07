import { useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'

/**
 * Modal de création d'une découpe rectangulaire.
 * Affiche un aperçu 3D simple et un formulaire pour saisir
 * les dimensions et la position de la découpe.
 */
export function CutBoxModal({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  // Valeurs de formulaire locales
  const [x, setX] = useState(0)
  const [y, setY] = useState(0)
  const [width, setWidth] = useState(50)
  const [height, setHeight] = useState(50)

  const handleValidate = () => {
    // TODO: envoyer les valeurs dans le store ou le parent
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Ajouter une découpe rectangulaire</DialogTitle>
          <DialogDescription>
            Définissez la position et la taille de la découpe
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="h-64 w-full border rounded-md bg-background">
            <Canvas camera={{ position: [3, 3, 3] }}>
              <ambientLight intensity={0.7} />
              <directionalLight position={[5, 5, 5]} intensity={0.5} />
              <mesh rotation={[0.2, 0.6, 0]}>
                <boxGeometry args={[1, 1, 0.1]} />
                <meshStandardMaterial color="#ff8844" />
              </mesh>
            </Canvas>
          </div>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col space-y-1">
                <Label htmlFor="cut-x" className="text-xs">Position X (mm)</Label>
                <Input id="cut-x" type="number" value={x} onChange={e => setX(Number(e.target.value))} className="h-9" />
              </div>
              <div className="flex flex-col space-y-1">
                <Label htmlFor="cut-y" className="text-xs">Position Y (mm)</Label>
                <Input id="cut-y" type="number" value={y} onChange={e => setY(Number(e.target.value))} className="h-9" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col space-y-1">
                <Label htmlFor="cut-width" className="text-xs">Largeur (mm)</Label>
                <Input id="cut-width" type="number" value={width} onChange={e => setWidth(Number(e.target.value))} className="h-9" />
              </div>
              <div className="flex flex-col space-y-1">
                <Label htmlFor="cut-height" className="text-xs">Hauteur (mm)</Label>
                <Input id="cut-height" type="number" value={height} onChange={e => setHeight(Number(e.target.value))} className="h-9" />
              </div>
            </div>
          </div>
        </div>
        <DialogFooter className="pt-4">
          <Button onClick={handleValidate}>Valider</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}