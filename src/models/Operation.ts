/**
 * src/models/Operation.ts
 *
 * Définit les types d'opérations utilisables dans la feature‑tree.
 * Chaque opération est immuable et identifiée par un OpID unique côté front.
 */

/** Identifiant d'opération unique côté front */
export type OpID = string;

/**
 * Opération de redimensionnement (taille du panneau)
 */
export type ResizeOp = {
  id: OpID;
  type: 'resize';
  w: number; // largeur en mm
  h: number; // hauteur en mm
  t: number; // épaisseur en mm
};

/**
 * Opération de découpe rectangulaire
 */
export type RectCutOp = {
  id: OpID;
  type: 'rectCut';
  x: number; // origine locale X (mm)
  y: number; // origine locale Y (mm)
  w: number; // largeur (mm)
  h: number; // hauteur (mm)
  depth?: number; // profondeur optionnelle (mm)
};

/**
 * Opération de découpe circulaire
 */
export type CircleCutOp = {
  id: OpID;
  type: 'circleCut';
  cx: number; // centre X (mm)
  cy: number; // centre Y (mm)
  r: number; // rayon (mm)
  depth?: number; // profondeur optionnelle (mm)
};

/**
 * TODO: Ajouter de nouvelles opérations (chanfrein, congé, pattern...)
 */

/**
 * Union de toutes les opérations supportées
 */
export type Operation = ResizeOp | RectCutOp | CircleCutOp;
