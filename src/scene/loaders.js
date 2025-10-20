// src/scene/loaders.js
import * as THREE from "three";
import { DRACOLoader } from "three/addons/loaders/DRACOLoader.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

/**
 * Optimized asset loader for Three.js.
 * - Uses DRACO web workers
 * - Lazily loads non-critical textures after first render
 */
export function initLoaders(manager) {
  // --- DRACO LOADER (use web workers) ---
  const dracoLoader = new DRACOLoader();
  dracoLoader.setDecoderPath("draco/");
  dracoLoader.setWorkerLimit(2);

  // --- GLTF LOADER ---
  const gltfLoader = new GLTFLoader(manager);
  gltfLoader.setDRACOLoader(dracoLoader);

  // --- TEXTURE LOADER ---
  const textureLoader = new THREE.TextureLoader();

  // --- TEXTURE MAP DEFINITION ---
  const textureMap = {
    First: "textures/first_texture_set.webp",
    Second: "textures/second_texture_set.webp",
    Third: "textures/third_texture_set.webp",
    Fourth: "textures/fourth_texture_set.webp",
    Fifth: "textures/fifth_texture_set.webp",
    Sixth: "textures/sixth_texture_set.webp",
  };

  // --- INITIAL LOAD: only 2 hero textures ---
  const loadedTextures = {};
  ["First", "Second"].forEach((key) => {
    const tex = textureLoader.load(textureMap[key]);
    tex.flipY = false;
    tex.colorSpace = THREE.SRGBColorSpace;
    loadedTextures[key] = tex;
  });

  // --- DEFER NON-CRITICAL TEXTURES ---
  if ("requestIdleCallback" in window) {
    requestIdleCallback(() => {
      ["Third", "Fourth", "Fifth", "Sixth"].forEach((key) => {
        const tex = textureLoader.load(textureMap[key]);
        tex.flipY = false;
        tex.colorSpace = THREE.SRGBColorSpace;
        loadedTextures[key] = tex;
      });
    });
  } else {
    // fallback for Safari
    setTimeout(() => {
      ["Third", "Fourth", "Fifth", "Sixth"].forEach((key) => {
        const tex = textureLoader.load(textureMap[key]);
        tex.flipY = false;
        tex.colorSpace = THREE.SRGBColorSpace;
        loadedTextures[key] = tex;
      });
    }, 0);
  }

  // --- VIDEO TEXTURE ---
  const videoElement = document.createElement("video");
  videoElement.src = "video/frog.mp4";
  videoElement.loop = true;
  videoElement.autoplay = true;
  videoElement.muted = true;
  videoElement.playsInline = true;
  videoElement.preload = "metadata";
  videoElement.play();

  const videoTexture = new THREE.VideoTexture(videoElement);
  videoTexture.colorSpace = THREE.SRGBColorSpace;
  videoTexture.flipY = false;

  return {
    gltfLoader,
    textureLoader,
    loadedTextures,
    videoTexture,
    textureMap,
  };
}
