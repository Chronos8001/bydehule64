import { level1 } from './level1';
import { level2 } from './level2';
import { level3 } from './level3';
import { level4 } from './level4';

/** Ordre de progression : `build` reconstruit un monde neuf à chaque tentative. */
export const levels = [
  { name: 'Les remparts', summary: 'Un écran, deux squelettes. La mise en jambes.', build: level1 },
  { name: 'Les souterrains', summary: 'Deux fois plus long, cinq squelettes et des pics.', build: level2 },
  { name: 'Les cryptes', summary: 'Le plus long. Sept squelettes, quatre nids de pics.', build: level3 },
  { name: 'La chambre du boss', summary: 'Trois coups sur la tête pour ouvrir la porte.', build: level4 },
];
