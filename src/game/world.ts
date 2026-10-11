/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { ISLANDS, COLOR_PALETTE } from './constants';
import {
  createJellyModel,
  createMushroomModel,
  createTreeModel,
  createIslandMesh,
  createCrystalMesh,
  createSpinnerBarMesh,
  createCheckpointMesh,
  createFinishPortalMesh,
  createStartBannerMesh,
  createCloudMesh,
} from './models';
import { CrystalData, VisualMode } from '../types/game';
import { PhysicsEngine } from './physics';
import { sounds } from '../audio/SoundEffects';

export interface WorldCallbacks {
  onCrystalCollected: (count: number, total: number) => void;
  onIslandChange: (islandId: number, islandName: string) => void;
}

export class WorldManager {
  public scene: THREE.Scene;
  public camera: THREE.PerspectiveCamera;
  public renderer: THREE.WebGLRenderer;
  public visualMode: VisualMode = 'classic';

  // 3D references
  private jellyRoot!: THREE.Group;
  private jellyBodyGroup!: THREE.Group;
  private islandsMap: Map<number, THREE.Group> = new Map();
  private springMushroomsMap: Map<number, THREE.Group> = new Map();
  private spinnerBarsMap: Map<number, THREE.Group> = new Map();
  private checkpointMeshesMap: Map<number, THREE.Group> = new Map();
  private crystalMeshes: Map<number, THREE.Group> = new Map();
  private treeInstances: THREE.Group[] = [];
  private cloudsGroup!: THREE.Group;
  private finishPortalGroup!: THREE.Group;
  private particleGroup!: THREE.Group;

  // Particle bursts & pooling
  private activeParticles: { mesh: THREE.Mesh; vx: number; vy: number; vz: number; life: number; maxLife: number }[] = [];
  private sharedParticleGeo = new THREE.SphereGeometry(0.08, 6, 6);
  private sharedParticleMatMap = new Map<number, THREE.MeshBasicMaterial>();
  private runCycle: number = 0;

  // Lighting
  private dirLight!: THREE.DirectionalLight;
  private ambientLight!: THREE.AmbientLight;
  private hemiLight!: THREE.HemisphereLight;

  // Camera targets
  public isIntroMode: boolean = true;
  private cameraLookTarget = new THREE.Vector3(-5, 1.5, -5);
  private cameraCurrentTarget = new THREE.Vector3(-5, 1.5, -5);

  private callbacks: WorldCallbacks;
  private gltfLoader = new GLTFLoader();

  constructor(container: HTMLElement, callbacks: WorldCallbacks) {
    this.callbacks = callbacks;

    // 1. Scene & Atmosphere
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0xc7ebec); // Pastel turquoise sky
    this.scene.fog = new THREE.FogExp2(0xc7ebec, 0.010); // Soft distant atmospheric fog

    // 2. Camera: FOV ~40° per specification
    const aspect = container.clientWidth / container.clientHeight;
    this.camera = new THREE.PerspectiveCamera(40, aspect, 0.2, 350);

    // Initial Intro Camera position
    this.setIntroCamera(container.clientWidth <= 640);

    // 3. Renderer with soft shadows & max DPR 1.5 for steady 60-120fps
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: 'high-performance',
    });
    this.renderer.setSize(container.clientWidth, container.clientHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.05;
    container.appendChild(this.renderer.domElement);

    // 4. Lighting (Three-point soft studio lighting)
    this.setupLighting();

    // 5. Build Course & Scenery
    this.buildCourse();

    // 6. Build Clouds & Particles
    this.buildCloudSea();
    this.buildParticleSystem();

    // 7. Build Jelly Character
    this.buildJelly();
  }

  private setupLighting() {
    // Soft sky-ground hemisphere
    this.hemiLight = new THREE.HemisphereLight(0xfff7e8, 0x72a59a, 0.85);
    this.scene.add(this.hemiLight);

    // Gentle ambient light
    this.ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    this.scene.add(this.ambientLight);

    // Main Key Light (Warm golden sunlight from high-right)
    this.dirLight = new THREE.DirectionalLight(0xfff5e6, 1.25);
    this.dirLight.position.set(30, 45, 20);
    this.dirLight.castShadow = true;
    this.dirLight.shadow.mapSize.width = 2048;
    this.dirLight.shadow.mapSize.height = 2048;
    this.dirLight.shadow.camera.near = 5;
    this.dirLight.shadow.camera.far = 180;
    const shadowDist = 45;
    this.dirLight.shadow.camera.left = -shadowDist;
    this.dirLight.shadow.camera.right = shadowDist;
    this.dirLight.shadow.camera.top = shadowDist;
    this.dirLight.shadow.camera.bottom = -shadowDist;
    this.dirLight.shadow.bias = -0.0006;
    this.scene.add(this.dirLight);

    // Subtle cool rim light from behind to give vinyl pop
    const rimLight = new THREE.DirectionalLight(0xa5e5ea, 0.55);
    rimLight.position.set(-25, 20, -50);
    this.scene.add(rimLight);
  }

  private buildCourse() {
    // 1. Build all 13 islands
    ISLANDS.forEach((island) => {
      const islandMesh = createIslandMesh(island);
      this.islandsMap.set(island.id, islandMesh);
      this.scene.add(islandMesh);

      // Trees along the course (placed near perimeter to not obstruct jumping)
      if ([1, 2, 5, 6, 9, 13].includes(island.id)) {
        const treeCount = island.id === 13 ? 3 : 1;
        for (let t = 0; t < treeCount; t++) {
          const tAngle = (t / treeCount) * Math.PI * 1.5 + 1.2;
          const dist = island.r * 0.72;
          const tree = createTreeModel(island.id === 13 ? 1.1 : 0.95);
          tree.position.set(
            island.x + Math.cos(tAngle) * dist,
            island.y,
            island.z + Math.sin(tAngle) * dist
          );
          tree.rotation.y = Math.random() * Math.PI * 2;
          this.treeInstances.push(tree);
          this.scene.add(tree);
        }
      }

      // Spring Mushrooms on spring islands (3, 7, 12)
      if (island.type === 'spring') {
        const mushroom = createMushroomModel(this.visualMode);
        mushroom.position.set(island.x, island.y, island.z);
        this.springMushroomsMap.set(island.id, mushroom);
        this.scene.add(mushroom);
      }

      // Spinners on islands 4 & 8
      if (island.type === 'spinner') {
        const barCount = island.id === 8 ? 2 : 1;
        const spinnerMesh = createSpinnerBarMesh(island.r * 0.92, barCount);
        spinnerMesh.position.set(island.x, island.y, island.z);
        this.spinnerBarsMap.set(island.id, spinnerMesh);
        this.scene.add(spinnerMesh);
      }

      // Checkpoints on islands 5 & 9
      if (island.type === 'checkpoint') {
        const cpMesh = createCheckpointMesh(false);
        cpMesh.position.set(island.x, island.y, island.z);
        this.checkpointMeshesMap.set(island.id, cpMesh);
        this.scene.add(cpMesh);
      }

      // Start banner on Island 1
      if (island.id === 1) {
        const banner = createStartBannerMesh();
        banner.position.set(island.x, island.y, island.z - island.r * 0.6);
        this.scene.add(banner);
      }

      // Finish portal on Island 13
      if (island.type === 'finish') {
        this.finishPortalGroup = createFinishPortalMesh();
        this.finishPortalGroup.position.set(island.x, island.y, island.z);
        this.scene.add(this.finishPortalGroup);
      }
    });
  }

  public populateCrystals(crystals: CrystalData[]) {
    // Clear any existing crystal meshes
    this.crystalMeshes.forEach((mesh) => this.scene.remove(mesh));
    this.crystalMeshes.clear();

    crystals.forEach((c) => {
      const cMesh = createCrystalMesh();
      cMesh.position.set(c.x, c.y, c.z);
      this.crystalMeshes.set(c.id, cMesh);
      this.scene.add(cMesh);
    });
  }

  private buildCloudSea() {
    this.cloudsGroup = new THREE.Group();
    this.cloudsGroup.name = 'cloud_sea';

    // Massive sea of pastel fluffy clouds beneath the islands (y: -14 to -22)
    const cloudCount = 36;
    for (let i = 0; i < cloudCount; i++) {
      const cloud = createCloudMesh(2.5 + Math.random() * 2.5);
      const cx = (Math.random() - 0.5) * 120;
      const cz = -Math.random() * 160 + 20;
      const cy = -16 - Math.random() * 8;
      cloud.position.set(cx, cy, cz);
      this.cloudsGroup.add(cloud);
    }
    this.scene.add(this.cloudsGroup);
  }

  private buildParticleSystem() {
    this.particleGroup = new THREE.Group();
    this.particleGroup.name = 'particle_bursts';
    this.scene.add(this.particleGroup);
  }

  public spawnSparkleBurst(x: number, y: number, z: number, count = 14, color = 0xffe24a) {
    let mat = this.sharedParticleMatMap.get(color);
    if (!mat) {
      mat = new THREE.MeshBasicMaterial({ color });
      this.sharedParticleMatMap.set(color, mat);
    }

    for (let i = 0; i < count; i++) {
      const p = new THREE.Mesh(this.sharedParticleGeo, mat);
      p.position.set(x, y, z);
      this.particleGroup.add(p);

      const angle = Math.random() * Math.PI * 2;
      const speed = 2.5 + Math.random() * 4.5;
      const vy = 2.0 + Math.random() * 5.0;

      this.activeParticles.push({
        mesh: p,
        vx: Math.cos(angle) * speed,
        vy,
        vz: Math.sin(angle) * speed,
        life: 0,
        maxLife: 0.5 + Math.random() * 0.35,
      });
    }
  }

  private buildJelly() {
    if (this.jellyRoot) {
      this.scene.remove(this.jellyRoot);
    }
    this.jellyRoot = createJellyModel(this.visualMode);
    this.jellyBodyGroup = this.jellyRoot.getObjectByName('body_squash_group') as THREE.Group;
    this.scene.add(this.jellyRoot);
  }

  public setVisualMode(mode: VisualMode) {
    if (this.visualMode === mode) return;
    this.visualMode = mode;
    this.buildJelly();

    // Update mushrooms
    this.springMushroomsMap.forEach((oldM) => {
      this.scene.remove(oldM);
    });
    this.springMushroomsMap.clear();

    ISLANDS.filter((i) => i.type === 'spring').forEach((island) => {
      const mushroom = createMushroomModel(this.visualMode);
      mushroom.position.set(island.x, island.y, island.z);
      this.springMushroomsMap.set(island.id, mushroom);
      this.scene.add(mushroom);
    });
  }

  public loadCustomGLTF(fileOrUrl: string | File): Promise<boolean> {
    return new Promise((resolve) => {
      const handleLoad = (gltf: { scene: THREE.Group }) => {
        try {
          const model = gltf.scene;
          // Validate finite bounds
          const bbox = new THREE.Box3().setFromObject(model);
          const size = new THREE.Vector3();
          bbox.getSize(size);

          if (!isFinite(size.x) || size.x === 0) {
            resolve(false);
            return;
          }

          // Scale model to match character height (~1.65 units)
          const targetHeight = 1.65;
          const scaleFactor = targetHeight / (size.y || 1);
          model.scale.setScalar(scaleFactor);

          // Center pivot at base feet (y = 0)
          bbox.setFromObject(model);
          model.position.y = -bbox.min.y;

          // Swap into jelly root
          if (this.jellyBodyGroup) {
            this.jellyBodyGroup.clear();
            this.jellyBodyGroup.add(model);
          }
          this.visualMode = 'tripo';
          resolve(true);
        } catch {
          resolve(false);
        }
      };

      if (typeof fileOrUrl === 'string') {
        this.gltfLoader.load(fileOrUrl, handleLoad, undefined, () => resolve(false));
      } else {
        const reader = new FileReader();
        reader.onload = (e) => {
          if (e.target?.result) {
            this.gltfLoader.parse(e.target.result as ArrayBuffer, '', handleLoad, () => resolve(false));
          } else {
            resolve(false);
          }
        };
        reader.readAsArrayBuffer(fileOrUrl);
      }
    });
  }

  public setIntroCamera(isMobile: boolean) {
    this.isIntroMode = true;
    if (isMobile) {
      // Reframe jelly and island center-upwards above the intro title
      this.camera.position.set(8, 14, 18);
      this.cameraLookTarget.set(0, 2.5, -2);
      this.cameraCurrentTarget.copy(this.cameraLookTarget);
      this.camera.lookAt(this.cameraLookTarget);
    } else {
      // Desktop: reserve left 35-40% for title, frame starting island center-right, course receding up-right
      // Near (13, 20, 25), looking at (-5, 1.5, -5)
      this.camera.position.set(13, 20, 25);
      this.cameraLookTarget.set(-5, 1.5, -5);
      this.cameraCurrentTarget.copy(this.cameraLookTarget);
      this.camera.lookAt(this.cameraLookTarget);
    }
  }

  public update(physics: PhysicsEngine, crystals: CrystalData[], delta: number) {
    const time = physics.timeElapsed;
    const speed = Math.sqrt(physics.player.vx * physics.player.vx + physics.player.vz * physics.player.vz);

    // 1. Update Jelly position and facing rotation
    this.jellyRoot.position.set(physics.player.x, physics.player.y, physics.player.z);

    if (this.isIntroMode) {
      // Warm angle facing camera during title screen
      this.jellyRoot.rotation.y = 0.52;
    } else {
      this.jellyRoot.rotation.y = physics.player.yaw;
    }

    // References to articulated parts
    const leftFootGroup = this.jellyRoot.getObjectByName('jelly_left_foot_group');
    const rightFootGroup = this.jellyRoot.getObjectByName('jelly_right_foot_group');
    const leftArm = this.jellyRoot.getObjectByName('jelly_left_arm');
    const rightArm = this.jellyRoot.getObjectByName('jelly_right_arm');
    const mintSprout = this.jellyRoot.getObjectByName('mint_sprout');
    const leftEye = this.jellyRoot.getObjectByName('jelly_left_eye');
    const rightEye = this.jellyRoot.getObjectByName('jelly_right_eye');

    let hopBob = 0;
    let rollTilt = 0;

    if (physics.player.isGrounded) {
      if (speed > 0.4) {
        // Joyful, bouncy running waddle (Mario / Fall Guys feel)
        this.runCycle += delta * speed * 1.5;
        rollTilt = Math.sin(this.runCycle) * 0.08;
        hopBob = Math.abs(Math.sin(this.runCycle)) * 0.06;

        if (leftFootGroup && rightFootGroup) {
          leftFootGroup.rotation.x = Math.sin(this.runCycle) * 0.45;
          leftFootGroup.position.y = 0.13 + Math.max(0, Math.sin(this.runCycle)) * 0.08;

          rightFootGroup.rotation.x = -Math.sin(this.runCycle) * 0.45;
          rightFootGroup.position.y = 0.13 + Math.max(0, -Math.sin(this.runCycle)) * 0.08;
        }

        if (leftArm && rightArm) {
          leftArm.rotation.x = -Math.sin(this.runCycle) * 0.5;
          rightArm.rotation.x = Math.sin(this.runCycle) * 0.5;
        }

        if (mintSprout) {
          mintSprout.rotation.z = Math.sin(this.runCycle) * 0.12;
          mintSprout.rotation.x = -speed * 0.025;
        }
      } else {
        // Gentle, calm idle state — no frantic jerking!
        if (leftFootGroup && rightFootGroup) {
          leftFootGroup.rotation.x *= 0.88;
          leftFootGroup.position.y += (0.13 - leftFootGroup.position.y) * 0.2;
          rightFootGroup.rotation.x *= 0.88;
          rightFootGroup.position.y += (0.13 - rightFootGroup.position.y) * 0.2;
        }
        if (leftArm && rightArm) {
          leftArm.rotation.x *= 0.88;
          rightArm.rotation.x *= 0.88;
        }
        if (mintSprout) {
          mintSprout.rotation.z *= 0.88;
          mintSprout.rotation.x *= 0.88;
        }
      }

      // Cute natural eye blinking every 3.5 seconds
      const blinkCycle = time % 3.5;
      const isBlinking = blinkCycle > 3.36;
      if (leftEye && rightEye) {
        leftEye.scale.y = isBlinking ? 0.15 : 1.25;
        rightEye.scale.y = isBlinking ? 0.15 : 1.25;
      }
    } else {
      // Airborne (tuck feet slightly, raise arms, tilt sprout)
      if (leftFootGroup && rightFootGroup) {
        leftFootGroup.position.y += (0.22 - leftFootGroup.position.y) * 0.15;
        leftFootGroup.rotation.x = -0.22;
        rightFootGroup.position.y += (0.22 - rightFootGroup.position.y) * 0.15;
        rightFootGroup.rotation.x = -0.22;
      }
      if (leftArm && rightArm) {
        leftArm.rotation.z = 0.75;
        rightArm.rotation.z = -0.75;
      }
      if (mintSprout) {
        mintSprout.rotation.x = Math.max(-0.35, -physics.player.vy * 0.025);
      }
    }

    // Apply gentle idle breathe and run hop bobbing
    const idleBreathe = physics.player.isGrounded && speed <= 0.4 ? Math.sin(time * 1.8) * 0.018 : 0;
    this.jellyBodyGroup.position.y = hopBob;
    this.jellyBodyGroup.rotation.z = rollTilt;
    this.jellyBodyGroup.scale.set(
      physics.player.squashScale.x * (1 - idleBreathe * 0.5),
      physics.player.squashScale.y * (1 + idleBreathe),
      physics.player.squashScale.z * (1 - idleBreathe * 0.5)
    );

    // Invulnerability visual blink
    if (physics.player.invulnerableTimer > 0) {
      this.jellyBodyGroup.visible = Math.floor(time * 25) % 2 === 0;
    } else {
      this.jellyBodyGroup.visible = true;
    }

    // 2. Update Dynamic Islands (Moving, Spinners, Crumble)
    physics.dynamicIslands.forEach((state, id) => {
      const islandMesh = this.islandsMap.get(id);
      if (islandMesh) {
        islandMesh.position.set(state.currentX + state.shakeOffset, state.currentY, state.currentZ);

        // Hide crumble island when collapsed
        if (state.isCollapsed) {
          islandMesh.visible = false;
        } else {
          islandMesh.visible = true;
        }
      }

      // Update Spring Mushroom squash & position
      const mushroom = this.springMushroomsMap.get(id);
      if (mushroom) {
        mushroom.position.set(state.currentX, state.currentY, state.currentZ);
        const capGroup = mushroom.getObjectByName('mushroom_bounce_cap');
        if (capGroup) {
          capGroup.scale.set(1 / Math.sqrt(state.springSquash), state.springSquash, 1 / Math.sqrt(state.springSquash));
        }
      }

      // Update Spinner rotation
      const spinner = this.spinnerBarsMap.get(id);
      if (spinner) {
        spinner.position.set(state.currentX, state.currentY, state.currentZ);
        const arms = spinner.getObjectByName('rotating_candy_arms');
        if (arms) {
          arms.rotation.y = state.rotationY;
        }
      }

      // Update Checkpoint visual
      const cpMesh = this.checkpointMeshesMap.get(id);
      if (cpMesh) {
        const isReached = physics.player.lastCheckpointIslandId >= id;
        const flag = cpMesh.getObjectByName('camp_flag') as THREE.Mesh;
        if (flag) {
          (flag.material as THREE.MeshStandardMaterial).color.setHex(isReached ? 0x7ad2b3 : COLOR_PALETTE.coralPink);
        }
      }
    });

    // 3. Update Trees (gentle breeze sway)
    this.treeInstances.forEach((tree, idx) => {
      const sway = Math.sin(time * 1.8 + idx) * 0.04;
      tree.rotation.z = sway;
    });

    // 4. Update Crystals (spin, hover bob, check player collection)
    crystals.forEach((c) => {
      const cMesh = this.crystalMeshes.get(c.id);
      if (cMesh) {
        if (c.collected) {
          cMesh.visible = false;
        } else {
          cMesh.visible = true;
          cMesh.rotation.y = time * 2.5 + c.id;
          cMesh.position.y = c.y + Math.sin(time * 3 + c.id) * 0.12;

          // Check distance to player
          const dx = physics.player.x - c.x;
          const dy = physics.player.y + 0.8 - cMesh.position.y;
          const dz = physics.player.z - c.z;
          const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

          if (dist < 1.35) {
            // Coleta de cristal com proteção contra exceções
            c.collected = true;
            cMesh.visible = false;
            try {
              sounds.playCrystalCollect();
            } catch {}
            try {
              this.spawnSparkleBurst(c.x, c.y + 0.5, c.z, 8, COLOR_PALETTE.gemGold);
            } catch {}

            try {
              const collectedCount = crystals.filter((k) => k.collected).length;
              this.callbacks.onCrystalCollected(collectedCount, crystals.length);
            } catch {}
          }
        }
      }
    });

    // 5. Update Finish Portal Vortex swirl
    if (this.finishPortalGroup) {
      const vortex = this.finishPortalGroup.getObjectByName('portal_vortex');
      if (vortex) {
        vortex.rotation.z = -time * 1.5;
      }
    }

    // 6. Update Particle Bursts
    for (let i = this.activeParticles.length - 1; i >= 0; i--) {
      const p = this.activeParticles[i];
      p.life += delta;
      if (p.life >= p.maxLife) {
        this.particleGroup.remove(p.mesh);
        this.activeParticles.splice(i, 1);
      } else {
        p.mesh.position.x += p.vx * delta;
        p.mesh.position.y += p.vy * delta;
        p.mesh.position.z += p.vz * delta;
        p.vy -= 9.8 * delta; // Gravity on particles
        const scale = 1 - p.life / p.maxLife;
        p.mesh.scale.setScalar(scale);
      }
    }

    // 7. Update Cloud Sea slow drift
    if (this.cloudsGroup) {
      this.cloudsGroup.position.x = Math.sin(time * 0.1) * 3;
    }

    // 8. In-Game Camera Follow
    // "Durante o jogo, acompanhe por trás com um deslocamento próximo de (0,8.8,15.3), olhando cerca de 5.8 unidades à frente. Preserve um horizonte estável e uma sombra útil no chão."
    if (!this.isIntroMode) {
      const targetCamX = physics.player.x;
      const targetCamY = physics.player.y + 8.8;
      const targetCamZ = physics.player.z + 15.3;

      const smoothCamFactor = Math.min(1.0, delta * 5.0);
      this.camera.position.x += (targetCamX - this.camera.position.x) * smoothCamFactor;
      this.camera.position.y += (targetCamY - this.camera.position.y) * smoothCamFactor;
      this.camera.position.z += (targetCamZ - this.camera.position.z) * smoothCamFactor;

      // Look ~5.8 units ahead (forward is -Z)
      const lookAheadZ = physics.player.z - 5.8;
      const lookAheadY = physics.player.y + 1.2;
      const lookAheadX = physics.player.x;

      this.cameraCurrentTarget.x += (lookAheadX - this.cameraCurrentTarget.x) * smoothCamFactor;
      this.cameraCurrentTarget.y += (lookAheadY - this.cameraCurrentTarget.y) * smoothCamFactor;
      this.cameraCurrentTarget.z += (lookAheadZ - this.cameraCurrentTarget.z) * smoothCamFactor;

      this.camera.lookAt(this.cameraCurrentTarget);
    }

    // Render Scene
    this.renderer.render(this.scene, this.camera);
  }

  public onResize(width: number, height: number) {
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }

  public dispose() {
    this.renderer.dispose();
  }
}
