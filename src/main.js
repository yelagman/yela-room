// ─────────────────────────────────────────────────────────────
// ENTRY POINT — main.js
// The entire 3D scene, interactions, UI, and animations boot here
// ─────────────────────────────────────────────────────────────

import './style.scss';
import * as THREE from 'three';

// ─── Core Setup ────────────────────────────────────────────────
import { setupScene } from './core/setupScene.js';
import { createInteractionManager } from './core/interactionManager.js';
import { startRenderLoop } from './core/renderLoop.js';

// ─── Scene Loading ─────────────────────────────────────────────
import { loadModel } from './scene/loadModel.js';

// ─── Animations ────────────────────────────────────────────────
import { playHoverAnimation } from './animations/playHoverAnimation.js';
import { playIntroAnimation } from './animations/playIntroAnimation.js';
import { animateKey } from './animations/animateKey.js';

// ─── UI Systems ────────────────────────────────────────────────
import { createModalManager } from './ui/modalManager.js';
import { createLoadingScreen } from './ui/loadingScreen.js';

// ────────────────────────────────────────────────────────────────
// 1. SCENE + CAMERA + RENDERER + CONTROLS SETUP
// ────────────────────────────────────────────────────────────────
const { scene, camera, renderer, controls, canvas, sizes } = setupScene();

// ────────────────────────────────────────────────────────────────
// 2. SOCIAL LINKS & MODALS
// ────────────────────────────────────────────────────────────────
const modals = {
  work: document.querySelector('.modal.work'),
  about: document.querySelector('.modal.about'),
  contact: document.querySelector('.modal.contact'),
};
const overlay = document.querySelector('.overlay');

const socialLinks = {
  Github: 'https://github.com/yelagman',
  LinkedIn: 'https://www.linkedin.com/in/yelaman-moldagali/',
  Instagram: 'https://www.instagram.com/jibaliba/',
  Scholar: 'https://dl.acm.org/profile/99660897391',
};

// ────────────────────────────────────────────────────────────────
// 3. STATEFUL OBJECT STORAGE
// ────────────────────────────────────────────────────────────────
const raycasterObjects = [];
const yAxisFans = [];
const flowers = [];
let chair = null;
let backpack = null;

// Shared state for hover tracking between systems
const sharedState = {
  currentHoveredObject: null,
  currentIntersects: [],
};

const animatedObjects = {};


// ────────────────────────────────────────────────────────────────
// 4. LOADERS + MODEL LOADING
// ────────────────────────────────────────────────────────────────
import { initLoaders } from './scene/loaders.js';

// Create a shared loading manager
const loadingManager = new THREE.LoadingManager();

// Initialize all loaders (GLTF, DRACO, Texture, Video)
const {
  gltfLoader,
  textureLoader,
  loadedTextures,
  textureMap,
  videoTexture,
} = initLoaders(loadingManager);

// Start loading the main scene model
loadModel({
  gltfLoader,
  textureLoader,
  loadedTextures,
  textureMap,
  videoTexture,
  scene,
  yAxisFans,
  raycasterObjects,
  animatedObjects, 
  setRefs: ({ chair: c, flowers: f, backpack: b }) => {
    chair = c;
    flowers.push(...f);
    backpack = b;
  },
}).then(() => {
  console.log('Model loaded successfully');
});



// ────────────────────────────────────────────────────────────────
// 5. MODAL MANAGER
// ────────────────────────────────────────────────────────────────
const modalManager = createModalManager({
  modals,
  overlay,
  controls,
  playHoverAnimation,
  sharedState,
});

// ────────────────────────────────────────────────────────────────
// 6. INPUT + INTERACTION SYSTEM
// ────────────────────────────────────────────────────────────────
const interactionManager = createInteractionManager({
  canvas,
  camera,
  scene,
  raycasterObjects,
  playHoverAnimation,
  animateKey,
  socialLinks,
  modalManager,
  modals,
});

// ────────────────────────────────────────────────────────────────
// 7. LOADING SCREEN & REVEAL ANIMATION
// ────────────────────────────────────────────────────────────────
createLoadingScreen({
  manager: loadingManager,
  playIntroAnimation: () => playIntroAnimation(animatedObjects),
});

// ────────────────────────────────────────────────────────────────
// 8. START RENDER LOOP
// ────────────────────────────────────────────────────────────────
startRenderLoop({
  renderer,
  scene,
  camera,
  controls,
  interactionManager,
  isModalOpen: modalManager.isModalOpen,
  animations: {
    fans: yAxisFans,
    chair,
    flowers,
    backpack,
  },
});

// ────────────────────────────────────────────────────────────────
// 9. RESIZE HANDLER
// ────────────────────────────────────────────────────────────────
window.addEventListener('resize', () => {
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});
