/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { CrystalData } from '../types/game';
import { ISLANDS } from './constants';

export function generateCourseCrystals(): CrystalData[] {
  const crystals: CrystalData[] = [];
  let crystalId = 1;

  ISLANDS.forEach((island) => {
    const r = island.r * 0.55; // Spread around the island surface
    // Place 3 crystals at pleasant angles
    const angles = [0.4, 2.5, 4.6];

    angles.forEach((angle, idx) => {
      const offsetX = Math.cos(angle) * r;
      const offsetZ = Math.sin(angle) * r;
      // Hovering slightly above the island surface
      const hoverY = island.y + 0.65 + (idx === 1 ? 0.3 : 0);

      crystals.push({
        id: crystalId++,
        islandId: island.id,
        x: island.x + offsetX,
        y: hoverY,
        z: island.z + offsetZ,
        collected: false,
      });
    });
  });

  return crystals;
}
