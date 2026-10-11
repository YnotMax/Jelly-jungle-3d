/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { IslandConfig } from '../types/game';

export const ISLANDS: IslandConfig[] = [
  { id: 1, name: 'Salto Inicial', type: 'start', x: 0, z: 0, y: 1.2, r: 5.4 },
  { id: 2, name: 'Na Maciota', type: 'plain', x: 0, z: -10, y: 1.6, r: 3.1 },
  { id: 3, name: 'Impulso do Cogumelo', type: 'spring', x: -4, z: -19, y: 2.0, r: 3.1 },
  { id: 4, name: 'Pirulito Giratório', type: 'spinner', x: 2, z: -29, y: 3.2, r: 3.6 },
  { id: 5, name: 'Ninho das Nuvens', type: 'checkpoint', x: 7, z: -39, y: 3.8, r: 4.0 },
  { id: 6, name: 'Ilha Voadora', type: 'moving', x: 1, z: -49, y: 4.1, r: 3.1 },
  { id: 7, name: 'Quica Mais!', type: 'spring', x: -6, z: -59, y: 4.7, r: 3.2 },
  { id: 8, name: 'Roda-Roda Maluco', type: 'spinner', x: -1, z: -71, y: 5.8, r: 3.8 },
  { id: 9, name: 'Pouso Estelar', type: 'checkpoint', x: 7, z: -82, y: 6.5, r: 4.0 },
  { id: 10, name: 'Pisa e Corre!', type: 'crumble', x: 4, z: -92, y: 7.1, r: 3.0 },
  { id: 11, name: 'Travessia Nebulosa', type: 'moving', x: -3, z: -102, y: 7.7, r: 3.2 },
  { id: 12, name: 'O Grande Salto', type: 'spring', x: -7, z: -113, y: 8.2, r: 3.3 },
  { id: 13, name: 'Topo do Céu', type: 'finish', x: 0, z: -127, y: 10.0, r: 5.0 },
];

export const PHYSICS_CONFIG = {
  TIMESTEP: 1 / 120, // Fixed 1/120s sub-step
  GRAVITY: 22.0, // Downward acceleration
  RUN_SPEED: 8.8, // Horizontal run speed
  GROUND_ACCEL: 45.0, // Responsive ground acceleration
  AIR_ACCEL: 22.0, // Air drift acceleration
  GROUND_FRICTION: 35.0, // Fast stop on ground
  JUMP_1_VELOCITY: 9.2, // First jump from ground
  JUMP_AIR_VELOCITY: 8.5, // 2nd and 3rd mid-air jumps
  SPRING_VELOCITY: 16.0, // Spring mushroom vertical impulse
  MAX_FALL_SPEED: -32.0, // Terminal velocity
  PLAYER_RADIUS: 0.55, // Horizontal collision radius
  PLAYER_HEIGHT: 1.65, // Character height
  INVULNERABILITY_DURATION: 1.7, // Knockback cooldown
  CRUMBLE_SHAKE_TIME: 1.5, // Time to collapse after player lands
  CRUMBLE_RECOVER_TIME: 4.0, // Time to respawn collapsed platform
  MOVING_ISLAND_AMP: 2.6, // Horizontal oscillation distance
  SPINNER_SPEED_1: 1.8, // Rad/s for spinner 1
  SPINNER_SPEED_2: -2.2, // Rad/s for spinner 2
  DEATH_Y: -9.0, // Respawn depth threshold
};

export const COLOR_PALETTE = {
  mint: 0x7ad2b3,
  mintLight: 0xa8e6cf,
  sage: 0x88b293,
  sageDark: 0x5a8368,
  cream: 0xfcf7ea,
  creamDark: 0xf3ebd3,
  turquoise: 0x3fbfae,
  turquoiseSky: 0xc7ebec,
  coralPink: 0xff7e90,
  coralPinkDark: 0xf06277,
  warmGold: 0xfcb034,
  warmGoldLight: 0xfed371,
  warmRock: 0x78736d,
  warmRockDark: 0x5a5550,
  candyIvory: 0xfffaef,
  candyRed: 0xff526c,
  candyWhite: 0xffffff,
  woodBrown: 0xb57c5a,
  gemGold: 0xffbe3d,
};
