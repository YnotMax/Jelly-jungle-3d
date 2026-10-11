/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { IslandConfig, PlayerState, VisualMode } from '../types/game';
import { ISLANDS, PHYSICS_CONFIG } from './constants';
import { sounds } from '../audio/SoundEffects';

export interface DynamicIslandState {
  id: number;
  currentX: number;
  currentY: number;
  currentZ: number;
  rotationY: number;
  // Crumble state
  crumbleTimer: number; // 0 to 1.5 shake, 1.5 to 5.5 hidden
  isCollapsed: boolean;
  shakeOffset: number;
  // Spring state
  springSquash: number;
  springCooldown: number;
}

export class PhysicsEngine {
  public player: PlayerState;
  public dynamicIslands: Map<number, DynamicIslandState> = new Map();
  public timeElapsed: number = 0;
  public onFinish?: () => void;
  public onCheckpoint?: (islandId: number) => void;
  public onFall?: (fallCount: number) => void;
  public isCompleted: boolean = false;

  private accumulator: number = 0;
  private jumpKeyWasPressed: boolean = false;
  private jumpRequested: boolean = false;

  constructor() {
    this.player = {
      x: 0,
      y: 1.2, // On island 1
      z: 0,
      vx: 0,
      vy: 0,
      vz: 0,
      yaw: 0, // Facing forward towards -Z (next island)
      jumpsRemaining: 3,
      isGrounded: true,
      groundIslandId: 1,
      squashScale: { x: 1, y: 1, z: 1 },
      invulnerableTimer: 0,
      fallCount: 0,
      lastCheckpointIslandId: 1,
    };

    // Initialize dynamic island states
    ISLANDS.forEach((island) => {
      this.dynamicIslands.set(island.id, {
        id: island.id,
        currentX: island.x,
        currentY: island.y,
        currentZ: island.z,
        rotationY: 0,
        crumbleTimer: 0,
        isCollapsed: false,
        shakeOffset: 0,
        springSquash: 1.0,
        springCooldown: 0,
      });
    });
  }

  public resetCourse() {
    this.player.x = 0;
    this.player.y = 1.2;
    this.player.z = 0;
    this.player.vx = 0;
    this.player.vy = 0;
    this.player.vz = 0;
    this.player.yaw = 0;
    this.player.jumpsRemaining = 3;
    this.player.isGrounded = true;
    this.player.groundIslandId = 1;
    this.player.squashScale = { x: 1, y: 1, z: 1 };
    this.player.invulnerableTimer = 0;
    this.player.fallCount = 0;
    this.player.lastCheckpointIslandId = 1;
    this.timeElapsed = 0;
    this.isCompleted = false;

    // Reset dynamic islands
    ISLANDS.forEach((island) => {
      const state = this.dynamicIslands.get(island.id);
      if (state) {
        state.currentX = island.x;
        state.currentY = island.y;
        state.currentZ = island.z;
        state.rotationY = 0;
        state.crumbleTimer = 0;
        state.isCollapsed = false;
        state.shakeOffset = 0;
        state.springSquash = 1.0;
        state.springCooldown = 0;
      }
    });
  }

  public respawnAtCheckpoint(isManualRespawn: boolean = false) {
    const cpIsland = ISLANDS.find((i) => i.id === this.player.lastCheckpointIslandId) || ISLANDS[0];
    this.player.x = cpIsland.x;
    this.player.y = cpIsland.y + 0.05;
    this.player.z = cpIsland.z;
    this.player.vx = 0;
    this.player.vy = 0;
    this.player.vz = 0;
    this.player.jumpsRemaining = 3;
    this.player.isGrounded = true;
    this.player.groundIslandId = cpIsland.id;
    this.player.squashScale = { x: 1, y: 1, z: 1 };
    this.player.invulnerableTimer = 0.5;

    if (!isManualRespawn) {
      this.player.fallCount += 1;
      if (this.onFall) this.onFall(this.player.fallCount);
    }
  }

  // Direct jump trigger for touch or button tap
  public triggerJump() {
    if (!this.jumpKeyWasPressed) {
      this.jumpRequested = true;
      this.jumpKeyWasPressed = true;
    }
  }

  // Handle jump button / Space press with strict single-tap / key-up requirement
  public handleJumpInput(isDown: boolean) {
    if (isDown && !this.jumpKeyWasPressed) {
      this.jumpRequested = true;
    }
    this.jumpKeyWasPressed = isDown;
  }

  public update(delta: number, inputX: number, inputZ: number) {
    // Clamp delta to prevent spiral of death
    const clampedDelta = Math.min(delta, 0.1);
    this.accumulator += clampedDelta;

    const dt = PHYSICS_CONFIG.TIMESTEP;
    while (this.accumulator >= dt) {
      this.substep(dt, inputX, inputZ);
      this.accumulator -= dt;
    }

    // Squash & stretch recovery damping
    this.player.squashScale.x += (1.0 - this.player.squashScale.x) * Math.min(1.0, clampedDelta * 12);
    this.player.squashScale.y += (1.0 - this.player.squashScale.y) * Math.min(1.0, clampedDelta * 12);
    this.player.squashScale.z += (1.0 - this.player.squashScale.z) * Math.min(1.0, clampedDelta * 12);
  }

  private substep(dt: number, rawInputX: number, rawInputZ: number) {
    this.timeElapsed += dt;
    const wasGrounded = this.player.isGrounded;

    // 1. Invulnerability timer countdown
    if (this.player.invulnerableTimer > 0) {
      this.player.invulnerableTimer = Math.max(0, this.player.invulnerableTimer - dt);
    }

    // 2. Update dynamic islands (moving, spinners, crumble)
    ISLANDS.forEach((island) => {
      const state = this.dynamicIslands.get(island.id);
      if (!state) return;

      // Spring recovery
      if (state.springCooldown > 0) {
        state.springCooldown -= dt;
      }
      state.springSquash += (1.0 - state.springSquash) * (dt * 10);

      // Moving island (6 & 11)
      if (island.type === 'moving') {
        const prevX = state.currentX;
        const speed = island.id === 6 ? 1.4 : 1.7;
        const amp = PHYSICS_CONFIG.MOVING_ISLAND_AMP;
        state.currentX = island.x + Math.sin(this.timeElapsed * speed) * amp;

        // If player is grounded on this island, carry player by displacement!
        if (this.player.isGrounded && this.player.groundIslandId === island.id) {
          const deltaX = state.currentX - prevX;
          this.player.x += deltaX;
        }
      }

      // Spinner island (4 & 8)
      if (island.type === 'spinner') {
        const rotSpeed = island.id === 4 ? PHYSICS_CONFIG.SPINNER_SPEED_1 : PHYSICS_CONFIG.SPINNER_SPEED_2;
        const deltaRot = rotSpeed * dt;
        state.rotationY += deltaRot;

        // If player is on this rotating platform, carry player rotationally
        if (this.player.isGrounded && this.player.groundIslandId === island.id) {
          const rx = this.player.x - island.x;
          const rz = this.player.z - island.z;
          const newRx = rx * Math.cos(deltaRot) - rz * Math.sin(deltaRot);
          const newRz = rx * Math.sin(deltaRot) + rz * Math.cos(deltaRot);
          this.player.x = island.x + newRx;
          this.player.z = island.z + newRz;
          this.player.yaw += deltaRot;
        }

        // Low candy sweeper bar knockback check
        this.checkSpinnerCollision(island, state);
      }

      // Crumble island (10)
      if (island.type === 'crumble') {
        if (state.crumbleTimer > 0) {
          state.crumbleTimer += dt;
          if (state.crumbleTimer <= PHYSICS_CONFIG.CRUMBLE_SHAKE_TIME) {
            // Shaking phase
            state.shakeOffset = (Math.random() - 0.5) * 0.18;
          } else if (state.crumbleTimer <= PHYSICS_CONFIG.CRUMBLE_SHAKE_TIME + PHYSICS_CONFIG.CRUMBLE_RECOVER_TIME) {
            // Collapsed / hidden phase: no collision!
            state.isCollapsed = true;
            state.shakeOffset = 0;
          } else {
            // Recovered!
            state.crumbleTimer = 0;
            state.isCollapsed = false;
            state.shakeOffset = 0;
          }
        }
      }
    });

    // 3. Normalize input
    let normX = rawInputX;
    let normZ = rawInputZ;
    const len = Math.sqrt(normX * normX + normZ * normZ);
    if (len > 1.0) {
      normX /= len;
      normZ /= len;
    }

    // Target velocity
    const targetVx = normX * PHYSICS_CONFIG.RUN_SPEED;
    const targetVz = normZ * PHYSICS_CONFIG.RUN_SPEED;

    // Acceleration damping based on ground or air
    const accelRate = this.player.isGrounded ? PHYSICS_CONFIG.GROUND_ACCEL : PHYSICS_CONFIG.AIR_ACCEL;
    this.player.vx += (targetVx - this.player.vx) * Math.min(1.0, accelRate * dt);
    this.player.vz += (targetVz - this.player.vz) * Math.min(1.0, accelRate * dt);

    // Turn character yaw towards movement direction
    if (len > 0.05) {
      const targetYaw = Math.atan2(-this.player.vx, -this.player.vz);
      // Smooth angular interpolation
      let angleDiff = targetYaw - this.player.yaw;
      while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
      while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;
      this.player.yaw += angleDiff * Math.min(1.0, 15 * dt);
    }

    // 4. Jump Execution (Strict 3 jumps)
    if (this.jumpRequested) {
      this.jumpRequested = false;

      if (this.player.jumpsRemaining > 0) {
        if (this.player.isGrounded) {
          // 1st jump from ground
          this.player.vy = PHYSICS_CONFIG.JUMP_1_VELOCITY;
          this.player.jumpsRemaining = 2;
          this.player.isGrounded = false;
          this.player.groundIslandId = null;
          // Squash and stretch: stretch vertically
          this.player.squashScale = { x: 0.8, y: 1.35, z: 0.8 };
          sounds.playJump(1);
        } else {
          // Mid-air jumps (2nd and 3rd)
          const jumpIndex = 4 - this.player.jumpsRemaining; // 2 or 3
          this.player.vy = PHYSICS_CONFIG.JUMP_AIR_VELOCITY;
          this.player.jumpsRemaining -= 1;
          this.player.squashScale = { x: 0.82, y: 1.28, z: 0.82 };
          sounds.playJump(jumpIndex);
        }
      }
    }

    // 5. Gravity & Vertical motion
    if (!this.player.isGrounded) {
      this.player.vy -= PHYSICS_CONFIG.GRAVITY * dt;
      if (this.player.vy < PHYSICS_CONFIG.MAX_FALL_SPEED) {
        this.player.vy = PHYSICS_CONFIG.MAX_FALL_SPEED;
      }
    }

    // Integrate position
    this.player.x += this.player.vx * dt;
    this.player.z += this.player.vz * dt;
    this.player.y += this.player.vy * dt;

    // 6. Ground & Island Collision
    this.checkIslandCollisions(wasGrounded);

    // 7. Checkpoint & Finish detection
    if (this.player.isGrounded && this.player.groundIslandId !== null) {
      const currentIsland = ISLANDS.find((i) => i.id === this.player.groundIslandId);
      if (currentIsland) {
        if (currentIsland.type === 'checkpoint' && this.player.lastCheckpointIslandId < currentIsland.id) {
          this.player.lastCheckpointIslandId = currentIsland.id;
          sounds.playCheckpoint();
          if (this.onCheckpoint) this.onCheckpoint(currentIsland.id);
        }

        if (currentIsland.type === 'finish' && !this.isCompleted) {
          this.isCompleted = true;
          sounds.playVictory();
          if (this.onFinish) this.onFinish();
        }
      }
    }

    // 8. Pit fall check (fell off island into cloud sea)
    if (this.player.y < PHYSICS_CONFIG.DEATH_Y) {
      this.respawnAtCheckpoint(false);
    }
  }

  private checkIslandCollisions(wasGrounded: boolean) {
    let landedThisStep = false;

    for (const island of ISLANDS) {
      const state = this.dynamicIslands.get(island.id);
      if (!state) continue;

      // Collapsed crumble island has no collision!
      if (island.type === 'crumble' && state.isCollapsed) {
        continue;
      }

      const islandX = state.currentX;
      const islandZ = state.currentZ;
      const islandY = state.currentY;
      const islandR = island.r;

      const dx = this.player.x - islandX;
      const dz = this.player.z - islandZ;
      const dist = Math.sqrt(dx * dx + dz * dz);

      // Check horizontal footprint
      if (dist <= islandR + PHYSICS_CONFIG.PLAYER_RADIUS * 0.6) {
        // Check vertical landing plane: top surface is at islandY
        const landingY = islandY;
        const verticalTolerance = 0.35;

        // If player is near the top and descending
        if (this.player.y <= landingY + verticalTolerance && this.player.y >= landingY - 0.45 && this.player.vy <= 0.1) {
          // Player lands!
          this.player.y = landingY;
          this.player.vy = 0;
          this.player.isGrounded = true;
          this.player.groundIslandId = island.id;
          this.player.jumpsRemaining = 3; // Refill all 3 jumps on landing
          landedThisStep = true;

          // Squash effect ONLY on initial touchdown from airborne
          if (!wasGrounded) {
            this.player.squashScale = { x: 1.25, y: 0.78, z: 1.25 };
            sounds.playLand();
          }

          // If Crumble island, start crumble timer
          if (island.type === 'crumble' && state.crumbleTimer === 0) {
            state.crumbleTimer = 0.001; // Start shake countdown
          }

          // Check Spring Mushroom Launch
          if (island.type === 'spring' && state.springCooldown <= 0) {
            // Mushroom is located on the island (near center dx, dz <= 1.4)
            if (dist <= 1.4) {
              // Spring launch!
              this.player.vy = PHYSICS_CONFIG.SPRING_VELOCITY;
              this.player.isGrounded = false;
              this.player.groundIslandId = null;
              this.player.jumpsRemaining = 3; // Restores all jumps
              this.player.squashScale = { x: 0.7, y: 1.5, z: 0.7 };
              state.springSquash = 0.4;
              state.springCooldown = 0.35;
              sounds.playSpringBounce();
            }
          }

          break; // Grounded on this island
        }
      }
    }

    if (!landedThisStep) {
      // Player walked off edge or is airborne
      this.player.isGrounded = false;
      this.player.groundIslandId = null;
    }
  }

  // Knockback from spinning candy bar on Islands 4 & 8
  private checkSpinnerCollision(island: IslandConfig, state: DynamicIslandState) {
    if (this.player.invulnerableTimer > 0) return;

    // Check vertical overlap: candy bars sit around y = island.y + 0.38
    // If player jumped high over it (y > island.y + 0.62), safe!
    const barY = island.y + 0.38;
    const playerBottom = this.player.y;
    const playerTop = this.player.y + PHYSICS_CONFIG.PLAYER_HEIGHT;

    if (playerBottom > barY + 0.28 || playerTop < barY - 0.2) {
      return; // Clear vertical separation
    }

    // Candy arm count: 1 on island 4, 2 on island 8
    const armCount = island.id === 8 ? 2 : 1;
    const armLen = island.r * 0.95;

    for (let a = 0; a < armCount; a++) {
      const armAngle = state.rotationY + (a / armCount) * Math.PI;

      // Check distance from player to line segment representing the candy bar
      const pRelX = this.player.x - island.x;
      const pRelZ = this.player.z - island.z;

      // Project onto bar line direction (cos, sin)
      const dirX = Math.cos(armAngle);
      const dirZ = Math.sin(armAngle);

      const proj = pRelX * dirX + pRelZ * dirZ;
      // Perpendicular vector
      const perpDist = Math.abs(-pRelX * dirZ + pRelZ * dirX);

      // Bar has thickness ~0.35 + player radius ~0.55 = 0.9
      if (Math.abs(proj) <= armLen && perpDist < 0.75) {
        // BONK! Knockback
        sounds.playBonk();
        this.player.invulnerableTimer = PHYSICS_CONFIG.INVULNERABILITY_DURATION;

        // Knockback impulse radially outward & slightly upward
        const knockDirX = pRelX !== 0 ? Math.sign(pRelX) : 1;
        const knockDirZ = pRelZ !== 0 ? Math.sign(pRelZ) : 1;

        this.player.vx = knockDirX * 7.5;
        this.player.vz = knockDirZ * 7.5;
        this.player.vy = 4.8;
        this.player.isGrounded = false;
        this.player.squashScale = { x: 1.3, y: 0.7, z: 1.3 };
        break;
      }
    }
  }
}
