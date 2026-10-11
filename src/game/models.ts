/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as THREE from 'three';
import { COLOR_PALETTE, PHYSICS_CONFIG } from './constants';
import { IslandConfig, VisualMode } from '../types/game';

// Materials cache to optimize draw calls and memory
const matCache = new Map<string, THREE.Material>();

function getStandardMat(key: string, color: number, roughness = 0.45, metalness = 0.05, extra?: Partial<THREE.MeshStandardMaterialParameters>): THREE.MeshStandardMaterial {
  if (matCache.has(key)) {
    return matCache.get(key) as THREE.MeshStandardMaterial;
  }
  const mat = new THREE.MeshStandardMaterial({
    color,
    roughness,
    metalness,
    ...extra,
  });
  matCache.set(key, mat);
  return mat;
}

/**
 * Creates the Jelly Character Model (~1.65 units height)
 * Soft vinyl candy-pink body, mint sprout with 2 leaves, big oval eyes with glints, blush, smile, feet and arms
 */
export function createJellyModel(mode: VisualMode = 'classic'): THREE.Group {
  const root = new THREE.Group();
  root.name = 'jelly_character';

  // Base materials
  const jellyPink = mode === 'tripo' ? 0xff7085 : COLOR_PALETTE.coralPink;
  const bodyMat = new THREE.MeshStandardMaterial({
    color: jellyPink,
    roughness: mode === 'tripo' ? 0.22 : 0.35,
    metalness: 0.08,
  });

  const eyeDarkMat = getStandardMat('jelly_eye_dark', 0x181820, 0.1, 0.3);
  const eyeWhiteMat = getStandardMat('jelly_eye_glint', 0xffffff, 0.1, 0.0);
  const blushMat = getStandardMat('jelly_blush', 0xff99a8, 0.6, 0.0);
  const mintMat = getStandardMat('jelly_mint', 0x88e2c0, 0.35, 0.0);
  const mintStemMat = getStandardMat('jelly_mint_stem', 0x5cc59f, 0.4, 0.0);
  const limbMat = getStandardMat('jelly_limbs', mode === 'tripo' ? 0xff8596 : 0xff8ca0, 0.4, 0.05);

  // Character body wrapper (pivoted at bottom y=0)
  const bodyGroup = new THREE.Group();
  bodyGroup.name = 'body_squash_group';
  root.add(bodyGroup);

  // Main squishy body: elevated chubby gumdrop shape (rests above feet, never clips into ground)
  const bodyGeo = new THREE.SphereGeometry(0.68, 32, 24);
  bodyGeo.scale(1.06, 0.94, 0.98);
  const bodyMesh = new THREE.Mesh(bodyGeo, bodyMat);
  bodyMesh.position.set(0, 0.88, 0);
  bodyMesh.castShadow = true;
  bodyMesh.receiveShadow = false;
  bodyGroup.add(bodyMesh);

  // Face elements (oriented facing -Z by default, facing the forward course)
  const faceGroup = new THREE.Group();
  faceGroup.name = 'jelly_face_group';
  faceGroup.position.set(0, 0.92, -0.64);
  bodyGroup.add(faceGroup);

  // Left & Right oval eyes
  const eyeGeo = new THREE.SphereGeometry(0.11, 16, 16);
  eyeGeo.scale(0.85, 1.25, 0.4);

  const leftEye = new THREE.Mesh(eyeGeo, eyeDarkMat);
  leftEye.name = 'jelly_left_eye';
  leftEye.position.set(-0.24, 0.08, 0);
  leftEye.rotation.y = 0.15;
  faceGroup.add(leftEye);

  const rightEye = new THREE.Mesh(eyeGeo, eyeDarkMat);
  rightEye.name = 'jelly_right_eye';
  rightEye.position.set(0.24, 0.08, 0);
  rightEye.rotation.y = -0.15;
  faceGroup.add(rightEye);

  // Eye highlights (big primary glint + small secondary sparkle)
  const glintBigGeo = new THREE.SphereGeometry(0.038, 12, 12);
  const leftGlint1 = new THREE.Mesh(glintBigGeo, eyeWhiteMat);
  leftGlint1.position.set(-0.22, 0.12, -0.05);
  faceGroup.add(leftGlint1);

  const rightGlint1 = new THREE.Mesh(glintBigGeo, eyeWhiteMat);
  rightGlint1.position.set(0.26, 0.12, -0.05);
  faceGroup.add(rightGlint1);

  const glintSmallGeo = new THREE.SphereGeometry(0.02, 8, 8);
  const leftGlint2 = new THREE.Mesh(glintSmallGeo, eyeWhiteMat);
  leftGlint2.position.set(-0.25, 0.03, -0.05);
  faceGroup.add(leftGlint2);

  const rightGlint2 = new THREE.Mesh(glintSmallGeo, eyeWhiteMat);
  rightGlint2.position.set(0.23, 0.03, -0.05);
  faceGroup.add(rightGlint2);

  // Blushing cheeks
  const blushGeo = new THREE.CylinderGeometry(0.085, 0.085, 0.02, 16);
  blushGeo.rotateX(Math.PI / 2);
  const leftBlush = new THREE.Mesh(blushGeo, blushMat);
  leftBlush.position.set(-0.36, -0.04, 0.03);
  leftBlush.scale.set(1.1, 0.65, 1.0);
  faceGroup.add(leftBlush);

  const rightBlush = new THREE.Mesh(blushGeo, blushMat);
  rightBlush.position.set(0.36, -0.04, 0.03);
  rightBlush.scale.set(1.1, 0.65, 1.0);
  faceGroup.add(rightBlush);

  // Cute mouth smile
  const mouthCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-0.075, -0.035, 0.02),
    new THREE.Vector3(0, -0.08, 0.03),
    new THREE.Vector3(0.075, -0.035, 0.02),
  ]);
  const mouthGeo = new THREE.TubeGeometry(mouthCurve, 8, 0.015, 8, false);
  const mouthMat = getStandardMat('jelly_mouth', 0x9e2b40, 0.3, 0.1);
  const mouthMesh = new THREE.Mesh(mouthGeo, mouthMat);
  faceGroup.add(mouthMesh);

  // Mint Sprout on top of head
  const sproutGroup = new THREE.Group();
  sproutGroup.position.set(0, 1.54, 0);
  sproutGroup.name = 'mint_sprout';
  bodyGroup.add(sproutGroup);

  // Curved sprout stem
  const stemCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, 0, 0),
    new THREE.Vector3(0.02, 0.1, -0.02),
    new THREE.Vector3(0.01, 0.22, 0.01),
  ]);
  const stemGeo = new THREE.TubeGeometry(stemCurve, 8, 0.03, 8, false);
  const stemMesh = new THREE.Mesh(stemGeo, mintStemMat);
  sproutGroup.add(stemMesh);

  // Left leaf & Right leaf
  const leafGeo = new THREE.ConeGeometry(0.12, 0.28, 12);
  leafGeo.scale(1.2, 0.4, 0.8);
  leafGeo.rotateX(Math.PI / 2);

  const leftLeaf = new THREE.Mesh(leafGeo, mintMat);
  leftLeaf.position.set(-0.12, 0.23, 0);
  leftLeaf.rotation.set(-0.2, 0.4, 0.9);
  leftLeaf.castShadow = true;
  sproutGroup.add(leftLeaf);

  const rightLeaf = new THREE.Mesh(leafGeo, mintMat);
  rightLeaf.position.set(0.12, 0.24, 0);
  rightLeaf.rotation.set(0.2, -0.4, -0.9);
  rightLeaf.castShadow = true;
  sproutGroup.add(rightLeaf);

  // Two distinct, adorable jelly boots/feet resting cleanly on the ground
  const footGeo = new THREE.SphereGeometry(0.19, 16, 12);
  footGeo.scale(0.85, 0.62, 1.4);

  // Left Foot Group
  const leftFootGroup = new THREE.Group();
  leftFootGroup.name = 'jelly_left_foot_group';
  leftFootGroup.position.set(-0.28, 0.13, -0.16);

  const leftFoot = new THREE.Mesh(footGeo, limbMat);
  leftFoot.name = 'jelly_left_foot';
  leftFoot.position.set(0, 0, 0);
  leftFoot.rotation.y = -0.12;
  leftFoot.castShadow = true;
  leftFootGroup.add(leftFoot);
  bodyGroup.add(leftFootGroup);

  // Right Foot Group
  const rightFootGroup = new THREE.Group();
  rightFootGroup.name = 'jelly_right_foot_group';
  rightFootGroup.position.set(0.28, 0.13, -0.16);

  const rightFoot = new THREE.Mesh(footGeo, limbMat);
  rightFoot.name = 'jelly_right_foot';
  rightFoot.position.set(0, 0, 0);
  rightFoot.rotation.y = 0.12;
  rightFoot.castShadow = true;
  rightFootGroup.add(rightFoot);
  bodyGroup.add(rightFootGroup);

  // Tiny stubby arms with cute hands
  const armGeo = new THREE.SphereGeometry(0.13, 16, 12);
  armGeo.scale(0.8, 1.35, 0.8);

  const leftArm = new THREE.Mesh(armGeo, limbMat);
  leftArm.name = 'jelly_left_arm';
  leftArm.position.set(-0.66, 0.82, 0);
  leftArm.rotation.z = 0.42;
  bodyGroup.add(leftArm);

  const rightArm = new THREE.Mesh(armGeo, limbMat);
  rightArm.name = 'jelly_right_arm';
  rightArm.position.set(0.66, 0.82, 0);
  rightArm.rotation.z = -0.42;
  bodyGroup.add(rightArm);

  return root;
}

/**
 * Creates the Spring Mushroom Model
 * Wide coral-pink dome with raised ivory spots, cream gills, thick short stem
 */
export function createMushroomModel(mode: VisualMode = 'classic'): THREE.Group {
  const root = new THREE.Group();
  root.name = 'spring_mushroom';

  const stemMat = getStandardMat('mush_stem', COLOR_PALETTE.cream, 0.5, 0.0);
  const capColor = mode === 'tripo' ? 0xff5f76 : COLOR_PALETTE.coralPink;
  const capMat = getStandardMat('mush_cap', capColor, 0.35, 0.05);
  const spotMat = getStandardMat('mush_spot', COLOR_PALETTE.candyIvory, 0.3, 0.0);
  const gillsMat = getStandardMat('mush_gills', 0xf1e7cf, 0.6, 0.0);

  // Thick short stem (y: 0 to 0.7)
  const stemGeo = new THREE.CylinderGeometry(0.42, 0.55, 0.75, 16);
  const stem = new THREE.Mesh(stemGeo, stemMat);
  stem.position.y = 0.375;
  stem.castShadow = true;
  stem.receiveShadow = true;
  root.add(stem);

  // Cap group that squashes on bounce
  const capGroup = new THREE.Group();
  capGroup.name = 'mushroom_bounce_cap';
  capGroup.position.y = 0.75;
  root.add(capGroup);

  // Cream gills under cap
  const gillsGeo = new THREE.CylinderGeometry(1.28, 0.48, 0.18, 24);
  const gills = new THREE.Mesh(gillsGeo, gillsMat);
  gills.position.y = 0.08;
  capGroup.add(gills);

  // Wide coral dome cap
  const capGeo = new THREE.SphereGeometry(1.32, 24, 16, 0, Math.PI * 2, 0, Math.PI * 0.48);
  capGeo.scale(1.0, 0.68, 1.0);
  const cap = new THREE.Mesh(capGeo, capMat);
  cap.position.y = 0.15;
  cap.castShadow = true;
  cap.receiveShadow = true;
  capGroup.add(cap);

  // Raised ivory spots on cap
  const spotGeo = new THREE.SphereGeometry(0.18, 12, 10);
  spotGeo.scale(1.0, 0.45, 1.0);

  const spotAngles = [
    { r: 0.45, a: 0.3, scale: 1.1 },
    { r: 0.55, a: 1.8, scale: 0.9 },
    { r: 0.65, a: 3.3, scale: 1.2 },
    { r: 0.5, a: 4.6, scale: 0.85 },
    { r: 0.85, a: 0.9, scale: 0.8 },
    { r: 0.9, a: 2.5, scale: 0.95 },
    { r: 0.88, a: 5.4, scale: 0.85 },
    { r: 0.0, a: 0.0, scale: 1.3 }, // Top center spot
  ];

  spotAngles.forEach((p) => {
    const spot = new THREE.Mesh(spotGeo, spotMat);
    const x = Math.cos(p.a) * p.r;
    const z = Math.sin(p.a) * p.r;
    const y = 0.15 + (1 - (p.r / 1.3) ** 2) * 0.52;
    spot.position.set(x, y, z);
    spot.scale.multiplyScalar(p.scale);
    capGroup.add(spot);
  });

  return root;
}

/**
 * Creates the Stylized Tree Model
 * Curved peach-brown trunk, large rounded turquoise/mint palm leaves, peach fruit clusters
 */
export function createTreeModel(scale = 1.0): THREE.Group {
  const root = new THREE.Group();
  root.name = 'tropical_toy_tree';

  const trunkMat = getStandardMat('tree_trunk', COLOR_PALETTE.woodBrown, 0.6, 0.0);
  const leafMat1 = getStandardMat('tree_leaf1', COLOR_PALETTE.turquoise, 0.4, 0.0);
  const leafMat2 = getStandardMat('tree_leaf2', COLOR_PALETTE.mint, 0.4, 0.0);
  const fruitMat = getStandardMat('tree_fruit', 0xffa07a, 0.3, 0.05);

  // Curved organic trunk using CatmullRomCurve3
  const curve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, 0, 0),
    new THREE.Vector3(0.2, 1.2, 0.1),
    new THREE.Vector3(-0.15, 2.4, 0.25),
    new THREE.Vector3(0, 3.6, 0.1),
  ]);
  const trunkGeo = new THREE.TubeGeometry(curve, 12, 0.28, 10, false);
  const trunkMesh = new THREE.Mesh(trunkGeo, trunkMat);
  trunkMesh.castShadow = true;
  trunkMesh.receiveShadow = true;
  root.add(trunkMesh);

  // Canopy crown group at top of trunk
  const crown = new THREE.Group();
  crown.position.set(0, 3.6, 0.1);
  root.add(crown);

  // Large rounded palm leaves bowing outward
  const leafCount = 6;
  const leafGeo = new THREE.SphereGeometry(0.65, 12, 10);
  leafGeo.scale(0.55, 0.12, 1.8);
  leafGeo.translate(0, 0, 0.9);

  for (let i = 0; i < leafCount; i++) {
    const angle = (i / leafCount) * Math.PI * 2;
    const leaf = new THREE.Mesh(leafGeo, i % 2 === 0 ? leafMat1 : leafMat2);
    leaf.rotation.y = angle;
    leaf.rotation.x = -0.32; // Bow downward
    leaf.rotation.z = (Math.random() - 0.5) * 0.1;
    leaf.castShadow = true;
    crown.add(leaf);
  }

  // Peach fruit clusters nestled under the crown
  const fruitGeo = new THREE.SphereGeometry(0.14, 10, 10);
  for (let f = 0; f < 4; f++) {
    const a = (f / 4) * Math.PI * 2 + 0.4;
    const fruit = new THREE.Mesh(fruitGeo, fruitMat);
    fruit.position.set(Math.cos(a) * 0.28, -0.22, Math.sin(a) * 0.28);
    fruit.castShadow = true;
    crown.add(fruit);
  }

  root.scale.setScalar(scale);
  return root;
}

/**
 * Creates Island 3D Model with thick grass, rounded rim, warm rock undercarriage,
 * hanging vines, flowers, pebbles, and optional waterfall.
 */
export function createIslandMesh(island: IslandConfig): THREE.Group {
  const root = new THREE.Group();
  root.name = `island_${island.id}_${island.name}`;
  root.position.set(island.x, island.y, island.z);

  const radius = island.r;
  const grassMat = getStandardMat('island_grass', COLOR_PALETTE.sage, 0.65, 0.0);
  const soilRimMat = getStandardMat('island_soil_rim', COLOR_PALETTE.creamDark, 0.7, 0.0);
  const rockMat = getStandardMat('island_rock', COLOR_PALETTE.warmRock, 0.8, 0.05);

  // 1. Grass top cylinder with bevel
  const grassGeo = new THREE.CylinderGeometry(radius, radius * 0.98, 0.4, 32);
  const grassMesh = new THREE.Mesh(grassGeo, grassMat);
  grassMesh.position.y = -0.2;
  grassMesh.receiveShadow = true;
  root.add(grassMesh);

  // 2. Beveled rim
  const rimGeo = new THREE.TorusGeometry(radius * 0.98, 0.15, 12, 32);
  rimGeo.rotateX(Math.PI / 2);
  const rimMesh = new THREE.Mesh(rimGeo, soilRimMat);
  rimMesh.position.y = -0.15;
  rimMesh.receiveShadow = true;
  root.add(rimMesh);

  // 3. Warm rock undercarriage (tapering down irregularly)
  const depth = Math.max(2.5, radius * 1.1);
  const rockGeo = new THREE.ConeGeometry(radius * 0.94, depth, 16);
  rockGeo.rotateX(Math.PI);
  const rockMesh = new THREE.Mesh(rockGeo, rockMat);
  rockMesh.position.y = -0.4 - depth / 2;
  rockMesh.castShadow = true;
  root.add(rockMesh);

  // Irregular secondary rock bulges under base
  for (let b = 0; b < 4; b++) {
    const angle = (b / 4) * Math.PI * 2 + (b * 0.4);
    const dist = radius * 0.55;
    const bulgeRadius = radius * 0.35;
    const bGeo = new THREE.DodecahedronGeometry(bulgeRadius, 1);
    const bMesh = new THREE.Mesh(bGeo, rockMat);
    bMesh.position.set(Math.cos(angle) * dist, -0.6 - bulgeRadius * 0.8, Math.sin(angle) * dist);
    bMesh.scale.set(1.1, 1.4, 0.9);
    bMesh.castShadow = true;
    root.add(bMesh);
  }

  // 4. Scenery: Hanging pastel vines on island rim
  const vineMat = getStandardMat('island_vines', COLOR_PALETTE.mint, 0.6, 0.0);
  for (let v = 0; v < 3; v++) {
    const vineAngle = (v / 3) * Math.PI * 2 + v * 0.8;
    const vineLen = 1.0 + Math.random() * 1.2;
    const vineGeo = new THREE.CylinderGeometry(0.04, 0.02, vineLen, 6);
    const vineMesh = new THREE.Mesh(vineGeo, vineMat);
    vineMesh.position.set(Math.cos(vineAngle) * radius, -0.3 - vineLen / 2, Math.sin(vineAngle) * radius);
    vineMesh.rotation.z = 0.1 * Math.sin(v);
    root.add(vineMesh);
  }

  // 5. Tiny decorative flowers & pebbles along rim perimeter (avoiding center landing area)
  const flowerMat = getStandardMat('island_flower', COLOR_PALETTE.coralPink, 0.5, 0.0);
  const flowerCenterMat = getStandardMat('island_flower_center', COLOR_PALETTE.warmGold, 0.4, 0.0);
  const pebbleMat = getStandardMat('island_pebble', COLOR_PALETTE.cream, 0.7, 0.0);

  const decorCount = Math.floor(radius * 1.8);
  for (let d = 0; d < decorCount; d++) {
    const angle = (d / decorCount) * Math.PI * 2 + 0.3;
    const dist = radius * (0.75 + Math.random() * 0.18); // Kept near edge!
    const px = Math.cos(angle) * dist;
    const pz = Math.sin(angle) * dist;

    if (d % 3 === 0) {
      // Small pebble
      const pebGeo = new THREE.SphereGeometry(0.12, 6, 6);
      pebGeo.scale(1.2, 0.4, 0.9);
      const peb = new THREE.Mesh(pebGeo, pebbleMat);
      peb.position.set(px, 0.02, pz);
      root.add(peb);
    } else {
      // Tiny flower
      const flGroup = new THREE.Group();
      flGroup.position.set(px, 0.02, pz);
      const petalGeo = new THREE.SphereGeometry(0.06, 6, 6);
      petalGeo.scale(1.2, 0.3, 0.6);
      const fl = new THREE.Mesh(petalGeo, flowerMat);
      const flc = new THREE.Mesh(new THREE.SphereGeometry(0.04, 6, 6), flowerCenterMat);
      flc.position.y = 0.03;
      flGroup.add(fl);
      flGroup.add(flc);
      root.add(flGroup);
    }
  }

  // 6. Waterfall on selected islands (Islands 1, 5, 9, 13)
  if ([1, 5, 9, 13].includes(island.id)) {
    const waterGroup = new THREE.Group();
    waterGroup.name = 'island_waterfall';
    const waterAngle = Math.PI * 0.75;
    const wx = Math.cos(waterAngle) * radius * 0.95;
    const wz = Math.sin(waterAngle) * radius * 0.95;

    // Translucent waterfall sheet
    const fallHeight = depth + 3.0;
    const fallGeo = new THREE.PlaneGeometry(0.9, fallHeight, 8, 16);
    fallGeo.translate(0, -fallHeight / 2, 0);
    const fallMat = new THREE.MeshStandardMaterial({
      color: 0x6be0ea,
      roughness: 0.15,
      metalness: 0.1,
      transparent: true,
      opacity: 0.78,
      side: THREE.DoubleSide,
    });
    const fallMesh = new THREE.Mesh(fallGeo, fallMat);
    fallMesh.position.set(wx, 0, wz);
    fallMesh.lookAt(wx * 2, 0, wz * 2);
    waterGroup.add(fallMesh);

    // Cute waterfall mist foam at bottom
    const foamGeo = new THREE.SphereGeometry(0.35, 8, 8);
    foamGeo.scale(1.4, 0.4, 1.2);
    const foamMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.6 });
    const foam = new THREE.Mesh(foamGeo, foamMat);
    foam.position.set(wx * 1.05, -fallHeight, wz * 1.05);
    waterGroup.add(foam);

    root.add(waterGroup);
  }

  return root;
}

/**
 * Creates Crystal Collectible Mesh (spinning diamond with sparkle aura)
 */
export function createCrystalMesh(): THREE.Group {
  const root = new THREE.Group();
  root.name = 'crystal_item';

  const gemMat = new THREE.MeshStandardMaterial({
    color: COLOR_PALETTE.gemGold,
    roughness: 0.15,
    metalness: 0.2,
    emissive: 0xffaa00,
    emissiveIntensity: 0.35,
  });

  // Double-pointed octahedron diamond
  const gemGeo = new THREE.OctahedronGeometry(0.38, 0);
  gemGeo.scale(0.85, 1.45, 0.85);
  const gemMesh = new THREE.Mesh(gemGeo, gemMat);
  gemMesh.position.y = 0.55;
  gemMesh.castShadow = true;
  root.add(gemMesh);

  // Shimmering outer ring
  const ringGeo = new THREE.TorusGeometry(0.48, 0.025, 8, 24);
  const ringMat = new THREE.MeshBasicMaterial({ color: 0xffe680, transparent: true, opacity: 0.65 });
  const ring = new THREE.Mesh(ringGeo, ringMat);
  ring.rotation.x = Math.PI / 3;
  ring.position.y = 0.55;
  root.add(ring);

  return root;
}

/**
 * Creates Candy Sweeper Bar for Spinners (Islands 4 & 8)
 */
export function createSpinnerBarMesh(length: number, barCount: number = 1): THREE.Group {
  const root = new THREE.Group();
  root.name = 'candy_spinner_bars';

  const candyRedMat = getStandardMat('candy_red', COLOR_PALETTE.candyRed, 0.3, 0.1);
  const candyWhiteMat = getStandardMat('candy_white', COLOR_PALETTE.candyWhite, 0.25, 0.1);
  const postMat = getStandardMat('spinner_post', COLOR_PALETTE.warmGold, 0.2, 0.3);

  // Central ornate candy dome post
  const postGeo = new THREE.CylinderGeometry(0.35, 0.45, 0.9, 16);
  const post = new THREE.Mesh(postGeo, postMat);
  post.position.y = 0.45;
  post.castShadow = true;
  root.add(post);

  const domeGeo = new THREE.SphereGeometry(0.38, 16, 12);
  const dome = new THREE.Mesh(domeGeo, candyRedMat);
  dome.position.y = 0.88;
  root.add(dome);

  // Rotating arm group
  const armsGroup = new THREE.Group();
  armsGroup.name = 'rotating_candy_arms';
  armsGroup.position.y = 0.38; // Low enough to jump over!
  root.add(armsGroup);

  for (let a = 0; a < barCount; a++) {
    const angle = (a / barCount) * Math.PI;
    const barSubGroup = new THREE.Group();
    barSubGroup.rotation.y = angle;

    // Segmented striped candy sweeper bar
    const segCount = 6;
    const segLen = length / segCount;
    for (let s = 0; s < segCount; s++) {
      const segGeo = new THREE.CylinderGeometry(0.18, 0.18, segLen * 0.95, 12);
      segGeo.rotateZ(Math.PI / 2);
      const mat = s % 2 === 0 ? candyRedMat : candyWhiteMat;
      const seg = new THREE.Mesh(segGeo, mat);
      // Extend out from center
      seg.position.x = s * segLen + segLen / 2;
      seg.castShadow = true;
      barSubGroup.add(seg);

      // Symmetrical other side
      const segOther = new THREE.Mesh(segGeo, mat);
      segOther.position.x = -(s * segLen + segLen / 2);
      segOther.castShadow = true;
      barSubGroup.add(segOther);
    }

    armsGroup.add(barSubGroup);
  }

  return root;
}

/**
 * Creates Checkpoint Camp Mesh (Tent, Flag, Lantern, Starlight glow)
 */
export function createCheckpointMesh(active: boolean = false): THREE.Group {
  const root = new THREE.Group();
  root.name = 'checkpoint_camp';

  const tentMat = getStandardMat('camp_tent', active ? 0xffc83b : COLOR_PALETTE.cream, 0.5, 0.0);
  const postMat = getStandardMat('camp_post', COLOR_PALETTE.woodBrown, 0.6, 0.0);
  const flagMat = getStandardMat('camp_flag', active ? 0x7ad2b3 : COLOR_PALETTE.coralPink, 0.4, 0.0);

  // Cute miniature A-frame tent
  const tentGeo = new THREE.ConeGeometry(0.85, 1.2, 4);
  tentGeo.rotateY(Math.PI / 4);
  const tent = new THREE.Mesh(tentGeo, tentMat);
  tent.position.set(-0.8, 0.6, 0.5);
  tent.castShadow = true;
  root.add(tent);

  // Checkpoint Flagpole
  const poleGeo = new THREE.CylinderGeometry(0.04, 0.04, 2.2, 8);
  const pole = new THREE.Mesh(poleGeo, postMat);
  pole.position.set(0.8, 1.1, 0.5);
  pole.castShadow = true;
  root.add(pole);

  // Pennant banner
  const flagGeo = new THREE.BufferGeometry();
  const flagVertices = new Float32Array([
    0.8, 2.1, 0.5,
    0.8, 1.6, 0.5,
    1.4, 1.85, 0.5,
  ]);
  flagGeo.setAttribute('position', new THREE.BufferAttribute(flagVertices, 3));
  flagGeo.computeVertexNormals();
  const flag = new THREE.Mesh(flagGeo, flagMat);
  root.add(flag);

  // Glowing lantern on pole
  const lanternMat = new THREE.MeshStandardMaterial({
    color: active ? 0xfff080 : 0xff9940,
    emissive: active ? 0xffe040 : 0xcc5500,
    emissiveIntensity: active ? 0.8 : 0.3,
  });
  const lanternGeo = new THREE.SphereGeometry(0.16, 8, 8);
  const lantern = new THREE.Mesh(lanternGeo, lanternMat);
  lantern.position.set(0.95, 1.4, 0.5);
  root.add(lantern);

  return root;
}

/**
 * Creates Finish Portal on Island 13
 * Warm gold sculpted archway, shimmering energy swirl, floating stars
 */
export function createFinishPortalMesh(): THREE.Group {
  const root = new THREE.Group();
  root.name = 'finish_portal';

  const goldMat = new THREE.MeshStandardMaterial({
    color: COLOR_PALETTE.warmGold,
    roughness: 0.25,
    metalness: 0.65,
    emissive: 0x996600,
    emissiveIntensity: 0.2,
  });

  // Grand golden archway
  const archGeo = new THREE.TorusGeometry(1.8, 0.24, 16, 32, Math.PI);
  archGeo.rotateZ(0);
  const arch = new THREE.Mesh(archGeo, goldMat);
  arch.position.y = 1.8;
  arch.castShadow = true;
  root.add(arch);

  // Arch pillars
  const pillarGeo = new THREE.CylinderGeometry(0.24, 0.32, 1.8, 16);
  const leftPillar = new THREE.Mesh(pillarGeo, goldMat);
  leftPillar.position.set(-1.8, 0.9, 0);
  leftPillar.castShadow = true;
  root.add(leftPillar);

  const rightPillar = new THREE.Mesh(pillarGeo, goldMat);
  rightPillar.position.set(1.8, 0.9, 0);
  rightPillar.castShadow = true;
  root.add(rightPillar);

  // Shimmering vortex disc
  const vortexGeo = new THREE.CircleGeometry(1.65, 32);
  const vortexMat = new THREE.MeshBasicMaterial({
    color: 0xffeeaa,
    transparent: true,
    opacity: 0.65,
    side: THREE.DoubleSide,
  });
  const vortex = new THREE.Mesh(vortexGeo, vortexMat);
  vortex.position.y = 1.8;
  vortex.name = 'portal_vortex';
  root.add(vortex);

  // Welcome banner on top of portal
  const bannerGeo = new THREE.BoxGeometry(2.4, 0.5, 0.12);
  const bannerMat = getStandardMat('portal_banner', COLOR_PALETTE.coralPink, 0.4, 0.0);
  const banner = new THREE.Mesh(bannerGeo, bannerMat);
  banner.position.set(0, 3.8, 0);
  root.add(banner);

  return root;
}

/**
 * Creates Start Banner on Island 1
 */
export function createStartBannerMesh(): THREE.Group {
  const root = new THREE.Group();
  root.name = 'start_banner';

  const postMat = getStandardMat('start_post', COLOR_PALETTE.woodBrown, 0.6, 0.0);
  const bannerMat = getStandardMat('start_cloth', COLOR_PALETTE.coralPink, 0.4, 0.0);

  const poleGeo = new THREE.CylinderGeometry(0.06, 0.06, 2.4, 8);
  const p1 = new THREE.Mesh(poleGeo, postMat);
  p1.position.set(-1.5, 1.2, 0);
  root.add(p1);

  const p2 = new THREE.Mesh(poleGeo, postMat);
  p2.position.set(1.5, 1.2, 0);
  root.add(p2);

  // Banner ribbon
  const bannerGeo = new THREE.BoxGeometry(3.0, 0.45, 0.06);
  const banner = new THREE.Mesh(bannerGeo, bannerMat);
  banner.position.set(0, 2.1, 0);
  root.add(banner);

  return root;
}

/**
 * Creates a Fluffy 3D Cloud
 */
export function createCloudMesh(scale = 1.0): THREE.Group {
  const root = new THREE.Group();
  const cloudMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    roughness: 0.9,
    metalness: 0.0,
    transparent: true,
    opacity: 0.92,
  });

  const puffCount = 5 + Math.floor(Math.random() * 3);
  for (let i = 0; i < puffCount; i++) {
    const puffRadius = 1.0 + Math.random() * 1.2;
    const puffGeo = new THREE.SphereGeometry(puffRadius, 8, 8);
    const puff = new THREE.Mesh(puffGeo, cloudMat);
    puff.position.set(
      (i - puffCount / 2) * 1.2 + (Math.random() - 0.5) * 0.6,
      (Math.random() - 0.5) * 0.4,
      (Math.random() - 0.5) * 1.0
    );
    root.add(puff);
  }

  root.scale.setScalar(scale);
  return root;
}
