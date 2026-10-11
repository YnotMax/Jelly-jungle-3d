/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type IslandType = 'start' | 'plain' | 'spring' | 'spinner' | 'checkpoint' | 'crumble' | 'moving' | 'finish';

export interface IslandConfig {
  id: number;
  name: string;
  type: IslandType;
  x: number;
  z: number;
  y: number;
  r: number;
}

export interface CrystalData {
  id: number;
  islandId: number;
  x: number;
  y: number;
  z: number;
  collected: boolean;
}

export interface PlayerState {
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  vz: number;
  yaw: number;
  jumpsRemaining: number;
  isGrounded: boolean;
  groundIslandId: number | null;
  squashScale: { x: number; y: number; z: number };
  invulnerableTimer: number;
  fallCount: number;
  lastCheckpointIslandId: number;
}

export type VisualMode = 'classic' | 'tripo';

export interface GameMetrics {
  timeSeconds: number;
  crystalsCollected: number;
  totalCrystals: number;
  currentIslandId: number;
  falls: number;
  stars: number;
  bestTime: number | null;
}

export interface TouchInputState {
  moveX: number;
  moveZ: number;
  jumpPressed: boolean;
}
